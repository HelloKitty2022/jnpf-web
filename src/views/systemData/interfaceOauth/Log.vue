<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="title">
    <BasicTable @register="registerTable" :searchInfo="searchInfo">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'invokType'">
          <a-tag :color="record.invokType == 'GET' ? 'success' : 'blue'">{{ record.invokType == 'GET' ? 'GET' : 'POST' }}</a-tag>
        </template>
      </template>
    </BasicTable>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { getLogList } from '/@/api/systemData/interfaceOauth';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useGlobSetting } from '/@/hooks/setting';
  import dayjs from 'dayjs';

  const id = ref('');
  const title = ref('');
  const { t } = useI18n();
  const globSetting = useGlobSetting();
  const [registerPopup] = usePopupInner(init);
  const columns: BasicColumn[] = [
    { title: '接口名称', dataIndex: 'fullName', width: 150 },
    { title: '接口编码', dataIndex: 'enCode', width: 100 },
    { title: '请求地址', dataIndex: 'url', width: 300 },
    { title: '请求时间', dataIndex: 'invokTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '请求IP', dataIndex: 'invokIp', width: 120 },
    { title: '请求类型', dataIndex: 'invokType', width: 80 },
    { title: '耗时(毫秒)', dataIndex: 'invokWasteTime', width: 90 },
    { title: '请求设备', dataIndex: 'invokDevice' },
  ];
  const searchInfo = reactive({
    id: id.value,
  });
  const [registerTable, { reload: reloadTable }] = useTable({
    api: getLogList,
    columns,
    useSearchForm: true,
    showTableSetting: false,
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
        {
          field: 'pickerVal',
          label: '请求时间',
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
    immediate: false,
    afterFetch: data => {
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        item.url = `${globSetting.apiUrl}/api/system/DataInterface/${item.id}/Actions/Response` + (item.tenantId ? '?tenantId=' + item.tenantId : '');
      }
      return data;
    },
  });

  function init(data) {
    id.value = data.id;
    title.value = data.appName || '查看详情';
    searchInfo.id = id.value;
    reloadTable({ page: 1 });
  }
</script>
