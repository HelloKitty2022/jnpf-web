<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" :title="title" :width="700" class="full-drawer">
    <a-tabs v-model:activeKey="activeKey" @change="onTabsChange" type="card" class="jnpf-content-table-tabs" destroyInactiveTabPane>
      <a-tab-pane :key="1" tab="方案管理">
        <BasicTable @register="registerSchemeTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
            <a-dropdown>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="handleAdd">全部数据</a-menu-item>
                </a-menu>
              </template>
              <a-button type="link" :loading="loading" preIcon="icon-ym icon-ym-btn-add">常用方案<DownOutlined /></a-button>
            </a-dropdown>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" />
            </template>
          </template>
        </BasicTable>
      </a-tab-pane>
      <a-tab-pane :key="2" tab="字段管理">
        <BasicTable @register="registerFieldTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
            <a-button type="link" preIcon="icon-ym icon-ym-dbLink" v-if="type == '2'" @click="handleDataConnect">数据连接</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" />
            </template>
          </template>
        </BasicTable>
      </a-tab-pane>
    </a-tabs>
  </BasicDrawer>
  <SchemeForm @register="registerSchemeForm" @reload="onTabsChange" />
  <FieldForm @register="registerFieldForm" @reload="onTabsChange" />
  <ConnectForm @register="registerConnectForm" @reload="initConnectData" />
</template>
<script lang="ts" setup>
  import { getDataAuthorizeSchemeList, getDataAuthorizeList, delScheme, delField, createScheme } from '/@/api/system/dataAuthorize';
  import { getDataSourceSelector } from '/@/api/systemData/dataSource';
  import { getInfo } from '/@/api/system/authorize';
  import { reactive, toRefs, nextTick } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SchemeForm from './SchemeForm.vue';
  import FieldForm from './FieldForm.vue';
  import ConnectForm from '../connectForm/Form.vue';
  import { DownOutlined } from '@ant-design/icons-vue';

  interface State {
    title: string;
    type: string;
    activeKey: number;
    dataList: any;
    tableName: string;
    loading: boolean;
    dbOptions: any[];
  }

  const state = reactive<State>({
    title: '',
    type: '',
    activeKey: 1,
    dataList: {},
    tableName: '',
    loading: false,
    dbOptions: [],
  });
  const { title, activeKey, type, loading } = toRefs(state);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerDrawer] = useDrawerInner(init);
  const [registerSchemeForm, { openModal: openSchemeFormModal }] = useModal();
  const [registerFieldForm, { openModal: openFieldFormModal }] = useModal();
  const [registerConnectForm, { openModal: openConnectFormModal }] = useModal();
  const schemeColumns: BasicColumn[] = [
    { title: '方案编码', dataIndex: 'enCode', width: 160 },
    { title: '方案名称', dataIndex: 'fullName', width: 160 },
    { title: '过滤条件', dataIndex: 'conditionText' },
  ];
  const fieldColumns: BasicColumn[] = [
    { title: '数据库表', dataIndex: 'bindTable', width: 100 },
    { title: '字段名称', dataIndex: 'enCode', width: 100 },
    { title: '字段说明', dataIndex: 'fullName', width: 80 },
    { title: '字段类型', dataIndex: 'type', width: 80 },
    { title: '条件符号', dataIndex: 'conditionSymbolName', width: 80 },
    { title: '条件内容', dataIndex: 'conditionName', width: 100 },
  ];
  const searchInfo = reactive({
    moduleId: '',
  });
  const [registerSchemeTable, { reload: reloadScheme }] = useTable({
    api: getDataAuthorizeSchemeList,
    searchInfo,
    columns: schemeColumns,
    pagination: false,
    immediate: false,
    actionColumn: {
      width: 100,
      title: '操作',
      dataIndex: 'action',
    },
  });
  const [registerFieldTable, { reload: reloadField }] = useTable({
    api: getDataAuthorizeList,
    searchInfo,
    columns: fieldColumns,
    pagination: false,
    immediate: false,
    actionColumn: {
      width: 100,
      title: '操作',
      dataIndex: 'action',
    },
  });

  function init(data) {
    state.activeKey = 1;
    state.title = `数据权限 - ${data.fullName}`;
    searchInfo.moduleId = data.id;
    state.type = data.type;
    nextTick(() => {
      reloadScheme();
      if (state.type == '2') {
        getDataSource();
        getInfoData();
      }
    });
  }
  function onTabsChange() {
    nextTick(() => {
      if (state.activeKey === 1) reloadScheme();
      if (state.activeKey === 2) reloadField();
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
    getInfo(searchInfo.moduleId, 3).then(res => {
      state.dataList = res.data || {};
      state.tableName = state.dataList.linkTables || '';
    });
  }
  function initConnectData(tableName) {
    state.tableName = tableName || '';
    getInfoData();
  }
  function handleAdd() {
    let data = {
      moduleId: searchInfo.moduleId,
      enCode: 'jnpf_alldata',
      fullName: '全部数据',
      allData: 1,
    };
    state.loading = true;
    createScheme(data)
      .then(res => {
        createMessage.success(res.msg);
        state.loading = false;
        onTabsChange();
      })
      .catch(() => {
        state.loading = false;
      });
  }
  function getTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.editText'),
        disabled: record.enCode === 'jnpf_alldata' && state.activeKey == 1,
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
    const formMethod = state.activeKey == 1 ? delScheme : delField;
    formMethod(id).then(res => {
      createMessage.success(res.msg);
      onTabsChange();
    });
  }
  function addOrUpdateHandle(id = '') {
    if (state.activeKey == 1) {
      openSchemeFormModal(true, { moduleId: searchInfo.moduleId, id, type: state.type, dataType: 3 });
    } else {
      openFieldFormModal(true, { moduleId: searchInfo.moduleId, id, type: state.type, dataType: 3 });
    }
  }
  function handleDataConnect() {
    openConnectFormModal(true, { moduleId: searchInfo.moduleId, dataList: state.dataList, dbOptions: state.dbOptions, dataType: 3 });
  }
</script>
