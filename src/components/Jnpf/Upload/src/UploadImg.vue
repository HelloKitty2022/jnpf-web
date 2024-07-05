<template>
  <div class="upload-img-container" :class="$attrs.class">
    <transition-group class="ant-upload-list ant-upload-list-picture-card" tag="div" name="list" v-if="!simple">
      <div class="ant-upload-list-picture-card-container" v-for="(file, index) in imgList" :key="file.fileId">
        <div class="ant-upload-list-item ant-upload-list-item-done ant-upload-list-item-list-type-picture-card">
          <div class="ant-upload-list-item-info">
            <a class="ant-upload-list-item-thumbnail">
              <img :src="apiUrl + (file.thumbUrl || file.url)" class="ant-upload-list-item-image" />
            </a>
          </div>
          <span class="ant-upload-list-item-actions">
            <EyeOutlined @click="handlePreview(index)" />
            <DeleteOutlined @click="handleRemove(index)" v-if="!disabled && !detailed" />
          </span>
        </div>
      </div>
    </transition-group>
    <p class="link-text" @click="handlePreview(0)" v-if="simple">查看图片</p>
    <a-upload
      v-model:file-list="fileList"
      list-type="picture-card"
      class="img-uploader"
      :accept="accept"
      :disabled="disabled || detailed"
      :show-upload-list="false"
      :multiple="limit != 1"
      :max-count="limit === 0 ? undefined : limit"
      :action="getAction"
      :headers="getHeaders"
      :before-upload="beforeUpload"
      @change="handleChange"
      :data="getUploadData"
      v-if="!detailed">
      <div>
        <plus-outlined></plus-outlined>
        <div class="ant-upload-text" v-if="buttonText">{{ props.buttonText }}</div>
      </div>
    </a-upload>
    <div class="upload-img__tip" v-if="tipText && !detailed">{{ tipText }}</div>
  </div>
</template>

<script lang="ts" setup>
  import { Form, Upload as AUpload } from 'ant-design-vue';
  import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import type { UploadChangeParam, UploadFile } from 'ant-design-vue';
  import { computed, ref, unref, watch } from 'vue';
  import { uploadImgProps, imgItem, units } from './props';
  import { useGlobSetting } from '/@/hooks/setting';
  import { getToken } from '/@/utils/auth';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { createImgPreview } from '/@/components/Preview/index';

  defineOptions({ name: 'JnpfUploadImg', inheritAttrs: false });
  const props = defineProps(uploadImgProps);
  const emit = defineEmits(['update:value', 'change']);
  const { createMessage } = useMessage();
  const globSetting = useGlobSetting();
  const fileList = ref<UploadFile[]>([]);
  const imgList = ref<imgItem[]>([]);
  const loading = ref<boolean>(false);
  const apiUrl = ref(globSetting.apiUrl);
  const formItemContext = Form.useInjectFormItemContext();

  const getAction = computed(() => globSetting.uploadUrl + '/' + props.type);
  const getHeaders = computed(() => ({ Authorization: getToken() as string }));
  const getUploadData = computed(() => ({ pathType: props.pathType, isAccount: props.isAccount, folder: props.folder }));

  watch(
    () => props.value,
    val => {
      imgList.value = val && Array.isArray(val) ? val : [];
    },
    { deep: true, immediate: true },
  );

  function beforeUpload(file) {
    const isTopLimit = props.limit ? imgList.value.length >= props.limit : false;
    if (isTopLimit) {
      createMessage.error(`当前限制最多可以上传${props.limit}张图片`);
      return AUpload.LIST_IGNORE;
    }
    const isAccept = new RegExp('image/*').test(file.type);
    if (!isAccept) {
      createMessage.error(`请上传图片`);
      return AUpload.LIST_IGNORE;
    }
    if (!props.fileSize) return true;
    const unitNum = units[props.sizeUnit];
    const isRightSize = file.size / unitNum < props.fileSize;
    if (!isRightSize) {
      createMessage.error(`图片大小超过${props.fileSize}${props.sizeUnit}`);
      return AUpload.LIST_IGNORE;
    }
    return true;
  }

  function handleChange({ file }: UploadChangeParam) {
    if (file.status === 'uploading') return (loading.value = true);
    if (file.status === 'error') {
      loading.value = false;
      fileList.value = fileList.value.filter(o => o.uid != file.uid);
      createMessage.error('上传失败');
      return;
    }
    if (file.status === 'done') {
      loading.value = false;
      if (file.response.code === 200) {
        const isTopLimit = props.limit ? imgList.value.length >= props.limit : false;
        if (isTopLimit) {
          fileList.value = fileList.value.filter(o => o.uid != file.uid);
          createMessage.error(`当前限制最多可以上传${props.limit}张图片`);
          return;
        }
        imgList.value.push({
          name: file.name,
          fileId: file.response.data.name,
          url: file.response.data.url,
          thumbUrl: file.response.data.thumbUrl,
        });
        emit('update:value', unref(imgList));
        emit('change', unref(imgList));
        formItemContext.onFieldChange();
      } else {
        fileList.value = fileList.value.filter(o => o.uid != file.uid);
        createMessage.error(file.response.msg);
      }
    }
  }
  function handlePreview(index: number) {
    const imageList = imgList.value.map(o => apiUrl.value + o.url);
    createImgPreview({ imageList: imageList, index });
  }
  function handleRemove(index: number) {
    fileList.value.splice(index, 1);
    imgList.value.splice(index, 1);
    emit('update:value', unref(imgList));
    emit('change', unref(imgList));
    formItemContext.onFieldChange();
  }
</script>
<style lang="less" scoped>
  .upload-img-container {
    .ant-upload-list {
      display: inline;
      .ant-upload-list-picture-card-container {
        width: 100px;
        height: 100px;
        .ant-upload-list-item {
          padding: 0;
          .ant-upload-list-item-info img {
            object-fit: unset;
          }
          .ant-upload-list-item-actions {
            .anticon-eye,
            .anticon-delete {
              font-size: 20px;
              margin: 0 10px;
            }
          }
        }
      }
    }
    .img-uploader {
      width: 100px;
      :deep(.ant-upload) {
        width: 100px;
        height: 100px;
        .anticon {
          font-size: 26px;
          color: #8c939d;
        }
        .ant-upload-text {
          margin-top: 10px;
          color: #8c939d;
        }
      }
    }
    .list-enter-active,
    .list-leave-active {
      transition: all 1s ease;
    }
    .list-enter-from,
    .list-leave-to {
      opacity: 0;
      transform: translateY(-30px);
    }
    .upload-img__tip {
      line-height: 1.2;
      color: @text-color-secondary;
      font-size: 12px;
      word-break: break-all;
    }
  }
</style>
<style lang="less">
  .ant-table {
    .upload-img-container {
      .ant-upload-list {
        white-space: pre-wrap;
      }
    }
  }
</style>
