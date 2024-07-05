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
      field: 'appKey',
      label: '原始ID',
      component: 'Input',
      helpMessage: '请在“微信公众号管理后台-设置与开发-公众号设置”页中获得',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      field: 'appId',
      label: 'AppID',
      component: 'Input',
      helpMessage: '请在“微信公众号管理后台-设置与开发-基本配置”页中获得',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'appSecret',
      label: 'Secret',
      component: 'InputPassword',
      helpMessage: '请在“微信公众号管理后台-设置与开发-基本配置”页中获得',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      field: 'agentId',
      label: 'Token',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'bearer',
      label: 'EncodingAESKey',
      component: 'Input',
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
      componentProps: { rows: 3 , placeholder: '请输入'},
    },
  ];
  const getTitle = computed(() => (!state.dataForm.id ? t('common.addText') : t('common.editText')));
  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerForm, { setFieldsValue, validate, resetFields }] = useForm({ labelWidth: 130, schemas: schemas });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);

  function init(data) {
    resetFields();
    state.dataForm.id = data.id;
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
    let query = {
      ...values,
      id: state.dataForm.id,
      type: 7,
    };
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
</script>
