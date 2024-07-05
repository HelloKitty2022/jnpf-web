<template>
  <div id="document-file-uploader">
    <Uploader
      :options="options"
      :file-status-text="statusText"
      class="uploader-app"
      ref="uploaderRef"
      @file-added="onFileAdded"
      @file-success="onFileSuccess"
      @file-progress="onFileProgress"
      @file-error="onFileError"
      @complete="onComplete"
      :autoStart="false"
      :key="uploadKey">
      <uploader-unsupport></uploader-unsupport>
      <UploaderBtn id="file-uploader-btn" ref="uploaderBtnRef" :attrs="attrs">选择文件</UploaderBtn>
      <uploader-list v-show="panelShow">
        <template #default="{ fileList }">
          <div class="file-panel">
            <div class="file-title">
              <p class="title">上传文件列表</p>
              <div class="operate">
                <i class="icon-ym icon-ym-nav-close" @click="onComplete"></i>
              </div>
            </div>
            <div class="upload-file-list">
              <div class="upload-file-list__item" v-for="file in fileList" :key="file.id">
                <uploader-file :class="'file_' + file.id" ref="files" :file="file" :list="true">
                  <template #default="props">
                    <FileItem :file="props.file" :list="props.list" />
                  </template>
                </uploader-file>
              </div>
              <jnpf-empty description="暂无待上传文件" v-if="!fileList.length" />
            </div>
          </div>
        </template>
      </uploader-list>
    </Uploader>
  </div>
</template>

<script lang="ts" setup>
  import { nextTick, ref, onMounted, reactive } from 'vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { getToken } from '/@/utils/auth';
  import VueSimpleUploader from 'vue-simple-uploader';
  import { useMessage } from '/@/hooks/web/useMessage';
  import SparkMD5 from 'spark-md5';
  import { documentMerge } from '/@/api/extend/document';
  import FileItem from '/@/components/Jnpf/Upload/src/SimpleUploader/FileItem.vue';
  import 'vue-simple-uploader/dist/style.css';

  const Uploader = VueSimpleUploader.Uploader;
  const UploaderBtn = VueSimpleUploader.UploaderBtn;
  const UploaderUnsupport = VueSimpleUploader.UploaderUnsupport;
  const UploaderList = VueSimpleUploader.UploaderList;
  const UploaderFile = VueSimpleUploader.UploaderFile;

  const props = defineProps({
    parentId: {
      type: String,
      default: '0',
    },
  });
  const emit = defineEmits(['fileSuccess']);
  const { createMessage } = useMessage();
  const globSetting = useGlobSetting();
  const uploaderRef = ref<any>(null);
  const uploaderBtnRef = ref<any>(null);
  const options = reactive({
    target: globSetting.apiUrl + '/api/file/chunk',
    chunkSize: 1024 * 1024 * 5,
    maxChunkRetries: 5,
    singleFile: false,
    testChunks: true, //是否开启服务器分片校验
    // 服务器分片校验函数，秒传及断点续传基础
    checkChunkUploadedByResponse: function (chunk, message) {
      const objMessage = JSON.parse(message);
      if (objMessage.code === 200) {
        if (objMessage.data.uploaded) {
          return true;
        }
        const chunkNumbers = objMessage.data.chunkNumbers;
        return (chunkNumbers || []).indexOf(chunk.offset + 1) >= 0;
      } else {
        return true;
      }
    },
    headers: {
      Authorization: getToken(),
    },
    query: {
      fileType: '',
      extension: '',
    },
  });
  const attrs = { accept: '*' };
  const statusText = {
    success: '上传成功',
    error: '上传失败',
    uploading: '上传中',
    paused: '暂停中',
    waiting: '等待中',
  };
  const panelShow = ref(false);
  const uploadKey = ref(+new Date());

  defineExpose({ openUploader });

  function openUploader() {
    uploaderBtnRef.value.$el.click();
  }
  function onFileAdded(file) {
    // 自定义状态
    file.customStatus = 'check';
    panelShow.value = true;
    options.query.fileType = file.fileType;
    options.query.extension = file.getExtension();
    computeMD5(file);
  }
  /**
   * 计算md5，实现断点续传及秒传
   * @param file
   */
  function computeMD5(file) {
    const fileReader = new FileReader();
    const blobSlice = File.prototype.slice || (File.prototype as any).mozSlice || (File.prototype as any).webkitSlice;
    let currentChunk = 0;
    const chunkSize = 10 * 1024 * 1000;
    const chunks = Math.ceil(file.size / chunkSize);
    const spark = new SparkMD5.ArrayBuffer();

    file.pause();
    loadNext();

    fileReader.onload = e => {
      spark.append(e.target?.result);
      if (currentChunk < chunks) {
        currentChunk++;
        loadNext();
      } else {
        const md5 = spark.end();
        computeMD5Success(md5, file);
      }
    };
    fileReader.onerror = function () {
      createMessage.error(`文件${file.name}读取出错，请检查该文件`);
      file.cancel();
    };

    function loadNext() {
      const start = currentChunk * chunkSize;
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
      fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end));
    }
  }
  function computeMD5Success(md5, file) {
    file.uniqueIdentifier = md5; // 把md5值作为文件的识别码
    file.customStatus = 'uploading';
    file.resume(); // 开始上传
  }
  function onFileSuccess(_rootFile, file, response, _chunk) {
    const res = JSON.parse(response);
    if (res.code != 200) {
      createMessage.error(res.msg);
      file.cancel();
      return;
    }
    setTimeout(() => {
      // 秒传 直接展示
      if (res.data.uploaded) {
        // 秒传结果
      } else if (res.data.merge) {
        // 需要合并
        handleSuccess(file);
      } else {
        // 上传错误
        file.cancel();
        createMessage.error(`上传失败`);
      }
    }, 300);
  }
  function onFileProgress(_rootFile, _file, _chunk) {}
  function onFileError(_rootFile, file, _response, _chunk) {
    file.cancel();
    createMessage.error(`上传失败`);
  }
  function handleSuccess(file) {
    const query = {
      identifier: file.uniqueIdentifier,
      fileName: file.name.replaceAll('#', ''),
      fileSize: file.size,
      fileType: file.getType(),
      extension: file.getExtension(),
      parentId: props.parentId,
    };
    documentMerge(query)
      .then(res => {
        // 自定义完成状态
        file.customCompleted = true;
        emit('fileSuccess', res.data);
        file.cancel();
      })
      .catch(() => {
        file.cancel();
      });
  }
  function onComplete() {
    uploaderRef.value?.uploader.cancel();
    panelShow.value = false;
    uploadKey.value = +new Date();
  }

  onMounted(() => {
    nextTick(() => {
      (window as any).uploader = uploaderRef.value?.uploader;
    });
  });
