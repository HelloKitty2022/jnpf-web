<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
            <jnpf-upload-btn url="/api/visualdev/Portal/Actions/Import" accept=".vp" @on-success="reload"></jnpf-upload-btn>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'isRelease'">
              <a-tag :color="record.isRelease === 1 ? 'success' : record.isRelease == 2 ? 'warning' : ''">
                {{ record.isRelease == 1 ? '已发布' : record.isRelease == 2 ? '已修改' : '未发布' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <Form @register="registerForm" @reload="reload" @design="handleDesignFun" />
    <PortalDesign @register="registerPortalDesign" @reload="reload" />
    <ReleaseModal @register="registerReleaseModal" @reload="reload" />
    <PreviewModal @register="registerPreviewModal" @previewPc="previewPc" />
    <Preview @register="registerPreview" />
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { getPortalList, delPortal, copyPortal, exportPortal } from '/@/api/onlineDev/portal';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { useBaseStore } from '/@/store/modules/base';
  import Form from './Form.vue';
  import PortalDesign from '/@/components/VisualPortal/Design/index.vue';
  import ReleaseModal from './components/ReleaseModal.vue';
  import { downloadByUrl } from '/@/utils/file/download';
  import Preview from '/@/components/VisualPortal/Design/components/Preview.vue';
  import { PreviewModal } from '/@/components/CommonModal';

  defineOptions({ name: 'onlineDev-webDesign' });

  const { createMessage } = useMessage();
  const baseStore = useBaseStore();
  const { t } = useI18n();
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerPortalDesign, { openModal: openPortalDesign }] = useModal();
  const [registerReleaseModal, { openModal: openReleaseModal }] = useModal();
  const [registerPreviewModal, { openModal: openPreviewModal }] = useModal();
  const [registerPreview, { openModal: openPreview }] = useModal();

  const columns: BasicColumn[] = [
    { title: '名称', dataIndex: 'fullName', width: 200 },
    { title: '编码', dataIndex: 'enCode', width: 180 },
    { title: '分类', dataIndex: 'category', width: 100 },
    { title: '类型', dataIndex: 'type', width: 100, align: 'center', customRender: ({ record }) => (record.type === 1 ? '配置路径' : '门户设计') },
    {
      title: '锁定',
      dataIndex: 'enabledLock',
      width: 100,
      align: 'center',
      customRender: ({ record }) => (record.type === 1 ? '' : record.enabledLock === 1 ? '是' : '否'),
    },
    { title: '创建人', dataIndex: 'creatorUser', width: 120 },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '最后修改时间', dataIndex: 'lastModifyTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
    { title: '发布状态', dataIndex: 'isRelease', width: 80, align: 'center' },
  ];
  const typeList = [
    { fullName: '配置路径', id: 1 },
    { fullName: '门户设计', id: 0 },
  ];
  const enabledLockList = [
    { fullName: '是', id: 1 },
    { fullName: '否', id: 0 },
  ];
  const categoryList = ref<any[]>([]);
  const [registerTable, { reload, getForm }] = useTable({
    api: getPortalList,
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
            showSearch: true,
          },
        },
        {
          field: 'type',
          label: '类型',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            showSearch: true,
            options: typeList,
          },
        },
        {
          field: 'enabledLock',
          label: '锁定',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            showSearch: true,
            options: enabledLockList,
          },
        },
        {
          field: 'isRelease',
          label: '发布状态',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            options: [
              { fullName: '未发布', id: 0 },
              { fullName: '已发布', id: 1 },
              { fullName: '已修改', id: 2 },
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
        label: '发布',
        onClick: handleRelease.bind(null, record),
      },
      {
        label: '设计',
        ifShow: record.type === 0,
        onClick: handleDesign.bind(null, record),
      },
      {
        label: '预览',
        onClick: handlePreview.bind(null, record.id),
      },
      {
        label: '复制',
        modelConfirm: {
          content: '您确定要复制该门户, 是否继续?',
          onOk: handleCopy.bind(null, record.id),
        },
      },
      {
        label: '导出',
        modelConfirm: {
          content: '您确定要导出该门户, 是否继续?',
          onOk: handleExport.bind(null, record.id),
        },
      },
    ];
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id, categoryList });
  }
  function handleDelete(id) {
    delPortal(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleRelease(record) {
    openReleaseModal(true, record);
  }
  function handleDesign(record) {
    openPortalDesign(true, record);
  }
  function handleDesignFun(item) {
    handleDesign(item);
  }
  function handlePreview(id) {
    openPreviewModal(true, { type: 'portal', id });
  }
  function previewPc({ id }) {
    openPreview(true, { id });
  }
  function handleCopy(id) {
    copyPortal(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleExport(id) {
    exportPortal(id).then(res => {
      downloadByUrl({ url: res.data.url });
    });
  }
  async function getOptions() {
    const res = await baseStore.getDictionaryData('portalDesigner');
    categoryList.value = res as any[];
    getForm().updateSchema({ field: 'category', componentProps: { options: res } });
  }

  onMounted(() => {
    getOptions();
  });
</script>
