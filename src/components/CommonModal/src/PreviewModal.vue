<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" :footer="null" :width="600" class="jnpf-add-modal jnpf-preview-modal">
    <div class="add-main">
      <div class="add-item add-item-left" @click="previewPc()">
        <i class="add-icon icon-ym icon-ym-pc"></i>
        <div class="add-txt">
          <p class="add-title">Web预览</p>
        </div>
      </div>
      <div class="add-item" @click="previewApp()">
        <i class="add-icon icon-ym icon-ym-mobile"></i>
        <div class="add-txt">
          <p class="add-title">App预览</p>
        </div>
      </div>
    </div>
    <BasicModal v-bind="$attrs" @register="registerQrModal" :title="title" :footer="null" :width="400" class="jnpf-qrcode-modal">
      <jnpf-qrcode :staticText="qrCodeText" :width="280" />
      <p class="tip">打开手机APP扫码预览</p>
    </BasicModal>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, ref, reactive } from 'vue';
  import { useGo } from '/@/hooks/web/usePage';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';

  interface State {
    type: string;
    id: string;
    dataSource: string;
    fullName: string;
    previewType: number;
  }

  const emit = defineEmits(['register', 'previewPc']);
  const [registerModal, { closeModal }] = useModalInner(init);
  const [registerQrModal, { openModal: openQrModal }] = useModal();
  const go = useGo();
  const qrCodeText = ref('');
  const state = reactive<State>({
    type: '',
    id: '',
    dataSource: '',
    fullName: '',
    previewType: 0,
  });

  const title = computed(() => {
    if (state.type === 'webDesign' || state.type === 'flow') {
      if (state.previewType == 0) return '预览设计中的表单';
      return '预览已发布的表单';
    }
    return '预览';
  });

  function init(data) {
    state.type = data.type || '';
    state.id = data.id;
    state.dataSource = data.dataSource || '';
    state.fullName = data.fullName || '';
    state.previewType = data.previewType || 0;
  }
  function previewPc() {
    closeModal();
    if (state.type === 'webDesign') {
      if (!state.id) return;
      go(`/previewModel?isPreview=1&id=${state.id}&previewType=${state.previewType}`);
      return;
    }
    setTimeout(() => {
      emit('previewPc', { id: state.id });
    }, 300);
  }
  function previewApp() {
    let data: any = {
      t: state.type === 'flow' ? 'WFP' : state.type === 'webDesign' ? 'ADP' : state.type,
      id: state.id,
    };
    if (state.type === 'report') data.fullName = state.fullName;
    if (state.type === 'flow') data.ds = state.dataSource;
    if (state.type == 'webDesign') data.previewType = state.previewType;
    qrCodeText.value = JSON.stringify(data);
    closeModal();
    openQrModal(true);
  }
</script>
<style lang="less">
  .jnpf-qrcode-modal {
    .jnpf-qrcode {
      padding: 10px;
    }
    .tip {
      text-align: center;
      font-size: 18px;
      margin-top: 10px;
      padding-bottom: 20px;
      color: @text-color-secondary;
    }
  }
</style>
