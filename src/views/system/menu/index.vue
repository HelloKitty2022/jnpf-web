<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'icon'">
              <i :class="record.icon + ' table-icon'" />
            </template>
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
    <Menu @register="registerMenu" />
    <Portal @register="registerPortal" />
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { getSystemList, delSystem } from '/@/api/system/system';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePopup } from '/@/components/Popup';
  import Form from './Form.vue';
  import Menu from './components/menu/index.vue';
  import Portal from './components/portal/index.vue';

  defineOptions({ name: 'system-menu' });

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const columns: BasicColumn[] = [
    { title: '应用名称', dataIndex: 'fullName', width: 200 },
    { title: '应用编码', dataIndex: 'enCode', width: 200 },
    { title: '说明', dataIndex: 'description' },
    { title: '图标', dataIndex: 'icon', width: 50, align: 'center' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
    { title: '状态', dataIndex: 'enabledMark', width: 70, align: 'center' },
  ];
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerMenu, { openPopup: openMenuPopup }] = usePopup();
  const [registerPortal, { openPopup: openPortalPopup }] = usePopup();
  const [registerTable, { reload }] = useTable({
    api: getSystemList,
    columns,
    useSearchForm: true,
    pagination: false,
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
        disabled: record.isMain == 1,
        modelConfirm: {
          onOk: handleDelete.bind(null, record.id),
        },
      },
    ];
  }
  function getDropDownActions(record): ActionItem[] {
    return [
      {
        label: '菜单管理',
        onClick: handleMenu.bind(null, record),
      },
      {
        ifShow: !record.mainSystem,
        label: '门户管理',
        onClick: handlePortal.bind(null, record),
      },
    ];
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id });
  }
  function handleMenu(record) {
    openMenuPopup(true, { id: record.id, title: record.fullName, isDevPlatform: !!record.mainSystem });
  }
  function handlePortal(record) {
    openPortalPopup(true, { id: record.id, title: record.fullName });
  }
  function handleDelete(id) {
    delSystem(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
</script>
