<template>
  <BasicModal v-bind="$attrs" width="500px" @register="registerModal" title="发送测试" showOkBtn @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { testConfig } from '/@/api/msgCenter/accountConfig';

  interface State {
    dataForm: any;
  }

  const state = reactive<State>({
    dataForm: {},
  });
  const schemas: FormSchema[] = [
    {
      field: 'testSendEmail',
      label: '收件邮箱',
      component: 'UserSelect',
      componentProps: { placeholder: '请选择' },
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      field: 'testEmailTitle',
      label: '邮件标题',
      component: 'Input',
      componentProps: { placeholder: '请输入', maxlength: 50 },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'testEmailContent',
      label: '邮件内容',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
  ];
  const { createMessage } = useMessage();
  const [registerForm, { setFieldsValue, validate, resetFields }] = useForm({ labelWidth: 80, schemas: schemas });
  const [registerModal, { changeOkLoading }] = useModalInner(init);

  function init(data) {
    resetFields();
    state.dataForm = data;
    setFieldsValue({ testEmailTitle: '测试', testEmailContent: '测试' });
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    values.testSendEmail = [values.testSendEmail];
    const query = {
      ...values,
      ...state.dataForm,
      testType: 'testSendMail',
    };
    testConfig(query)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
</script>
