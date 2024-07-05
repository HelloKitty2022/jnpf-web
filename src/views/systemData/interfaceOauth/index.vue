<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'usefulLife'"> </template>
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
    <Empower @register="registerEmpower" />
    <UserSelect @register="registerUserSelect" />
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getInterfaceOauthList, delInterfaceOauth } from '/@/api/systemData/interfaceOauth';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePopup } from '/@/components/Popup';
  import { useModal } from '/@/components/Modal';
  import { onMounted } from 'vue';
  import { formatToDate } from '/@/utils/dateUtil';
  import Form from './Form.vue';
  import Log from './Log.vue';
  import Empower from './components/Empower.vue';
  import UserSelect from './components/UserSelect.vue';

  defineOptions({ name: 'systemData-interfaceOauth' });

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const columns: BasicColumn[] = [
    { title: 'appId', dataIndex: 'appId', width: 250 },
    { title: '应用名称', dataIndex: 'appName' },
    {
      title: '使用期限',
      dataIndex: 'usefulLife',
      width: 120,
      customRender: ({ record }) => {
        return record.usefulLife ? formatToDate(record.usefulLife) : '永久';
      },
    },
    { title: '创建人', dataIndex: 'creatorUser', width: 120 },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '最后修改时间', dataIndex: 'lastModifyTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '排序', dataIndex: 'sortCode', width: 70 },
    { title: '状态', dataIndex: 'enabledMark', width: 70 },
  ];
  const [registerForm, { openPopup: openFormPopup }] = usePopup();
  const [registerLog, { openPopup: openLogPopup }] = usePopup();
  const [registerEmpower, { openModal: openEmpowerModel }] = useModal();
  const [registerUserSelect, { openModal: openUserSelectModel }] = useModal();
  const [registerTable, { reload }] = useTable({
    api: getInterfaceOauthList,
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
  function getDropDownActions(record) {
    return [
      {
        label: t('common.detailText'),
        onClick: handleDetail.bind(null, record.id),
      },
      {
        label: '日志',
        onClick: handleLog.bind(null, record),
      },
      {
        label: '授权',
        onClick: handleAuth.bind(null, record.id),
      },
      {
        label: '用户',
        onClick: handleUser.bind(null, record.id),
      },
    ];
  }
  function handleDetail(id) {
    openFormPopup(true, { id, isDetail: 1 });
  }
  function handleLog(record) {
    openLogPopup(true, { id: record.id, appName: record.appName });
  }
  function handleAuth(id) {
    openEmpowerModel(true, { id });
  }
  function handleUser(id) {
    openUserSelectModel(true, { id });
  }
  function handleDelete(id) {
    delInterfaceOauth(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function addOrUpdateHandle(id = '') {
    openFormPopup(true, { id });
  }

  onMounted(() => {});
</script>
