<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" showOkBtn @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getInfo, updateTable, createTable } from '/@/api/extend/table';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    dataForm: any;
  }

  const state = reactive<State>({
    dataForm: {},
  });
  const schemas: FormSchema[] = [
    {
      field: 'projectName',
      label: '项目名称',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'projectCode',
      label: '项目编码',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'principal',
      label: '负责人',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'jackStands',
      label: '立项人',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
    },
    {
      field: 'projectType',
      label: '项目类型',
      component: 'Select',
      componentProps: { placeholder: '请选择' },
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      field: 'projectPhase',
      label: '项目阶段',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
    },
    {
      field: 'customerName',
      label: '客户名称',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
    },
    {
      field: 'interactionDate',
      label: '交互日期',
      component: 'DatePicker',
      componentProps: { placeholder: '请选择' },
    },
    {
      field: 'costAmount',
      label: '费用金额',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: { placeholder: '请输入' },
    },
    {
      field: 'tunesAmount',
      label: '已用金额',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: { placeholder: '请输入' },
    },
    {
      field: 'projectedIncome',
      label: '预计收入',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: { placeholder: '请输入' },
    },
    {
      field: 'description',
      label: '备注',
      component: 'Textarea',
      componentProps: { placeholder: '请输入', rows: 3 },
    },
  ];
  const getTitle = computed(() => (!state.dataForm.id ? t('common.addText') : t('common.editText')));
  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerForm, { setFieldsValue, validate, resetFields, updateSchema }] = useForm({ labelWidth: 80, schemas: schemas });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);

  function init(data) {
    resetFields();
    state.dataForm.id = data.id;
    if (data.industryTypeList) updateSchema({ field: 'projectType', componentProps: { options: data.industryTypeList } });
    if (state.dataForm.id) {
      changeLoading(true);
      getInfo(state.dataForm.id).then(res => {
        const data = res.data;
        state.dataForm = data;
        setFieldsValue(data);
        changeLoading(false);
      });
    }
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    const query = {
      ...values,
      id: state.dataForm.id,
    };
    const formMethod = state.dataForm.id ? updateTable : createTable;
    formMethod(query)
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
</script>
