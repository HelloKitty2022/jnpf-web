<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" />
            </template>
          </template>
          <template #summary>
            <a-table-summary fixed>
              <a-table-summary-row>
                <a-table-summary-cell :index="0">合计</a-table-summary-cell>
                <a-table-summary-cell v-for="(item, index) in getColumnSum()" :key="index" :index="index + 1">
                  {{ item }}
                </a-table-summary-cell>
              </a-table-summary-row>
            </a-table-summary>
          </template>
        </BasicTable>
      </div>
    </div>
    <Form @register="registerForm" @reload="reload" />
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, unref } from 'vue';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { getTableList, delTable } from '/@/api/extend/table';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useBaseStore } from '/@/store/modules/base';
  import Form from '../commonForm/index.vue';

  defineOptions({ name: 'extend-tableDemo-statisticsTable' });

  interface State {
    industryTypeList: any[];
    list: any[];
  }

  const state = reactive<State>({
    industryTypeList: [],
    list: [],
  });
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const { createMessage } = useMessage();
  const columns: BasicColumn[] = [
    { title: '项目名称', dataIndex: 'projectName', width: 200 },
    { title: '项目编码', dataIndex: 'projectCode', width: 160 },
    {
      title: '项目类型',
      dataIndex: 'projectType',
      width: 120,
      customRender: ({ record }) => {
        let item = state.industryTypeList.filter(o => o.id == record.projectType)[0];
        return item && item.fullName ? item.fullName : '';
      },
    },
    { title: '项目阶段', dataIndex: 'projectPhase', width: 120 },
    { title: '客户名称', dataIndex: 'customerName', width: 200 },
    { title: '负责人', dataIndex: 'principal', width: 80 },
    { title: '立项人', dataIndex: 'jackStands', width: 80 },
    { title: '交互时间', dataIndex: 'interactionDate', width: 100, format: 'date|YYYY-MM-DD' },
    { title: '费用金额', dataIndex: 'costAmount', width: 100 },
    { title: '已用金额', dataIndex: 'tunesAmount', width: 100 },
    { title: '预计收入', dataIndex: 'projectedIncome', width: 100 },
    { title: '登记人', dataIndex: 'registrant', width: 80 },
    { title: '登记时间', dataIndex: 'registerDate', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '备注', dataIndex: 'description', width: 100 },
  ];
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerTable, { reload }] = useTable({
    api: getTableList,
    columns,
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
      ],
    },
    actionColumn: {
      width: 100,
      title: '操作',
      dataIndex: 'action',
    },
    afterFetch: data => {
      state.list = data;
      return data;
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
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id, industryTypeList: state.industryTypeList });
  }
  function handleDelete(id) {
    delTable(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  async function init() {
    state.industryTypeList = (await baseStore.getDictionaryData('IndustryType')) as any[];
  }
  function getColumnSum() {
    const sums: any[] = [];
    unref(columns).forEach((column, index) => {
      if (index === 7 || index === 12) return (sums[index] = '');
      let sumVal = state.list.reduce((sum, d) => sum + parseFloat(d[column.dataIndex as any]), 0);
      sumVal = Number.isNaN(sumVal) ? '' : sumVal;
      sums[index] = sumVal && !Number.isInteger(sumVal) ? sumVal.toFixed(2) : sumVal;
    });
    return sums;
  }

  onMounted(() => init());
</script>
