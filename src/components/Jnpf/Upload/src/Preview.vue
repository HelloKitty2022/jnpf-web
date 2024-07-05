<template>
  <a-modal
    v-model:visible="visible"
    :footer="null"
    :closable="false"
    :keyboard="false"
    :maskClosable="false"
    class="common-container-modal jnpf-full-modal full-modal file-preview-modal"
    wrap-class-name="fullscreen-modal">
    <template #closeIcon>
      <ModalClose :canFullscreen="false" @cancel="handleCancel" />
    </template>
    <template #title>
      <div class="jnpf-full-modal-header">
        <div class="header-title">
          <p class="header-txt">{{ title }}</p>
        </div>
        <a-space class="options" :size="10">
          <a-button type="primary" @click="handleDownload()" v-if="showDownload">下载</a-button>
          <a-button @click="handleCancel()">{{ t('common.cancelText') }}</a-button>
        </a-space>
      </div>
    </template>
    <div class="basic-content bg-white" v-loading="loading">
      <iframe width="100%" height="100%" :src="url" frameborder="0"></iframe>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
  import { reactive, toRefs } from 'vue';
  import { Modal as AModal } from 'ant-design-vue';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getDownloadUrl, previewFile } from '/@/api/basic/common';
  import { downloadByUrl } from '/@/utils/file/download';
  import { getToken } from '/@/utils/auth';

  interface State {
    visible: boolean;
    loading: boolean;
    title: string;
    url: string;
    file: any;
  }
  const props = defineProps({
    showDownload: { type: Boolean, default: false },
    type: { type: String, default: 'annex' },
  });
  defineEmits(['register']);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const state = reactive<State>({
    visible: false,
    loading: false,
    title: '',
    url: '',
    file: {},
  });
  const { visible, loading, title, url } = toRefs(state);

  defineExpose({ init });

  function init(file) {
    state.title = '文档预览 - ' + file.name;
    state.url = '';
    state.file = file;
    state.visible = true;
    state.loading = true;
    let query = {
      fileName: file.fileId,
      fileVersionId: file.fileVersionId,
      fileDownloadUrl: file.url,
    };
    previewFile(query)
      .then(res => {
        state.loading = false;
        if (res.data) {
          state.url = res.data + '&token=' + getToken();
        } else {
          createMessage.warning('文件不存在');
          handleCancel();
        }
      })
      .catch(() => {
        state.loading = false;
        handleCancel();
      });
  }
  function handleCancel() {
    state.visible = false;
  }
  function handleDownload() {
    if (!state.file.fileId) return;
    getDownloadUrl(props.type, state.file.fileId).then(res => {
      downloadByUrl({ url: res.data.url, fileName: state.file.name });
    });
  }
</script>
<style lang="less">
  .file-preview-modal {
    .ant-modal-body {
      padding: 10px !important;
    }
    .header-txt {
      max-width: 80vw !important;
    }
  }
</style>
