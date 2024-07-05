<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="dataForm.id ? t('common.editText') : t('common.addText')" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
    <template #appendFooter>
      <a-button type="primary" :loading="btnLoading" @click="handleSubmit(1)">确定并设计</a-button>
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { toRefs, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import formValidate from '/@/utils/formValidate';
  import { getInfo, update, create } from '/@/api/onlineDev/integrate';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    dataForm: any;
    btnLoading: boolean;
  }

  const state = reactive<State>({
    dataForm: { id: '' },
    btnLoading: false,
  });
  const { dataForm, btnLoading } = toRefs(state);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const emit = defineEmits(['register', 'reload', 'design']);
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);
  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 60,
    schemas: [
      {
        field: 'fullName',
        label: '名称',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 100 },
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
        field: 'type',
        label: '类型',
        component: 'Select',
        componentProps: {
          options: [
            { id: 1, fullName: '事件触发' },
            { id: 2, fullName: '定时触发' },
            { id: 3, fullName: 'webhook触发' },
          ],
          disabled: true,
        },
        rules: [{ required: true, trigger: 'change', message: '必填', type: 'number' }],
      },
      {
        field: 'enabledMark',
        label: '状态',
        component: 'Switch',
        defaultValue: 1,
      },
      {
        field: 'description',
        label: '说明 ',
        component: 'Textarea',
        componentProps: { placeholder: '请输入' },
      },
    ],
  });

  function init(data) {
    resetFields();
    state.dataForm.id = data.id || '';
    state.dataForm.type = data.type || 1;
    if (state.dataForm.id) {
      changeLoading(true);
      getInfo(state.dataForm.id)
        .then(res => {
          state.dataForm = res.data;
          setFieldsValue(state.dataForm);
          changeLoading(false);
        })
        .catch(() => {
          changeLoading(false);
        });
    } else {
      setFieldsValue({ type: state.dataForm.type });
    }
  }
  async function handleSubmit(type?) {
    const values = await validate();
    if (!values) return;
    type === 1 ? (state.btnLoading = true) : changeOkLoading(true);
    const query = { ...values, id: state.dataForm.id };
    const formMethod = state.dataForm.id ? update : create;
    formMethod(query)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        state.btnLoading = false;
        closeModal();
        emit('reload');
        if (type === 1) emit('design', state.dataForm.id || res.data);
      })
      .catch(() => {
        changeOkLoading(false);
        state.btnLoading = false;
      });
  }
</script>
