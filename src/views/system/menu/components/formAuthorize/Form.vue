<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" showOkBtn @ok="handleSubmit">
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
  import { create, update, getInfo } from '/@/api/system/formAuthorize';
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
  });
  const { fieldRuleOptions, treeData, menuType, dataType } = toRefs(state);
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
      field: 'sortCode',
      label: '排序',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: { min: '0', max: '999999', placeholder: '排序' },
    },
    {
      field: 'enabledMark',
      label: '状态',
      component: 'Switch',
      defaultValue: 1,
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
  const [registerForm, { setFieldsValue, validate, resetFields, clearValidate }] = useForm({ labelWidth: 100, schemas: schemas });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);

  function init(data) {
    resetFields();
    state.id = data.id;
    state.moduleId = data.moduleId;
    state.menuType = data.type;
    state.dataType = data.dataType;
    changeLoading(true);
    getVisualTables(state.moduleId, state.dataType)
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
      getInfo(state.id)
        .then(res => {
          const data = res.data;
          setFieldsValue(data);
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
      moduleId: state.moduleId,
      id: state.id,
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
  function onNameChange(val, tableName, fieldName) {
    setFieldsValue({ enCode: val || '' });
    if (tableName) setFieldsValue({ bindTable: tableName });
    if (fieldName) setFieldsValue({ fullName: fieldName });
    if (val) clearValidate();
  }
  function onFileRuleChange() {
    setFieldsValue({ childTableKey: '' });
  }
</script>
