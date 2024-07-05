<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="数据连接" showOkBtn @ok="handleSubmit">
    <BasicForm @register="registerForm">
      <template #dataSelect="{ model, field }">
        <TableModal :dbLinkId="state.dataForm.dbLinkId" :value="model[field]" @change="onTableModalChange" />
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { update } from '/@/api/system/authorize';
  import { useMessage } from '/@/hooks/web/useMessage';
  import TableModal from '../connectForm/TableModal.vue';

  interface State {
    moduleId: string;
    id: string;
    dataType: string;
    dataForm: any;
    dbOptions: any[];
  }

  const state = reactive<State>({
    moduleId: '',
    id: '',
    dataType: '',
    dataForm: {
      id: '',
      dbLinkId: '0',
      dataSelect: [],
    },
    dbOptions: [],
  });
  const schemas: FormSchema[] = [
    {
      field: 'dbLinkId',
      label: '数据连接',
      component: 'Select',
      defaultValue: '0',
      componentProps: { placeholder: '请选择', allowClear: false, showSearch: true, fieldNames: { options: 'children' }, onChange: onDbLinkIdChange },
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      field: 'dataSelect',
      label: '数据选择',
      component: 'Select',
      slot: 'dataSelect',
      rules: [{ required: true, trigger: 'change', message: '必填', type: 'array' }],
    },
  ];
  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const [registerForm, { setFieldsValue, validate, resetFields, clearValidate, updateSchema }] = useForm({ labelWidth: 80, schemas: schemas });
  const [registerModal, { closeModal, changeOkLoading }] = useModalInner(init);

  function init(data) {
    resetFields();
    state.id = data.id;
    state.moduleId = data.moduleId;
    state.dbOptions = data.dbOptions;
    updateSchema([{ field: 'dbLinkId', componentProps: { options: state.dbOptions } }]);
    state.dataType = data.dataType;
    if (data.dataList) {
      state.dataForm.id = data.dataList.id || '';
      state.dataForm.dbLinkId = data.dataList.linkId || '0';
      state.dataForm.dataSelect = data.dataList.linkTables ? data.dataList.linkTables.split(',') : [];
      setFieldsValue({
        dbLinkId: state.dataForm.dbLinkId,
        dataSelect: state.dataForm.dataSelect,
      });
      clearValidate();
    }
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    const query = {
      moduleId: state.moduleId,
      linkId: values.dbLinkId,
      linkTables: state.dataForm.dataSelect.toString(),
      dataType: state.dataType,
      id: state.dataForm.id,
    };
    update(query)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        closeModal();
        emit('reload');
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
  function onTableModalChange(val) {
    state.dataForm.dataSelect = val;
    setFieldsValue({ dataSelect: val });
    if (val?.length) clearValidate();
  }
  function onDbLinkIdChange(val) {
    state.dataForm.dbLinkId = val;
    setFieldsValue({ dataSelect: [] });
    clearValidate();
  }
</script>
