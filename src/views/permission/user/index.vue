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
            <a-button type="link" @click="handleExport"><i class="icon-ym icon-ym-btn-download button-preIcon"></i>{{ t('common.exportText') }}</a-button>
            <a-button type="link" @click="handleImport"><i class="icon-ym icon-ym-btn-upload button-preIcon"></i>{{ t('common.importText') }}</a-button>
            <a-button type="link" @click="handleSync"><i class="icon-ym icon-ym-synForThird button-preIcon"></i>{{ t('common.syncText') }}</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'enabledMark'">
              <a-tag :color="record.enabledMark == 1 ? 'success' : record.enabledMark == 2 ? 'warning' : 'error'">
                {{ record.enabledMark == 1 ? '启用' : record.enabledMark == 2 ? '锁定' : '禁用' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'action' && !record.isAdministrator">
              <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <Form @register="registerForm" @reload="reload" />
    <ResetPassword @register="registerPsdModal" />
    <OrgTree @register="registerOrgTree" />
    <SocialsBind @register="registerSocialsBind" />
    <ExportModal @register="registerExportModal" />
    <ImportModal @register="registerImportModal" @reload="reload" />
    <WorkHandoverModal @register="registerWorkHandoverModal" @reload="reload" />
    <PermissionPopup @register="registerPermission" />
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref, onMounted } from 'vue';
  import { BasicLeftTree, TreeItem } from '/@/components/Tree';
  import { getUserList, unlockUser, delUser } from '/@/api/permission/user';
  import { getDepartmentSelectorByAuth } from '/@/api/permission/organize';
  import { BasicTable, useTable, TableAction, BasicColumn, FormProps, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { usePopup } from '/@/components/Popup';
  import Form from './Form.vue';
  import ResetPassword from './ResetPassword.vue';
  import OrgTree from './OrgTree.vue';
  import SocialsBind from './SocialsBind.vue';
  import ExportModal from './ExportModal.vue';
  import ImportModal from './ImportModal.vue';
  import WorkHandoverModal from './WorkHandoverModal.vue';
  import { createLocalStorage } from '/@/utils/cache';
  import { useRouter } from 'vue-router';
  import PermissionPopup from '../organize/Permission.vue';
  import { useBaseStore } from '/@/store/modules/base';

  defineOptions({ name: 'permission-user' });

  const { createMessage } = useMessage();
  const baseStore = useBaseStore();
  const { t } = useI18n();
  const router = useRouter();
  const ls = createLocalStorage();
  const [registerPsdModal, { openModal: openPsdModal }] = useModal();
  const [registerExportModal, { openModal: openExportModal }] = useModal();
  const [registerImportModal, { openModal: openImportModal }] = useModal();
  const [registerWorkHandoverModal, { openModal: openWorkHandoverModal }] = useModal();
  const [registerForm, { openPopup: openFormPopup }] = usePopup();
  const [registerOrgTree, { openPopup: openOrgTreePopup }] = usePopup();
  const [registerSocialsBind, { openPopup: openSocialsBindPopup }] = usePopup();
  const [registerPermission, { openPopup: openPermissionPopup }] = usePopup();

  const columns: BasicColumn[] = [
    { title: '账号', dataIndex: 'account', width: 100 },
    { title: '姓名', dataIndex: 'realName', width: 100 },
    { title: '性别', dataIndex: 'gender', width: 90, align: 'center' },
    { title: '手机', dataIndex: 'mobilePhone', width: 120 },
    { title: '所属组织', dataIndex: 'organize' },
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
  const organizeIdTree = ref([]);
  const [registerTable, { reload, setLoading, getForm, getFetchParams }] = useTable({
    api: getUserList,
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
          field: 'gender',
          label: '性别',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            fieldNames: { value: 'enCode' },
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
              { fullName: '锁定', id: 2 },
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
    return [
      {
        label: '重置密码',
        onClick: handleResetPwd.bind(null, record.id, record.account),
      },
      {
        label: '解除锁定',
        ifShow: record.enabledMark === 2,
        modelConfirm: {
          title: '解除锁定',
          content: '此操作将解除该账户锁定, 是否继续?',
          onOk: handleUnlock.bind(null, record.id),
        },
      },
      {
        label: '绑定管理',
        ifShow: !!ls.get('useSocials'),
        onClick: handleSocialsBind.bind(null, record.id),
      },
      {
        disabled: record.enabledMark == 1 || record.enabledMark == 2,
        label: '工作交接',
        onClick: handleWorkHandover.bind(null, record),
      },
      {
        label: '查看权限',
        onClick: handlePermission.bind(null, record.id, record.realName),
      },
    ];
  }
  function handlePermission(id, fullName) {
    openPermissionPopup(true, { id, fullName, objectType: 'user' });
  }
  function initData(isInit = false) {
    treeLoading.value = true;
    if (isInit) setLoading(true);
    getDepartmentSelectorByAuth().then(res => {
      treeData.value = res.data.list;
      treeLoading.value = false;
      if (isInit) reload({ page: 1 });
    });
  }
  function reloadTree() {
    treeData.value = [];
    initData();
  }
  function handleTreeSelect(id, _node, nodePath) {
    if (!id || searchInfo.organizeId === id) return;
    searchInfo.organizeId = id;
    organizeIdTree.value = nodePath.map(o => o.id);
    getForm().resetFields();
  }
  function addOrUpdateHandle(id = '') {
    openFormPopup(true, { id, organizeIdTree: organizeIdTree.value || [] });
  }
  function handleDelete(id) {
    delUser(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleResetPwd(id, account) {
    openPsdModal(true, { id, account });
  }
  function handleSocialsBind(id) {
    openSocialsBindPopup(true, { id });
  }
  function handleWorkHandover(record) {
    openWorkHandoverModal(true, { userInfo: record });
  }
  function handleUnlock(id) {
    unlockUser(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleExport() {
    const listQuery = {
      ...getFetchParams(),
      organizeId: getFetchParams().organizeId || '',
      keyword: getFetchParams().keyword || '',
    };
    openExportModal(true, { listQuery });
  }
  function handleImport() {
    openImportModal(true, {});
  }
  function handleSync() {
    router.push('/system/sysConfig?type=1');
  }
  async function initOptions() {
    const sexRes = await baseStore.getDictionaryData('sex');
    getForm().updateSchema({ field: 'gender', componentProps: { options: sexRes } });
  }

  onMounted(() => {
    initData(true);
    initOptions();
  });
</script>
