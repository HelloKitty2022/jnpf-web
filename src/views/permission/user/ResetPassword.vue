<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="重置密码" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { resetUserPassword } from '/@/api/permission/user';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { encryptByMd5 } from '/@/utils/cipher';
  import { useMessage } from '/@/hooks/web/useMessage';

  defineEmits(['register']);
  const [registerForm, { setFieldsValue, getFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 90,
    schemas: [
      {
        field: 'account',
        label: '账户',
        component: 'Input',
        componentProps: {
          readonly: true,
          placeholder: '请输入',
        },
      },
      {
        field: 'userPassword',
        label: '新密码',
        component: 'InputPassword',
        componentProps: {
          placeholder: '请输入',
        },
        rules: [
          {
            required: true,
            trigger: 'blur',
            validator: (_rule, val) => {
              if (!val) {
                return Promise.reject('请输入新密码');
              }
              if (getFieldsValue().validatePassword !== '') {
                validate(['validatePassword']);
              }
              return Promise.resolve();
            },
          },
        ],
      },
      {
        field: 'validatePassword',
        label: '确认新密码',
        component: 'InputPassword',
        componentProps: {
          placeholder: '请输入',
        },
        rules: [
          {
            required: true,
            trigger: 'blur',
            validator: async (_rule, val) => {
              if (!val) {
                return Promise.reject('请再次输入新密码');
              }
              if (val !== getFieldsValue().userPassword) {
                return Promise.reject('两次输入密码不一致');
              }
              return Promise.resolve();
            },
          },
        ],
      },
    ],
  });
  const [registerModal, { changeOkLoading, closeModal }] = useModalInner(init);
  const id = ref('');
  const { createMessage } = useMessage();

  function init(data) {
    resetFields();
    id.value = data.id;
    setFieldsValue(data);
  }

  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    const query = {
      id: id.value,
      userPassword: encryptByMd5(values.userPassword),
      validatePassword: encryptByMd5(values.validatePassword),
    };
    resetUserPassword(query)
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
