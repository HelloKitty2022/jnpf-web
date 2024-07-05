<template>
  <BasicModal v-bind="$attrs" @register="registerModal" defaultFullscreen :footer="null" :closable="false" :keyboard="false" class="jnpf-full-modal full-modal">
    <template #title>
      <div class="jnpf-full-modal-header">
        <div class="header-title">
          <img src="../../../assets/images/jnpf.png" class="header-logo" />
          <p class="header-txt" v-if="!activeStep"> · 表单设计</p>
          <a-tooltip :title="dataForm.fullName" v-else>
            <p class="header-txt"> · {{ dataForm.fullName }}</p>
          </a-tooltip>
        </div>
        <a-steps v-model:current="activeStep" type="navigation" size="small" @change="onStepChange">
          <a-step title="基础设置" />
          <a-step title="表单设计" disabled />
        </a-steps>
        <a-space class="options" :size="10">
          <a-button @click="handlePrev" :disabled="activeStep <= 0 || btnLoading">{{ t('common.prev') }}</a-button>
          <a-button @click="handleNext" :disabled="activeStep >= 1 || loading || btnLoading">{{ t('common.next') }} </a-button>
          <a-button type="primary" @click="handleSubmit()" :disabled="loading" :loading="btnLoading">{{ t('common.saveText') }}</a-button>
          <a-button @click="closeModal()">{{ t('common.cancelText') }}</a-button>
        </a-space>
      </div>
    </template>
    <a-row type="flex" justify="center" align="middle" class="basic-content" v-show="!activeStep">
      <a-col :span="12" :xxl="10" class="basic-form">
        <BasicForm @register="registerForm" />
        <template v-if="dataForm.formType == 2">
          <a-table :data-source="tables" :columns="columns" size="small" :pagination="false" :scroll="{ x: 'max-content' }">
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'typeId'">
                <a-tag color="processing" v-if="record.typeId == '1'">主表</a-tag>
                <a-tag color="warning" @click="changeTable(record)" v-else style="cursor: pointer" title="点击设置成主表">从表</a-tag>
              </template>
              <template v-if="column.key === 'table'">
                <span :title="record.tableName || record.table">{{ record.table }}</span>
              </template>
              <template v-if="column.key === 'tableField' && record.typeId !== '1'">
                <jnpf-select
                  v-model:value="record.tableField"
                  placeholder="请选择"
                  :options="record.fields"
                  :field-names="{ value: 'field', label: 'field' }"
                  showSearch
                  class="!w-144px" />
              </template>
              <template v-if="column.key === 'relationField' && record.typeId !== '1'">
                <jnpf-select
                  v-model:value="record.relationField"
                  placeholder="请选择"
                  :options="mainTableFields"
                  :field-names="{ value: 'field', label: 'field' }"
                  showSearch
                  class="!w-144px" />
              </template>
              <template v-if="column.key === 'action'">
                <a-button class="action-btn" type="link" color="error" @click="handleDelItem(record, index)" size="small">移除</a-button>
              </template>
            </template>
            <template #emptyText>
              <p class="ant-table__empty-text">点击“新增”可选择1条(单表)或2条以上(多表)，未选择数据表时系统将会自动创建数据表</p>
            </template>
          </a-table>
          <div class="table-add-action" @click="openTableBox">
            <a-button type="link" preIcon="icon-ym icon-ym-btn-add">新增一行</a-button>
          </div>
        </template>
      </a-col>
    </a-row>
    <template v-if="activeStep == 1">
      <FormGenerator ref="generatorRef" :conf="formData" :formInfo="{ ...dataForm, type: 6 }" :dbType="dbType" v-if="dataForm.formType == 2" />
      <template v-else>
        <a-row type="flex" justify="center" align="middle" class="basic-content">
          <a-col :span="12" :xxl="10" class="basic-form">
            <FieldForm ref="fieldFormRef" :conf="formData" />
          </a-col>
        </a-row>
      </template>
    </template>
    <TableModal @register="registerTableModal" @select="onTableSelect" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { getInfo, create, update } from '/@/api/workFlow/formDesign';
  import { getDataSourceSelector } from '/@/api/systemData/dataSource';
  import { getDataModelFieldList } from '/@/api/systemData/dataModel';
  import { ref, reactive, toRefs, unref, nextTick } from 'vue';
  import { BasicModal, useModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useGeneratorStore } from '/@/store/modules/generator';
  import formValidate from '/@/utils/formValidate';
  import TableModal from '/@/views/onlineDev/webDesign/components/TableModal.vue';
  import { FormGenerator } from '/@/components/FormGenerator';
  import FieldForm from './FieldForm.vue';

  interface State {
    activeStep: number;
    loading: boolean;
    btnLoading: boolean;
    relationTable: boolean;
    mainTableFields: any[];
    dbOptions: any[];
    tables: any[];
    defaultTable: any[];
    dataForm: Recordable;
    [prop: string]: any;
  }
  interface ComType {
    getData: () => any;
  }

  const emit = defineEmits(['register', 'reload']);
  const [registerForm, { setFieldsValue, getFieldsValue, resetFields, validate, updateSchema }] = useForm({
    schemas: [
      {
        field: 'fullName',
        label: '表单名称',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 50 },
        rules: [{ required: true, trigger: 'blur', message: '必填' }],
      },
      {
        field: 'enCode',
        label: '表单编码',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 50 },
        rules: [
          { required: true, trigger: 'blur', message: '必填' },
          { validator: formValidate('enCode'), trigger: 'blur' },
        ],
      },
      {
        field: 'formType',
        label: '表单类型',
        component: 'Select',
        componentProps: {
          options: [
            { id: 1, fullName: '系统表单' },
            { id: 2, fullName: '自定义表单' },
          ],
          disabled: true,
          showArrow: false,
        },
        rules: [{ required: true, trigger: 'change', message: '必填', type: 'number' }],
      },
      {
        field: 'flowType',
        label: '表单类别',
        component: 'Radio',
        componentProps: {
          options: [
            { id: 0, fullName: '发起表单' },
            { id: 1, fullName: '功能表单' },
          ],
          optionType: 'button',
          buttonStyle: 'solid',
        },
        rules: [{ required: true, trigger: 'change', message: '必填', type: 'number' }],
        ifShow: ({ values }) => values.formType == 1,
      },
      {
        field: 'urlAddress',
        label: 'Web地址',
        helpMessage: 'Web地址配置为前端物理地址',
        component: 'Input',
        componentProps: { placeholder: '请输入', addonBefore: '@/views/' },
        ifShow: ({ values }) => values.formType == 1,
      },
      {
        field: 'appUrlAddress',
        label: 'App地址',
        helpMessage: 'APP地址配置为前端物理地址，需与代码同步更新',
        component: 'Input',
        componentProps: { placeholder: '请输入' },
        ifShow: ({ values }) => values.formType == 1,
      },
      {
        field: 'interfaceUrl',
        label: '接口地址',
        helpMessage: ['后端接口请求地址', ' 系统将会请求地址中的saveData(post方法), getData(get方法)', '接口例：/api/example/UserController'],
        component: 'Input',
        componentProps: { placeholder: '请输入' },
        ifShow: ({ values }) => values.formType == 1,
      },
      {
        field: 'sortCode',
        label: '表单排序',
        defaultValue: 0,
        component: 'InputNumber',
        componentProps: { min: 0, max: 999999 },
      },
      {
        field: 'description',
        label: '表单说明',
        component: 'Textarea',
        componentProps: { placeholder: '请输入' },
      },
      {
        field: 'dbLinkId',
        label: '数据连接',
        defaultValue: '0',
        component: 'Select',
        componentProps: { placeholder: '请选择', allowClear: false, showSearch: true, fieldNames: { options: 'children' }, onChange: onDbChange },
        ifShow: ({ values }) => values.formType == 2,
      },
    ],
  });
  const [registerTableModal, { openModal: openTableModal }] = useModal();
  const [registerModal, { closeModal, changeLoading }] = useModalInner(init);
  const { createMessage, createConfirm } = useMessage();
  const generatorStore = useGeneratorStore();
  const { t } = useI18n();
  const state = reactive<State>({
    activeStep: 0,
    loading: false,
    btnLoading: false,
    relationTable: false,
    mainTableFields: [],
    dbOptions: [],
    tables: [],
    defaultTable: [],
    dataForm: {
      id: '',
      fullName: '',
      enCode: '',
      flowType: 0,
      formType: 2,
      urlAddress: '',
      appUrlAddress: '',
      interfaceUrl: '',
      sortCode: 0,
      description: '',
      dbLinkId: '0',
      tableJson: '',
      draftJson: '',
    },
    formData: null,
    dbType: 'MySQL',
  });
  const generatorRef = ref<Nullable<ComType>>(null);
  const fieldFormRef = ref<Nullable<ComType>>(null);
  const { activeStep, loading, btnLoading, tables, mainTableFields, dbType, formData, dataForm } = toRefs(state);
  const columns = [
    { title: '类别', dataIndex: 'typeId', key: 'typeId', width: 65 },
    { title: '表名', dataIndex: 'table', key: 'table' },
    { title: '外键字段', dataIndex: 'tableField', key: 'tableField', width: 160 },
    { title: '关联主键', dataIndex: 'relationField', key: 'relationField', width: 160 },
    { title: '操作', dataIndex: 'action', key: 'action', width: 50, fixed: 'right' },
  ];
  function handleDelItem(record, index) {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '确定要移除当前行?',
      onOk: () => {
        state.tables.splice(index, 1);
        if (record.typeId == '1' && state.tables.length) {
          state.tables[0].typeId = '1';
          state.tables[0].relationTable = '';
          state.tables[0].tableField = '';
          state.tables[0].relationField = '';
          state.tables[0].relationTable = '';
          state.mainTableFields = state.tables[0].fields;
          state.relationTable = state.tables[0].table;
        }
      },
    });
  }
  function init(data) {
    state.activeStep = 0;
    state.loading = true;
    state.tables = [];
    state.defaultTable = [];
    state.formData = null;
    getDbOptions();
    changeLoading(true);
    resetFields();
    state.dataForm.id = data.id;
    if (state.dataForm.id) {
      getInfo(state.dataForm.id).then(res => {
        state.dataForm = res.data;
        setFieldsValue(state.dataForm);
        state.formData = state.dataForm.draftJson && JSON.parse(state.dataForm.draftJson);
        state.tables = state.dataForm.tableJson ? JSON.parse(state.dataForm.tableJson) : [];
        state.defaultTable = JSON.parse(JSON.stringify(state.tables));
        updateFields();
        changeLoading(false);
      });
    } else {
      state.dataForm.flowType = data.flowType;
      state.dataForm.formType = data.formType;
      setFieldsValue({ flowType: data.flowType, formType: data.formType });
      state.loading = false;
      changeLoading(false);
    }
  }
  async function updateFields() {
    if (state.dataForm.formType === 1 || !state.tables.length) {
      state.loading = false;
      nextTick(() => handleNext());
      return;
    }
    state.dataForm.dbLinkId = state.dataForm.dbLinkId || '0';
    const type = state.dataForm.type;
    const queryType = type == 3 || type == 4 || type == 5 ? '1' : '0';
    for (let i = 0; i < state.tables.length; i++) {
      const res = await getDataModelFieldList(state.dataForm.dbLinkId, state.tables[i].table, queryType);
      const fields = res.data.list;
      state.tables[i].fields = fields;
      if (state.tables[i].typeId == '1') {
        state.mainTableFields = state.tables[i].fields;
        state.relationTable = state.tables[i].table;
      }
    }
    state.loading = false;
    nextTick(() => handleNext());
  }
  function onDbChange() {
    state.tables = [];
  }
  function getDbOptions() {
    getDataSourceSelector().then(res => {
      let list = res.data.list || [];
      list = list.filter(o => o.children && o.children.length);
      if (list[0] && list[0].children && list[0].children.length) list[0] = list[0].children[0];
      delete list[0].children;
      state.dbOptions = list;
      updateSchema([{ field: 'dbLinkId', componentProps: { options: state.dbOptions } }]);
    });
  }
  function getDbType() {
    for (let i = 0; i < state.dbOptions.length; i++) {
      const item = state.dbOptions[i];
      if (state.dataForm.dbLinkId === item.id) {
        state.dbType = item.dbType;
        break;
      }
      const e = state.dbOptions[i].children || [];
      for (let j = 0; j < e.length; j++) {
        if (state.dataForm.dbLinkId === e[j].id) {
          state.dbType = e[j].dbType;
          break;
        }
      }
    }
  }
  function openTableBox() {
    const values = getFieldsValue();
    if (!values.dbLinkId) return createMessage.error('请先选择数据库');
    openTableModal(true, { dbLinkId: values.dbLinkId });
  }
  async function onTableSelect(data) {
    const values = getFieldsValue();
    const type = state.dataForm.type;
    const queryType = type == 3 || type == 4 || type == 5 ? '1' : '0';
    const checkList: any[] = [];
    if (!state.tables.length) {
      for (let i = 0; i < data.length; i++) {
        const e = data[i];
        const relationTable = data[0].table;
        const typeId = i == 0 ? '1' : '0';
        const res = await getDataModelFieldList(values.dbLinkId, e.table, queryType);
        const fields = res.data.list;
        const item = {
          relationField: '',
          relationTable: i == 0 ? '' : relationTable,
          table: e.table,
          tableName: e.tableName,
          tableField: '',
          typeId,
          fields,
        };
        checkList.push(item);
      }
      state.relationTable = checkList[0].table;
      state.mainTableFields = checkList[0].fields;
      state.tables = checkList;
    } else {
      for (let i = 0; i < data.length; i++) {
        const e = data[i];
        let boo = state.tables.some(o => o.table == e.table);
        if (!boo) {
          const res = await getDataModelFieldList(values.dbLinkId, e.table, queryType);
          const fields = res.data.list;
          const item = {
            relationField: '',
            relationTable: state.relationTable,
            table: e.table,
            tableName: e.tableName,
            tableField: '',
            typeId: '0',
            fields,
          };
          checkList.push(item);
        }
      }
      state.tables = [...state.tables, ...checkList];
    }
    state.loading = false;
  }
  function changeTable(record) {
    state.relationTable = record.table;
    state.mainTableFields = record.fields;
    for (let i = 0; i < state.tables.length; i++) {
      state.tables[i].typeId = state.tables[i].table === record.table ? '1' : '0';
      state.tables[i].relationTable = state.tables[i].table === record.table ? '' : state.relationTable;
      state.tables[i].relationField = '';
      state.tables[i].tableField = '';
    }
  }
  function handlePrev() {
    state.activeStep -= 1;
    if (state.activeStep == 0) updateTables();
  }
  async function handleNext() {
    if (state.activeStep < 1) {
      const values = await validate();
      if (!values) return;
      state.dataForm = { ...state.dataForm, ...values };
      getDbType();
      if (!state.tables.length) {
        if (state.defaultTable.length) {
          createMessage.warning('请至少选择一个数据表');
          return;
        }
        generatorStore.setHasTable(false);
        generatorStore.setAllTable([]);
        generatorStore.setFormItemList([]);
        state.activeStep += 1;
      } else {
        if (!exist()) return;
        const subTable = state.tables.filter(o => o.typeId == '0');
        generatorStore.setHasTable(true);
        generatorStore.setAllTable(state.tables);
        generatorStore.setSubTable(subTable);
        generatorStore.setFormItemList(state.mainTableFields);
        state.activeStep += 1;
      }
    }
  }
  function onStepChange(current) {
    if (current == 0) updateTables();
  }
  function updateTables() {
    state.tables = generatorStore.getAllTable;
    state.mainTableFields = generatorStore.getFormItemList;
  }
  function exist() {
    let isOk = true;
    for (let i = 0; i < state.tables.length; i++) {
      const e = state.tables[i];
      if (e.typeId == '0') {
        if (!e.tableField) {
          createMessage.warning(`表${e.table}外键字段不能为空`);
          isOk = false;
          break;
        }
        if (!e.relationField) {
          createMessage.warning(`表${e.table}关联主键不能为空`);
          isOk = false;
          break;
        }
      }
    }
    return isOk;
  }
  async function handleSubmit() {
    if (state.activeStep < 1) {
      if (!state.tables.length && state.defaultTable.length) return createMessage.warning('请至少选择一个数据表');
      const values = await validate();
      if (!values) return;
      state.dataForm = { ...state.dataForm, ...values };
      handleRequest();
    } else {
      const ComRef = state.dataForm.formType == 2 ? unref(generatorRef) : unref(fieldFormRef);
      (ComRef as ComType)
        .getData()
        .then(res => {
          state.formData = res.formData;
          handleRequest();
        })
        .catch(err => {
          err.msg && createMessage.warning(err.msg);
        });
    }
  }
  function handleRequest() {
    state.btnLoading = true;
    const query = {
      ...state.dataForm,
      tableJson: JSON.stringify(state.tables),
      draftJson: state.formData ? JSON.stringify(state.formData) : null,
    };
    const formMethod = state.dataForm.id ? update : create;
    formMethod(query)
      .then(res => {
        createMessage.success(res.msg);
        state.btnLoading = false;
        setTimeout(() => {
          closeModal();
          emit('reload');
        }, 200);
      })
      .catch(() => {
        state.btnLoading = false;
      });
  }
</script>
