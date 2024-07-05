<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-search-box">
        <BasicForm
          class="search-form"
          @register="registerForm"
          :schemas="getSchemasForm"
          :labelWidth="activeKey == '1' ? 50 : 70"
          @submit="handleSubmit"
          @reset="handleReset" />
      </div>
      <div class="jnpf-content-wrapper-content bg-white">
        <a-tabs v-model:activeKey="activeKey" type="card" class="jnpf-content-wrapper-tabs" destroyInactiveTabPane>
          <a-tab-pane key="1" tab="登录日志">
            <BasicTable @register="registerLoginTable" :columns="loginTableColumns" :searchInfo="getSearchInfo">
              <template #tableTitle>
                <a-button type="error" preIcon="icon-ym icon-ym-btn-clearn" @click="handleDelete">{{ t('common.delText') }}</a-button>
                <a-button type="link" danger @click="handleDelAll">一键清空</a-button>
              </template>
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'loginType'">
                  <div class="login-type-box">
                    <span class="circle-box" :class="record.loginType == 0 ? 'circle-box-primary' : 'circle-box-error'" />
                    {{ record.loginType == 0 ? '登录' : '退出' }}
                  </div>
                </template>
                <template v-if="column.key === 'loginMark'">
                  <a-tag :color="record.loginMark == 1 ? 'success' : 'error'">{{ record.loginMark == 1 ? '成功' : '失败' }}</a-tag>
                </template>
              </template>
            </BasicTable>
          </a-tab-pane>
          <a-tab-pane key="5" tab="请求日志">
            <BasicTable @register="registerRequestTable" :columns="requestTableColumns" :searchInfo="getSearchInfo">
              <template #tableTitle>
                <a-button type="error" preIcon="icon-ym icon-ym-btn-clearn" @click="handleDelete">{{ t('common.delText') }}</a-button>
                <a-button type="link" danger @click="handleDelAll">一键清空</a-button>
              </template>
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <TableAction :actions="getTableActions(record)" />
                </template>
              </template>
            </BasicTable>
          </a-tab-pane>
          <a-tab-pane key="3" tab="操作日志">
            <BasicTable @register="registerOperationTable" :columns="operationTableColumns" :searchInfo="getSearchInfo">
              <template #tableTitle>
                <a-button type="error" preIcon="icon-ym icon-ym-btn-clearn" @click="handleDelete">{{ t('common.delText') }}</a-button>
                <a-button type="link" danger @click="handleDelAll">一键清空</a-button>
              </template>
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <TableAction :actions="getTableActions(record)" />
                </template>
              </template>
            </BasicTable>
          </a-tab-pane>
          <a-tab-pane key="4" tab="异常日志">
            <BasicTable @register="registerErrorTable" :columns="errorTableColumns" :searchInfo="getSearchInfo">
              <template #tableTitle>
                <a-button type="error" preIcon="icon-ym icon-ym-btn-clearn" @click="handleDelete">{{ t('common.delText') }}</a-button>
                <a-button type="link" danger @click="handleDelAll">一键清空</a-button>
              </template>
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <TableAction :actions="getTableActions(record)" />
                </template>
              </template>
            </BasicTable>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
    <Detail @register="registerDetailDetail" />
  </div>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, watch, onMounted, computed, nextTick } from 'vue';
  import { getLogList, delLog, batchDelLog } from '/@/api/system/log';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicTable, useTable, BasicColumn, TableAction, ActionItem } from '/@/components/Table';
  import { useDrawer } from '/@/components/Drawer';
  import Detail from './Detail.vue';
  import dayjs from 'dayjs';

  defineOptions({ name: 'system-log' });

  interface State {
    activeKey: string;
    searchInfo: any;
  }

  const { createMessage, createConfirm } = useMessage();
  const { t } = useI18n();
  const state = reactive<State>({
    activeKey: '1',
    searchInfo: {},
  });
  const { activeKey } = toRefs(state);
  const [registerForm] = useForm({
    baseColProps: { span: 6 },
    showActionButtonGroup: true,
    showAdvancedButton: true,
    compact: true,
    fieldMapToTime: [['pickerVal', ['startTime', 'endTime']]],
  });
  const loginTableColumns: BasicColumn[] = [
    { title: '类型', dataIndex: 'loginType', width: 100 },
    { title: '时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '用户', dataIndex: 'userName', width: 120 },
    { title: 'IP地址', dataIndex: 'ipAddress', width: 120 },
    { title: '地点', dataIndex: 'ipAddressName', width: 120 },
    { title: '浏览器', dataIndex: 'browser', width: 120 },
    { title: '操作系统', dataIndex: 'platForm', width: 120 },
    { title: '耗时(毫秒)', dataIndex: 'requestDuration', width: 90, align: 'center' },
    { title: '状态', dataIndex: 'loginMark', width: 70, align: 'center' },
    { title: '说明', dataIndex: 'abstracts', width: 200 },
  ];
  const requestTableColumns: BasicColumn[] = [
    { title: '请求时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '用户', dataIndex: 'userName', width: 120 },
    { title: 'IP地址', dataIndex: 'ipAddress', width: 120 },
    { title: '地点', dataIndex: 'ipAddressName', width: 120 },
    { title: '浏览器', dataIndex: 'browser', width: 120 },
    { title: '操作系统', dataIndex: 'platForm', width: 120 },
    { title: '请求方式', dataIndex: 'requestMethod', width: 80 },
    { title: '耗时(毫秒)', dataIndex: 'requestDuration', width: 90, align: 'center' },
    { title: '请求地址', dataIndex: 'requestUrl', width: 200 },
  ];
  const operationTableColumns: BasicColumn[] = [
    { title: '操作时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '用户', dataIndex: 'userName', width: 120 },
    { title: 'IP地址', dataIndex: 'ipAddress', width: 160 },
    { title: '地点', dataIndex: 'ipAddressName', width: 120 },
    { title: '浏览器', dataIndex: 'browser', width: 120 },
    { title: '操作系统', dataIndex: 'platForm', width: 120 },
    { title: '操作模块', dataIndex: 'moduleName', width: 80 },
    { title: '请求方式', dataIndex: 'requestMethod', width: 80 },
    { title: '耗时(毫秒)', dataIndex: 'requestDuration', width: 90, align: 'center' },
    { title: '请求地址', dataIndex: 'requestUrl', width: 200 },
  ];
  const errorTableColumns: BasicColumn[] = [
    { title: '操作时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '用户', dataIndex: 'userName', width: 120 },
    { title: 'IP地址', dataIndex: 'ipAddress', width: 160 },
    { title: '地点', dataIndex: 'ipAddressName', width: 120 },
    { title: '浏览器', dataIndex: 'browser', width: 120 },
    { title: '操作系统', dataIndex: 'platForm', width: 120 },
    { title: '请求方式', dataIndex: 'requestMethod', width: 80 },
    { title: '请求地址', dataIndex: 'requestUrl', width: 200 },
  ];
  const useTableAttrs: any = {
    api: getLogList,
    rowSelection: { type: 'checkbox' },
    immediate: false,
    clickToRowSelect: false,
    clearSelectOnPageChange: true,
  };
  const actionColumn = {
    width: 60,
    title: '操作',
    dataIndex: 'action',
  };
  const [registerLoginTable, { reload: reloadLoginTable, getSelectRows: getLoginSelectRows }] = useTable(useTableAttrs);
  const [registerRequestTable, { reload: reloadRequestTable, getSelectRows: getRequestSelectRows }] = useTable({ ...useTableAttrs, actionColumn });
  const [registerOperationTable, { reload: reloadOperationTable, getSelectRows: getOperationSelectRows }] = useTable({ ...useTableAttrs, actionColumn });
  const [registerErrorTable, { reload: reloadErrorTable, getSelectRows: getErrorSelectRows }] = useTable({ ...useTableAttrs, actionColumn });
  const [registerDetailDetail, { openDrawer }] = useDrawer();

  const getSearchInfo = computed(() => ({ category: state.activeKey, ...state.searchInfo }));
  const getSchemasForm = computed<any>(() => {
    const keyWord = {
      field: 'keyword',
      label: t('common.keyword'),
      component: 'Input',
      componentProps: {
        placeholder: t('common.enterKeyword'),
        submitOnPressEnter: true,
      },
    };
    const loginSearchForm = [
      {
        field: 'loginType',
        label: '类型',
        component: 'Select',
        componentProps: {
          placeholder: '请选择',
          options: [
            { fullName: '登录', id: 0 },
            { fullName: '退出', id: 1 },
          ],
        },
      },
      {
        field: 'loginMark',
        label: '状态',
        component: 'Select',
        componentProps: {
          placeholder: '请选择',
          options: [
            { fullName: '成功', id: 1 },
            { fullName: '失败', id: 0 },
          ],
        },
      },
      {
        field: 'pickerVal',
        label: '时间',
        component: 'DateRange',
        componentProps: {
          format: 'YYYY-MM-DD HH:mm:ss',
          showTime: { defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('23:59:59', 'HH:mm:ss')] },
          placeholder: ['开始时间', '结束时间'],
        },
      },
    ];
    const searchForm = [
      {
        field: 'requestMethod',
        label: '请求方式',
        component: 'Select',
        componentProps: {
          placeholder: '请选择',
          options: [
            { fullName: 'GET', id: 'GET' },
            { fullName: 'POST', id: 'POST' },
            { fullName: 'PUT', id: 'PUT' },
            { fullName: 'DELETE', id: 'DELETE' },
          ],
        },
      },
      {
        field: 'pickerVal',
        label: state.activeKey == '5' ? '请求时间' : '操作时间',
        component: 'DateRange',
        componentProps: {
          format: 'YYYY-MM-DD HH:mm:ss',
          showTime: { defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('23:59:59', 'HH:mm:ss')] },
          placeholder: ['开始时间', '结束时间'],
        },
      },
    ];
    return state.activeKey == '1' ? [keyWord, ...loginSearchForm] : [keyWord, ...searchForm];
  });

  watch(
    () => state.activeKey,
    () => {
      nextTick(() => reload());
    },
  );

  function handleSubmit(data) {
    let obj = {};
    for (let [key, value] of Object.entries(data)) {
      if (value || value == 0) {
        if (Array.isArray(value)) {
          if (value.length) obj[key] = value;
        } else {
          obj[key] = value;
        }
      }
    }
    state.searchInfo = obj;
    handleSearch();
  }
  function handleReset() {
    state.searchInfo = {};
    handleSearch();
  }
  function handleSearch() {
    nextTick(() => {
      reload();
    });
  }
  function handleDelete() {
    const list: any[] = getSelectData() || [];
    if (!list.length) return createMessage.error('请选择一条数据');
    const query = {
      ids: list.map(item => item.id),
    };
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '您确定要删除这些数据吗, 是否继续?',
      onOk: () => {
        delLog(query).then(res => {
          createMessage.success(res.msg);
          reload();
        });
      },
    });
  }
  function handleDelAll() {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '此操作会将所有日志删除，是否继续?',
      onOk: () => {
        batchDelLog(state.activeKey).then(res => {
          createMessage.success(res.msg);
          reload();
        });
      },
    });
  }
  function reload() {
    if (state.activeKey === '1') reloadLoginTable({ page: 1 });
    if (state.activeKey === '5') reloadRequestTable({ page: 1 });
    if (state.activeKey === '3') reloadOperationTable({ page: 1 });
    if (state.activeKey === '4') reloadErrorTable({ page: 1 });
  }
  function getSelectData() {
    if (state.activeKey === '1') return getLoginSelectRows();
    if (state.activeKey === '5') return getRequestSelectRows();
    if (state.activeKey === '3') return getOperationSelectRows();
    if (state.activeKey === '4') return getErrorSelectRows();
  }
  function getTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.detailText'),
        onClick: toDetail.bind(null, record.id),
      },
    ];
  }
  function toDetail(id) {
    openDrawer(true, { id, activeKey: state.activeKey });
  }

  onMounted(() => {
    reload();
  });
</script>
