<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" showOkBtn @ok="handleSubmit">
    <BasicForm @register="registerForm">
      <template #templateId="{ model, field }">
        <TemplateModal
          :value="model[field]"
          :messageType="model.messageType"
          :title="dataForm.templateName"
          :messageSource="messageSource"
          placeholder="请选择"
          @change="onTemplateIdChange" />
      </template>
      <template #accountConfigId="{ model, field }">
        <TemplateModal
          :value="model[field]"
          :type="2"
          :messageType="model.messageType"
          :title="dataForm.accountName"
          placeholder="请选择"
          @change="onAccountConfigIdChange" />
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, reactive, toRefs } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { useBaseStore } from '/@/store/modules/base';
  import TemplateModal from '../components/TemplateModal.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    dataForm: any;
    index: number;
    messageSource: string;
  }

  const state = reactive<State>({
    dataForm: {},
    index: 0,
    messageSource: '',
  });
  const { dataForm, messageSource } = toRefs(state);
  const schemas: FormSchema[] = [
    {
      field: 'messageType',
      label: '消息类型',
      component: 'Select',
      componentProps: { placeholder: '请选择', onChange: onMessageTypeChange },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'templateId',
      label: '模板名称',
      component: 'Select',
      slot: 'templateId',
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      field: 'templateCode',
      label: '模板编码',
      component: 'Input',
      componentProps: { placeholder: '请输入', disabled: true },
    },
    {
      ifShow: ({ values }) => values.messageType != 1 && values.messageType != 4 && values.messageType != 5,
      field: 'accountConfigId',
      label: '账号名称',
      component: 'Select',
      slot: 'accountConfigId',
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      ifShow: ({ values }) => values.messageType != 1 && values.messageType != 4 && values.messageType != 5,
      field: 'accountCode',
      label: '账号编码',
      component: 'Input',
      componentProps: { placeholder: '请输入', disabled: true },
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
      componentProps: { placeholder: '请输入', rows: 3 },
    },
  ];
  const getTitle = computed(() => (!state.dataForm.id ? t('common.addText') : t('common.editText')));
  const emit = defineEmits(['register', 'reload']);
  const baseStore = useBaseStore();
  const { t } = useI18n();
  const [registerForm, { setFieldsValue, validate, clearValidate, resetFields, updateSchema }] = useForm({ labelWidth: 80, schemas: schemas });
  const [registerModal, { closeModal }] = useModalInner(init);

  function init(data) {
    resetFields();
    initData();
    state.index = data.index;
    state.dataForm = data.row;
    state.messageSource = data.messageSource;
    setFieldsValue(data.row);
  }
  async function initData() {
    let messageTypeList = (await baseStore.getDictionaryData('msgSendType')) as any[];
    messageTypeList.map(o => (o.id = o.enCode));
    updateSchema([{ field: 'messageType', componentProps: { options: messageTypeList } }]);
  }
  function onTemplateIdChange(val, item) {
    state.dataForm.templateName = item.fullName;
    setFieldsValue({ templateId: val, templateCode: item.enCode });
    clearValidate('templateId');
  }
  function onAccountConfigIdChange(val, item) {
    state.dataForm.accountName = item.fullName;
    setFieldsValue({ accountConfigId: val, accountCode: item.enCode });
    clearValidate('accountConfigId');
  }
  function onMessageTypeChange() {
    setFieldsValue({
      accountName: '',
      accountConfigId: '',
      accountCode: '',
      templateId: '',
      templateName: '',
      templateCode: '',
    });
    clearValidate();
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    closeModal();
    const query = {
      ...values,
      accountName: state.dataForm.accountName,
      templateName: state.dataForm.templateName,
    };
    emit('reload', query, state.index);
  }
</script>
