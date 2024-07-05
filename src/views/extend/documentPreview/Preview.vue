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
  import { previewFile } from '/@/api/extend/documentPreview';
  import { getToken } from '/@/utils/auth';
  import { useGlobSetting } from '/@/hooks/setting';
  import { encryptByBase64 } from '/@/utils/cipher';

  interface State {
    visible: boolean;
    loading: boolean;
    title: string;
    url: string;
  }

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const globSetting = useGlobSetting();
  const state = reactive<State>({
    visible: false,
    loading: false,
    title: '',
    url: '',
  });
  const { visible, loading, title, url } = toRefs(state);

  defineExpose({ init });

  function init(data) {
    state.title = '文档预览 - ' + data.name;
    state.url = '';
    if (!data.id) return (state.visible = false);
    state.visible = true;
    state.loading = true;
    previewFile(data.id, data.type)
      .then(res => {
        state.loading = false;
        if (res.data) {
          if (data.type === 'localPreview') {
            state.url = `${globSetting.filePreviewServer}/onlinePreview?url=` + encodeURIComponent(encryptByBase64(res.data)) + '&token=' + getToken();
            return;
          }
          state.url = res.data;
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
