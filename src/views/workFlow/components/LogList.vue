<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" destroyOnClose :title="title" class="full-popup basic-flow-parser">
    <BasicTable @register="registerTable" :searchInfo="searchInfo" />
  </BasicPopup>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { getLogList } from '/@/api/workFlow/flowMonitor';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';

  const searchInfo = reactive({
    id: '',
  });
  const title = ref('');
  const columns: BasicColumn[] = [
    { title: '事件名称', dataIndex: 'fullName', width: 200 },
    { title: '接口名称', dataIndex: 'interfaceName', width: 150 },
    { title: '接口编码', dataIndex: 'interfaceCode', width: 150 },
    { title: '执行时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '执行结果', dataIndex: 'result', width: 200 },
  ];
  const [registerPopup] = usePopupInner(init);
  const [registerTable, { reload }] = useTable({
    api: getLogList,
    columns,
    showTableSetting: false,
    pagination: false,
    immediate: false,
  });

  function init(data) {
    searchInfo.id = data.taskNodeId || '';
    title.value = data.nodeName;
    searchInfo.id && reload();
  }
</script>
