<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="handleAdd()">{{ t('common.addText') }}</a-button>
          </template>
          <template #expandedRowRender="{ record }">
            <a-tabs size="small" v-loading="record.childTableLoading">
              <a-tab-pane key="1" tab="订单商品">
                <BasicTable @register="registerGoodsTable" :data-source="record.goodsList">
                  <template #summary v-if="record.goodsList && record.goodsList.length">
                    <a-table-summary>
                      <a-table-summary-row>
                        <a-table-summary-cell :index="0">合计</a-table-summary-cell>
                        <a-table-summary-cell v-for="(item, index) in getGoodsColumnSum(record.goodsList)" :key="index" :index="index + 1">
                          {{ item }}
                        </a-table-summary-cell>
                      </a-table-summary-row>
                    </a-table-summary>
                  </template>
                </BasicTable>
              </a-tab-pane>
              <a-tab-pane key="2" tab="收款计划">
                <BasicTable @register="registerPlanTable" :data-source="record.planList">
                  <template #summary v-if="record.planList && record.planList.length">
                    <a-table-summary>
                      <a-table-summary-row>
                        <a-table-summary-cell :index="0">合计</a-table-summary-cell>
                        <a-table-summary-cell v-for="(item, index) in getPlanColumnSum(record.planList)" :key="index" :index="index + 1">
                          {{ item }}
                        </a-table-summary-cell>
                      </a-table-summary-row>
                    </a-table-summary>
                  </template>
                </BasicTable>
              </a-tab-pane>
            </a-tabs>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'currentState'">
              <a-tag color="processing" v-if="record.currentState == 1">等待审核</a-tag>
              <a-tag color="success" v-else-if="record.currentState == 2">审核通过</a-tag>
              <a-tag color="error" v-else-if="record.currentState == 3">审核退回</a-tag>
              <a-tag v-else-if="record.currentState == 4 || record.currentState == 7">流程撤回</a-tag>
              <a-tag v-else-if="record.currentState == 5">审核终止</a-tag>
              <a-tag color="error" v-else-if="record.currentState == 6">已被挂起</a-tag>
              <a-tag color="warning" v-else>等待提交</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <FlowParser @register="registerFlowParser" @reload="reload" />
    <SelectFlowModal @register="registerSelectFlowModal" @change="selectFlow" />
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref, unref } from 'vue';
  import { getOrderList, delOrder, getOrderEntryList, getOrderPlanList } from '/@/api/extend/order';
  import { getFlowIdByCode, getFlowList } from '/@/api/workFlow/flowEngine';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { usePopup } from '/@/components/Popup';
  import { useModal } from '/@/components/Modal';
  import FlowParser from '/@/views/workFlow/components/FlowParser.vue';
  import { SelectFlowModal } from '/@/components/CommonModal';
  import dayjs from 'dayjs';

  defineOptions({ name: 'extend-order' });

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerFlowParser, { openPopup: openFlowParser }] = usePopup();
  const [registerSelectFlowModal, { openModal: openSelectFlowModal }] = useModal();
  const flowTemplateId = ref('');
  const flowList = ref<any[]>([]);
  const columns: BasicColumn[] = [
    { title: '订单编码', dataIndex: 'orderCode', width: 150, sorter: true },
    { title: '订单日期', dataIndex: 'orderDate', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss', sorter: true },
    { title: '客户名称', dataIndex: 'customerName', width: 200, sorter: true },
    { title: '业务人员', dataIndex: 'salesmanName', width: 120, sorter: true },
    { title: '付款金额', dataIndex: 'receivableMoney', width: 100, sorter: true },
    { title: '制单人员', dataIndex: 'creatorUser', width: 120 },
    { title: '订单备注', dataIndex: 'description' },
    { title: '状态', dataIndex: 'currentState', width: 120, align: 'center', sorter: true },
  ];
  const goodsColumns: BasicColumn[] = [
    { title: '商品名称', dataIndex: 'goodsName' },
    { title: '规格型号', dataIndex: 'specifications', width: 80 },
    { title: '单位', dataIndex: 'unit', width: 80 },
    { title: '数量', dataIndex: 'qty', width: 80 },
    { title: '单价', dataIndex: 'price', width: 80 },
    { title: '金额', dataIndex: 'amount', width: 80 },
    { title: '折扣%', dataIndex: 'discount', width: 80 },
    { title: '税率%', dataIndex: 'cess', width: 80 },
    { title: '实际单价', dataIndex: 'actualPrice', width: 80 },
    { title: '实际金额', dataIndex: 'actualAmount', width: 80 },
  ];
  const planColumns: BasicColumn[] = [
    { title: '收款日期', dataIndex: 'receivableDate', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '收款比率%', dataIndex: 'receivableRate', width: 100 },
    { title: '收款金额', dataIndex: 'receivableMoney', width: 100 },
    { title: '收款方式', dataIndex: 'receivableMode', width: 100 },
    { title: '收款摘要', dataIndex: 'abstract' },
  ];
  const [registerTable, { reload }] = useTable({
    api: getOrderList,
    columns,
    useSearchForm: true,
    formConfig: {
      schemas: [
        {
          field: 'keyword',
          label: t('common.keyword'),
          component: 'Input',
          componentProps: { placeholder: t('common.enterKeyword'), submitOnPressEnter: true },
        },
        {
          field: 'pickerVal',
          label: '订单日期',
          component: 'DateRange',
          componentProps: {
            format: 'YYYY-MM-DD HH:mm:ss',
            showTime: { defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('23:59:59', 'HH:mm:ss')] },
            placeholder: ['开始时间', '结束时间'],
          },
        },
      ],
      fieldMapToTime: [['pickerVal', ['startTime', 'endTime']]],
    },
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
    },
    onExpand: handleExpand,
  });
  const [registerGoodsTable] = useTable({
    columns: goodsColumns,
    pagination: false,
    showTableSetting: false,
    canResize: false,
    scroll: { x: undefined },
  });
  const [registerPlanTable] = useTable({
    columns: planColumns,
    pagination: false,
    showTableSetting: false,
    canResize: false,
    scroll: { x: undefined },
  });

  function getTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.editText'),
        disabled: [1, 2, 4, 5].includes(record.currentState),
        onClick: toDetail.bind(null, record, '-1'),
      },
      {
        label: t('common.delText'),
        color: 'error',
        disabled: [1, 2, 3, 5].includes(record.currentState),
        modelConfirm: {
          onOk: handleDelete.bind(null, record.id),
        },
      },
      {
        label: t('common.detailText'),
        disabled: !record.currentState,
        onClick: toDetail.bind(null, record, 0),
      },
    ];
  }
  function getGoodsColumnSum(data) {
    const sums: any[] = [];
    unref(goodsColumns).forEach((column, index) => {
      if (index === 0 || index === 1 || index === 2) return (sums[index] = '');
      let sumVal = data.reduce((sum, d) => sum + parseFloat(d[column.dataIndex as any]), 0);
      sumVal = Number.isNaN(sumVal) ? '' : sumVal;
      sums[index] = sumVal && !Number.isInteger(sumVal) ? sumVal.toFixed(2) : sumVal;
    });
    return sums;
  }
  function getPlanColumnSum(data) {
    const sums: any[] = [];
    unref(planColumns).forEach((column, index) => {
      if (index === 0 || index === 3 || index === 4) return (sums[index] = '');
      let sumVal = data.reduce((sum, d) => sum + parseFloat(d[column.dataIndex as any]), 0);
      sumVal = Number.isNaN(sumVal) ? '' : sumVal;
      sums[index] = sumVal && !Number.isInteger(sumVal) ? sumVal.toFixed(2) : sumVal;
    });
    return sums;
  }
  function handleDelete(id) {
    delOrder(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function toDetail(record, opType) {
    const data = {
      id: record.id,
      flowId: record.flowId,
      opType,
    };
    openFlowParser(true, data);
  }
  function handleExpand(expanded, record) {
    if (!expanded || record.goodsList?.length || record.planList?.length) return;
    record.childTableLoading = true;
    getOrderEntryList(record.id)
      .then(res => {
        record.childTableLoading = false;
        record.goodsList = res.data.list;
      })
      .catch(() => {
        record.childTableLoading = false;
      });
    getOrderPlanList(record.id).then(res => {
      record.planList = res.data.list;
    });
  }
  function getFlowTemplateId() {
    getFlowIdByCode('crmOrder').then(res => {
      flowTemplateId.value = res.data;
      getFlowList(flowTemplateId.value, '1').then(res => {
        flowList.value = res.data;
      });
    });
  }
  function handleAdd() {
    if (!flowList.value.length) return createMessage.error('流程不存在');
    if (flowList.value.length === 1) return selectFlow(flowList.value[0]);
    openSelectFlowModal(true, { flowList: flowList.value });
  }
  function selectFlow(record) {
    const data = {
      id: '',
      flowId: record.id,
      opType: '-1',
    };
    openFlowParser(true, data);
  }

  onMounted(() => {
    getFlowTemplateId();
  });
</script>
