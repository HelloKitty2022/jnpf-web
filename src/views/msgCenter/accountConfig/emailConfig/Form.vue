<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" showOkBtn @ok="handleSubmit">
    <BasicForm @register="registerForm">
      <template #smtpPassword="{ model, field }">
        <a-input-password v-model:value="model[field]" placeholder="请输入" show-password>
          <template #addonAfter>
            <span class="cursor-pointer" @click="handleTest">测试</span>
          </template>
        </a-input-password>
      </template>
    </BasicForm>
    <Test @register="registerTest" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, reactive } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { create, update, getInfo } from '/@/api/msgCenter/accountConfig';
  import formValidate from '/@/utils/formValidate';
  import Test from './Test.vue';
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
      field: 'addressorName',
      label: '发件人昵称',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'smtpServer',
      label: 'SMTP服务器',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'smtpPort',
      label: 'SMTP端口',
      component: 'InputNumber',
      defaultValue: 25,
      componentProps: { min: 0, max: 999999, placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填', type: 'number' }],
    },
    {
      field: 'sslLink',
      label: 'SSL安全连接',
      component: 'Switch',
      defaultValue: 0,
    },
    {
      field: 'smtpUser',
      label: 'SMTP用户名',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'smtpPassword',
      label: 'SMTP密码',
      component: 'Input',
      slot: 'smtpPassword',
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
  const [registerForm, { setFieldsValue, validate, resetFields }] = useForm({ labelWidth: 100, schemas: schemas });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);
  const [registerTest, { openModal: openTestModal }] = useModal();

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
    const query = {
      ...values,
      id: state.dataForm.id,
      type: 2,
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
  async function handleTest() {
    const values = await validate();
    if (!values) return;
    const query = {
      ...values,
      id: state.dataForm.id,
      type: 2,
    };
    openTestModal(true, query);
  }
</script>
