<template>
  <BasicPopup
    class="full-popup data-interface-popup"
    v-bind="$attrs"
    :continueLoading="activeStep < getStepList.length - 1"
    @register="registerPopup"
    @ok="handleSubmit"
    showOkBtn>
    <template #title>
      <div class="ml-10px steps">
        <a-steps v-model:current="activeStep" type="navigation" size="small" :key="key">
          <a-step v-for="item in getStepList" :key="item" :title="item" disabled />
        </a-steps>
      </div>
    </template>
    <template #insertToolbar>
      <a-space :size="10">
        <a-button @click="handlePrev" :disabled="activeStep <= 0">{{ t('common.prev') }}</a-button>
        <a-button @click="handleNext" :disabled="activeStep >= getStepList.length - 1">{{ t('common.next') }} </a-button>
      </a-space>
    </template>
    <!-- 基本信息 -->
    <a-row class="mt-20px overflow-auto h-full" v-show="activeStep === 0">
      <a-col :span="14" :offset="5">
        <BasicForm @register="registerForm">
          <template #hasPage="{ model, field }">
            <JnpfSwitch v-model:value="model[field]" :checkedValue="1" :unCheckedValue="0" @change="onHasPageChange" :disabled="hasPageDisabled" />
            <span class="page-explain" @click="handleShowPageExplain">分页使用说明</span>
          </template>
        </BasicForm>
      </a-col>
    </a-row>
    <!-- sql语句 -->
    <div class="config h-full" v-if="getShowSqlBox()">
      <div class="left-pane">
        <jnpf-select
          v-if="activeStep === 1"
          class="!w-full"
          v-model:value="dataConfigJson.sqlData.dbLinkId"
          showSearch
          :options="dbOptions"
          placeholder="选择数据库"
          @change="handleSelectTable"
          :fieldNames="{ options: 'children' }" />
        <jnpf-select
          v-if="activeStep === 2"
          class="!w-full"
          v-model:value="dataCountJson.sqlData.dbLinkId"
          showSearch
          :options="dbOptions"
          placeholder="选择数据库"
          @change="handleSelectTable"
          :fieldNames="{ options: 'children' }" />
        <jnpf-select
          v-if="activeStep === 3"
          class="!w-full"
          v-model:value="dataEchoJson.sqlData.dbLinkId"
          showSearch
          :options="dbOptions"
          placeholder="选择数据库"
          @change="handleSelectTable"
          :fieldNames="{ options: 'children' }" />
        <div class="box">
          <InputSearch class="search-box" :placeholder="t('common.enterKeyword')" allowClear v-model:value="keyword" @search="handleSearchTable" />
          <BasicTree
            class="tree-box remove-active-tree"
            ref="leftTreeRef"
            :defaultExpandAll="false"
            :treeData="treeData"
            :loading="treeLoading"
            :load-data="onLoadData"
            @select="handleTreeSelect" />
        </div>
      </div>
      <div class="middle-pane">
        <div class="title-box">
          <span> SQL语句<BasicHelp text="支持SQL语句&存储过程语句" /> </span>
          <a-dropdown>
            <span class="cursor-pointer">系统变量<DownOutlined /></span>
            <template #overlay>
              <a-menu>
                <a-menu-item disabled>当前系统变量仅支持内部接口引用</a-menu-item>
                <a-menu-divider />
                <a-menu-item v-for="(item, index) in getSysVariableList" :key="index" @click="handleSysNodeClick(item.value)">
                  <span>{{ item.value }}</span>
                  <span style="float: right; color: #8492a6; padding-left: 10px">{{ item.tips }}</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <MonacoEditor v-if="activeStep === 1" class="h-full" ref="sqlEditorRef" language="sql" v-model="dataConfigJson.sqlData.sql" />
        <MonacoEditor v-if="activeStep === 2" class="h-full" ref="sqlEditorRef" language="sql" v-model="dataCountJson.sqlData.sql" />
        <MonacoEditor v-if="activeStep === 3" class="h-full" ref="sqlEditorRef" language="sql" v-model="dataEchoJson.sqlData.sql" />
      </div>
      <div class="right-pane" v-if="!dataForm.isPostPosition">
        <FieldTable :list="parameterJson" @item-click="handleItemClick" />
        <FieldTable :list="fieldJson" :type="1" />
      </div>
    </div>
    <!-- api操作 -->
    <div class="config h-full" v-if="getShowApiBox()">
      <div class="middle-pane">
        <a-form :colon="false" :model="apiData" ref="formElRef">
          <a-form-item label="" name="url" :rules="pathRules" class="!mt-20px !mx-20px">
            <a-input v-model:value="apiData.url" placeholder="请输入接口路径">
              <template #addonBefore>
                <div class="!w-80px">
                  <jnpf-select v-model:value="apiData.method" :options="methodOptions" />
                </div>
              </template>
            </a-input>
          </a-form-item>
        </a-form>
        <div class="title title-box">请求参数</div>
        <a-tabs v-model:activeKey="activeKey" class="tabs-box">
          <a-tab-pane v-for="item in tabList" :key="item.key" :tab="item.title" />
        </a-tabs>
        <jnpf-radio v-if="activeKey === 2" v-model:value="apiData.bodyType" class="!mb-20px !ml-20px" :options="bodyTypeList" @change="onBodyTypeChange" />
        <template v-if="getShowTableBox()">
          <parameterTable
            v-if="getShowTableBox()"
            :list="getList"
            :hasPage="dataForm.hasPage"
            :activeStep="activeStep"
            :fieldTreeData="fieldTreeData"
            :parameterJson="parameterJson"
            :sourceDisabled="!!dataForm.isPostPosition" />
          <div class="table-actions" @click="addHandle()">
            <a-button type="link" preIcon="icon-ym icon-ym-btn-add">{{ getAddTitle }}</a-button>
          </div>
        </template>
        <div v-if="activeKey === 2 && apiData.bodyType === 0" class="mt-20px ml-50px">该请求没有Body主体</div>
        <div v-if="activeKey === 2 && (apiData.bodyType === 3 || apiData.bodyType === 4)" class="middle-pane !mb-10px">
          <div class="title-box">
            <span>{{ apiData.bodyType === 3 ? 'JSON' : 'XML' }} Body</span>
            <a-popover placement="bottom">
              <template #content>
                <BasicLeftTree
                  class="tree-box w-200px h-400px overflow-auto"
                  ref="leftTreeRef"
                  defaultExpandAll
                  :treeData="getTreeData"
                  @select="handleSelect" />
              </template>
              <span v-if="!dataForm.isPostPosition" class="cursor-pointer">插入参数<DownOutlined /></span>
            </a-popover>
          </div>
          <MonacoEditor v-if="apiData.bodyType === 3 || apiData.bodyType === 4" class="h-full" ref="sqlEditorRef" language="sql" v-model="apiData.body" />
        </div>
      </div>
      <div class="right-pane" v-if="!dataForm.isPostPosition">
        <FieldTable :list="parameterJson" @item-click="handleItemClick" />
        <FieldTable :list="fieldJson" :type="1" />
      </div>
    </div>
    <!-- 静态数据数据处理 -->
    <div class="config h-full" v-if="activeStep === 1 && dataForm.type == 2">
      <MonacoEditor class="h-full middle-pane" ref="editorRef" v-model="dataConfigJson.staticData" language="json" />
      <FieldTable class="static-right-pane" :list="fieldJson" :type="1" scrollY="calc(100vh - 312px)" v-if="!dataForm.isPostPosition" />
    </div>
    <!-- api\sql数据处理 -->
    <div class="jsStaticData" v-if="getShowCodeBox()">
      <div class="json-box">
        <MonacoEditor class="h-full" ref="codeEditorRef" v-model="dataJsJson" language="javascript" v-if="getIsLastStep()" />
        <MonacoEditor class="h-full" ref="codeEditorRef" v-model="dataExceptionJson" language="javascript" v-else />
      </div>
      <div class="jsTips">
        <p>1、支持JavaScript的脚本</p>
        <p>2、小程序不支持在线JS脚本</p>
      </div>
    </div>
    <PageExplainModal @register="registerPageExplain" />
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { ref, computed, reactive, toRefs, unref, watch, nextTick } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { getDataInterfaceInfo, createDataInterface, updateDataInterface } from '/@/api/systemData/dataInterface';
  import { getDataModelListAll, getDataModelFieldList } from '/@/api/systemData/dataModel';
  import { getDataSourceSelector } from '/@/api/systemData/dataSource';
  import { BasicTree, BasicLeftTree } from '/@/components/Tree';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useBaseStore } from '/@/store/modules/base';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { MonacoEditor } from '/@/components/CodeEditor';
  import { useModal } from '/@/components/Modal';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { InputSearch } from 'ant-design-vue';
  import PageExplainModal from './components/PageExplainModal.vue';
  import FieldTable from './components/Field/Field.vue';
  import parameterTable from './components/parameter/index.vue';
  import { getVariateSelector } from '/@/api/systemData/variate';

  interface State {
    activeStep: number;
    keyword: string;
    treeData: any[];
    dbOptions: any[];
    treeLoading: boolean;
    dataForm: any;
    dataConfigJson: any;
    dataCountJson: any;
    dataEchoJson: any;
    dataJsJson: any;
    dataExceptionJson: any;
    fieldJson: any[];
    parameterJson: any[];
    methodOptions: any[];
    restaurants: any[];
    pathRules: any;
    echoPathRules: any;
    key: any;
    sqlType: number;
    activeKey: number;
    list: any[];
    fieldTreeData: any[];
    apiData: any;
    hasPageDisabled: boolean;
  }

  const defaultDataJsJson = '(data) => {\r\n    // 处理数据逻辑\r\n\r\n    // 返回所需的数据\r\n    return data\r\n}';
  const defaultDataExceptionJson = '(data) => {\r\n    // 返回true表示接口验证成功！\r\n\r\n    // 返回false表示接口验证失败！\r\n    return true\r\n}';
  const defaultJson = {
    staticData: '',
    sqlData: {
      dbLinkId: '',
      sql: '',
    },
    apiData: {
      method: 1,
      url: '',
      header: [],
      query: [],
      body: '',
      bodyType: 0,
    },
  };
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const sqlEditorRef = ref(null);
  const leftTreeRef = ref(null);
  const state = reactive<State>({
    activeStep: 0,
    keyword: '',
    treeData: [],
    dbOptions: [],
    treeLoading: false,
    dataForm: {
      fullName: '',
      enCode: '',
      category: '',
      type: 2,
      hasPage: 0,
      sortCode: 0,
      enabledMark: 1,
      description: '',
    },
    dataConfigJson: defaultJson,
    dataCountJson: defaultJson,
    dataEchoJson: defaultJson,
    dataJsJson: '',
    dataExceptionJson: '',
    fieldJson: [],
    parameterJson: [],
    methodOptions: [
      { fullName: 'GET', id: 1 },
      { fullName: 'POST', id: 2 },
    ],
    restaurants: [
      { value: 'Postman-Token' },
      { value: 'Host' },
      { value: 'User-Agent' },
      { value: 'Accept' },
      { value: 'Accept-Encoding' },
      { value: 'Connection' },
    ],
    pathRules: [{ required: true, message: '必填', trigger: 'blur' }],
    echoPathRules: [{ required: true, message: '必填', trigger: 'blur' }],
    key: +new Date(),
    sqlType: 0,
    activeKey: 0,
    list: [],
    fieldTreeData: [],
    apiData: defaultJson.apiData,
    hasPageDisabled: false,
  });
  const {
    activeStep,
    dataForm,
    dataConfigJson,
    dataCountJson,
    dataEchoJson,
    dataJsJson,
    dataExceptionJson,
    fieldJson,
    parameterJson,
    dbOptions,
    treeLoading,
    treeData,
    keyword,
    methodOptions,
    pathRules,
    key,
    activeKey,
    fieldTreeData,
    apiData,
    hasPageDisabled,
  } = toRefs(state);
  const schemas: FormSchema[] = [
    {
      field: 'fullName',
      label: '名称',
      component: 'Input',
      componentProps: { placeholder: '请输入', maxlength: 50 },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'enCode',
      label: '编码',
      component: 'Input',
      componentProps: { placeholder: '请输入', maxlength: 50 },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'category',
      label: '分类',
      component: 'TreeSelect',
      componentProps: { placeholder: '请选择' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'type',
      label: '类型',
      component: 'Radio',
      defaultValue: 2,
      componentProps: {
        options: [
          { fullName: '静态数据', id: 2 },
          { fullName: 'SQL操作', id: 1 },
          { fullName: 'API操作', id: 3 },
        ],
        onChange: onTypeChange,
      },
    },
    {
      ifShow: ({ values }) => values.type === 1,
      field: 'action',
      label: '动作',
      component: 'Radio',
      componentProps: {
        options: [
          { fullName: '查询', id: 3 },
          { fullName: '增加', id: 1 },
          { fullName: '修改', id: 2 },
          { fullName: '删除', id: 4 },
        ],
        onChange: $event => {
          onMethodChange($event, 'sql');
        },
      },
    },
    {
      field: 'sortCode',
      label: '排序',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: { min: 0, max: 999999 },
    },
    {
      field: 'enabledMark',
      label: '状态',
      component: 'Switch',
      defaultValue: 1,
    },
    {
      ifShow: ({ values }) => values.type === 3 || (values.type === 1 && values.action === 3),
      field: 'hasPage',
      label: '分页',
      component: 'Switch',
      defaultValue: 0,
      slot: 'hasPage',
    },
    {
      field: 'isPostPosition',
      label: '鉴权',
      component: 'Switch',
      helpMessage: '开启后作为鉴权接口',
      defaultValue: 0,
      componentProps: { onChange: onIsPostPositionChange },
    },
    {
      field: 'description',
      label: '说明',
      component: 'Textarea',
      componentProps: { placeholder: '请输入', row: 3 },
    },
  ];
  const bodyTypeList = [
    { fullName: 'none', id: 0 },
    { fullName: 'form-data', id: 1 },
    { fullName: 'x-www-form-urlencoded', id: 2 },
    { fullName: 'json', id: 3 },
    { fullName: 'xml', id: 4 },
  ];
  const tabList = [
    { title: 'Header', key: 0 },
    { title: 'Query', key: 1 },
    { title: 'Body', key: 2 },
  ];
  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const [registerForm, { setFieldsValue, validate, resetFields, updateSchema }] = useForm({ labelWidth: 80, schemas: schemas });
  const [registerPopup, { closePopup, changeLoading, changeOkLoading }] = usePopupInner(init);
  const [registerPageExplain, { openModal: openPageExplainModal }] = useModal();
  const formElRef = ref();

  const getAddTitle = computed(() => {
    const name = tabList[state.activeKey]?.title || '';
    return `添加${name}参数`;
  });
  const getStepList = computed(() => {
    state.key = +new Date();
    let base = ['基本信息', '数据配置'];
    if (state.dataForm.type === 2) return base;
    if (state.dataForm.type === 1 && state.dataForm.hasPage === 1) base = [...base, '数量统计', '数据回显'];
    if (state.dataForm.type === 3 && state.dataForm.hasPage === 0) base = [...base, '异常验证'];
    if (state.dataForm.type === 3 && state.dataForm.hasPage === 1) base = [...base, '数据回显', '异常验证'];
    if (state.dataForm.type === 3 && state.dataForm.isPostPosition === 1) return base;
    return [...base, '数据处理'];
  });
  const getSysVariableList = computed(() => {
    const list = [
      { value: '@lotSnowID', tips: '批量生成不同雪花ID' },
      { value: '@snowFlakeID', tips: '系统生成雪花ID' },
      { value: '@currentUser', tips: '当前用户' },
      { value: '@currentUsersAndSubordinates', tips: '当前用户及下属' },
      { value: '@organization', tips: '当前组织' },
      { value: '@currentOrganizationAndSuborganization', tips: '当前组织及子组织' },
      { value: '@chargeorganization', tips: '当前分管组织' },
    ];
    const dataConfigList = [
      { value: '@offsetSize', tips: '开始数据条数' },
      { value: '@pageSize', tips: '返回数据条数' },
    ];
    const dataEchoList = [
      { value: '@showKey', tips: '回显字段查询key' },
      { value: '@showValue', tips: '回显字段值' },
    ];
    const keyword = { value: '@keyword', tips: '关键词搜索' };
    if (!state.dataForm.hasPage) return list;
    if (state.activeStep === 2) return [...list, keyword];
    if (state.activeStep === 3) return [...list, ...dataEchoList];
    return [...list, ...dataConfigList, keyword];
  });
  const getList = computed(() => {
    if (state.activeKey === 0) state.list = state.apiData.header || [];
    if (state.activeKey === 1) state.list = state.apiData.query || [];
    if (state.activeKey === 2) state.list = state.apiData.body || [];
    return state.list;
  });
  const getTreeData = computed(() => {
    const parameterJson: any[] = state.parameterJson.map(o => ({ ...o, fullName: o.field, parameter: 1, type: 1 }));
    let tree: any[] = [
      { id: 1, fullName: '接口参数', hasChildren: true, children: parameterJson },
      { id: 2, fullName: '变量', hasChildren: true, children: state.fieldTreeData },
    ];
    tree = tree.filter(o => o.children && o.children.length);
    if (!state.dataForm.hasPage) return tree;
    const page = {
      id: 3,
      fullName: '分页参数',
      hasChildren: true,
      children: [
        { fullName: 'currentPage', id: 'currentPage', parameter: 1, type: 1 },
        { fullName: 'pageSize', id: 'pageSize', parameter: 1, type: 1 },
        { fullName: 'keyword', id: 'keyword', parameter: 1, type: 1 },
      ],
    };
    const echo = {
      id: 4,
      fullName: '回显参数',
      hasChildren: true,
      children: [
        { fullName: 'showKey', id: 'showKey', parameter: 1, type: 1 },
        { fullName: 'showValue', id: 'showValue', parameter: 1, type: 1 },
      ],
    };
    return [...tree, state.activeStep == 1 ? page : echo];
  });

  watch(
    () => state.activeStep,
    (newVal, oldVal) => {
      if (state.dataForm.type !== 3) return;
      if (oldVal == 1) state.dataConfigJson.apiData = JSON.parse(JSON.stringify(state.apiData));
      if (oldVal == 2 && state.dataForm.hasPage) state.dataEchoJson.apiData = JSON.parse(JSON.stringify(state.apiData));
      if (newVal === 1) state.apiData = JSON.parse(JSON.stringify(state.dataConfigJson.apiData));
      if (newVal === 2 && state.dataForm.hasPage) state.apiData = JSON.parse(JSON.stringify(state.dataEchoJson.apiData));
    },
  );

  async function init(data) {
    state.activeStep = 0;
    resetData();
    resetFields();
    state.dataForm.id = data.id;
    const options = (await baseStore.getDictionaryData('DataInterfaceType')) as any[];
    updateSchema([{ field: 'category', componentProps: { options } }]);
    getDataSourceSelector().then(res => {
      let list = res.data.list || [];
      list = list.filter(o => o.children && o.children.length);
      if (list[0] && list[0].children && list[0].children.length) list[0] = list[0].children[0];
      delete list[0].children;
      state.dbOptions = list;
      state.hasPageDisabled = false;
      if (state.dataForm.id) {
        changeLoading(true);
        getDataInterfaceInfo(state.dataForm.id).then(res => {
          state.dataForm = res.data;
          setFieldsValue({
            fullName: state.dataForm.fullName,
            enCode: state.dataForm.enCode,
            category: state.dataForm.category,
            type: state.dataForm.type,
            action: state.dataForm.action,
            sortCode: state.dataForm.sortCode,
            enabledMark: state.dataForm.enabledMark,
            description: state.dataForm.description,
            hasPage: state.dataForm.hasPage,
            isPostPosition: state.dataForm.isPostPosition,
            id: state.dataForm.id,
          });
          state.dataConfigJson = res.data.dataConfigJson ? JSON.parse(res.data.dataConfigJson) : JSON.parse(JSON.stringify(defaultJson));
          if (!state.dataConfigJson.sqlData.dbLinkId) state.dataConfigJson.sqlData.dbLinkId = '0';
          state.dataCountJson = res.data.dataCountJson ? JSON.parse(res.data.dataCountJson) : JSON.parse(JSON.stringify(defaultJson));
          state.dataEchoJson = res.data.dataEchoJson ? JSON.parse(res.data.dataEchoJson) : JSON.parse(JSON.stringify(defaultJson));
          state.parameterJson = res.data.parameterJson ? JSON.parse(res.data.parameterJson) : [];
          state.fieldJson = res.data.fieldJson ? JSON.parse(res.data.fieldJson) : [];
          state.dataJsJson = res.data.dataJsJson;
          state.dataExceptionJson = res.data.dataExceptionJson;
          if (state.dataConfigJson.apiData.bodyType == 1 || state.dataConfigJson.apiData.bodyType == 2) {
            state.dataConfigJson.apiData.body = state.dataConfigJson.apiData.body ? JSON.parse(state.dataConfigJson.apiData.body) : [];
          }
          if (state.dataEchoJson.apiData.bodyType == 1 || state.dataEchoJson.apiData.bodyType == 2) {
            state.dataEchoJson.apiData.body = state.dataEchoJson.apiData.body ? JSON.parse(state.dataEchoJson.apiData.body) : [];
          }
          getTableList();
          changeLoading(false);
          updateSchema([{ field: 'isPostPosition', componentProps: { disabled: true } }]);
          if (state.dataForm.hasPage || state.dataForm.isPostPosition) state.hasPageDisabled = true;
        });
      } else {
        updateSchema([{ field: 'category', defaultValue: data.category }]);
        getTableList();
      }
      getVariateData();
    });
  }
  function getTableList() {
    state.treeLoading = true;
    const query = {
      linkId: state.dataConfigJson.sqlData.dbLinkId,
      keyword: state.keyword,
      pageSize: 1000000,
    };
    getDataModelListAll(query)
      .then(res => {
        state.treeLoading = false;
        state.treeData = res.data.list.map(o => ({
          ...o,
          fullName: o.tableName ? o.table + '(' + o.tableName + ')' : o.table,
          isLeaf: false,
          id: o.table,
          icon: o.type == 1 ? 'icon-ym icon-ym-view' : 'icon-ym icon-ym-generator-tableGrid',
        }));
      })
      .catch(() => {
        state.treeLoading = false;
        state.treeData = [];
      });
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    if (!state.dataConfigJson.staticData && state.dataForm.type == 2) return createMessage.error('请输入静态数据');
    changeOkLoading(true);
    if (state.dataConfigJson.apiData.bodyType == 1 || state.dataConfigJson.apiData.bodyType == 2) {
      state.dataConfigJson.apiData.body = JSON.stringify(state.dataConfigJson.apiData.body);
    }
    if (state.dataEchoJson.apiData.bodyType == 1 || state.dataEchoJson.apiData.bodyType == 2) {
      state.dataEchoJson.apiData.body = JSON.stringify(state.dataEchoJson.apiData.body);
    }
    const query = {
      ...state.dataForm,
      ...values,
      id: state.dataForm.id,
      dataConfigJson: JSON.stringify(state.dataConfigJson),
      dataCountJson: JSON.stringify(state.dataCountJson),
      dataEchoJson: JSON.stringify(state.dataEchoJson),
      dataJsJson: state.dataJsJson,
      dataExceptionJson: state.dataExceptionJson,
      fieldJson: JSON.stringify(state.fieldJson),
      parameterJson: JSON.stringify(state.parameterJson),
    };
    const formMethod = state.dataForm.id ? updateDataInterface : createDataInterface;
    formMethod(query)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        closePopup();
        emit('reload');
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
  function onTypeChange(val) {
    state.dataForm.type = val;
    state.dataForm.action = val === 1 ? 3 : null;
    setFieldsValue({ action: state.dataForm.action });
  }
  function onHasPageChange(val) {
    state.dataForm.hasPage = val;
    if (val) setFieldsValue({ isPostPosition: 0 });
    updateSchema([{ field: 'isPostPosition', componentProps: { disabled: !!val } }]);
  }
  function handlePrev() {
    state.activeStep -= 1;
    state.activeKey = 0;
  }
  async function handleNext() {
    const values = await validate();
    if (!values) return;
    if (state.dataForm.type === 1) {
      if (state.activeStep === 1 && !state.dataConfigJson.sqlData.sql) return createMessage.warning('请输入SQL查询语句');
      if (state.dataForm.hasPage) {
        if (state.activeStep === 2 && !state.dataCountJson.sqlData.sql) return createMessage.warning('请输入SQL语句');
        if (state.activeStep === 3 && !state.dataEchoJson.sqlData.sql) return createMessage.warning('请输入SQL语句');
      }
      handleNextFun();
    }
    if (state.dataForm.type === 3) {
      if (state.activeStep === 1 || (state.activeStep === 2 && state.dataForm.hasPage)) {
        try {
          const values_ = await formElRef.value?.validate();
          if (!values_) return;
          //处理参数名称必填验证
          handleValidate();
        } catch (_) {}
      } else {
        handleNextFun();
      }
    }
    if (state.dataForm.type === 2) handleNextFun();
  }
  function handleNextFun() {
    state.activeStep += 1;
    // SQL操作
    if (state.dataForm.type === 1) {
      getIsLastStep() && setDataJsJson();
      if (state.dataForm.hasPage) {
        const defaultDbLinkId = state.dataConfigJson.sqlData.dbLinkId;
        if ((state.dataCountJson.sqlData.dbLinkId != 0 || !state.dataCountJson.sqlData.dbLinkId) && state.activeStep === 2)
          state.dataCountJson.sqlData.dbLinkId = defaultDbLinkId;
        if ((state.dataEchoJson.sqlData.dbLinkId != 0 || !state.dataEchoJson.sqlData.dbLinkId) && state.activeStep === 3)
          state.dataEchoJson.sqlData.dbLinkId = defaultDbLinkId;
      }
    }
    // API操作
    if (state.dataForm.type === 3) {
      if (state.activeStep === 1 || (state.activeStep === 2 && state.dataForm.hasPage)) state.activeKey = 0;
      if (getIsLastStep()) setDataJsJson();
      if (state.activeStep === unref(getStepList).length - 2) setDataExceptionJson();
    }
  }
  function handleValidate() {
    const headerList = state.apiData.header || [];
    const queryList = state.apiData.query || [];
    for (let i = 0; i < headerList.length; i++) {
      if (!headerList[i].field) return createMessage.warning('参数名称不能为空');
    }
    for (let i = 0; i < queryList.length; i++) {
      if (!queryList[i].field) return createMessage.warning('参数名称不能为空');
    }
    if ((state.apiData.bodyType === 1 || state.apiData.bodyType === 2) && Array.isArray(state.apiData.body) && state.apiData.body?.length) {
      for (let i = 0; i < state.apiData.body.length; i++) {
        if (!state.apiData.body[i].field) return createMessage.warning('参数名称不能为空');
      }
    }
    handleNextFun();
  }
  function setDataJsJson() {
    if (!state.dataJsJson) state.dataJsJson = defaultDataJsJson;
  }
  function setDataExceptionJson() {
    if (!state.dataExceptionJson) state.dataExceptionJson = defaultDataExceptionJson;
  }
  function addHandle() {
    state.list.push({ field: '', defaultValue: '', dataType: 'varchar', source: state.dataForm.isPostPosition ? 3 : 1 });
  }
  function handleSysNodeClick(data) {
    (sqlEditorRef.value as any)?.insert(data);
  }
  function handleItemClick(item) {
    item.field && (sqlEditorRef.value as any)?.insert('{' + item.field + '}');
  }
  function getTree() {
    const tree = unref(leftTreeRef);
    if (!tree) {
      throw new Error('tree is null!');
    }
    return tree as any;
  }
  function onLoadData(node) {
    return new Promise((resolve: (value?: unknown) => void) => {
      getDataModelFieldList(state.dataConfigJson.sqlData.dbLinkId, node.dataRef.table).then(res => {
        const data = res.data.list.map(o => ({
          ...o,
          isLeaf: true,
          fullName: o.fieldName ? o.field + '(' + o.fieldName + ')' : o.field,
          id: node.dataRef.table + '-' + o.field,
        }));
        getTree().updateNodeByKey(node.eventKey, { children: data, isLeaf: !data.length });
        resolve();
      });
    });
  }
  function handleSelectTable() {
    nextTick(() => {
      getTableList();
    });
  }
  function handleTreeSelect(keys) {
    const selectedNode: any = getTree()?.getSelectedNode(keys[0]);
    const content = selectedNode.isLeaf ? selectedNode.field : selectedNode.table;
    (sqlEditorRef.value as any)?.insert(content);
  }
  function handleSelect(_id, node) {
    if (node.hasChildren || node.type !== 1) return;
    const val = node.field || node.fullName;
    const insertVal = node.parameter == 1 ? '{' + val + '}' : '{@' + val + '}';
    (sqlEditorRef.value as any)?.insert(insertVal);
  }
  function handleSearchTable() {
    treeData.value = [];
    getTableList();
  }
  function onMethodChange(val, key = 'sql') {
    if (key == 'sql') state.dataForm.action = val;
    state[key + 'action'] = val;
    let data = { action: val };
    if (val !== 3 && key == 'sql') {
      data['hasPage'] = 0;
      state.dataForm.hasPage = 0;
    }
    setFieldsValue(data);
  }
  function getVariateData() {
    getVariateSelector().then(res => (state.fieldTreeData = res.data));
  }
  function onIsPostPositionChange(val) {
    state.dataForm.isPostPosition = val;
    if (val) state.dataForm.hasPage = 0;
    state.hasPageDisabled = !!val;
  }
  function resetData() {
    state.keyword = '';
    state.dataForm = {
      fullName: '',
      enCode: '',
      category: '',
      type: 2,
      hasPage: 0,
      action: '1',
      sortCode: 0,
      enabledMark: 1,
      description: '',
    };
    state.fieldJson = [];
    state.parameterJson = [];
    state.fieldTreeData = [];
    state.dataConfigJson = JSON.parse(JSON.stringify(defaultJson));
    state.dataConfigJson.sqlData.dbLinkId = '0';
    state.dataCountJson = JSON.parse(JSON.stringify(defaultJson));
    state.dataEchoJson = JSON.parse(JSON.stringify(defaultJson));
    state.dataJsJson = JSON.parse(JSON.stringify(defaultDataJsJson));
    state.dataExceptionJson = JSON.parse(JSON.stringify(defaultDataExceptionJson));
  }
  function handleShowPageExplain() {
    openPageExplainModal(true);
  }
  function getShowSqlBox() {
    if (state.dataForm.type !== 1) return false;
    if (state.activeStep === 1) return true;
    if (state.dataForm.hasPage && (state.activeStep === 2 || state.activeStep === 3)) return true;
  }
  function getShowApiBox() {
    if (state.activeStep === 1 && state.dataForm.type === 3) return true;
    if (state.activeStep === 2 && state.dataForm.type === 3 && state.dataForm.hasPage) return true;
    return false;
  }
  function getShowTableBox() {
    if (state.activeKey === 0 || state.activeKey === 1) return true;
    if (state.activeKey === 2 && (state.apiData.bodyType === 1 || state.apiData.bodyType === 2)) return true;
    return false;
  }
  function getShowCodeBox() {
    if (getIsLastStep() && state.dataForm.type !== 2) return true;
    if (state.dataForm.type === 3) {
      if (state.activeStep === unref(getStepList).length - 1 && state.dataForm.isPostPosition == 1) return true;
      if (state.activeStep === unref(getStepList).length - 2 && state.dataForm.isPostPosition !== 1) return true;
    }
    return false;
  }
  function getIsLastStep() {
    return state.activeStep === unref(getStepList).length - 1 && !(state.dataForm.type === 3 && state.dataForm.isPostPosition == 1) ? true : false;
  }
  function onBodyTypeChange(val) {
    if (val == 1 || val == 2) state.apiData.body = [];
    else state.apiData.body = '';
  }
</script>
<style lang="less">
  .data-interface-popup {
    .scrollbar {
      padding: 0;
      height: 100%;

      .scrollbar__view {
        height: 100%;

        & > div {
          height: 100% !important;
        }
      }
    }

    .steps {
      overflow: auto;

      .ant-steps-item {
        width: 150px;
      }
    }

    .page-explain {
      cursor: pointer;
      float: right;
      color: @text-color-label;

      &:hover {
        color: @primary-color;
      }
    }

    .config {
      flex: 1;
      padding: 10px;
      display: flex;
      justify-content: space-between;
      overflow: hidden;

      .left-pane {
        flex-shrink: 0;
        width: 350px;
        margin-right: 10px;

        .box {
          margin-top: 8px;
          border-radius: 4px;
          height: calc(100% - 40px);
          border: 1px solid @border-color-base;
          overflow: hidden;

          .search-box {
            padding: 10px;
          }

          .tree-box {
            height: calc(100% - 52px);
            overflow: auto;
            overflow-x: hidden;
          }
        }
      }

      .middle-pane {
        border: 1px solid @border-color-base;
        border-radius: 4px;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .title {
          border-top: 1px solid @border-color-base;
        }

        .title-box {
          height: 36px;
          line-height: 36px;
          display: flex;
          justify-content: space-between;
          color: @text-color-label;
          font-size: 14px;
          padding: 0 10px;
          flex-shrink: 0;
          border-bottom: 1px solid @border-color-base;
        }

        .tabs-box {
          overflow: unset;

          :deep(.ant-tabs-tab:first-child) {
            margin-left: 20px;
          }
        }

        .table-actions {
          flex-shrink: 0;
          border-top: 1px dashed @border-color-base;
          text-align: center;
        }

        .top-box {
          display: flex;

          .main-box {
            flex: 1;
            margin-right: 18px;
          }
        }
      }

      .right-pane {
        width: 350px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        height: calc(100% + 9px);
        overflow: hidden;
        margin-left: 10px;

        .right-pane-btn {
          flex-shrink: 0;
        }
      }

      .static-right-pane {
        flex: unset;
        width: 350px;
        margin-left: 10px;
        margin-bottom: unset;
      }
    }

    .jsStaticData {
      flex: 1;
      display: flex;
      overflow: hidden;
      flex-direction: column;
      padding: 10px;
      height: 100%;

      .json-box {
        flex: 1;
      }

      .jsTips {
        flex-shrink: 0;
        padding: 8px 16px;
        background-color: @primary-1;
        border-radius: 4px;
        border-left: 5px solid @primary-color;
        margin-top: 10px;

        p {
          line-height: 24px;
          color: @text-color-help-dark;
        }
      }
    }

    .icon-ym-btn-edit {
      color: @primary-color;
      cursor: pointer;
      font-size: 16px;
    }

    .icon-ym-delete {
      color: @error-color;
      cursor: pointer;
      font-size: 16px;
    }

    .ant-select {
      width: 100% !important;
    }
  }
</style>
