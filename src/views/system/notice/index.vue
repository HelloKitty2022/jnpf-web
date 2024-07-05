<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'enabledMark'">
              <a-tag :color="record.enabledMark == 1 ? 'success' : record.enabledMark == 0 ? 'warning' : ''">
                {{ record.enabledMark == 1 ? '已发送' : record.enabledMark == 0 ? '存草稿' : '已过期' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <Detail @register="registerDetail" />
    <Form @register="registerForm" @reload="reload" />
  </div>
</template>
<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getNoticeList, delNotice, release } from '/@/api/system/message';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useModal } from '/@/components/Modal';
  import { usePopup } from '/@/components/Popup';
  import { useBaseStore } from '/@/store/modules/base';
  import Detail from './Detail.vue';
  import Form from './Form.vue';
  import dayjs from 'dayjs';

  defineOptions({ name: 'system-notice' });

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const baseStore = useBaseStore();
  const columns: BasicColumn[] = [
    { title: '标题', dataIndex: 'title' },
    { title: '类型', dataIndex: 'category', width: 60, align: 'center' },
    { title: '失效时间', dataIndex: 'expirationTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '创建人', dataIndex: 'creatorUser', width: 120 },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '发布人', dataIndex: 'releaseUser', width: 120 },
    { title: '发布时间', dataIndex: 'releaseTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '状态', dataIndex: 'enabledMark', width: 80, align: 'center' },
  ];
  const [registerDetail, { openModal: openDetailModal }] = useModal();
  const [registerForm, { openPopup: openFormPopup }] = usePopup();
  const [registerTable, { reload, getForm }] = useTable({
    api: getNoticeList,
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
          field: 'type',
          label: '类型',
          component: 'Select',
          componentProps: { placeholder: '请选择', multiple: true, showSearch: true, fieldNames: { value: 'enCode' } },
        },
        {
          field: 'enabledMark',
          label: '状态',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            multiple: true,
            options: [
              { id: '0', fullName: '存草稿' },
              { id: '1', fullName: '已发送' },
              { id: '2', fullName: '已过期' },
            ],
          },
        },
        {
          field: 'releaseUser',
          label: '发布人',
          component: 'UserSelect',
          componentProps: { placeholder: '请选择', multiple: true },
        },
        {
          field: 'releaseTime',
          label: '发布时间',
          component: 'DateRange',
          componentProps: {
            format: 'YYYY-MM-DD HH:mm:ss',
            showTime: { defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('23:59:59', 'HH:mm:ss')] },
            placeholder: ['开始时间', '结束时间'],
          },
        },
        {
          field: 'expirationTime',
          label: '失效时间',
          component: 'DateRange',
          componentProps: {
            format: 'YYYY-MM-DD HH:mm:ss',
            showTime: { defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('23:59:59', 'HH:mm:ss')] },
            placeholder: ['开始时间', '结束时间'],
          },
        },
        {
          field: 'creatorUser',
          label: '创建人',
          component: 'UserSelect',
          componentProps: { placeholder: '请选择', multiple: true },
        },
        {
          field: 'creatorTime',
          label: '创建时间',
          component: 'DateRange',
          componentProps: {
            format: 'YYYY-MM-DD HH:mm:ss',
            showTime: { defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('23:59:59', 'HH:mm:ss')] },
            placeholder: ['开始时间', '结束时间'],
          },
        },
      ],
    },
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
    },
  });

  function getTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.editText'),
        disabled: record.enabledMark != 0,
        onClick: addOrUpdateHandle.bind(null, record.id),
      },
      {
        label: t('common.delText'),
        color: 'error',
        modelConfirm: {
          onOk: handleDelete.bind(null, record.id),
        },
      },
    ];
  }
  function getDropDownActions(record): ActionItem[] {
    return [
      {
        label: t('common.detailText'),
        onClick: handleDetail.bind(null, record.id),
      },
      {
        label: '发布',
        ifShow: record.enabledMark == 0,
        modelConfirm: {
          content: '您确定要发布当前公告, 是否继续?',
          onOk: handleRelease.bind(null, record.id),
        },
      },
    ];
  }
  function handleDelete(id) {
    delNotice(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleRelease(id) {
    release(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleDetail(id) {
    openDetailModal(true, { id });
  }
  function addOrUpdateHandle(id = '') {
    openFormPopup(true, { id });
  }
  async function getOptions() {
    const res = (await baseStore.getDictionaryData('NoticeType')) as any[];
    getForm().updateSchema({ field: 'type', componentProps: { options: res } });
  }

  onMounted(() => {
    getOptions();
  });
</script>
