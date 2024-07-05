<template>
  <BasicModal class="result-modal" v-bind="$attrs" @register="registerModal" title="发送测试" :show-ok-btn="false" width="800px">
    <BasicTable @register="registerTable" :data-source="resultList">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'messageType'">
          <div class="title" :title="record.messageType">
            <CheckCircleFilled style="color: #67c23a" v-if="record.isSuccess == '1'" />
            <CloseCircleFilled style="color: #f56c6c" v-else />
            <span class="pl-5px">{{ record.messageType }}</span>
          </div>
        </template>
        <template v-if="column.key === 'result'">
          <span class="error-result" :title="record.result">{{ record.result }}</span>
        </template>
      </template>
    </BasicTable>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive, toRefs } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons-vue';

  interface State {
    resultList: any[];
  }

  const state = reactive<State>({
    resultList: [],
  });
  const { resultList } = toRefs(state);
  const [registerModal] = useModalInner(init);
  const columns: BasicColumn[] = [
    { title: '任务', dataIndex: 'messageType', width: 180 },
    { title: '原因', dataIndex: 'result', width: 180 },
  ];
  const [registerTable] = useTable({
    columns,
    useSearchForm: false,
    showTableSetting: false,
    pagination: false,
    canResize: false,
    showIndexColumn: false,
  });

  function init(data) {
    state.resultList = data;
  }
</script>
<style lang="less" scoped>
  .error-result {
    color: #f56c6c;
  }
</style>
