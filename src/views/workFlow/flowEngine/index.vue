<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="openAddModal()">{{ t('common.addText') }}</a-button>
            <jnpf-upload-btn url="/api/workflow/Engine/flowTemplate/Actions/Import" accept=".ffe" @on-success="reload"></jnpf-upload-btn>
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
    <AddModal @register="registerAdd" @select="handleAdd" />
    <VersionManage @register="registerVersionManage" />
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { getFlowEngineList, delFlowEngine, copy, exportData, release, stop } from '/@/api/workFlow/flowEngine';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { usePopup } from '/@/components/Popup';
  import { useBaseStore } from '/@/store/modules/base';
  import Form from './Form.vue';
  import AddModal from './AddModal.vue';
  import VersionManage from './VersionManage.vue';
  import { downloadByUrl } from '/@/utils/file/download';

  defineOptions({ name: 'workFlow-flowEngine' });

  const { createMessage } = useMessage();
  const baseStore = useBaseStore();
  const { t } = useI18n();
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerAdd, { openModal: openAddModal }] = useModal();
  const [registerVersionManage, { openPopup: openVersionManagePopup }] = usePopup();

  const columns: BasicColumn[] = [
    { title: '流程名称', dataIndex: 'fullName', width: 200 },
    { title: '流程编码', dataIndex: 'enCode', width: 200 },
    { title: '流程分类', dataIndex: 'category', width: 150 },
    {
      title: '流程类型',
      dataIndex: 'type',
      width: 100,
      align: 'center',
      customRender: ({ record }) => {
        return record.type == 0 ? '发起流程' : '功能流程';
      },
    },
    { title: '创建人', dataIndex: 'creatorUser', width: 120 },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
    { title: '状态', dataIndex: 'enabledMark', width: 80, align: 'center' },
  ];
  const categoryList = ref<any[]>([]);
  const [registerTable, { reload, getForm }] = useTable({
    api: getFlowEngineList,
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
          field: 'category',
          label: '流程分类',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            showSearch: true,
          },
        },
        {
          field: 'type',
          label: '流程类型',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            options: [
              { fullName: '发起流程', id: 0 },
              { fullName: '功能流程', id: 1 },
            ],
          },
        },
        {
          field: 'enabledMark',
          label: '状态',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            options: [
              { fullName: '启用', id: 1 },
              { fullName: '禁用', id: 0 },
            ],
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
        onClick: addOrUpdateHandle.bind(null, record.id, record.type),
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
        label: '启用流程',
        ifShow: record.enabledMark != 1,
        modelConfirm: {
          content: '此操作将启用该流程，是否继续?',
          onOk: handleRelease.bind(null, record),
        },
      },
      {
        label: '禁用流程',
        ifShow: record.enabledMark == 1,
        modelConfirm: {
          content: '此操作将禁用该流程，是否继续?',
          onOk: handleRelease.bind(null, record),
        },
      },
      {
        label: '版本管理',
        onClick: handleVersionManage.bind(null, record.id, record.fullName),
      },
      {
        label: '复制流程',
        modelConfirm: {
          content: '您确定要复制该流程, 是否继续?',
          onOk: handleCopy.bind(null, record.id),
        },
      },
      {
        label: '导出流程',
        modelConfirm: {
          content: '您确定要导出该流程, 是否继续?',
          onOk: handleExport.bind(null, record.id),
        },
      },
    ];
  }
  function addOrUpdateHandle(id = '', type) {
    openFormModal(true, { id, type, categoryList });
  }
  function handleDelete(id) {
    delFlowEngine(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleRelease(record) {
    const method = record.enabledMark ? stop : release;
    method(record.id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleVersionManage(id, fullName) {
    openVersionManagePopup(true, { id, fullName });
  }
  function handleCopy(id) {
    copy(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleExport(id) {
    exportData(id).then(res => {
      downloadByUrl({ url: res.data.url });
    });
  }
  function handleAdd(type) {
    addOrUpdateHandle('', type);
  }
  async function getOptions() {
    const res = await baseStore.getDictionaryData('WorkFlowCategory');
    categoryList.value = res as any[];
    getForm().updateSchema({ field: 'category', componentProps: { options: res } });
  }
  onMounted(() => {
    getOptions();
  });
</script>
