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
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getDataSourceList, delDataSource } from '/@/api/systemData/dataSource';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useModal } from '/@/components/Modal';
  import { onMounted } from 'vue';
  import { useBaseStore } from '/@/store/modules/base';
  import Form from './Form.vue';

  defineOptions({ name: 'systemData-dataSource' });

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const baseStore = useBaseStore();
  const columns: BasicColumn[] = [
    { title: '连接名称', dataIndex: 'fullName' },
    { title: '连接驱动', dataIndex: 'dbType', width: 150 },
    { title: '主机地址', dataIndex: 'host', width: 200 },
    { title: '端口', dataIndex: 'port', width: 60 },
    { title: '创建人', dataIndex: 'creatorUser', width: 120 },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '最后修改时间', dataIndex: 'lastModifyTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '排序', dataIndex: 'sortCode', width: 70 },
  ];
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerTable, { reload, getForm }] = useTable({
    api: getDataSourceList,
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
          field: 'dbType',
          label: '连接驱动',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            fieldNames: { label: 'fullName', value: 'enCode' },
          },
        },
      ],
    },
    actionColumn: {
      width: 100,
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
  function handleDelete(id) {
    delDataSource(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id });
  }
  async function getDictionaryData() {
    const categoryList = (await baseStore.getDictionaryData('dbType')) as any[];
    getForm().updateSchema({ field: 'dbType', componentProps: { options: categoryList } });
  }

  onMounted(() => {
    getDictionaryData();
  });
</script>
