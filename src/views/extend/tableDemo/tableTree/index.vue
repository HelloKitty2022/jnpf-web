<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable" :data-source="state.industryTypeList" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, nextTick } from 'vue';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { useBaseStore } from '/@/store/modules/base';

  defineOptions({ name: 'extend-tableDemo-tableTree' });

  interface State {
    industryTypeList: any[];
  }

  const state = reactive<State>({
    industryTypeList: [],
  });
  const baseStore = useBaseStore();
  const columns: BasicColumn[] = [
    { title: '名称', dataIndex: 'fullName', width: 200 },
    { title: '编码', dataIndex: 'id', width: 160 },
  ];
  const [registerTable, { expandAll }] = useTable({
    columns,
    useSearchForm: false,
    isTreeTable: true,
    immediate: false,
    showTableSetting: false,
    pagination: false,
  });

  async function init() {
    state.industryTypeList = (await baseStore.getDictionaryData('IndustryType')) as any[];
    nextTick(() => expandAll());
  }

  onMounted(() => init());
</script>
