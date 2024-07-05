<template>
  <BasicModal v-bind="$attrs" @register="registerModal" defaultFullscreen :footer="null" :closable="false" :keyboard="false" class="jnpf-full-modal full-modal">
    <template #title>
      <div class="jnpf-full-modal-header">
        <div class="header-title">
          <img src="../../../assets/images/jnpf.png" class="header-logo" />
          <p class="header-txt"> · 打印预览</p>
        </div>
        <a-space class="options" :size="10">
          <a-button type="primary" @click="handlePrint()">打印</a-button>
          <a-button @click="closeModal()">{{ t('common.cancelText') }}</a-button>
        </a-space>
      </div>
    </template>
    <div class="basic-content">
      <div ref="printRrf" class="print-content" v-html="printData" />
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getPrintDevInfo } from '/@/api/system/printDev';

  const printData = ref<any>('null');
  const printRrf = ref(null);
  const { t } = useI18n();
  const [registerModal, { closeModal, changeLoading }] = useModalInner(init);

  function init(data) {
    printData.value = '';
    if (data.id) {
      changeLoading(true);
      getPrintDevInfo(data.id)
        .then(res => {
          printData.value = res.data.printTemplate;
          changeLoading(false);
        })
        .then(() => {
          changeLoading(false);
        });
    }
  }
  function handlePrint() {
    let print = (printRrf.value as any)?.innerHTML;
    let newWindow = window.open('_blank');
    (newWindow as any).document.body.innerHTML = print;
    (newWindow as any).print();
    (newWindow as any).close();
  }
</script>
<style lang="less" scoped>
  .print-content {
    background-color: @component-background;
    padding: 40px 30px;
    margin: 0 auto;
    border-radius: 4px;
    width: 776px;
    height: 100%;
    overflow: hidden auto;

    :deep(table) {
      border-color: gray;
    }
  }
</style>
