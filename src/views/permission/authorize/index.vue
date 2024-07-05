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
    <AuthorizePopup @register="registerAuthorize" />
    <PortalAuthorizePopup @register="registerPortalAuthorize" />
    <UsersSelectModal @register="registerUsersSelect" :getDataApi="getPermissionMember" :saveDataApi="savePermissionMember" />
  </div>
</template>

<script lang="ts" setup>
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { getList, del, copy, getPermissionMember, savePermissionMember } from '/@/api/permission/permissionGroup';
  import { usePopup } from '/@/components/Popup';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import Form from './Form.vue';
  import AuthorizePopup from './components/AuthorizePopup.vue';
  import PortalAuthorizePopup from './components/PortalAuthorizePopup.vue';
  import UsersSelectModal from './components/UsersSelectModal.vue';

  defineOptions({ name: 'permission-authorize' });

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const columns: BasicColumn[] = [
    { title: '权限组名称', dataIndex: 'fullName', width: 200 },
    { title: '权限组编码', dataIndex: 'enCode', width: 200 },
    { title: '说明', dataIndex: 'description' },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
    { title: '状态', dataIndex: 'enabledMark', width: 70, align: 'center' },
  ];
  const [registerTable, { reload }] = useTable({
    api: getList,
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
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerAuthorize, { openPopup: openAuthorizePopup }] = usePopup();
  const [registerPortalAuthorize, { openPopup: openPortalAuthorizePopup }] = usePopup();
  const [registerUsersSelect, { openModal: registerUsersSelectModal }] = useModal();

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
        label: '权限成员',
        onClick: handleMember.bind(null, record.id),
      },
      {
        label: '权限授权',
        onClick: handleAuthorize.bind(null, record),
      },
      {
        label: '门户授权',
        onClick: handlePortalAuthorize.bind(null, record),
      },
      {
        label: '复制权限',
        modelConfirm: {
          content: '您确定要复制该功能权限, 是否继续?',
          onOk: handleCopy.bind(null, record.id),
        },
      },
    ];
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id });
  }
  function handleDelete(id) {
    del(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleMember(id) {
    registerUsersSelectModal(true, { id });
  }
  function handleAuthorize(record) {
    openAuthorizePopup(true, { id: record.id, fullName: record.fullName + '的权限授权', type: 'Batch' });
  }
  function handlePortalAuthorize(record) {
    openPortalAuthorizePopup(true, { id: record.id, fullName: record.fullName + '的门户权限' });
  }
  function handleCopy(id) {
    copy(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
</script>
