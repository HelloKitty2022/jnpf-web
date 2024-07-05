<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="error" preIcon="icon-ym icon-ym-delete" @click="batchDelete">强制下线</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { getOnlineUser, batchDelOnlineUser, deleteOnlineUser } from '/@/api/permission/onlineUser';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';

  defineOptions({ name: 'permission-userOnline' });

  const { createMessage, createConfirm } = useMessage();
  const { t } = useI18n();
  const columns: BasicColumn[] = [
    { title: '用户', dataIndex: 'userName', width: 120 },
    { title: '所属组织', dataIndex: 'organize', width: 120 },
    { title: 'IP地址', dataIndex: 'loginIPAddress', width: 120 },
    { title: '登录地点', dataIndex: 'loginAddress', width: 120 },
    { title: '浏览器', dataIndex: 'loginBrowser', width: 120 },
    { title: '操作系统', dataIndex: 'loginSystem', width: 120 },
    { title: '登录时间', dataIndex: 'loginTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
  ];
  const [registerTable, { reload, getSelectRowKeys }] = useTable({
    api: getOnlineUser,
    columns,
    rowKey: 'userId',
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
      width: 80,
      title: '操作',
      dataIndex: 'action',
    },
    rowSelection: { type: 'checkbox' },
    clickToRowSelect: false,
  });

  function getTableActions(record): ActionItem[] {
    return [
      {
        label: '强制下线',
        color: 'error',
        modelConfirm: {
          content: '确定要注销该账号?',
          onOk: handleDelete.bind(null, record.userId),
        },
      },
    ];
  }
  function batchDelete() {
    if (!getSelectRowKeys().length) return createMessage.error('请选择一条数据');
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '您确定要强制下线这些用户吗, 是否继续?',
      onOk: () => {
        batchDelOnlineUser(getSelectRowKeys()).then(res => {
          createMessage.success(res.msg);
          reload();
        });
      },
    });
  }
  function handleDelete(id) {
    deleteOnlineUser(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
</script>
