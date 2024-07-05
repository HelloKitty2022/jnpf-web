<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-left">
      <BasicLeftTree
        title="组织机构"
        :treeData="treeData"
        :loading="treeLoading"
        @reload="reloadTree"
        @select="handleTreeSelect"
        :dropDownActions="leftDropDownActions" />
    </div>
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable" :searchInfo="searchInfo" ref="tableRef">
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
    <OrgTree @register="registerOrgTree" />
    <Member @register="registerMember" />
    <GlobalMember @register="registerGlobalMember" />
    <PermissionPopup @register="registerPermission" />
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref, onMounted } from 'vue';
  import { BasicLeftTree, TreeItem } from '/@/components/Tree';
  import { getRoleList, delRole } from '/@/api/permission/role';
  import { getDepartmentSelectorByAuth } from '/@/api/permission/organize';
  import { BasicTable, useTable, TableAction, BasicColumn, FormProps, ActionItem } from '/@/components/Table';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { usePopup } from '/@/components/Popup';
  import { useOrganizeStore } from '/@/store/modules/organize';
  import Form from './Form.vue';
  import Member from './Member.vue';
  import GlobalMember from './GlobalMember.vue';
  import OrgTree from '../user/OrgTree.vue';
  import PermissionPopup from '../organize/Permission.vue';

  defineOptions({ name: 'permission-role' });

  const userStore = useUserStore();
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const organizeStore = useOrganizeStore();
  const [registerMember, { openModal: openMemberModal }] = useModal();
  const [registerGlobalMember, { openModal: openGlobalMemberModal }] = useModal();
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerOrgTree, { openPopup: openOrgTreePopup }] = usePopup();
  const [registerPermission, { openPopup: openPermissionPopup }] = usePopup();

  const columns: BasicColumn[] = [
    { title: '角色名称', dataIndex: 'fullName', width: 200 },
    { title: '角色编码', dataIndex: 'enCode', width: 150 },
    { title: '角色类型', dataIndex: 'type', width: 90, align: 'center' },
    { title: '所属组织', dataIndex: 'organizeInfo' },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
    { title: '状态', dataIndex: 'enabledMark', width: 70, align: 'center' },
  ];
  const searchInfo = reactive({
    organizeId: '',
  });
  const leftDropDownActions = [
    {
      label: '架构图',
      onClick: openOrgTreePopup.bind(null, true, {}),
    },
  ];
  const treeLoading = ref(false);
  const treeData = ref<TreeItem[]>([]);
  const [registerTable, { reload, setLoading, getForm }] = useTable({
    api: getRoleList,
    columns,
    immediate: false,
    useSearchForm: true,
    formConfig: getFormConfig(),
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
    },
  });

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
          label: '角色类型',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            options: [
              { fullName: '全局', id: 1 },
              { fullName: '组织', id: 0 },
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
    };
  }
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
    if (!record.enabledMark) return [];
    return [
      {
        label: '角色成员',
        onClick: viewMember.bind(null, record),
      },
      {
        label: '查看权限',
        onClick: handlePermission.bind(null, record.id, record.fullName),
      },
    ];
  }
  function handlePermission(id, fullName) {
    openPermissionPopup(true, { id, fullName, objectType: 'role' });
  }
  function initData(isInit = false) {
    treeLoading.value = true;
    if (isInit) setLoading(true);
    getDepartmentSelectorByAuth().then(res => {
      if (userStore.getUserInfo?.isAdministrator) {
        const globalItem = {
          fullName: '全局',
          hasChildren: false,
          id: '0',
          parentId: '-1',
          icon: 'icon-ym icon-ym-global-role',
        };
        treeData.value = [...res.data.list, globalItem];
      } else {
        treeData.value = res.data.list;
      }
      treeLoading.value = false;
      if (isInit) reload({ page: 1 });
    });
  }
  function reloadTree() {
    treeData.value = [];
    initData();
  }
  function handleTreeSelect(id) {
    if (!id || searchInfo.organizeId === id) return;
    searchInfo.organizeId = id;
    getForm().resetFields();
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id });
  }
  function handleDelete(id) {
    delRole(id).then(res => {
      createMessage.success(res.msg);
      organizeStore.resetState();
      reload();
    });
  }
  function viewMember(record) {
    const { id, fullName, type } = record;
    type === '全局' ? openGlobalMemberModal(true, { id, fullName, type: 'Role' }) : openMemberModal(true, { id, fullName });
  }

  onMounted(() => {
    initData(true);
  });
</script>
