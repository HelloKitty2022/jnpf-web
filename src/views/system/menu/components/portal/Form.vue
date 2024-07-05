<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" showOkBtn @ok="handleSubmit" destroyOnClose>
    <BasicForm @register="registerForm">
      <template #portalId="{ model, field }">
        <PortalModal
          :value="model[field]"
          :systemId="dataForm.systemId"
          :title="dataForm.fullName"
          :platform="dataForm.platform"
          @change="onPortalModalChange" />
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { toRefs, computed, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getPortalManageInfo, createPortalManage, updatePortalManage } from '/@/api/onlineDev/portal';
  import PortalModal from './PortalModal.vue';

  interface State {
    category: string;
    dataForm: any;
    featureWebData: any[];
    featureAppData: any[];
    dictionaryData: any[];
    reportData: any[];
    screenData: any[];
    portalData: any[];
  }

  const state = reactive<State>({
    category: '',
    dataForm: {
      id: '',
      portalId: '',
      fullName: '',
      category: '',
      enCode: '',
      homePageMark: 0,
      sortCode: 0,
      enabledMark: 1,
      description: '',
      systemId: '', //系统id
      platform: 'Web',
    },
    featureWebData: [],
    featureAppData: [],
    dictionaryData: [],
    reportData: [],
    screenData: [],
    portalData: [],
  });
  const { dataForm } = toRefs(state);

  const schemas: FormSchema[] = [
    {
      field: 'portalId',
      label: '门户名称',
      component: 'Select',
      slot: 'portalId',
      rules: [{ required: true, message: '必填', trigger: 'change' }],
    },
    {
      field: 'category',
      label: '门户分类',
      component: 'Select',
      componentProps: { placeholder: '请选择', disabled: true },
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
      componentProps: { rows: 4, placeholder: '请输入' },
    },
  ];
  const getTitle = computed(() => (!state.dataForm.id ? '添加' : '编辑'));
  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const [registerForm, { setFieldsValue, validate, clearValidate, resetFields, updateSchema }] = useForm({ labelWidth: 80, schemas: schemas });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);

  function init(data) {
    resetFields();
    state.dataForm.id = data.id;
    state.dataForm.systemId = data.systemId;
    updateSchema({ field: 'category', componentProps: { options: data.categoryList } });
    if (state.dataForm.id) {
      changeLoading(true);
      getPortalManageInfo(state.dataForm.id).then(res => {
        state.dataForm = res.data;
        state.dataForm.category = state.dataForm.categoryId;
        setFieldsValue(state.dataForm);
        changeLoading(false);
      });
    } else {
      state.dataForm.platform = data.platform || 'Web';
    }
  }
  function onPortalModalChange(id, item) {
    state.dataForm.fullName = item.fullName;
    setFieldsValue({ portalId: id, category: item.categoryId });
    clearValidate('portalId');
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    const query = {
      ...state.dataForm,
      ...values,
    };
    const formMethod = state.dataForm.id ? updatePortalManage : createPortalManage;
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
