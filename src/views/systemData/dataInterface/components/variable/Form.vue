<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" destroy-on-close>
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { create, update, getInfo } from '/@/api/systemData/variate';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    id: string;
    interfaceId: string;
    dataForm: any;
  }

  const state = reactive<State>({
    id: '',
    interfaceId: '',
    dataForm: {},
  });
  const schemas: FormSchema[] = [
    {
      field: 'fullName',
      label: '变量名',
      component: 'Input',
      componentProps: { placeholder: '请输入', maxlength: 50 },
      rules: [{ required: true, message: '必填', trigger: 'blur' }],
    },
    {
      field: 'expression',
      label: 'JS表达式',
      component: 'Textarea',
      componentProps: { placeholder: '请输入', rows: 4 },
      rules: [{ required: true, message: '必填', trigger: 'blur' }],
    },
  ];
  const getTitle = computed(() => (!state.id ? t('common.addText') : t('common.editText')));
  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerForm, { validate, resetFields, setFieldsValue }] = useForm({ labelWidth: 80, schemas: schemas });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);

  function init(data) {
    resetFields();
    state.interfaceId = data.interfaceId;
    state.id = data.id;
    if (state.id) {
      changeLoading(true);
      getInfo(state.id)
        .then(res => {
          setFieldsValue(res.data);
          changeLoading(false);
        })
        .catch(() => {
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
      id: state.id,
      interfaceId: state.interfaceId,
    };
    const formMethod = state.id ? update : create;
    formMethod(query)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        closeModal();
        setTimeout(() => {
          emit('reload');
        }, 200);
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
</script>
