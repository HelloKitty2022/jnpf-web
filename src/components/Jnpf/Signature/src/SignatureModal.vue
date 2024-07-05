<template>
  <a-modal v-model:visible="visible" title="选择签章" class="jnpf-signature-modal" centered :maskClosable="false" :keyboard="false" :width="600">
    <template #closeIcon>
      <ModalClose :canFullscreen="false" @cancel="handleCancel" />
    </template>
    <template #footer>
      <a-button @click="handleCancel">{{ t('common.cancelText') }}</a-button>
      <a-button type="primary" @click="handleSubmit">{{ t('common.okText') }}</a-button>
    </template>
    <div class="sign-main">
      <a-form :colon="false" :labelCol="{ style: { width: '80px' } }" :model="dataForm" ref="formElRef">
        <a-form-item label="电子签章" name="innerValue">
          <jnpf-select v-model:value="dataForm.innerValue" :options="options" showSearch allowClear />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
  import { getListByIds } from '/@/api/system/signature';
  import { Modal as AModal } from 'ant-design-vue';
  import { reactive, ref, toRefs } from 'vue';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { FormInstance } from 'ant-design-vue';

  interface State {
    dataForm: any;
    visible: boolean;
    options: any[];
  }
  const emit = defineEmits(['register', 'confirm']);
  defineExpose({ openModal });
  const { t } = useI18n();
  const formElRef = ref<FormInstance>();
  const state = reactive<State>({
    dataForm: {
      innerValue: '',
    },
    visible: false,
    options: [],
  });
  const { dataForm, visible, options } = toRefs(state);

  function openModal(data) {
    state.visible = true;
    state.dataForm.innerValue = data.value || '';
    if (!data.ableIds || !data.ableIds.length) return;
    getListByIds(data.ableIds).then(res => {
      const list = res?.data?.list || [];
      state.options = list.map(o => ({ id: o.icon, fullName: o.fullName }));
    });
  }
  function handleCancel() {
    state.visible = false;
  }
  async function handleSubmit() {
    const values = await formElRef.value?.validate();
    if (!values) return;
    emit('confirm', values.innerValue || '');
    handleCancel();
  }
</script>
<style lang="less">
  .jnpf-signature-modal {
    .ant-modal-body {
      padding: 40px 50px !important;
    }
  }
</style>
