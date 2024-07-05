<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="title" class="full-popup" destroy-on-close>
    <div class="jnpf-content-wrapper-search-box ml-10px mt-10px">
      <BasicForm class="search-form" @register="registerSearchForm" @submit="handleSubmit" @reset="handleReset" />
    </div>
    <a-tabs v-model:activeKey="listQuery.platform" type="card" class="jnpf-content-table-tabs" destroyInactiveTabPane>
      <a-tab-pane key="Web" tab="Web门户">
        <BasicTable @register="registerWebTable" :columns="menuTableColumns" :searchInfo="getSearchInfo">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">添加</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'icon'">
              <i :class="record.icon + ' table-icon'" />
            </template>
            <template v-if="column.key === 'enabledMark'">
              <a-tag :color="record.enabledMark == 1 ? 'success' : 'error'">{{ record.enabledMark == 1 ? '启用' : '禁用' }}</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
            </template>
          </template>
        </BasicTable>
      </a-tab-pane>
      <a-tab-pane key="App" tab="App门户">
        <BasicTable @register="registerAppTable" :columns="menuTableColumns" :searchInfo="getSearchInfo">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">添加</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'icon'">
              <i :class="record.icon + ' table-icon'" />
            </template>
            <template v-if="column.key === 'enabledMark'">
              <a-tag :color="record.enabledMark == 1 ? 'success' : 'error'">{{ record.enabledMark == 1 ? '启用' : '禁用' }}</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
            </template>
          </template>
        </BasicTable>
      </a-tab-pane>
    </a-tabs>
    <Form @register="registerForm" @reload="reloadTable" />
    <TransferModal @register="registerTransfer" :multiple="true" @change="reloadTable" />
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { computed, reactive, toRefs, nextTick, watch } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { getPortalManageList, delPortalManage } from '/@/api/onlineDev/portal';
  import { useModal } from '/@/components/Modal';
  import { useBaseStore } from '/@/store/modules/base';
  import TransferModal from './TransferModal.vue';
  import Form from './Form.vue';

  interface State {
    listQuery: any;
    systemId: string;
    title: string;
    parentId: string;
    categoryList: any[];
  }

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const state = reactive<State>({
    listQuery: {
      platform: 'Web',
      category: '',
      enabledMark: '',
      keyword: '',
    },
    systemId: '',
    title: '',
    parentId: '',
    categoryList: [],
  });
  const { listQuery, title } = toRefs(state);
  const baseStore = useBaseStore();

  const getSearchInfo = computed(() => ({
    keyword: state.listQuery.keyword,
    category: state.listQuery.category,
    enabledMark: state.listQuery.enabledMark,
    platform: state.listQuery.platform,
    systemId: state.systemId,
  }));

  const menuTableColumns: BasicColumn[] = [
    { title: '门户名称', dataIndex: 'fullName', width: 200 },
    { title: '分类', dataIndex: 'categoryName', width: 150 },
    { title: '说明', dataIndex: 'description', width: 200 },
    { title: '创建人', dataIndex: 'creatorUser', width: 120 },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '最后修改时间', dataIndex: 'lastModifyTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
    { title: '状态', dataIndex: 'enabledMark', width: 70, align: 'center' },
  ];

  const [registerPopup] = usePopupInner(init);
  const [registerSearchForm, { updateSchema }] = useForm({
    baseColProps: { span: 6 },
    showActionButtonGroup: true,
    showAdvancedButton: true,
    compact: true,
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
        field: 'category',
        label: '分类',
        component: 'Select',
        labelWidth: 40,
        componentProps: { placeholder: '请选择' },
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
  });
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerTransfer, { openModal: openTransferModal }] = useModal();
  const [registerWebTable, { reload: reloadWebTable }] = useTable({
    api: getPortalManageList,
    immediate: false,
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
    },
  });
  const [registerAppTable, { reload: reloadAppTable }] = useTable({
    api: getPortalManageList,
    immediate: false,
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
    },
  });

  watch(
    () => state.listQuery.platform,
    () => {
      nextTick(() => reloadTable());
    },
    { deep: true },
  );

  async function init(data) {
    state.systemId = data.id;
    state.title = data.title + '的门户管理';
    state.listQuery.platform = 'Web';
    state.categoryList = (await baseStore.getDictionaryData('portalDesigner')) as any[];
    updateSchema([{ field: 'category', componentProps: { options: state.categoryList || [] } }]);
    nextTick(() => reloadWebTable({ page: 1 }));
  }
  function getTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.editText'),
        onClick: addOrUpdateHandle.bind(null, record.id),
      },
      {
        label: t('common.delText'),
        color: 'error',
        disabled: record.isMain == 1,
        modelConfirm: {
          onOk: handleDelete.bind(null, record.id),
        },
      },
    ];
  }
  function getDropDownActions(record): ActionItem[] {
    return [
      {
        label: '授权',
        onClick: handleAuthorize.bind(null, record),
      },
    ];
  }
  function handleSubmit(values) {
    state.listQuery.keyword = values?.keyword || '';
    state.listQuery.category = values?.category || '';
    state.listQuery.enabledMark = values?.enabledMark;
    handleSearch();
  }
  function handleReset() {
    state.listQuery.keyword = '';
    state.listQuery.category = '';
    state.listQuery.enabledMark = '';
    handleSearch();
  }
  function handleSearch() {
    nextTick(() => reloadTable());
  }
  function addOrUpdateHandle(id?) {
    openFormModal(true, { id, categoryList: state.categoryList, systemId: state.systemId, platform: state.listQuery.platform });
  }
  function handleDelete(id) {
    delPortalManage(id).then(res => {
      createMessage.success(res.msg);
      reloadTable();
    });
  }
  function handleAuthorize(record) {
    openTransferModal(true, { id: record.id, systemId: state.systemId });
  }
  function reloadTable() {
    state.listQuery.platform == 'Web' ? reloadWebTable({ page: 1 }) : reloadAppTable({ page: 1 });
  }
</script>
