<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-left">
      <BasicLeftTree
        title="接口分类"
        ref="leftTreeRef"
        :treeData="treeData"
        :loading="treeLoading"
        :showSearch="false"
        @reload="reloadTree"
        @select="handleTreeSelect"
        showToolbar />
    </div>
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable" :searchInfo="searchInfo" :tableSetting="tableSetting">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
            <jnpf-upload-btn url="/api/system/DataInterface/Actions/Import" accept=".bd" @on-success="reload"></jnpf-upload-btn>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'enabledMark'">
              <a-tag :color="record.enabledMark == 1 ? 'success' : 'error'">{{ record.enabledMark == 1 ? '启用' : '禁用' }}</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <Form @register="registerForm" @reload="reload" />
    <Variable @register="registerVariable" />
    <Preview @register="registerPreview" />
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref, onMounted, nextTick } from 'vue';
  import { BasicLeftTree, TreeItem, TreeActionType } from '/@/components/Tree';
  import { getDataInterfaceList, delDataInterface, exportData, copy } from '/@/api/systemData/dataInterface';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { usePopup } from '/@/components/Popup';
  import { useBaseStore } from '/@/store/modules/base';
  import { downloadByUrl } from '/@/utils/file/download';
  import Form from './Form.vue';
  import Preview from './Preview.vue';
  import Variable from './components/variable/index.vue';

  defineOptions({ name: 'systemData-dataInterface' });

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const [registerForm, { openPopup: openFormPopup }] = usePopup();
  const [registerPreview, { openPopup: openPreviewPopup }] = usePopup();
  const [registerVariable, { openPopup: openVariablePopup }] = usePopup();
  const columns: BasicColumn[] = [
    { title: '名称', dataIndex: 'fullName' },
    { title: '编码', dataIndex: 'enCode' },
    { title: '类型', dataIndex: 'type', width: 100 },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
    { title: '状态', dataIndex: 'enabledMark', width: 70, align: 'center' },
  ];
  const searchInfo = reactive({
    category: '',
  });
  const tableSetting = reactive({
    expand: false,
  });
  const leftTreeRef = ref<Nullable<TreeActionType>>(null);
  const treeLoading = ref(false);
  const treeData = ref<TreeItem[]>([]);
  const [registerTable, { reload, setLoading, getForm }] = useTable({
    api: getDataInterfaceList,
    columns,
    immediate: false,
    useSearchForm: true,
    formConfig: {
      schemas: [
        {
          field: 'keyword',
          label: t('common.keyword'),
          component: 'Input',
          componentProps: {
            placeholder: t('common.enterKeyword'),
            submitOnPressEnter: true,
          },
        },
        {
          field: 'type',
          label: '类型',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            options: [
              { fullName: '静态数据', id: 2 },
              { fullName: 'SQL操作', id: 1 },
              { fullName: 'API操作', id: 3 },
            ],
          },
        },
        {
          field: 'enabledMark',
          label: '状态',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            options: [
              { fullName: '启用', id: 1 },
              { fullName: '禁用', id: 0 },
            ],
          },
        },
      ],
    },
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
    },
  });

  function getTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.editText'),
        onClick: addOrUpdateHandle.bind(null, record.id),
      },
      {
        label: t('common.delText'),
        color: 'error',
        modelConfirm: {
          onOk: handleDelete.bind(null, record.id),
        },
      },
    ];
  }
  function getDropDownActions(record): ActionItem[] {
    return [
      {
        label: '预览',
        onClick: handlePreview.bind(null, record),
      },
      {
        label: '复制',
        modelConfirm: {
          content: '您确定要复制该数据接口, 是否继续?',
          onOk: handleCopy.bind(null, record.id),
        },
      },
      {
        label: '导出',
        modelConfirm: {
          content: '您确定要导出该数据接口, 是否继续?',
          onOk: handleExport.bind(null, record.id),
        },
      },
      {
        ifShow: !!record.isPostPosition,
        label: '变量',
        onClick: handleVariable.bind(null, record.id),
      },
    ];
  }
  async function initData(isInit = false) {
    treeLoading.value = true;
    if (isInit) setLoading(true);
    treeData.value = (await baseStore.getDictionaryData('DataInterfaceType')) as any[];
    nextTick(() => {
      if (isInit) searchInfo.category = unref(treeData)[0].id;
      const leftTree = unref(leftTreeRef);
      leftTree?.setSelectedKeys([searchInfo.category]);
      if (isInit) searchInfo.category && reload();
      treeLoading.value = false;
    });
  }
  function reloadTree() {
    treeData.value = [];
    initData();
  }
  function handleTreeSelect(id) {
    if (!id || searchInfo.category === id) return;
    searchInfo.category = id;
    getForm().resetFields();
  }
  function addOrUpdateHandle(id = '') {
    openFormPopup(true, { id, ...searchInfo });
  }
  function handleDelete(id) {
    delDataInterface(id).then(res => {
      createMessage.success(res.msg);
      baseStore.setDictionaryList();
      reload();
    });
  }
  function handlePreview(row) {
    const { id, enabledMark, tenantId, fullName } = row;
    if (enabledMark === 0) return createMessage.error('接口已被禁用，请先开启接口');
    openPreviewPopup(true, { id, tenantId, fullName });
  }
  function handleCopy(id) {
    copy(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleExport(id) {
    exportData(id).then(res => {
      downloadByUrl({ url: res.data.url });
    });
  }
  function handleVariable(id) {
    openVariablePopup(true, { id });
  }

  onMounted(() => {
    initData(true);
  });
</script>
