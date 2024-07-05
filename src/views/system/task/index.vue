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
              <a-tag :color="record.enabledMark == 1 ? 'success' : 'error'">{{ record.enabledMark == 1 ? '启用' : '禁用' }}</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <Form @register="registerForm" @reload="reload" />
    <Log @register="registerLog" />
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { getTaskList, delTask } from '/@/api/system/task';
  import { usePopup } from '/@/components/Popup';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import Form from './Form.vue';
  import Log from './Log.vue';

  defineOptions({ name: 'system-task' });

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const columns: BasicColumn[] = [
    { title: '任务标题', dataIndex: 'fullName' },
    { title: '任务编码', dataIndex: 'enCode', width: 200 },
    { title: '执行次数', dataIndex: 'runCount', width: 100 },
    { title: '任务开始时间', dataIndex: 'startTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '任务结束时间', dataIndex: 'endTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '最后执行时间', dataIndex: 'lastRunTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '下次运行时间', dataIndex: 'nextRunTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '状态', dataIndex: 'enabledMark', width: 70 },
  ];
  const [registerForm, { openPopup: openFormPopup }] = usePopup();
  const [registerLog, { openPopup: openLogPopup }] = usePopup();
  const [registerTable, { reload }] = useTable({
    api: getTaskList,
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
        label: '任务日志',
        onClick: handleLogList.bind(null, record.id, record.fullName),
      },
    ];
  }
  function addOrUpdateHandle(id = '') {
    openFormPopup(true, { id });
  }
  function handleLogList(id = '', title = '') {
    openLogPopup(true, { id, title });
  }
  function handleDelete(id) {
    delTask(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
</script>
