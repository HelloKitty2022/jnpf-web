<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-search-box">
        <BasicForm class="search-form" @register="registerSearchForm" @submit="handleSubmit" @reset="handleReset"></BasicForm>
      </div>
      <div class="jnpf-content-wrapper-content bg-white">
        <a-tabs v-model:activeKey="activeKey" type="card" class="jnpf-content-wrapper-tabs" destroyInactiveTabPane @tabClick="onTabClick">
          <a-tab-pane key="0" tab="委托发起">
            <BasicTable @register="registerLaunchTable" :searchInfo="getSearchInfo">
              <template #tableTitle>
                <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="openAddModal()">发起委托</a-button>
              </template>
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag color="processing" v-if="record.status == 1">等待审核</a-tag>
                  <a-tag color="success" v-else-if="record.status == 2">审核通过</a-tag>
                  <a-tag color="error" v-else-if="record.status == 3">审核退回</a-tag>
                  <a-tag v-else-if="record.status == 4 || record.status == 7">流程撤回</a-tag>
                  <a-tag v-else-if="record.status == 5">审核终止</a-tag>
                  <a-tag color="error" v-else-if="record.status == 6">已被挂起</a-tag>
                  <a-tag color="warning" v-else>等待提交</a-tag>
                </template>
                <template v-if="column.key === 'completion'">
                  <p v-if="record.status == 5 || record.completion == 0">----</p>
                  <p v-else-if="record.completion == 100">已完成</p>
                  <a-progress :percent="record.completion" size="small" v-else></a-progress>
                </template>
                <template v-if="column.key === 'action'">
                  <TableAction :actions="getLaunchTableActions(record)" />
                </template>
              </template>
            </BasicTable>
          </a-tab-pane>
          <a-tab-pane key="1" tab="委托设置">
            <BasicTable
              @register="registerDelegateTable"
              :columns="delegateTableColumns1"
              :searchInfo="getSearchInfo"
              :actionColumn="{ width: 150, title: '操作', dataIndex: 'action' }">
              <template #tableTitle>
                <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
              </template>
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag v-if="record.status == 1">未开始</a-tag>
                  <a-tag color="error" v-else-if="record.status == 2">已失效</a-tag>
                  <a-tag color="processing" v-else>委托中</a-tag>
                </template>
                <template v-if="column.key === 'action'">
                  <TableAction :actions="getDelegateTableActions(record)" :dropDownActions="getDelegateTableDropDownActions(record)" />
                </template>
              </template>
            </BasicTable>
          </a-tab-pane>
          <a-tab-pane key="2" tab="委托给我的">
            <BasicTable @register="registerDelegateTable1" :columns="delegateTableColumns" :searchInfo="getSearchInfo">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag v-if="record.status == 1">未开始</a-tag>
                  <a-tag color="error" v-else-if="record.status == 2">已失效</a-tag>
                  <a-tag color="processing" v-else>委托中</a-tag>
                </template>
              </template>
            </BasicTable>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
    <FlowParser @register="registerFlowParser" @reload="reloadLaunchTable" />
    <FlowPopup @register="registerFlowPopup" @select="onSelect" />
    <AddModal @register="registerAdd" @select="handleAdd" />
    <Form @register="registerForm" @reload="reloadDelegateTable" />
  </div>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, onMounted, computed, nextTick } from 'vue';
  import { getFlowLaunchList, delFlowLaunch } from '/@/api/workFlow/flowLaunch';
  import { getFlowDelegateList, delFlowDelegate, stop } from '/@/api/workFlow/flowDelegate';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useDefineSetting } from '/@/hooks/setting/useDefineSetting';
  import { usePopup } from '/@/components/Popup';
  import { useModal } from '/@/components/Modal';
  import FlowParser from '/@/views/workFlow/components/FlowParser.vue';
  import FlowPopup from '../flowLaunch/FlowPopup.vue';
  import AddModal from './AddModal.vue';
  import Form from './Form.vue';
  import { useRoute } from 'vue-router';

  interface State {
    activeKey: string;
    keyword: string;
  }

  defineOptions({ name: 'workFlow-entrust' });

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const { getUrgentText } = useDefineSetting();
  const [registerFlowPopup, { openPopup: openFlowPopup }] = usePopup();
  const [registerFlowParser, { openPopup: openFlowParser }] = usePopup();
  const [registerAdd, { openModal: openAddModal }] = useModal();
  const [registerForm, { openModal: openFormModal }] = useModal();
  const state = reactive<State>({
    activeKey: '0',
    keyword: '',
  });
  const { activeKey } = toRefs(state);

  const getSearchInfo = computed(() => ({ keyword: state.keyword, myOrDelagateToMe: state.activeKey, delegateType: true }));

  const [registerSearchForm, { resetFields }] = useForm({
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
    ],
  });
  const launchTableColumns: BasicColumn[] = [
    { title: '流程标题', dataIndex: 'fullName', width: 200 },
    { title: '所属流程', dataIndex: 'flowName', width: 150 },
    { title: '发起时间', dataIndex: 'startTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '审批节点', dataIndex: 'thisStep', width: 150 },
    { title: '紧急程度', dataIndex: 'flowUrgent', width: 100, align: 'center' },
    { title: '流程状态', dataIndex: 'status', width: 120, align: 'center' },
    { title: '流程进度', dataIndex: 'completion', width: 150 },
  ];
  const delegateTableColumns: BasicColumn[] = [
    { title: '委托人', dataIndex: 'userName', width: 120 },
    { title: '受委托人', dataIndex: 'toUserName', width: 120 },
    { title: '委托类型', dataIndex: 'type', width: 120 },
    { title: '委托流程', dataIndex: 'flowName', width: 250 },
    { title: '开始时间', dataIndex: 'startTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '结束时间', dataIndex: 'endTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '状态', dataIndex: 'status', width: 120, align: 'center' },
    { title: '委托说明', dataIndex: 'description' },
  ];
  const delegateTableColumns1 = delegateTableColumns.filter(o => o.dataIndex !== 'userName');
  const [registerLaunchTable, { reload: reloadLaunchTable }] = useTable({
    api: getFlowLaunchList,
    columns: launchTableColumns,
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
    },
    afterFetch: data => {
      const list = data.map(o => {
        o.flowUrgent = getUrgentText(o.flowUrgent);
        return o;
      });
      return list;
    },
    immediate: false,
  });
  const [registerDelegateTable, { reload: reloadDelegateTable }] = useTable({
    api: getFlowDelegateList,
    afterFetch: data => {
      const currTime = +new Date();
      const list = data.map(o => {
        // 0-委托中 1-未开始 2-已失效
        let status = 0;
        if (o.startTime > currTime) {
          status = 1;
        } else if (o.endTime <= currTime) {
          status = 2;
        }
        o.status = status;
        o.type = o.type == '1' ? '审批委托' : '发起委托';
        return o;
      });
      return list;
    },
    immediate: false,
  });
  const [registerDelegateTable1, { reload: reloadDelegateTable1 }] = useTable({
    api: getFlowDelegateList,
    afterFetch: data => {
      const currTime = +new Date();
      const list = data.map(o => {
        // 0-委托中 1-未开始 2-已失效
        let status = 0;
        if (o.startTime > currTime) {
          status = 1;
        } else if (o.endTime <= currTime) {
          status = 2;
        }
        o.status = status;
        o.type = o.type == '1' ? '审批委托' : '发起委托';
        return o;
      });
      return list;
    },
    immediate: false,
  });

  function getLaunchTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.editText'),
        disabled: [1, 2, 4, 5].includes(record.status),
        onClick: toDetail.bind(null, record, '-1'),
      },
      {
        label: t('common.delText'),
        color: 'error',
        disabled: [1, 2, 3, 5].includes(record.status),
        modelConfirm: {
          onOk: handleFlowDelete.bind(null, record.id),
        },
      },
      {
        label: t('common.detailText'),
        disabled: !record.status,
        onClick: toDetail.bind(null, record, 0),
      },
    ];
  }
  function getDelegateTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.editText'),
        disabled: record.status == 2,
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
  function getDelegateTableDropDownActions(record): ActionItem[] {
    if (record.status == 2) return [];
    return [
      {
        label: '结束委托',
        modelConfirm: {
          title: '结束委托',
          content: '结束后，流程不再进行委托！',
          onOk: handleStop.bind(null, record.id),
        },
      },
    ];
  }
  function onTabClick() {
    nextTick(() => resetFields());
  }
  function handleSubmit(values) {
    state.keyword = values?.keyword || '';
    handleSearch();
  }
  function handleReset() {
    state.keyword = '';
    handleSearch();
  }
  function handleSearch() {
    const method = state.activeKey === '0' ? reloadLaunchTable : state.activeKey === '1' ? reloadDelegateTable : reloadDelegateTable1;
    nextTick(() => {
      method({ page: 1 });
    });
  }
  function handleFlowDelete(id) {
    delFlowLaunch(id).then(res => {
      createMessage.success(res.msg);
      reloadLaunchTable();
    });
  }
  // 新增委托
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id });
  }
  // 删除委托
  function handleDelete(id) {
    delFlowDelegate(id).then(res => {
      createMessage.success(res.msg);
      reloadDelegateTable();
    });
  }
  function handleStop(id) {
    stop(id).then(res => {
      createMessage.success(res.msg);
      reloadDelegateTable();
    });
  }
  function toDetail(record, opType) {
    const data = {
      id: record.id,
      flowId: record.flowId,
      opType,
      parentId: record.parentId,
    };
    openFlowParser(true, data);
  }
  function handleAdd(flowType) {
    openFlowPopup(true, { flowType, isEntrust: true });
  }
  function onSelect(record) {
    const data = {
      id: '',
      flowId: record.id,
      opType: '-1',
      delegateUserList: record.delegateUserList,
    };
    openFlowParser(true, data);
  }

  onMounted(() => {
    const route = useRoute();
    if (route.query.config) {
      state.activeKey = route.query.config == '1' ? '1' : '2';
      nextTick(() => {
        state.activeKey == '1' ? reloadDelegateTable({ page: 1 }) : reloadDelegateTable1({ page: 1 });
      });
    } else {
      reloadLaunchTable({ page: 1 });
    }
  });
</script>
