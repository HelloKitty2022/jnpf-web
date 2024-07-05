<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-dropdown>
              <template #overlay>
                <a-menu @click="handleAdd">
                  <a-menu-item key="company">新建公司</a-menu-item>
                  <a-menu-item key="department">新建部门</a-menu-item>
                </a-menu>
              </template>
              <a-button type="primary" preIcon="icon-ym icon-ym-btn-add">{{ t('common.addText') }}<DownOutlined /></a-button>
            </a-dropdown>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'fullName'"><i :class="'mr-6px ' + record.icon"></i>{{ record.fullName }}</template>
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <Form @register="registerForm" @reload="reload" />
    <DepForm @register="registerDepForm" @reload="reload" />
    <Member @register="registerMember" />
    <PermissionPopup @register="registerPermission" />
  </div>
</template>
<script lang="ts" setup>
  import { getOrganizeList, delOrganize } from '/@/api/permission/organize';
  import { BasicTable, useTable, TableAction, BasicColumn, FormProps, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { usePopup } from '/@/components/Popup';
  import { useOrganizeStore } from '/@/store/modules/organize';
  import Form from './Form.vue';
  import DepForm from './DepForm.vue';
  import Member from './Member.vue';
  import { DownOutlined } from '@ant-design/icons-vue';
  import PermissionPopup from '../organize/Permission.vue';

  defineOptions({ name: 'permission-organize' });

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const organizeStore = useOrganizeStore();
  const [registerDepForm, { openModal: openDepFormModal }] = useModal();
  const [registerMember, { openModal: openMemberModal }] = useModal();
  const [registerForm, { openPopup: openFormPopup }] = usePopup();
  const [registerPermission, { openPopup: openPermissionPopup }] = usePopup();

  const columns: BasicColumn[] = [
    { title: '名称', dataIndex: 'fullName' },
    { title: '编码', dataIndex: 'enCode' },
    { title: '层级', dataIndex: 'index', width: 100, align: 'center' },
    { title: '类型', dataIndex: 'type', width: 100, align: 'center', customRender: ({ record }) => (record.type === 'company' ? '公司' : '部门') },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
  ];
  const [registerTable, { reload }] = useTable({
    api: getOrganizeList,
    columns,
    isTreeTable: true,
    useSearchForm: true,
    pagination: false,
    formConfig: getFormConfig(),
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
    },
    afterFetch: data => setTableIndex(data),
  });
  // 树形列表index层级
  function setTableIndex(arr, index = 0) {
    arr.forEach(item => {
      item.index = 1;
      if (index) item.index = index + 1;
      if (item.children) setTableIndex(item.children, item.index);
    });
  }
  function getFormConfig(): Partial<FormProps> {
    return {
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
          componentProps: {
            placeholder: '请选择',
            options: [
              { fullName: '公司', id: 'company' },
              { fullName: '部门', id: 'department' },
            ],
          },
        },
      ],
    };
  }
  function getTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.editText'),
        onClick: addOrUpdateHandle.bind(null, record.id, record.type, record.parentId),
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
        label: '查看成员',
        onClick: viewMember.bind(null, record.id, record.fullName),
      },
      {
        label: '查看权限',
        onClick: handlePermission.bind(null, record.id, record.fullName, record.type),
      },
    ];
  }
  function handlePermission(id, fullName, objectType) {
    openPermissionPopup(true, { id, fullName, objectType });
  }
  function handleAdd({ key }) {
    addOrUpdateHandle('', key);
  }
  function addOrUpdateHandle(id = '', type, parentId = '') {
    const openMethod = type === 'company' ? openFormPopup : openDepFormModal;
    openMethod(true, { id, parentId });
  }
  function handleDelete(id) {
    delOrganize(id).then(res => {
      createMessage.success(res.msg);
      organizeStore.resetState();
      reload();
    });
  }
  function viewMember(id, fullName) {
    openMemberModal(true, { id, fullName });
  }
</script>
