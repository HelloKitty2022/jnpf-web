<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-report-icon-preview-print" @click="handlePrint()">打印</a-button>
          </template>
        </BasicTable>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, reactive } from 'vue';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { getTableList } from '/@/api/extend/table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useBaseStore } from '/@/store/modules/base';
  import printJS from 'print-js';

  defineOptions({ name: 'extend-tableDemo-printTable' });

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
  const columns: BasicColumn[] = [
    { title: '项目名称', dataIndex: 'projectName', width: 200 },
    { title: '项目编码', dataIndex: 'projectCode', width: 160 },
    { title: '项目类型', dataIndex: 'projectType', width: 120 },
    { title: '项目阶段', dataIndex: 'projectPhase', width: 120 },
    { title: '客户名称', dataIndex: 'customerName', width: 200 },
    { title: '费用金额', dataIndex: 'costAmount', width: 100 },
    { title: '已用金额', dataIndex: 'tunesAmount', width: 100 },
    { title: '预计收入', dataIndex: 'projectedIncome', width: 100 },
  ];
  const [registerTable] = useTable({
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
    afterFetch: data => {
      state.list = data;
      state.list.map(o => {
        let item = state.industryTypeList.filter(j => j.id == o.projectType)[0];
        o.projectType = item && item.fullName ? item.fullName : '';
        for (const key in o) {
          o[key] = o[key] ? o[key] : '';
        }
      });
      return data;
    },
  });
  function handlePrint() {
    let columnsList = JSON.parse(JSON.stringify(columns));
    printJS({
      printable: state.list,
      properties: columnsList.map(o => {
        o.field = o.dataIndex;
        o.displayName = o.title;
        return o;
      }),
      type: 'json',
      gridStyle: 'border: 1px solid lightgray; margin-bottom: -1px;text-align:center;word-break: break-all;',
      repeatTableHeader: false, //当设置为false时，数据表头将只显示在第一页。
    });
  }
  async function init() {
    state.industryTypeList = (await baseStore.getDictionaryData('IndustryType')) as any[];
  }

  onMounted(() => init());
</script>
