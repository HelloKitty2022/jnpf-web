<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #expandedRowRender="{ record }">
            <BasicTable @register="registerSubTable" v-loading="record.childTableLoading" :data-source="record.list" />
          </template>
        </BasicTable>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, reactive } from 'vue';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { getIndustryList, getCityList } from '/@/api/extend/table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useBaseStore } from '/@/store/modules/base';

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
    { title: '名称', dataIndex: 'fullName', width: 800 },
    { title: '编码', dataIndex: 'enCode', width: 150 },
  ];
  const [registerTable] = useTable({
    api: getIndustryList,
    columns,
    useSearchForm: true,
    pagination: false,
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
    onExpand: handleExpand,
  });
  const [registerSubTable] = useTable({
    columns,
    pagination: false,
    showTableSetting: false,
    showIndexColumn: false,
    canResize: false,
    scroll: { x: undefined },
  });
  function handleExpand(expanded, record) {
    if (!expanded || record.list?.length) return;
    record.childTableLoading = true;
    getCityList(record.id)
      .then(res => {
        record.childTableLoading = false;
        record.list = res.data.list;
      })
      .catch(() => {
        record.childTableLoading = false;
      });
  }
  async function init() {
    state.industryTypeList = (await baseStore.getDictionaryData('IndustryType')) as any[];
  }

  onMounted(() => init());
</script>
