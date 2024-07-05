<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" title="执行队列" width="600px" class="full-drawer" destroy-on-close>
    <BasicTable @register="registerTable">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'enabledMark'">
          <a-tag :color="record.state === 1 ? 'success' : ''">{{ record.state === 1 ? '执行中' : '等待' }}</a-tag>
        </template>
      </template>
    </BasicTable>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { getQueueList } from '/@/api/onlineDev/integrate';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';

  const [registerDrawer, {}] = useDrawerInner();
  const columns: BasicColumn[] = [
    { title: '名称', dataIndex: 'fullName' },
    { title: '执行时间', dataIndex: 'executionTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '状态', dataIndex: 'enabledMark', width: 70 },
  ];
  const [registerTable] = useTable({
    api: getQueueList,
    columns,
    pagination: false,
    showTableSetting: false,
  });
</script>
