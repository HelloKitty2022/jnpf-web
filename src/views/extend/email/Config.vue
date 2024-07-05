<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="邮箱配置" showOkBtn @ok="handleSubmit" destroyOnClose>
    <BasicForm @register="registerForm">
      <template #password="{ model, field }">
        <a-input v-model:value="model[field]" allowClear placeholder="邮箱密码">
          <template #addonAfter>
            <loading-outlined class="mr-5px" v-if="state.testLoading" />
            <span class="cursor-pointer" disabled @click="test()">连接测试</span>
          </template>
        </a-input>
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { getConfigInfo, saveConfig, checkMail } from '/@/api/extend/email';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { LoadingOutlined } from '@ant-design/icons-vue';

  interface State {
    testLoading: boolean;
  }

  const state = reactive<State>({
    testLoading: false,
  });
  const schemas: FormSchema[] = [
    {
      field: 'pop3Host',
      label: 'POP3服务',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'pop3Port',
      label: 'POP3端口',
      component: 'InputNumber',
      componentProps: { min: 0, max: 999999 },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'smtpHost',
      label: 'SMTP服务',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'smtpPort',
      label: 'SMTP端口',
      component: 'InputNumber',
      componentProps: { min: 0, max: 999999 },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'senderName',
      label: '显示名称',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'account',
      label: '邮箱地址',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'password',
      label: '邮箱密码',
      component: 'InputSearch',
      slot: 'password',
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'emailSsl',
      label: 'SSL登录',
      component: 'Switch',
      defaultValue: 0,
    },
  ];
  defineEmits(['register']);
  const { createMessage } = useMessage();
  const [registerForm, { setFieldsValue, validate, resetFields }] = useForm({ labelWidth: 80, schemas: schemas });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);

  function init() {
    state.testLoading = false;
    resetFields();
    changeLoading(true);
    getConfigInfo().then(res => {
      setFieldsValue(res.data);
      changeLoading(false);
    });
  }
  async function test() {
    const values = await validate();
    if (!values) return;
    state.testLoading = true;
    checkMail(values)
      .then(res => {
        createMessage.success(res.msg);
        state.testLoading = false;
      })
      .catch(() => {
        state.testLoading = false;
      });
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    saveConfig(values)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        closeModal();
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
</script>
