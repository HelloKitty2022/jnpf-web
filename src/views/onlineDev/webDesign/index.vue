<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="openAddModal()">{{ t('common.addText') }}</a-button>
            <jnpf-upload-btn url="/api/visualdev/OnlineDev/Actions/Import" accept=".vdd" @on-success="reload"></jnpf-upload-btn>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'isRelease'">
              <a-tag :color="record.isRelease == 1 ? 'success' : record.isRelease == 2 ? 'warning' : ''">
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
    <Form @register="registerForm" @reload="reload" />
    <ViewForm @register="registerViewForm" @reload="reload" />
    <AddModal @register="registerAdd" @select="handleAdd" />
    <ReleaseModal @register="registerReleaseModal" @reload="reload" />
    <ShortLinkModal @register="registerShortLink" @reload="reload" />
    <EngineForm @register="registerEngineForm" />
    <VersionManage @register="registerVersionManage" />
    <PreviewModal @register="registerPreview" />
  </div>
</template>
<script lang="ts" setup>
  import { reactive, onMounted, ref } from 'vue';
  import { getVisualDevList, delVisualDev, copy, exportData } from '/@/api/onlineDev/visualDev';
  import { getFlowByFormId } from '/@/api/workFlow/formDesign';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { usePopup } from '/@/components/Popup';
  import { useBaseStore } from '/@/store/modules/base';
  import Form from './Form.vue';
  import ViewForm from './ViewForm.vue';
  import AddModal from './components/AddModal.vue';
  import ReleaseModal from './components/ReleaseModal.vue';
  import ShortLinkModal from './components/ShortLinkModal.vue';
  import VersionManage from '/@/views/workFlow/flowEngine/VersionManage.vue';
  import EngineForm from '/@/views/workFlow/flowEngine/Form.vue';
  import { downloadByUrl } from '/@/utils/file/download';
  import { PreviewModal } from '/@/components/CommonModal';

  defineOptions({ name: 'onlineDev-webDesign' });

  const { createMessage } = useMessage();
  const baseStore = useBaseStore();
  const { t } = useI18n();
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerViewForm, { openModal: openViewFormModal }] = useModal();
  const [registerAdd, { openModal: openAddModal }] = useModal();
  const [registerReleaseModal, { openModal: openReleaseModal }] = useModal();
  const [registerShortLink, { openModal: openShortLinkModal }] = useModal();
  const [registerEngineForm, { openModal: openEngineFormModal }] = useModal();
  const [registerPreview, { openModal: openPreviewModal }] = useModal();
  const [registerVersionManage, { openPopup: openVersionManagePopup }] = usePopup();

  const columns: BasicColumn[] = [
    { title: '名称', dataIndex: 'fullName', width: 200 },
    { title: '编码', dataIndex: 'enCode', width: 200 },
    { title: '分类', dataIndex: 'category', width: 150 },
    {
      title: '类型',
      dataIndex: 'webType',
      width: 100,
      align: 'center',
      customRender: ({ record }) => {
        return record.webType == 4 ? '数据视图' : record.enableFlow ? '流程表单' : '普通表单';
      },
    },
    { title: '创建人', dataIndex: 'creatorUser', width: 120 },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '最后修改时间', dataIndex: 'lastModifyTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
    { title: '状态', dataIndex: 'isRelease', width: 80, align: 'center' },
  ];
  const categoryList = ref<any[]>([]);
  const enginCategoryList = ref<any[]>([]);
  const searchInfo = reactive({
    type: 1,
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
          field: 'webType',
          label: '类型',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            options: [
              { fullName: '普通表单', id: 1 },
              { fullName: '流程表单', id: 2 },
              { fullName: '数据视图', id: 4 },
            ],
          },
        },
        {
          field: 'isRelease',
          label: '状态',
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
        onClick: addOrUpdateHandle.bind(null, record.id, record.webType),
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
        label: '流程设计',
        ifShow: !!record.enableFlow,
        onClick: handleEngine.bind(null, record.id),
      },
      {
        label: '流程版本',
        ifShow: !!record.enableFlow,
        onClick: handleVersionManage.bind(null, record.id, record.fullName),
      },
      {
        label: '设计预览',
        onClick: handlePreview.bind(null, record.id, 0),
      },
      {
        label: '发布表单',
        onClick: handleRelease.bind(null, record),
      },
      {
        label: '发布预览',
        ifShow: record.enabledMark === 1,
        onClick: handlePreview.bind(null, record.id, 1),
      },
      {
        label: '复制表单',
        modelConfirm: {
          content: '您确定要复制该功能表单, 是否继续?',
          onOk: handleCopy.bind(null, record.id),
        },
      },
      {
        label: '导出表单',
        modelConfirm: {
          content: '您确定要导出该功能表单, 是否继续?',
          onOk: handleExport.bind(null, record.id),
        },
      },
      {
        label: '外链设置',
        ifShow: record.webType != 4 && !record.enableFlow,
        onClick: openShortLink.bind(null, record.id),
      },
    ];
  }
  function addOrUpdateHandle(id = '', webType) {
    if (webType == 4) return openViewFormModal(true, { id, ...searchInfo, categoryList });
    openFormModal(true, { id, ...searchInfo, categoryList });
  }
  function handleDelete(id) {
    delVisualDev(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleEngine(id) {
    getFlowByFormId(id).then(res => {
      const flowId = res.data && res.data.id;
      if (!flowId) return;
      openEngineFormModal(true, { id: flowId, type: 1, categoryList: enginCategoryList.value, formId: id });
    });
  }
  function handleVersionManage(id, fullName) {
    openVersionManagePopup(true, { id, fullName, type: 1 });
  }
  function handleRelease(record) {
    openReleaseModal(true, record);
  }
  function handlePreview(id, previewType) {
    openPreviewModal(true, { type: 'webDesign', id, previewType });
  }
  function openShortLink(id) {
    openShortLinkModal(true, { id });
  }
  function handleCopy(id) {
    copy(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleExport(id) {
    exportData(id).then(res => {
      downloadByUrl({ url: res.data.url });
    });
  }
  async function getOptions() {
    const res = await baseStore.getDictionaryData('webDesign');
    categoryList.value = res as any[];
    getForm().updateSchema({ field: 'category', componentProps: { options: res } });
    enginCategoryList.value = (await baseStore.getDictionaryData('WorkFlowCategory')) as any[];
  }
  function handleAdd(webType) {
    addOrUpdateHandle('', webType);
  }

  onMounted(() => {
    getOptions();
  });
</script>
