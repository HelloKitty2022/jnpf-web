<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    defaultFullscreen
    :footer="null"
    :closable="false"
    :keyboard="false"
    class="jnpf-full-modal full-modal report-modal">
    <iframe :src="state.url" width="100%" height="100%" frameborder="0" class="frame" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive, onMounted } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useGlobSetting } from '/@/hooks/setting';
  import { getToken } from '/@/utils/auth';

  interface State {
    url: string;
  }

  const emit = defineEmits(['register', 'reload']);
  const { report } = useGlobSetting();
  const [registerModal, { closeModal }] = useModalInner(init);
  const state = reactive<State>({
    url: '',
  });

  function init(data) {
    state.url = `${report}/index.html?token=${getToken()}${data.id ? '&id=' + data.id : ''}`;
  }
  function handleMessage(e) {
    const data = e.data;
    if (data !== 'closeDialog') return;
    state.url = '';
    closeModal();
    emit('reload');
  }

  onMounted(() => {
    window.addEventListener('message', handleMessage);
  });
</script>
<style lang="less">
  .report-modal {
    .ant-modal-header {
      display: none !important;
    }
    .scrollbar {
      padding: 0 !important;
    }
  }
</style>
