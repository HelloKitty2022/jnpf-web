<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" showOkBtn @ok="handleSubmit" destroyOnClose>
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { getInfo, create, update } from '/@/api/extend/document';
  import { useMessage } from '/@/hooks/web/useMessage';

  interface State {
    dataForm: any;
    id: string;
    parentId: string;
    type: string;
  }

  const state = reactive<State>({
    dataForm: {},
    id: '',
    parentId: '',
    type: '0',
  });
  const schemas: FormSchema[] = [
    {
      field: 'fullName',
      label: '',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
  ];
  const getTitle = computed(() => (!state.id ? '新建文件夹' : '重命名文件'));
  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const [registerForm, { setFieldsValue, validate, resetFields }] = useForm({ labelWidth: 80, schemas: schemas });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);

  function init(data) {
    resetFields();
    state.id = data.id;
    state.parentId = data.parentId;
    state.type = '0';
    if (state.id) {
      changeLoading(true);
      getInfo(state.id).then(res => {
        state.dataForm = res.data;
        state.type = state.dataForm.type || '0';
        setFieldsValue({ fullName: state.dataForm.fullName });
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
      parentId: state.parentId,
      type: state.type,
    };
    const formMethod = state.id ? update : create;
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
