<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="getTitle" class="full-popup">
    <BasicTable :columns="columns" @register="registerTable" class="jnpf-sub-table jnpf-sub-table-full" v-show="!showFlow">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'processId'">
          {{ record.processId }}
          <template v-if="record.isRetry">
            <a-tag color="blue" class="!mx-8px">重试</a-tag>
            <BasicHelp :text="[`原实例ID：${record.parentId}`, `原实例执行时间：${dayjs(record.parentTime).format('YYYY-MM-DD HH:mm:ss')}`]">
              <template #default><i class="icon-ym icon-ym-generator-link" /></template>
            </BasicHelp>
          </template>
        </template>
        <template v-if="column.key === 'enabledMark'">
          <a-tag :color="record.resultType === 1 ? 'success' : 'error'">{{ record.resultType === 1 ? '成功' : '失败' }}</a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <TableAction :actions="getTableActions(record)" />
        </template>
      </template>
    </BasicTable>
    <LogDetail @register="registerLogDetailModal" @updateNodes="updateNodes" />
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { getTaskList, retryTask, delTask } from '/@/api/onlineDev/integrate';
  import { ref, unref, computed, reactive } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useModal } from '/@/components/Modal';
  import LogDetail from './LogDetail.vue';
  import dayjs from 'dayjs';

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerPopup, { closePopup }] = usePopupInner(init);
  const emit = defineEmits(['register', 'updateNodes']);
  const title = ref('');
  const showFlow = ref(false);
  const columns: BasicColumn[] = [
    { title: '实例ID', dataIndex: 'processId' },
    { title: '执行结果', dataIndex: 'enabledMark', width: 150 },
    { title: '执行时间', dataIndex: 'executionTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
  ];
  const searchInfo = reactive({ integrateId: '' });
  const [registerLogDetailModal, { openModal: openLogDetailModal }] = useModal();
  const [registerTable, { reload }] = useTable({
    api: getTaskList,
    searchInfo: searchInfo,
    useSearchForm: true,
    formConfig: {
      baseColProps: { span: 6 },
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
          field: 'resultType',
          label: '执行结果',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            options: [
              { fullName: '成功', id: 1 },
              { fullName: '失败', id: 0 },
            ],
            showSearch: true,
            allowClear: false,
          },
        },
      ],
      fieldMapToTime: [['pickerVal', ['startTime', 'endTime']]],
    },
    immediate: false,
    tableSetting: { setting: false, redo: false },
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
    },
  });

  const getTitle = computed(() => (unref(showFlow) ? '流程图' : unref(title)));

  function init(data) {
    title.value = data.fullName;
    searchInfo.integrateId = data.id;
    reload();
  }
  function getTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.detailText'),
        onClick: handleDetail.bind(null, record.id),
      },
      {
        label: t('common.delText'),
        color: 'error',
        modelConfirm: {
          onOk: handleDelete.bind(null, record.id),
        },
      },
      {
        label: '重试',
        ifShow: record.resultType != 1,
        modelConfirm: {
          content: '确定将本实例进行重试，是否继续?',
          onOk: handleRedo.bind(null, record.id),
        },
      },
    ];
  }
  function handleDetail(id) {
    openLogDetailModal(true, { id });
  }
  function handleRedo(id) {
    retryTask(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleDelete(id) {
    delTask(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function updateNodes() {
    emit('updateNodes', searchInfo.integrateId);
    closePopup();
  }
</script>
<style lang="less" scoped>
  .process-preview {
    height: 100%;
    padding: 10px 0;

    :deep(.process-flow-container) {
      .tips {
        display: none;
      }

      .scale-slider {
        right: 10px;
      }
    }
  }
</style>
