<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
            <jnpf-upload-btn url="/api/system/printDev/Actions/Import" accept=".bp" @on-success="reload"></jnpf-upload-btn>
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
    <Preview @register="registerPreview" />
    <Log @register="registerLog" />
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { getPrintDevList, delPrintDev, copy, exportData } from '/@/api/system/printDev';
  import { useModal } from '/@/components/Modal';
  import { usePopup } from '/@/components/Popup';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { downloadByUrl } from '/@/utils/file/download';
  import { useBaseStore } from '/@/store/modules/base';
  import Form from './Form.vue';
  import Preview from './Preview.vue';
  import Log from './Log.vue';

  defineOptions({ name: 'system-printDev' });

  const { t } = useI18n();
  const baseStore = useBaseStore();
  const { createMessage } = useMessage();
  const categoryList = ref<any[]>([]);
  const columns: BasicColumn[] = [
    { title: '名称', dataIndex: 'fullName' },
    { title: '编码', dataIndex: 'enCode', width: 200 },
    { title: '分类', dataIndex: 'category', width: 150 },
    { title: '创建人', dataIndex: 'creatorUser', width: 120 },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '最后修改时间', dataIndex: 'lastModifyTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
    { title: '状态', dataIndex: 'enabledMark', width: 70, align: 'center' },
  ];
  const [registerTable, { reload, getForm }] = useTable({
    api: getPrintDevList,
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
          field: 'category',
          label: '分类',
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
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerPreview, { openModal: openPreviewModal }] = useModal();
  const [registerLog, { openPopup: openLogPopup }] = usePopup();

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
        label: '复制',
        modelConfirm: {
          content: '您确定要复制该打印模板, 是否继续?',
          onOk: handleCopy.bind(null, record.id),
        },
      },
      {
        label: '预览',
        onClick: handlePreview.bind(null, record.id),
      },
      {
        label: '导出',
        modelConfirm: {
          content: '您确定要导出该打印模板, 是否继续?',
          onOk: handleExport.bind(null, record.id),
        },
      },
      {
        label: '日志',
        onClick: handleShowLog.bind(null, record),
      },
    ];
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id, categoryList: categoryList.value });
  }
  function handleExport(id) {
    exportData(id).then(res => {
      downloadByUrl({ url: res.data.url });
    });
  }
  function handleShowLog(record) {
    openLogPopup(true, { id: record.id, title: record.fullName });
  }
  function handleCopy(id) {
    copy(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handlePreview(id) {
    openPreviewModal(true, { id });
  }
  function handleDelete(id) {
    delPrintDev(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  async function getOptions() {
    categoryList.value = (await baseStore.getDictionaryData('printDev')) as any[];
    getForm().updateSchema({ field: 'category', componentProps: { options: categoryList.value, fieldNames: { value: 'enCode' } } });
  }

  onMounted(() => {
    getOptions();
  });
</script>
