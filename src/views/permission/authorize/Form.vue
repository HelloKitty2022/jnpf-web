<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { create, update, getInfo } from '/@/api/permission/permissionGroup';
  import { computed, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import formValidate from '/@/utils/formValidate';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    dataForm: any;
  }

  const emit = defineEmits(['register', 'reload']);
  const state = reactive<State>({
    dataForm: {
      id: '',
      fullName: '',
      enCode: '',
      type: '',
      enabledMark: 1,
      globalMark: null,
      organizeIdsTree: [],
      sortCode: 0,
      description: '',
    },
  });
  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 110,
    schemas: [
      {
        field: 'fullName',
        label: '权限组名称',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 50 },
        rules: [{ required: true, trigger: 'blur', message: '必填' }],
      },
      {
        field: 'enCode',
        label: '权限组编码',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 50 },
        rules: [
          { required: true, trigger: 'blur', message: '必填' },
          { validator: formValidate('enCode'), trigger: 'blur' },
        ],
      },
      {
        field: 'sortCode',
        label: '排序',
        defaultValue: 0,
        component: 'InputNumber',
        componentProps: { min: 0, max: 999999, placeholder: '请输入' },
      },
      {
        field: 'enabledMark',
        label: '状态',
        defaultValue: 1,
        component: 'Switch',
      },
      {
        field: 'description',
        label: '说明',
        component: 'Textarea',
        componentProps: { placeholder: '请输入' },
      },
    ],
  });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);
  const { createMessage } = useMessage();
  const { t } = useI18n();

  const getTitle = computed(() => (!state.dataForm.id ? t('common.addText') : t('common.editText')));

  function init(data) {
    resetFields();
    state.dataForm.id = data.id;
    if (state.dataForm.id) {
      changeLoading(true);
      getInfo(state.dataForm.id).then(res => {
        setFieldsValue(res.data);
        changeLoading(false);
      });
    }
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    const query = { ...state.dataForm, ...values };
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
