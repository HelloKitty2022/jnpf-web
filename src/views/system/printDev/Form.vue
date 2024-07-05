<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    defaultFullscreen
    :footer="null"
    :closable="false"
    :keyboard="false"
    class="jnpf-full-modal full-modal"
    destroyOnClose>
    <template #title>
      <div class="jnpf-full-modal-header">
        <div class="header-title">
          <img src="../../../assets/images/jnpf.png" class="header-logo" />
          <p class="header-txt"> · 打印模板</p>
        </div>
        <a-steps v-model:current="activeStep" type="navigation" size="small">
          <a-step title="基础设置" />
          <a-step title="打印设置" :disabled="activeStep <= 1" />
        </a-steps>
        <a-space class="options" :size="10">
          <a-button @click="handlePrev" :disabled="activeStep <= 0 || btnLoading">{{ t('common.prev') }}</a-button>
          <a-button @click="handleNext" :disabled="activeStep >= 1 || loading || btnLoading" :loading="nextBtnLoading">{{ t('common.next') }} </a-button>
          <a-button type="primary" @click="handleSubmit()" :disabled="loading || activeStep != 1" :loading="btnLoading">{{ t('common.saveText') }}</a-button>
          <a-button @click="closeModal()">{{ t('common.cancelText') }}</a-button>
        </a-space>
      </div>
    </template>
    <div class="basic-content">
      <a-row type="flex" justify="center" align="middle" class="basic-content" v-show="activeStep === 0">
        <a-col :span="12" :xxl="10" class="basic-form">
          <BasicForm @register="registerForm">
            <template #sqlTemplate>
              <a-form-item-rest>
                <a-button preIcon="icon-ym icon-ym-btn-add" @click="handleAddSql()">新增SQL</a-button>
                <a-row v-for="(item, i) in sqlTemplate" :key="i" class="mt-10px">
                  <a-col :span="21">
                    <a-textarea v-model:value="item.sql" placeholder="请输入SQL查询语句&存储过程语句" type="textarea" :autoSize="{ minRows: 3, maxRows: 10 }" />
                  </a-col>
                  <a-col :span="2" :offset="1" class="delBtn">
                    <a-button type="danger" preIcon="icon-ym icon-ym-nav-close" @click="handleDelSql(i)"> </a-button>
                  </a-col>
                </a-row>
              </a-form-item-rest>
            </template>
            <template #interfaceId="{ model, field }">
              <interface-modal :value="model[field]" :title="dataForm.interfaceName" :hasPage="0" dataType="1,3" @change="onInterfaceChange" />
            </template>
          </BasicForm>
          <a-table
            v-if="dataForm.interfaceId && state.dataForm.sourceType == 1"
            :data-source="parameterJson"
            :columns="templateJsonColumns"
            size="small"
            :pagination="false"
            class="mb-20px">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'field'">
                <span class="required-sign">{{ record.required ? '*' : '' }}</span>
                {{ record.field }}{{ record.fieldName ? '(' + record.fieldName + ')' : '' }}
              </template>
              <template v-if="column.key === 'sourceType'">
                <jnpf-select
                  v-model:value="record.sourceType"
                  :options="getSourceTypeOptions(record.required)"
                  class="!w-100px"
                  @change="handleSourceTypeChange(record)" />
              </template>
              <template v-if="column.key === 'relationField'">
                <template v-if="record.sourceType === 2">
                  <jnpf-input-number v-if="['int', 'decimal'].includes(record.dataType)" v-model:value="record.relationField" placeholder="请输入" clearable />
                  <jnpf-date-picker
                    v-else-if="record.dataType == 'datetime'"
                    class="!w-full"
                    v-model:value="record.relationField"
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="请选择"
                    clearable />
                  <jnpf-input v-else v-model:value="record.relationField" placeholder="请输入" clearable />
                </template>
                <jnpf-select v-if="record.sourceType === 4" v-model:value="record.relationField" :options="interfaceSystemOptions" allowClear showSearch />
              </template>
            </template>
            <template #emptyText>
              <p class="leading-60px">暂无数据</p>
            </template>
          </a-table>
        </a-col>
      </a-row>
      <PrintDesign
        v-if="activeStep === 1 && showPrintDesign"
        :treeData="treeData"
        v-model:value="dataForm.printTemplate"
        :pageParam="pageParam"
        @pageParamChange="pageParamChange"
        @input="onDesignChange"
        :type="dataForm.type" />
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, watch, nextTick, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import PrintDesign from '/@/components/PrintDesign/index.vue';
  import { getPrintDevInfo, updatePrintDev, createPrintDev, getFields } from '/@/api/system/printDev';
  import { BasicForm, useForm } from '/@/components/Form';
  import formValidate from '/@/utils/formValidate';
  import { getDataSourceSelector } from '/@/api/systemData/dataSource';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { InterfaceModal } from '/@/components/CommonModal';
  import { sourceTypeOptions, interfaceSystemOptions, templateJsonColumns } from '/@/components/FlowProcess/src/helper/define';

  const emit = defineEmits(['register', 'reload']);

  interface State {
    activeStep: number;
    btnLoading: boolean;
    nextBtnLoading: boolean;
    loading: boolean;
    treeData: any;
    dataForm: any;
    pageParam: any;
    dbOptions: any[];
    sqlTemplate: any[];
    parameterJson: any[];
    showPrint: boolean;
    showPrintDesign: boolean;
    fieldList: any[];
  }

  const state = reactive<State>({
    activeStep: 0,
    btnLoading: false,
    nextBtnLoading: false,
    loading: false,
    treeData: [],
    dataForm: {
      id: '',
      fullName: '',
      enCode: '',
      dbLinkId: '0',
      type: 1,
      enabledMark: 1,
      sortCode: 0,
      category: '',
      sqlTemplate: '',
      leftFields: '',
      printTemplate: '',
      description: '',
      sourceType: 0,
    },
    pageParam: {
      type: '2',
      width: '210',
      height: '297',
      mt: '10',
      mb: '10',
      ml: '10',
      mr: '10',
      direction: '纵向',
    },
    dbOptions: [],
    sqlTemplate: [],
    parameterJson: [],
    showPrint: true,
    showPrintDesign: true,
    fieldList: [],
  });
  const { activeStep, btnLoading, loading, treeData, dataForm, pageParam, sqlTemplate, nextBtnLoading, showPrintDesign, parameterJson } = toRefs(state);
  const { t } = useI18n();
  const { createMessage } = useMessage();
  const [registerModal, { closeModal, changeLoading }] = useModalInner(init);
  const [registerForm, { setFieldsValue, resetFields, validate, updateSchema, clearValidate }] = useForm({
    schemas: [
      {
        field: 'fullName',
        label: '模板名称',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 100 },
        rules: [{ required: true, trigger: 'blur', message: '必填' }],
      },
      {
        field: 'enCode',
        label: '模板编码',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 50 },
        rules: [
          { required: true, trigger: 'blur', message: '必填' },
          { validator: formValidate('enCode'), trigger: 'blur' },
        ],
      },
      {
        field: 'category',
        label: '模板分类',
        component: 'Select',
        componentProps: { placeholder: '请选择', showSearch: true, fieldNames: { value: 'enCode' } },
        rules: [{ required: true, trigger: 'change', message: '必填' }],
      },
      {
        field: 'type',
        label: '模板类型',
        defaultValue: 1,
        component: 'Radio',
        componentProps: {
          options: [
            { id: 1, fullName: '流程表单' },
            { id: 2, fullName: '功能表单' },
          ],
          optionType: 'button',
          buttonStyle: 'solid',
        },
        rules: [{ required: true, trigger: 'change', message: '必填', type: 'number' }],
      },
      {
        field: 'sortCode',
        label: '模板排序',
        defaultValue: 0,
        component: 'InputNumber',
        componentProps: { min: 0, max: 999999 },
      },
      {
        field: 'enabledMark',
        label: '模板状态',
        defaultValue: 1,
        component: 'Switch',
      },
      {
        field: 'description',
        label: '模板说明',
        component: 'Textarea',
        componentProps: { placeholder: '请输入' },
      },
      {
        field: 'sourceType',
        label: '数据来源',
        defaultValue: 0,
        component: 'Radio',
        componentProps: {
          options: [
            { fullName: '自定义SQL', id: 0 },
            { fullName: '数据接口', id: 1 },
          ],
          optionType: 'button',
          buttonStyle: 'solid',
          onChange: onSourceTypeChange,
        },
      },
      {
        ifShow: ({ values }) => values.sourceType == 0,
        field: 'tips',
        label: ' ',
        component: 'Alert',
        componentProps: { message: '默认打印的时候必须传业务主键@formId给SQL语句里面作为Where查询条件', type: 'warning', showIcon: true },
      },
      {
        ifShow: ({ values }) => values.sourceType == 0,
        field: 'dbLinkId',
        label: '数据连接',
        component: 'Select',
        defaultValue: '0',
        componentProps: { placeholder: '请选择', allowClear: false, showSearch: true, fieldNames: { options: 'children' } },
        rules: [{ required: true, trigger: 'change', message: '必填' }],
      },
      {
        ifShow: ({ values }) => values.sourceType == 0,
        field: 'sqlTemplate',
        label: 'SQL语句',
        component: 'Select',
        slot: 'sqlTemplate',
        required: true,
      },
      {
        ifShow: ({ values }) => values.sourceType == 1,
        field: 'interfaceId',
        label: '数据接口',
        slot: 'interfaceId',
        component: 'Select',
        rules: [{ required: true, trigger: 'change', message: '必填' }],
      },
    ],
  });

  watch(
    () => state.sqlTemplate,
    value => {
      nextTick(() => {
        setFieldsValue({ sqlTemplate: value });
      });
    },
    { deep: true },
  );

  function init(data) {
    state.sqlTemplate = [];
    state.parameterJson = [];
    state.fieldList = [];
    state.dataForm.printTemplate = '';
    state.showPrintDesign = true;
    resetFields();
    clearValidate();
    getDataSource();
    state.activeStep = 0;
    state.dataForm.id = data.id || '';
    if (data?.categoryList) updateSchema({ field: 'category', componentProps: { options: data.categoryList } });
    if (state.dataForm.id) {
      changeLoading(true);
      state.showPrint = false;
      getPrintDevInfo(state.dataForm.id)
        .then(res => {
          state.dataForm = res.data;
          state.sqlTemplate = (state.dataForm.sqlTemplate && JSON.parse(state.dataForm.sqlTemplate)) || [];
          state.parameterJson = (state.dataForm.parameterJson && JSON.parse(state.dataForm.parameterJson)) || [];
          state.fieldList = state.dataForm.fieldJson ? JSON.parse(state.dataForm.fieldJson) : [];
          let e = (res.data.pageParam && JSON.parse(res.data.pageParam)) || {};
          state.pageParam = e;
          setFieldsValue(state.dataForm);
          state.showPrint = true;
          changeLoading(false);
        })
        .catch(() => {
          state.loading = false;
          state.showPrint = true;
          changeLoading(false);
        });
    }
  }
  function getDataSource() {
    getDataSourceSelector().then(res => {
      let list = res.data.list || [];
      list = list.filter(o => o.children && o.children.length);
      if (list[0] && list[0].children && list[0].children.length) list[0] = list[0].children[0];
      delete list[0].children;
      state.dbOptions = list;
      updateSchema([{ field: 'dbLinkId', componentProps: { options: state.dbOptions } }]);
    });
  }
  function handleSubmit() {
    state.btnLoading = true;
    const formMethod = state.dataForm.id ? updatePrintDev : createPrintDev;
    formMethod(state.dataForm)
      .then(res => {
        state.btnLoading = false;
        state.showPrintDesign = false;
        createMessage.success(res.msg);
        setTimeout(() => {
          closeModal();
          setTimeout(() => {
            emit('reload');
          }, 200);
        }, 50);
      })
      .catch(() => {
        state.btnLoading = false;
      });
  }
  function handlePrev() {
    state.activeStep -= 1;
  }
  async function handleNext() {
    if (state.activeStep < 1) {
      const values = await validate();
      if (!values) return;
      state.dataForm = { ...state.dataForm, ...values, sqlTemplate: JSON.stringify(state.sqlTemplate), parameterJson: JSON.stringify(state.parameterJson) };
      if (values.sourceType == 0) {
        if (!exist()) return;
        state.nextBtnLoading = true;
        const query = {
          dbLinkId: values.dbLinkId,
          sqlTemplate: state.dataForm.sqlTemplate,
        };
        getFields(query)
          .then(res => {
            state.treeData = res.data;
            state.activeStep += 1;
            state.nextBtnLoading = false;
          })
          .catch(() => {
            state.nextBtnLoading = false;
          });
      } else {
        if (!state.fieldList?.length) return createMessage.error('请先设置数据接口的字段列表！');
        state.treeData = state.fieldList.map(o => ({ ...o, fullName: o.field + '(' + o.defaultValue + ')', id: o.defaultValue }));
        state.activeStep += 1;
      }
    }
  }
  function pageParamChange(pageParam) {
    state.dataForm.pageParam = pageParam && JSON.stringify(pageParam);
  }
  function handleAddSql() {
    state.sqlTemplate.push({ sql: '' });
  }
  function handleDelSql(i) {
    state.sqlTemplate.splice(i, 1);
  }
  function exist() {
    if (!state.sqlTemplate.length) {
      createMessage.error('请输入SQL语句');
      return false;
    }
    let isOk = true;
    for (let i = 0; i < state.sqlTemplate.length; i++) {
      const e = state.sqlTemplate[i];
      if (!e.sql) {
        createMessage.error(`第${i + 1}行SQL语句不能为空`);
        isOk = false;
        break;
      }
    }
    return isOk;
  }
  function onDesignChange(val) {
    state.dataForm.printTemplate = val;
  }
  function onSourceTypeChange(val) {
    state.dataForm.sourceType = val;
  }
  function onInterfaceChange(id, row) {
    state.fieldList = [];
    if (!id) {
      state.dataForm.interfaceId = '';
      state.dataForm.interfaceName = '';
      state.parameterJson = [];
      handleInterfaceInfo();
      return;
    }
    state.fieldList = row.fieldJson ? JSON.parse(row.fieldJson) : [];
    if (state.dataForm.interfaceId === id) return;
    state.dataForm.interfaceId = id;
    state.dataForm.interfaceName = row.fullName;
    state.parameterJson = row.templateJson ? row.templateJson.map(o => ({ ...o, relationField: '', sourceType: 2 })) : [];
    handleInterfaceInfo();
    setTimeout(() => {
      clearValidate('interfaceId');
    }, 0);
  }
  function handleInterfaceInfo() {
    setFieldsValue({
      interfaceId: state.dataForm.interfaceId,
      interfaceName: state.dataForm.interfaceName,
    });
  }
  function handleSourceTypeChange(record) {
    record.relationField = record.sourceType == 4 ? unref(interfaceSystemOptions)[0]?.id : '';
  }
  function getSourceTypeOptions(isRequired) {
    return isRequired ? sourceTypeOptions.filter(o => o.id != 3 && o.id != 1) : sourceTypeOptions.filter(o => o.id != 1);
  }
</script>
