<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" showOkBtn @ok="handleSubmit" destroy-on-close>
    <BasicForm @register="registerForm">
      <template #enCode="{ model, field }">
        <FieldModal :value="model[field]" @change="onNameChange" :treeData="treeData" :menuType="menuType" :dataType="dataType" />
      </template>
      <template #fieldRule="{ model, field }">
        <a-select v-model:value="model[field]" :options="fieldRuleOptions" placeholder="请选择字段规则" @change="onFileRuleChange">
          <template #option="{ value, label }">
            {{ label }}<BasicHelp v-if="value != 0" :text="`与主表是一对${value == 1 ? '一' : '多'}的主从关系`" />
          </template>
        </a-select>
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, reactive, toRefs } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { createField, updateField, getFieldInfo } from '/@/api/system/dataAuthorize';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getVisualTables } from '/@/api/system/authorize';
  import FieldModal from '../connectForm/FieldModal.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    moduleId: string;
    id: string;
    menuType: number;
    dataType: number;
    treeData: any[];
    fieldRuleOptions: any[];
    conditionTextOptions: any[];
    symbolOptions: any[];
  }

  const state = reactive<State>({
    moduleId: '',
    id: '',
    menuType: 0,
    dataType: 0,
    treeData: [],
    fieldRuleOptions: [
      { value: 0, label: '主表规则' },
      { value: 1, label: '副表规则' },
      { value: 2, label: '子表规则' },
    ],
    conditionTextOptions: [],
    symbolOptions: [],
  });
  const { fieldRuleOptions, treeData, menuType, dataType } = toRefs(state);
  const fieldTypeOptions = [
    { id: 'string', fullName: 'string' },
    { id: 'int', fullName: 'int' },
    { id: 'double', fullName: 'double' },
    { id: 'varchar', fullName: 'varchar' },
    { id: 'datetime', fullName: 'datetime' },
    { id: 'text', fullName: 'text' },
    { id: 'bigint', fullName: 'bigint' },
  ];
  const baseSymbolOptions = [
    { id: '==', fullName: '等于' },
    { id: '<>', fullName: '不等于' },
    { id: 'like', fullName: '包含' },
    { id: 'notLike', fullName: '不包含' },
    { id: 'null', fullName: '为空' },
    { id: 'notNull', fullName: '不为空' },
  ];
  const rangeSymbolOptions = [
    { id: '>=', fullName: '大于等于' },
    { id: '>', fullName: '大于' },
    { id: '==', fullName: '等于' },
    { id: '<=', fullName: '小于等于' },
    { id: '<', fullName: '小于' },
    { id: '<>', fullName: '不等于' },
    { id: 'between', fullName: '介于' },
    { id: 'null', fullName: '为空' },
    { id: 'notNull', fullName: '不为空' },
  ];
  const selectSymbolOptions = [
    { id: '==', fullName: '等于' },
    { id: '<>', fullName: '不等于' },
    { id: 'in', fullName: '包含任意一个' },
    { id: 'notIn', fullName: '不包含任意一个' },
    { id: 'null', fullName: '为空' },
    { id: 'notNull', fullName: '不为空' },
  ];
  const systemFieldOptions = [
    { id: 'input', fullName: '任意文本' },
    { id: '@userId', fullName: '当前用户' },
    { id: '@organizeId', fullName: '当前组织' },
  ];
  const organizeOptions = [
    { id: '@userAndSubordinates', fullName: '当前用户及下属' },
    { id: '@organizationAndSuborganization', fullName: '当前组织及子组织' },
    { id: '@branchManageOrganize', fullName: '当前分管组织' },
    { id: 'organizeSelect', fullName: '组织选择' },
    { id: 'depSelect', fullName: '部门选择' },
    { id: 'posSelect', fullName: '岗位选择' },
    { id: 'roleSelect', fullName: '角色选择' },
    { id: 'groupSelect', fullName: '分组选择' },
    { id: 'userSelect', fullName: '用户选择' },
  ];
  const numberOptions = [{ id: 'inputNumber', fullName: '数字输入' }];
  const dateOptions = [{ id: 'datePicker', fullName: '日期选择' }];
  const formatOptions = [
    { id: 'yyyy', fullName: 'yyyy' },
    { id: 'yyyy-MM', fullName: 'yyyy-MM' },
    { id: 'yyyy-MM-dd', fullName: 'yyyy-MM-dd' },
    { id: 'yyyy-MM-dd HH:mm', fullName: 'yyyy-MM-dd HH:mm' },
    { id: 'yyyy-MM-dd HH:mm:ss', fullName: 'yyyy-MM-dd HH:mm:ss' },
  ];
  const schemas: FormSchema[] = [
    {
      field: 'enCode',
      label: '字段名称',
      component: 'Input',
      slot: 'enCode',
      componentProps: { placeholder: '请输入', maxlength: 200 },
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      ifShow: ({ values }) => values.bindTable,
      field: 'bindTable',
      label: '数据库表',
      component: 'Input',
      componentProps: { placeholder: '请输入', disabled: true },
    },
    {
      field: 'fieldRule',
      label: '字段规则',
      component: 'Select',
      slot: 'fieldRule',
      defaultValue: 0,
      componentProps: { placeholder: '请选择' },
      rules: [{ required: true, trigger: 'blur', message: '必填', type: 'number' }],
    },
    {
      ifShow: ({ values }) => values.fieldRule === 2,
      field: 'childTableKey',
      label: '关联字段',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      helpMessage: '输入表单设计内设计子表的控件字段名，例：tableField107',
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'fullName',
      label: '字段说明',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'type',
      label: '字段类型',
      component: 'Select',
      componentProps: { placeholder: '请选择', options: fieldTypeOptions, showSearch: true, allowClear: false, onChange: onFieldTypeChange },
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      field: 'conditionText',
      label: '条件内容',
      component: 'Select',
      componentProps: { placeholder: '请选择', showSearch: true, onChange: onConditionTextChange },
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      ifShow: ({ values }) => values.conditionText === 'datePicker',
      field: 'format',
      label: ' ',
      component: 'Select',
      componentProps: { options: formatOptions, allowClear: false },
    },
    {
      field: 'conditionSymbol',
      label: '条件符号',
      component: 'Select',
      componentProps: { placeholder: '请选择', multiple: true, showSearch: true },
      rules: [{ required: true, trigger: 'change', message: '必填', type: 'array' }],
    },
    {
      field: 'description',
      label: '备注',
      component: 'Textarea',
      componentProps: { rows: 3 },
    },
  ];
  const getTitle = computed(() => (!state.id ? t('common.addText') : t('common.editText')));
  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerForm, { setFieldsValue, validate, resetFields, clearValidate, updateSchema, getFieldsValue }] = useForm({
    labelWidth: 100,
    schemas: schemas,
  });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);

  function init(data) {
    resetFields();
    state.id = data.id;
    state.moduleId = data.moduleId;
    state.menuType = data.type;
    state.dataType = data.dataType;
    state.conditionTextOptions = [];
    state.symbolOptions = [];
    updateSchema([
      { field: 'conditionSymbol', componentProps: { options: [] } },
      { field: 'conditionText', componentProps: { options: [] } },
    ]);
    changeLoading(true);
    getVisualTables(state.moduleId, 3)
      .then(res => {
        let data: any[] = [];
        for (const key in res?.data?.linkTables) {
          const obj = {
            tableName: res.data.linkTables[key],
            dbLink: res.data.linkId,
          };
          data.push(obj);
        }
        state.treeData = data;
        changeLoading(false);
      })
      .then(() => {
        changeLoading(false);
      });
    if (state.id) {
      changeLoading(true);
      getFieldInfo(state.id)
        .then(res => {
          const data = res.data;
          data.conditionSymbol = data.conditionSymbol ? data.conditionSymbol.split(',') : [];
          setFieldsValue(data);
          getOptions(data.type, data.conditionText);
          changeLoading(false);
        })
        .then(() => {
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
      conditionSymbol: values.conditionSymbol.join(),
      moduleId: state.moduleId,
      id: state.id,
    };
    const formMethod = state.id ? updateField : createField;
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
  function onNameChange(val, tableName, fieldName) {
    setFieldsValue({ enCode: val || '' });
    if (tableName) setFieldsValue({ bindTable: tableName });
    if (fieldName) setFieldsValue({ fullName: fieldName });
    if (val) clearValidate();
  }
  function onFileRuleChange() {
    setFieldsValue({ childTableKey: '' });
  }
  function onFieldTypeChange(val) {
    getConditionTextOptions(val);
    setFieldsValue({ conditionText: '', conditionSymbol: [], format: '' });
    clearValidate(['conditionText', 'conditionSymbol']);
    updateSchema([
      { field: 'conditionText', componentProps: { options: state.conditionTextOptions } },
      { field: 'conditionSymbol', componentProps: { options: [] } },
    ]);
  }
  function onConditionTextChange(val) {
    const fieldType = getFieldsValue().type;
    getSymbolOptions(fieldType, val);
    setFieldsValue({ conditionSymbol: [] });
    clearValidate(['conditionSymbol']);
    updateSchema({ field: 'conditionSymbol', componentProps: { options: state.symbolOptions } });
    setFieldsValue({ format: val === 'datePicker' ? 'yyyy-MM-dd HH:mm:ss' : '' });
  }
  function getConditionTextOptions(fieldType) {
    let options: any = [];
    if (['int', 'bigint', 'double'].includes(fieldType)) options = numberOptions;
    if (fieldType === 'datetime') options = dateOptions;
    if (fieldType === 'text') options = systemFieldOptions;
    if (['string', 'varchar'].includes(fieldType)) options = [...systemFieldOptions, ...organizeOptions];
    state.conditionTextOptions = options;
  }
  function getSymbolOptions(fieldType, conditionText) {
    state.symbolOptions = [];
    if (!fieldType || !conditionText) return;
    let options: any = [];
    if (['inputNumber', 'datePicker'].includes(conditionText)) options = rangeSymbolOptions;
    if (['string', 'varchar', 'text'].includes(fieldType) && systemFieldOptions.some(o => o.id === conditionText)) options = baseSymbolOptions;
    if (['string', 'varchar'].includes(fieldType) && organizeOptions.some(o => o.id === conditionText)) options = selectSymbolOptions;
    state.symbolOptions = options;
  }
  function getOptions(fieldType, conditionText) {
    getConditionTextOptions(fieldType);
    getSymbolOptions(fieldType, conditionText);
    updateSchema([
      { field: 'conditionText', componentProps: { options: state.conditionTextOptions } },
      { field: 'conditionSymbol', componentProps: { options: state.symbolOptions } },
    ]);
  }
</script>
