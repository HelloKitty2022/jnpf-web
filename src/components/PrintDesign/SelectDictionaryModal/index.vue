<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="选择字典分类" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { getDictionaryTypeSelector } from '/@/api/systemData/dictionary';

  interface State {
    node: any;
  }

  const state = reactive<State>({
    node: '',
  });
  const emit = defineEmits(['register', 'reload']);
  const [registerModal, { closeModal }] = useModalInner(init);
  const [registerForm, { resetFields, validate, updateSchema }] = useForm({
    labelWidth: 80,
    schemas: [
      {
        field: 'dictionaryType',
        label: '数据字典',
        component: 'TreeSelect',
        componentProps: { placeholder: '请选择', lastLevel: true },
        rules: [{ required: true, trigger: 'change', message: '必填' }],
      },
    ],
  });

  function init(data) {
    state.node = data.node;
    resetFields();
    getDictionaryType();
  }
  function getDictionaryType() {
    getDictionaryTypeSelector().then(res => {
      const dictionaryOptions = res.data.list.filter(o => o.children && o.children.length);
      updateSchema({ field: 'dictionaryType', componentProps: { options: dictionaryOptions } });
    });
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    closeModal();
    emit('reload', values.dictionaryType, state.node);
  }
</script>
