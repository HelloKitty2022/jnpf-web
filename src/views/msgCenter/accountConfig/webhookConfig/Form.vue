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
  import { create, update, getInfo } from '/@/api/msgCenter/accountConfig';
  import formValidate from '/@/utils/formValidate';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    dataForm: any;
  }

  const state = reactive<State>({
    dataForm: {},
  });
  const schemas: FormSchema[] = [
    {
      field: 'fullName',
      label: '名称',
      component: 'Input',
      componentProps: { placeholder: '请输入', maxlength: 50 },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'enCode',
      label: '编码',
      component: 'Input',
      componentProps: { placeholder: '请输入', maxlength: 50 },
      rules: [
        { required: true, trigger: 'blur', message: '必填' },
        { validator: formValidate('enCode'), trigger: 'blur' },
      ],
    },
    {
      field: 'webhookType',
      label: '类型',
      component: 'Select',
      componentProps: { placeholder: '请选择', onChange: onWebhookTypeChange },
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      field: 'webhookAddress',
      label: 'WebHook地址',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'approveType',
      label: '认证类型',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { fullName: '无需认证', id: '1' },
          { fullName: 'bearer令牌', id: '2' },
        ],
      },
      rules: [{ required: true, trigger: 'change', message: '必填', type: 'string' }],
    },
    {
      ifShow: ({ values }) => values.approveType == '2',
      field: 'bearer',
      label: 'Bearer令牌',
      component: 'Input',
      helpMessage: '密钥',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'sortCode',
      label: '排序',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: { min: '0', max: '999999', placeholder: '请输入' },
    },
    {
      field: 'enabledMark',
      label: '状态',
      component: 'Switch',
      defaultValue: 1,
    },
    {
      field: 'description',
      label: '说明',
      component: 'Textarea',
      componentProps: { rows: 3, placeholder: '请输入' },
    },
  ];
  const getTitle = computed(() => (!state.dataForm.id ? t('common.addText') : t('common.editText')));
  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerForm, { setFieldsValue, validate, resetFields, updateSchema }] = useForm({ labelWidth: 120, schemas: schemas });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);

  function init(data) {
    resetFields();
    state.dataForm.id = data.id;
    updateSchema({ field: 'approveType', componentProps: { disabled: false } });
    if (data.categoryList) updateSchema({ field: 'webhookType', componentProps: { options: data.categoryList } });
    if (state.dataForm.id) {
      changeLoading(true);
      getInfo(state.dataForm.id).then(res => {
        const data = res.data;
        state.dataForm = data;
        setFieldsValue(data);
        updateSchema({ field: 'approveType', componentProps: { disabled: data.webhookType == '2' ? true : false } });
        changeLoading(false);
      });
    }
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    let query = {
      ...values,
      id: state.dataForm.id,
      type: 6,
    };
    if (query.approveType == '1') {
      query.bearer = '';
      query.userName = '';
      query.password = '';
    } else if (query.approveType == '2') {
      query.userName = '';
      query.password = '';
    } else {
      query.bearer = '';
    }
    const formMethod = state.dataForm.id ? update : create;
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
  function onWebhookTypeChange(val) {
    if (val == 2) setFieldsValue({ approveType: '1', bearer: '' });
    updateSchema({ field: 'approveType', componentProps: { disabled: val == 2 ? true : false } });
  }
</script>
