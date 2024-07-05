<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" title="常用字段管理" width="700px" class="full-drawer">
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
  </BasicDrawer>
  <Form @register="registerForm" @reload="reload" />
</template>
<script lang="ts" setup>
  import { getCommonFieldsList, delCommonFields } from '/@/api/systemData/commonFields';
  import { h } from 'vue';
  import { Checkbox } from 'ant-design-vue';
  import Form from './Form.vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerDrawer, {}] = useDrawerInner();
  const [registerForm, { openModal: openFormModal }] = useModal();
  const columns: BasicColumn[] = [
    {
      title: '列名',
      dataIndex: 'field',
    },
    {
      title: '说明',
      dataIndex: 'fieldName',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'dataType',
      width: 80,
    },
    {
      title: '长度',
      dataIndex: 'dataLength',
      width: 60,
    },
    {
      title: '允许空',
      dataIndex: 'allowNull',
      width: 60,
      align: 'center',
      customRender: ({ record }) => {
        return h(Checkbox, { checked: record.allowNull === 1 });
      },
    },
  ];
  const typeOptions: any[] = [
    { fullName: '字符串', id: 'varchar' },
    { fullName: '整型', id: 'int' },
    { fullName: '日期时间', id: 'datetime' },
    { fullName: '浮点', id: 'decimal' },
    { fullName: '长整型', id: 'bigint' },
    { fullName: '文本', id: 'text' },
  ];
  const [registerTable, { reload }] = useTable({
    api: getCommonFieldsList,
    columns,
    pagination: false,
    resizeHeightOffset: -10,
    actionColumn: {
      width: 100,
      title: '操作',
      dataIndex: 'action',
    },
    afterFetch: data => {
      const list = data.map(o => ({
        ...o,
        dataType: getTypeText(o.dataType),
      }));
      return list;
    },
  });
  function getTypeText(type) {
    let item = typeOptions.filter(o => o.id == type)[0];
    return item && item.fullName ? item.fullName : '';
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
    delCommonFields(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
</script>
