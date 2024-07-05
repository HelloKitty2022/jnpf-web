<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" :title="title" :width="700" class="full-drawer">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
        <a-button type="link" preIcon="ym-custom ym-custom-content-copy" @click="handleBatchAdd">批量新增</a-button>
        <a-button type="link" preIcon="icon-ym icon-ym-dbLink" v-if="type == '2'" @click="handleDataConnect">数据连接</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'enabledMark'">
          <a-tag :color="record.enabledMark == 1 ? 'success' : 'error'">{{ record.enabledMark == 1 ? '启用' : '禁用' }}</a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <TableAction :actions="getTableActions(record)" />
        </template>
      </template>
    </BasicTable>
  </BasicDrawer>
  <Form @register="registerForm" @reload="reload" />
  <BatchForm @register="registerBatchForm" @reload="reload" />
  <ConnectForm @register="registerConnectForm" @reload="initConnectData" />
</template>
<script lang="ts" setup>
  import { getFormAuthorizeList, del } from '/@/api/system/formAuthorize';
  import { getDataSourceSelector } from '/@/api/systemData/dataSource';
  import { getInfo } from '/@/api/system/authorize';
  import { reactive, toRefs, nextTick } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import Form from './Form.vue';
  import BatchForm from './BatchForm.vue';
  import ConnectForm from '../connectForm/Form.vue';

  interface State {
    id: string;
    title: string;
    type: string;
    dbOptions: any[];
    dataList: any;
    tableName: string;
  }

  const state = reactive<State>({
    id: '',
    title: '',
    type: '',
    dbOptions: [],
    dataList: {},
    tableName: '',
  });
  const { title, type } = toRefs(state);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerDrawer, {}] = useDrawerInner(init);
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerBatchForm, { openModal: openBatchFormModal }] = useModal();
  const [registerConnectForm, { openModal: openConnectFormModal }] = useModal();
  const columns: BasicColumn[] = [
    { title: '数据库表', dataIndex: 'bindTable', width: 120 },
    { title: '字段名称', dataIndex: 'enCode', width: 160 },
    { title: '字段说明', dataIndex: 'fullName' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
    { title: '状态', dataIndex: 'enabledMark', width: 70, align: 'center' },
  ];
  const searchInfo = reactive({
    id: '',
  });
  const [registerTable, { reload }] = useTable({
    api: getFormAuthorizeList,
    searchInfo,
    columns,
    pagination: false,
    immediate: false,
    showIndexColumn: false,
    actionColumn: {
      width: 100,
      title: '操作',
      dataIndex: 'action',
    },
  });

  function init(data) {
    state.id = data.id;
    state.title = `表单权限 - ${data.fullName}`;
    searchInfo.id = data.id;
    state.type = data.type;
    nextTick(() => {
      reload();
      if (state.type == '2') {
        getDataSource();
        getInfoData();
      }
    });
  }
  function getDataSource() {
    getDataSourceSelector().then(res => {
      let list = res.data.list || [];
      list = list.filter(o => o.children && o.children.length);
      if (list[0] && list[0].children && list[0].children.length) list[0] = list[0].children[0];
      delete list[0].children;
      state.dbOptions = list;
    });
  }
  function getInfoData() {
    getInfo(state.id, 2).then(res => {
      state.dataList = res.data || {};
      state.tableName = state.dataList.linkTables || '';
    });
  }
  function initConnectData(tableName) {
    state.tableName = tableName || '';
    getInfoData();
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
  function handleDelete(id) {
    del(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { moduleId: state.id, id, type: state.type, dataType: 2 });
  }
  function handleBatchAdd() {
    openBatchFormModal(true, { moduleId: state.id });
  }
  function handleDataConnect() {
    openConnectFormModal(true, { moduleId: state.id, dataList: state.dataList, dbOptions: state.dbOptions, dataType: 2 });
  }
</script>