</script>
<style lang="less">
  #document-file-uploader {
    position: fixed;
    z-index: 20;
    right: 10px;
    bottom: 10px;

    .uploader-app {
      width: 600px;
    }
    .file-panel {
      background-color: @component-background;
      border: 1px solid @border-color-base;
      border-radius: 6px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);

      .file-title {
        display: flex;
        height: 50px;
        line-height: 50px;
        padding: 0 15px;
        border-bottom: 1px solid @border-color-base;
        font-size: 16px;

        .operate {
          flex: 1;
          text-align: right;
          .icon-ym-nav-close {
            font-size: 16px;
            cursor: pointer;
          }
        }
      }
      .upload-file-list {
        position: relative;
        height: 240px;
        overflow-x: hidden;
        overflow-y: auto;
        background-color: @component-background;
        font-size: 14px;

        > li {
          background-color: @component-background;
        }
        .uploader-file {
          line-height: 48px !important;
          height: 49px !important;
          border-bottom: 1px solid @border-color-base;
          .uploader-file-info {
            padding: 0 10px;
            line-height: 48px;
          }
        }
      }
    }
    .uploader-file-icon {
      &:before {
        content: '' !important;
      }
    }

    .uploader-file-actions > span {
      margin-right: 6px;
    }
    .uploader-app .upload-file-list .upload-file-list__item {
      margin-top: 0;
      border-radius: 0;
    }
  }

  /* 隐藏上传按钮 */
  #file-uploader-btn {
    position: absolute;
    clip: rect(0, 0, 0, 0);
  }
</style>
