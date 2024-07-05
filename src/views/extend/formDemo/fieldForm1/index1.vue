<template>
  <div class="jnpf-content-wrapper jnpf-content-wrapper-form">
    <div class="jnpf-common-page-header">
      <BasicTitle>表单示例</BasicTitle>
      <a-space>
        <a-button type="primary" :loading="btnLoading" @click="handleSubmit">{{ t('common.okText') }}</a-button>
        <a-button @click="resetFields">{{ t('common.resetText') }}</a-button>
      </a-space>
    </div>
    <div class="jnpf-content-wrapper-form-body">
      <ScrollContainer v-loading="loading">
        <div class="p-10px">
          <BasicForm @register="registerForm" />
        </div>
      </ScrollContainer>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { getDictionaryType } from '/@/api/systemData/dictionary';
  import { ref } from 'vue';
  import { Space as ASpace } from 'ant-design-vue';
  import { ScrollContainer } from '/@/components/Container';
  import { BasicTitle } from '/@/components/Basic';
  import { BasicForm, useForm } from '/@/components/Form';
  import { getFormSchema } from './schemaData';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';

  defineOptions({ name: 'extend-formDemo' });

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const loading = ref(false);
  const btnLoading = ref(false);
  const [registerForm, { resetFields, validate, updateSchema }] = useForm({
    labelWidth: 100,
    labelAlign: 'right',
    schemas: getFormSchema(),
  });
  function initData() {
    getDictionaryType().then(res => {
      const treeData = res.data.list;
      updateSchema({ field: 'fieldTreeSelect', componentProps: { options: treeData } });
      updateSchema({ field: 'fieldCascader', componentProps: { options: treeData } });
    });
  }

  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    btnLoading.value = true;
    setTimeout(() => {
      btnLoading.value = false;
    }, 1000);
    createMessage.success('请在控制台查看！');
  }

  initData();
</script>
