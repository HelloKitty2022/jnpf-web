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
              <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <Form @register="registerForm" @reload="reload" />
    <DownloadModal @register="registerDownloadModal" />
    <PreviewModal @register="registerPreviewModal" />
  </div>
</template>
<script lang="ts" setup>
  import { reactive, onMounted, ref } from 'vue';
  import { getVisualDevList, delVisualDev, copy } from '/@/api/onlineDev/visualDev';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { useBaseStore } from '/@/store/modules/base';
  import Form from './Form.vue';
  import DownloadModal from '../DownloadModal.vue';
  import PreviewModal from '../PreviewModal.vue';

  defineOptions({ name: 'generator-webForm' });

  const { createMessage } = useMessage();
  const baseStore = useBaseStore();
  const { t } = useI18n();
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerDownloadModal, { openModal: openDownloadModal }] = useModal();
  const [registerPreviewModal, { openModal: openPreviewModal }] = useModal();

  const columns: BasicColumn[] = [
    { title: '名称', dataIndex: 'fullName', width: 200 },
    { title: '编码', dataIndex: 'enCode', width: 200 },
    { title: '分类', dataIndex: 'category', width: 150 },
    {
      title: '类型',
      dataIndex: 'enableFlow',
      width: 100,
      align: 'center',
      customRender: ({ record }) => {
        return record.enableFlow == 1 ? '流程表单' : '普通表单';
      },
    },
    { title: '创建人', dataIndex: 'creatorUser', width: 120 },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '最后修改时间', dataIndex: 'lastModifyTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
  ];
  const categoryList = ref<any[]>([]);
  const searchInfo = reactive({
    type: 4,
  });
  const [registerTable, { reload, getForm }] = useTable({
    api: getVisualDevList,
    columns,
    searchInfo,
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
            showSearch: true,
          },
        },
        {
          field: 'enableFlow',
          label: '类型',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            options: [
              { fullName: '普通表单', id: 0 },
              { fullName: '流程表单', id: 1 },
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
        label: '复制模板',
        modelConfirm: {
          content: '您确定要复制该功能模板, 是否继续?',
          onOk: handleCopy.bind(null, record.id),
        },
      },
      {
        label: '下载代码',
        onClick: handleDownload.bind(null, record),
      },
      {
        label: '预览代码',
        onClick: handlePreview.bind(null, record),
      },
    ];
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id, ...searchInfo, categoryList });
  }
  function handleDelete(id) {
    delVisualDev(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleCopy(id) {
    copy(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleDownload(record) {
    openDownloadModal(true, { tables: record.tables, id: record.id, hasPackage: record.hasPackage });
  }
  function handlePreview(record) {
    openPreviewModal(true, { tables: record.tables, id: record.id });
  }
  async function getOptions() {
    const res = await baseStore.getDictionaryData('webForm');
    categoryList.value = res as any[];
    getForm().updateSchema({ field: 'category', componentProps: { options: res } });
  }

  onMounted(() => {
    getOptions();
  });
</script>
