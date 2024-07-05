<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="error" preIcon="icon-ym icon-ym-btn-clearn" @click="handleDel">{{ t('common.delText') }}</a-button>
            <a-button type="link" danger @click="handleDelAll">一键清空 </a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <Detail @register="registerForm" @reload="reload" />
  </div>
</template>
<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getMsgMonitorList, delMsgMonitor, emptyMsgMonitor } from '/@/api/msgCenter/msgMonitor';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useModal } from '/@/components/Modal';
  import { useBaseStore } from '/@/store/modules/base';
  import Detail from './Detail.vue';
  import dayjs from 'dayjs';

  defineOptions({ name: 'msgCenter-msgMonitor' });

  const { t } = useI18n();
  const baseStore = useBaseStore();
  const { createMessage, createConfirm } = useMessage();
  const columns: BasicColumn[] = [
    { title: '消息类型', dataIndex: 'messageType', width: 100 },
    { title: '消息来源', dataIndex: 'messageSource', width: 100 },
    { title: '消息标题', dataIndex: 'title' },
    { title: '发送时间', dataIndex: 'sendTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
  ];
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerTable, { reload, getSelectRows, clearSelectedRowKeys, getForm }] = useTable({
    api: getMsgMonitorList,
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
        {
          field: 'messageType',
          label: '消息类型',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
          },
        },
        {
          field: 'messageSource',
          label: '消息来源',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
          },
        },
        {
          field: 'pickerVal',
          label: '发送时间',
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
    actionColumn: {
      width: 60,
      title: '操作',
      dataIndex: 'action',
    },
    rowSelection: { type: 'checkbox' },
    clickToRowSelect: false,
  });

  function getTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.detailText'),
        onClick: handleDetail.bind(null, record.id),
      },
    ];
  }
  function handleDel() {
    const selectData = getSelectRows() || [];
    if (!selectData.length) return createMessage.error('请选择一条数据');
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '您确定要删除这些数据吗, 是否继续?',
      onOk: () => {
        const query = {
          ids: selectData.map(item => item.id),
        };
        delMsgMonitor(query).then(res => {
          createMessage.success(res.msg);
          clearSelectedRowKeys();
          reload();
        });
      },
    });
  }
  function handleDelAll() {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '您确定要清空全部数据吗, 是否继续?',
      onOk: () => {
        emptyMsgMonitor().then(res => {
          createMessage.success(res.msg);
          reload();
        });
      },
    });
  }
  function handleDetail(id) {
    openFormModal(true, { id });
  }
  async function init() {
    let messageTypeList = (await baseStore.getDictionaryData('msgSendType')) as any[];
    messageTypeList.map(o => (o.id = o.enCode));
    getForm().updateSchema([{ field: 'messageType', componentProps: { options: messageTypeList } }]);
    let messageSourceList = (await baseStore.getDictionaryData('msgSourceType')) as any[];
    messageSourceList.map(o => (o.id = o.enCode));
    getForm().updateSchema([{ field: 'messageSource', componentProps: { options: messageSourceList } }]);
  }

  onMounted(() => {
    init();
  });
</script>
