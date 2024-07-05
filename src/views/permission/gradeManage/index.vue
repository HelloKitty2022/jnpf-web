<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <Form @register="registerForm" @reload="reload" />
  </div>
</template>
<script lang="ts" setup>
  import { getGradeManageList, delGradeManage } from '/@/api/permission/gradeManage';
  import { BasicTable, useTable, TableAction, BasicColumn, FormProps, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import Form from './Form.vue';

  defineOptions({ name: 'permission-grade' });

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerForm, { openModal: openFormModal }] = useModal();

  const columns: BasicColumn[] = [
    { title: '管理组', dataIndex: 'managerGroup', width: 200 },
    { title: '账号', dataIndex: 'account', width: 100 },
    { title: '姓名', dataIndex: 'realName', width: 100 },
    { title: '性别', dataIndex: 'gender', width: 90, align: 'center' },
    { title: '手机', dataIndex: 'mobilePhone', width: 120 },
    { title: '所属组织', dataIndex: 'organizeId' },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
  ];
  const [registerTable, { reload }] = useTable({
    api: getGradeManageList,
    columns,
    useSearchForm: true,
    formConfig: getFormConfig(),
    actionColumn: {
      width: 100,
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
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id });
  }
  function handleDelete(id) {
    delGradeManage(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
</script>
