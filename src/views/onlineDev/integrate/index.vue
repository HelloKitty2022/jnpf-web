<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #toolbar>
            <a-tooltip placement="top">
              <template #title>
                <span>执行队列</span>
              </template>
              <i class="icon-ym icon-ym-generator-slider cursor-pointer text-18px" @click="openDrawer(true)"></i>
            </a-tooltip>
          </template>
          <template #tableTitle>
            <a-dropdown>
              <template #overlay>
                <a-menu @click="handleAdd">
                  <a-menu-item :key="item.id" v-for="item in typeList">{{ item.fullName }}</a-menu-item>
                </a-menu>
              </template>
              <a-button type="primary" preIcon="icon-ym icon-ym-btn-add">{{ t('common.addText') }}<DownOutlined /></a-button>
            </a-dropdown>
            <jnpf-upload-btn url="/api/visualdev/Integrate/Actions/Import" accept=".bi" @on-success="reload"></jnpf-upload-btn>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              {{ record.type === 1 ? '事件触发' : record.type === 2 ? '定时触发' : 'webhook触发' }}
            </template>
            <template v-if="column.key === 'enabledMark'">
              <a-tag :color="record.enabledMark === 1 ? 'success' : 'error'">{{ record.enabledMark == 1 ? '启用' : '禁用' }}</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <Form @register="registerForm" @reload="reload" @design="handleDesign" />
    <IntegrateProcess @register="registerIntegrateProcess" @reload="reload" />
    <ExecutionQueue @register="registerDrawer" />
    <Log @register="registerLogPopup" @updateNodes="updateNodes" />
  </div>
</template>
<script lang="ts" setup>
  import { getIntegrateList, delIntegrate, copy, exportData, updateState } from '/@/api/onlineDev/integrate';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { usePopup } from '/@/components/Popup/src/usePopup';
  import { IntegrateProcess } from '/@/components/IntegrateProcess';
  import { downloadByUrl } from '/@/utils/file/download';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { useDrawer } from '/@/components/Drawer';
  import Form from './Form.vue';
  import ExecutionQueue from './components/ExecutionQueue.vue';
  import Log from './components/Log.vue';

  defineOptions({ name: 'onlineDev-integrate' });

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerIntegrateProcess, { openModal: openIntegrateProcess }] = useModal();
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerLogPopup, { openPopup: openLogPopup }] = usePopup();

  const columns: BasicColumn[] = [
    { title: '名称', dataIndex: 'fullName', width: 200 },
    { title: '编码', dataIndex: 'enCode', width: 180 },
    { title: '类型', dataIndex: 'type', width: 110, align: 'center' },
    { title: '创建人', dataIndex: 'creatorUser', width: 120 },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '最后修改时间', dataIndex: 'lastModifyTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '状态', dataIndex: 'enabledMark', width: 80, align: 'center' },
  ];
  const typeList = [
    { fullName: '事件触发', id: 1 },
    { fullName: '定时触发', id: 2 },
    { fullName: 'webhook触发', id: 3 },
  ];
  const [registerTable, { reload }] = useTable({
    api: getIntegrateList,
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
          componentProps: { placeholder: '请选择', options: typeList },
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
        label: '设计',
        onClick: handleDesign.bind(null, record.id),
      },
      {
        label: '日志',
        onClick: handleLog.bind(null, record.id, record.fullName),
      },
      {
        label: '启用',
        ifShow: record.enabledMark != 1,
        modelConfirm: {
          content: '此操作将启用该集成助手，是否继续?',
          onOk: handleRelease.bind(null, record.id),
        },
      },
      {
        label: '禁用',
        ifShow: record.enabledMark == 1,
        modelConfirm: {
          content: '此操作将禁用该集成助手，是否继续?',
          onOk: handleRelease.bind(null, record.id),
        },
      },
      {
        label: '复制',
        modelConfirm: {
          content: '您确定要复制该集成助手, 是否继续?',
          onOk: handleCopy.bind(null, record.id),
        },
      },
      {
        label: '导出',
        modelConfirm: {
          content: '您确定要导出该集成助手, 是否继续?',
          onOk: handleExport.bind(null, record.id),
        },
      },
    ];
  }
  function handleAdd({ key }) {
    addOrUpdateHandle('', key);
  }
  function addOrUpdateHandle(id = '', type) {
    openFormModal(true, { id, type });
  }
  function handleDelete(id) {
    delIntegrate(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleDesign(id) {
    openIntegrateProcess(true, { id });
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
  function handleLog(id, fullName) {
    openLogPopup(true, { id, fullName });
  }
  function handleRelease(id) {
    updateState(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function updateNodes(id) {
    handleDesign(id);
  }
</script>
