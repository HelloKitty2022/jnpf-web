<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" title="查看缓存">
    <BasicForm @register="registerForm" class="!px-10px" />
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { getInfo } from '/@/api/system/cache';

  const id = ref('');
  const schemas: FormSchema[] = [
    {
      field: 'name',
      label: 'STRING',
      component: 'Input',
      componentProps: { placeholder: 'STRING', readonly: true },
    },
    {
      field: 'value',
      label: 'VALUE',
      component: 'Textarea',
      componentProps: { placeholder: 'VALUE', rows: 30, readonly: true },
    },
  ];
  const [registerForm, { setFieldsValue, resetFields }] = useForm({ labelWidth: 50, schemas: schemas });
  const [registerPopup, { changeLoading }] = usePopupInner(init);

  function init(data) {
    resetFields();
    id.value = data.id;
    if (id.value) {
      changeLoading(true);
      getInfo(id.value).then(res => {
        setFieldsValue(res.data);
        changeLoading(false);
      });
    }
  }
</script>
