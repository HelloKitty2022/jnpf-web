<template>
  <Uploader
    :options="options"
    :file-status-text="statusText"
    class="uploader-app"
    :class="{ isFirst: !value.length }"
    ref="uploaderRef"
    @file-added="onFileAdded"
    @file-success="onFileSuccess"
    @file-progress="onFileProgress"
    @file-error="onFileError"
    :autoStart="false">
    <uploader-unsupport></uploader-unsupport>
    <UploaderBtn id="file-uploader-btn" ref="uploaderBtnRef" :attrs="attrs">选择文件</UploaderBtn>
    <uploader-list>
      <template #default="{ fileList }">
        <div class="upload-file-list">
          <div class="upload-file-list__item" v-for="file in fileList" :key="file.id">
            <uploader-file :class="'file_' + file.id" ref="files" :file="file" :list="true">
              <template #default="props">
                <FileItem :file="props.file" :list="props.list" />
              </template>
            </uploader-file>
          </div>
        </div>
      </template>
    </uploader-list>
  </Uploader>
</template>

<script lang="ts" setup>
  import { nextTick, ref, onMounted, reactive, computed, unref, watch } from 'vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { getToken } from '/@/utils/auth';
  import VueSimpleUploader from 'vue-simple-uploader';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { uploadFileProps, units } from '../props';
  import SparkMD5 from 'spark-md5';
  import { chunkMerge } from '/@/api/basic/common';
  import FileItem from './FileItem.vue';
  import 'vue-simple-uploader/dist/style.css';

  const Uploader = VueSimpleUploader.Uploader;
  const UploaderBtn = VueSimpleUploader.UploaderBtn;
  const UploaderUnsupport = VueSimpleUploader.UploaderUnsupport;
  const UploaderList = VueSimpleUploader.UploaderList;
  const UploaderFile = VueSimpleUploader.UploaderFile;

  const props = defineProps(uploadFileProps);
  const emit = defineEmits(['fileSuccess']);
  const { createMessage } = useMessage();
  const globSetting = useGlobSetting();
  const uploaderRef = ref<any>(null);
  const uploaderBtnRef = ref<any>(null);
  const options = reactive({
    target: globSetting.apiUrl + '/api/file/chunk',
    chunkSize: 1024 * 1024 * 5,
    maxChunkRetries: 5,
    singleFile: props.limit === 1,
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
  const messageKey = 'upload';
  const attrs = ref({ accept: props.accept || '*' });
  const statusText = {
    success: '上传成功',
    error: '上传失败',
    uploading: '上传中',
    paused: '暂停中',
    waiting: '等待中',
  };

  const getAcceptText = computed(() => {
    let txt = '';
    if (props.accept.includes('image/*')) txt += '、图片';
    if (props.accept.includes('video/*')) txt += '、视频';
    if (props.accept.includes('audio/*')) txt += '、音频';
    if (props.accept.includes('.xls,.xlsx')) txt += '、excel';
    if (props.accept.includes('.doc,.docx')) txt += '、word';
    if (props.accept.includes('.pdf')) txt += '、pdf';
    if (props.accept.includes('.txt')) txt += '、txt';
    return txt.slice(1);
  });

  watch(
    () => props.accept,
    val => {
      attrs.value.accept = val || '*';
    },
  );

  defineExpose({ openUploader });

  function openUploader() {
    uploaderBtnRef.value.$el.click();
  }
  // 上传前校验
  function beforeUpload(file) {
    const isTopLimit = props.limit ? props.value.length >= props.limit : false;
    if (isTopLimit) {
      createMessage.error({ content: `当前限制最多可以上传${props.limit}个文件`, key: messageKey });
      return false;
    }
    if (!props.fileSize) return true;
    const unitNum = units[props.sizeUnit];
    const isRightSize = file.size / unitNum < props.fileSize;
    if (!isRightSize) {
      createMessage.error({ content: `文件大小超过${props.fileSize}${props.sizeUnit}`, key: messageKey });
      return isRightSize;
    }
    const isAccept = checkAccept(file);
    if (!isAccept) {
      createMessage.error({ content: `请选择${unref(getAcceptText)}类型的文件`, key: messageKey });
      return isAccept;
    }
    return isRightSize && isAccept;
  }
  // 校验格式
  function checkAccept(file) {
    if (!props.accept || props.accept === '*') return true;
    const extension = file.getExtension();
    const fileType = file.fileType;
    if (props.accept.indexOf(extension) > -1) return true;
    if (props.accept.includes('image/*') && new RegExp('image/*').test(fileType)) return true;
    if (props.accept.includes('video/*') && new RegExp('video/*').test(fileType)) return true;
    if (props.accept.includes('audio/*') && new RegExp('audio/*').test(fileType)) return true;
    return false;
  }
  function onFileAdded(file) {
    if (beforeUpload && typeof beforeUpload === 'function' && !beforeUpload(file)) {
      file.cancel();
      return false;
    }
    // 自定义状态
    file.customStatus = 'check';
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
  function onFileProgress(_rootFile, _file, _chunk) {
    // console.log(`上传中 ${_file.name}，chunk：${_chunk.startByte / 1024 / 1024} ~ ${_chunk.endByte / 1024 / 1024}`);
  }
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
      type: props.type,
      pathType: props.pathType,
      isAccount: props.isAccount,
      folder: props.folder,
    };
    chunkMerge(query)
      .then(res => {
        // 自定义完成状态
        file.customCompleted = true;
        const data = {
          name: file.name.replaceAll('#', ''),
          fileId: res.data.name,
          fileSize: res.data.fileSize,
          fileExtension: res.data.fileExtension,
          fileVersionId: res.data.fileVersionId,
          url: res.data.url,
        };
        emit('fileSuccess', data);
        file.cancel();
      })
      .catch(() => {
        file.cancel();
      });
  }

  onMounted(() => {
    nextTick(() => {
      (window as any).uploader = uploaderRef.value?.uploader;
    });
  });
</script>
<style lang="less">
  .uploader-app {
    margin: 0;
    padding: 0;
    &.isFirst .upload-file-list {
      .upload-file-list__item {
        margin-top: 10px;
      }
    }
    .upload-file-list {
      .upload-file-list__item {
        margin-top: 5px;
        border-radius: 4px;
        overflow: hidden;
      }
      .uploader-file {
        border-bottom: none;
        height: 26px !important;
        line-height: 26px;
        &:hover {
          background-color: @selected-hover-bg;
        }
      }
    }
    .uploader-file-icon {
      &:before {
        content: '' !important;
      }
    }
  }
  /* 隐藏上传按钮 */
  #file-uploader-btn {
    position: absolute;
    clip: rect(0, 0, 0, 0);
  }
</style>
