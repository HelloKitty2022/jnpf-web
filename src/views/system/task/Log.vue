<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="title">
    <BasicTable @register="registerTable" :searchInfo="searchInfo">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'runResult'">
          <a-tag :color="record.runResult == 0 ? 'success' : 'error'">{{ record.runResult == 0 ? '成功' : '失败' }}</a-tag>
        </template>
      </template>
    </BasicTable>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { getTaskLogList } from '/@/api/system/task';
  import dayjs from 'dayjs';

  const id = ref('');
  const title = ref('');
  const [registerPopup] = usePopupInner(init);
  const columns: BasicColumn[] = [
    { title: '执行时间', dataIndex: 'runTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '执行结果', dataIndex: 'runResult', width: 100 },
    { title: '执行说明', dataIndex: 'description' },
  ];
  const searchInfo = reactive({
    id: id.value,
  });
  const [registerTable, { reload: reloadTable }] = useTable({
    api: getTaskLogList,
    columns,
    useSearchForm: true,
    showTableSetting: false,
    formConfig: {
      schemas: [
        {
          field: 'pickerVal',
          label: '执行时间',
          component: 'DateRange',
          componentProps: {
            format: 'YYYY-MM-DD HH:mm:ss',
            showTime: { defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('23:59:59', 'HH:mm:ss')] },
            placeholder: ['开始时间', '结束时间'],
          },
        },
        {
          field: 'runResult',
          label: '执行结果',
          component: 'Select',
          componentProps: {
            placeholder: '请选择执行结果',
            options: [
              { fullName: '成功', id: 0 },
              { fullName: '失败', id: 1 },
            ],
          },
        },
      ],
      fieldMapToTime: [['pickerVal', ['startTime', 'endTime']]],
    },
    immediate: false,
  });

  function init(data) {
    id.value = data.id;
    title.value = data.title || '查看详情';
    searchInfo.id = id.value;
    reloadTable({ page: 1 });
  }
</script>
