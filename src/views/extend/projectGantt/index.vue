<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'fullName'">
              <p>{{ record.fullName }}</p>
              <p class="text-grey">{{ record.enCode }}</p>
            </template>
            <template v-if="column.key === 'startTime'">
              <p>{{ dayjs(record.startTime).format('YYYY-MM-DD') }}</p>
              <p class="text-grey">{{ dayjs(record.endTime).format('YYYY-MM-DD') }}</p>
            </template>
            <template v-if="column.key === 'schedule'">
              <p>{{ record.timeLimit }}天</p>
              <a-progress :percent="record.schedule" />
            </template>
            <template v-if="column.key === 'state'">
              <a-tag color="success" v-if="record.schedule === 100">已完成</a-tag>
              <template v-else>
                <a-tag color="processing" v-if="record.state === 1">进行中</a-tag>
                <a-tag color="error" v-if="record.state === 2">已暂停</a-tag>
              </template>
            </template>
            <template v-if="column.key === 'managersInfo'">
              <a-avatar
                :size="30"
                :src="globSetting.apiUrl + img.headIcon"
                v-for="(img, i) in record.managersInfo"
                :key="i"
                :title="img.account"
                class="!mr-6px" />
            </template>
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <Form @register="registerForm" @reload="reload" />
    <Task @register="registerTask" />
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { getProjectList, delProject } from '/@/api/extend/projectGantt';
  import { useModal } from '/@/components/Modal';
  import { usePopup } from '/@/components/Popup';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useGlobSetting } from '/@/hooks/setting';
  import dayjs from 'dayjs';
  import Form from './Form.vue';
  import Task from './Task.vue';

  defineOptions({ name: 'extend-tableDemo-projectGantt' });

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const globSetting = useGlobSetting();
  const columns: BasicColumn[] = [
    { title: '项目名称/项目编码', dataIndex: 'fullName', width: 180 },
    { title: '开始日期/结束日期', dataIndex: 'startTime', width: 160 },
    { title: '项目工期/完成进度', dataIndex: 'schedule', width: 160 },
    { title: '状态', dataIndex: 'state', width: 100 },
    { title: '参与人员', dataIndex: 'managersInfo', width: 750 },
  ];
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerTask, { openPopup: openTaskPopup }] = usePopup();
  const [registerTable, { reload }] = useTable({
    api: getProjectList,
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
      {
        label: '项目任务',
        onClick: handleTask.bind(null, record),
      },
    ];
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id });
  }
  function handleDelete(id) {
    delProject(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleTask(row) {
    openTaskPopup(true, row);
  }
</script>
