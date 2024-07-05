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
      field: 'channel',
      label: '渠道',
      component: 'Select',
      defaultValue: 1,
      componentProps: {
        placeholder: '请选择',
        options: [
          { fullName: '阿里云', id: 1 },
          { fullName: '腾讯云', id: 2 },
        ],
        onChange: onChannelChange,
      },
      rules: [{ required: true, trigger: 'change', message: '必填', type: 'number' }],
    },
    {
      field: 'smsSignature',
      label: '短信签名',
      component: 'Input',
      helpMessage: '选择国内消息或国际/港澳台消息，在“签名管理”⻚中获取',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      ifShow: ({ values }) => values.channel === 1,
      field: 'appId',
      label: 'AccessKey ID',
      component: 'Input',
      helpMessage: '请在“阿里云的AccessKey管理-安全信息管理”页中获得',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      ifShow: ({ values }) => values.channel === 1,
      field: 'appSecret',
      label: 'AccessKey Secret',
      component: 'InputPassword',
      helpMessage: '请在“阿里云的AccessKey管理-安全信息管理”页中获得',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      ifShow: ({ values }) => values.channel === 1,
      field: 'endPoint',
      label: 'EndPoint',
      component: 'Input',
      helpMessage: '请在“阿里云的短信服务-OpenAPI Explorer-Region&Endpoint”页中获得',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      ifShow: ({ values }) => values.channel === 2,
      field: 'secretId',
      label: 'SecretId',
      component: 'Input',
      helpMessage: '请在”腾讯云的访问管理-访问密钥- API密钥管理”⻚中获得',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      ifShow: ({ values }) => values.channel === 2,
      field: 'secretKey',
      label: 'SecretKey',
      component: 'InputPassword',
      helpMessage: '请在”腾讯云的访问管理-访问密钥- API密钥管理”⻚中获得',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      ifShow: ({ values }) => values.channel === 2,
      field: 'sdkAppId',
      label: 'SDK AppID',
      component: 'InputPassword',
      helpMessage: '请在”腾讯云的应⽤管理-应⽤列表”⻚中获得',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      ifShow: ({ values }) => values.channel === 2,
      field: 'appKey',
      label: 'App Key',
      component: 'InputPassword',
      helpMessage: '请在”腾讯云的应⽤管理-应⽤列表”⻚中获得',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      ifShow: ({ values }) => values.channel === 2,
      field: 'zoneName',
      label: '地域域名',
      component: 'Input',
      helpMessage: '默认是国内地域域名,也⽀持指定其它地域域名',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      ifShow: ({ values }) => values.channel === 2,
      field: 'zoneParam',
      label: '地域参数',
      component: 'Input',
      helpMessage: '默认是国内地域参数,也⽀持指定其它地域参数',
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
  const [registerForm, { setFieldsValue, validate, resetFields, clearValidate }] = useForm({ labelWidth: 145, schemas: schemas });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);

  function init(data) {
    resetFields();
    state.dataForm.id = data.id;
    if (state.dataForm.id) {
      changeLoading(true);
      getInfo(state.dataForm.id).then(res => {
        const data = res.data;
        data.secretId = data.channel == 2 ? data.appId : '';
        data.secretKey = data.channel == 2 ? data.appSecret : '';
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
      type: 3,
    };
    if (values.channel === 2) {
      query.appId = values.secretId;
      query.appSecret = values.secretKey;
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
  function onChannelChange() {
    setFieldsValue({
      appId: '',
      appSecret: '',
      endPoint: '',
      secretId: '',
      secretKey: '',
      appKey: '',
      sdkAppId: '',
      zoneName: 'sms.tencentcloudapi.com',
      zoneParam: 'ap-beijing',
      smsSignature: '',
    });
    clearValidate();
  }
</script>
