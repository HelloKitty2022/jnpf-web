<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="title">
    <BasicTable @register="registerTable" :searchInfo="searchInfo" />
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { getPrintLogList } from '/@/api/system/printDev';
  import { useI18n } from '/@/hooks/web/useI18n';
  import dayjs from 'dayjs';

  const title = ref('');
  const { t } = useI18n();
  const [registerPopup] = usePopupInner(init);
  const columns: BasicColumn[] = [
    { title: '名称', dataIndex: 'printTitle' },
    { title: '打印人', dataIndex: 'printMan' },
    { title: '打印时间', dataIndex: 'printTime', format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '打印条数', dataIndex: 'printNum' },
  ];
  const searchInfo = reactive({
    id: '',
    keyword: '',
    startTime: '',
    endTime: '',
    sort: 'desc',
    sidx: '',
  });
  const [registerTable, { reload: reloadTable }] = useTable({
    api: getPrintLogList,
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
          label: '打印时间',
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
  });

  function init(data) {
    title.value = data.title + '的打印日志' || '查看详情';
    searchInfo.id = data.id;
    reloadTable({ page: 1 });
  }
</script>
