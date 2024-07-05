<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
            <jnpf-upload-btn url="/api/system/BillRule/Actions/Import" accept=".bb" @on-success="reload"></jnpf-upload-btn>
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
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { getBillRuleList, delBillRule, exportTpl } from '/@/api/system/billRule';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { downloadByUrl } from '/@/utils/file/download';
  import { useBaseStore } from '/@/store/modules/base';
  import Form from './Form.vue';

  defineOptions({ name: 'system-task' });

  const { t } = useI18n();
  const baseStore = useBaseStore();
  const { createMessage } = useMessage();
  const categoryList = ref<any[]>([]);
  const columns: BasicColumn[] = [
    { title: '业务名称', dataIndex: 'fullName' },
    { title: '业务编码', dataIndex: 'enCode', width: 200 },
    { title: '业务分类', dataIndex: 'category', width: 150 },
    { title: '当前流水号', dataIndex: 'outputNumber', width: 200 },
    { title: '创建人', dataIndex: 'creatorUser', width: 120 },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '最后修改时间', dataIndex: 'lastModifyTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
    { title: '状态', dataIndex: 'enabledMark', width: 70, align: 'center' },
  ];
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerTable, { reload, getForm }] = useTable({
    api: getBillRuleList,
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
          field: 'categoryId',
          label: '业务分类',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
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
  function getDropDownActions(record): ActionItem[] {
    return [
      {
        label: '导出',
        modelConfirm: {
          content: '您确定要导出该单据模板, 是否继续?',
          onOk: handleExport.bind(null, record.id),
        },
      },
    ];
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id, categoryList: categoryList.value });
  }
  function handleExport(id) {
    exportTpl(id).then(res => {
      downloadByUrl({ url: res.data.url });
    });
  }
  function handleDelete(id) {
    delBillRule(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  async function getOptions() {
    categoryList.value = (await baseStore.getDictionaryData('businessType')) as any[];
    getForm().updateSchema({ field: 'categoryId', componentProps: { options: categoryList.value } });
  }

  onMounted(() => {
    getOptions();
  });
</script>
