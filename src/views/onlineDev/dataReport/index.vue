<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
            <jnpf-upload-btn :url="reportServer + '/Data/Actions/Import'" accept=".json" @on-success="reload"></jnpf-upload-btn>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'enabledMark'">
              <a-tag :color="record.enabledMark === 1 ? 'success' : 'error'">{{ record.enabledMark == 1 ? '启用' : '禁用' }}</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <PreviewModal @register="registerPreview" type="flow" @previewPc="previewPc" />
    <Form @register="registerForm" @reload="reload" />
    <PreviewPopup @register="registerPreviewPopup" />
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { getDataReportList, delDataReport, copy, release } from '/@/api/onlineDev/dataReport';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { usePopup } from '/@/components/Popup';
  import { useBaseStore } from '/@/store/modules/base';
  import { downloadByUrl } from '/@/utils/file/download';
  import { useGlobSetting } from '/@/hooks/setting';
  import { getToken } from '/@/utils/auth';
  import { PreviewModal } from '/@/components/CommonModal';
  import Form from './Form.vue';
  import PreviewPopup from './PreviewPopup.vue';

  defineOptions({ name: 'onlineDev-webDesign' });

  const { createMessage } = useMessage();
  const baseStore = useBaseStore();
  const { t } = useI18n();
  const [registerPreview, { openModal: openPreviewModal }] = useModal();
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerPreviewPopup, { openPopup: openPreviewPopup }] = usePopup();

  const columns: BasicColumn[] = [
    { title: '名称', dataIndex: 'fullName', width: 200 },
    { title: '编码', dataIndex: 'enCode', width: 200 },
    { title: '分类', dataIndex: 'category', width: 150 },
    { title: '创建人', dataIndex: 'creatorUser', width: 120 },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '最后修改时间', dataIndex: 'lastModifyTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
    { title: '状态', dataIndex: 'enabledMark', width: 70, align: 'center' },
  ];
  const { reportServer } = useGlobSetting();
  const currRow = ref<any>({});
  const categoryList = ref<any[]>([]);
  const [registerTable, { reload, getForm }] = useTable({
    api: getDataReportList,
    columns,
    useSearchForm: true,
    immediate: false,
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
    afterFetch: data => {
      const list = data.map(o => {
        let category = '';
        const arr = categoryList.value.filter(category => category.id == o.categoryId);
        if (arr.length) {
          const item = arr[0];
          category = item && item.fullName ? item.fullName : '';
        }
        return { ...o, category };
      });
      return list;
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
        label: '预览',
        onClick: handlePreview.bind(null, record),
      },
      {
        label: '复制',
        modelConfirm: {
          content: '您确定要复制该报表, 是否继续?',
          onOk: handleCopy.bind(null, record.id),
        },
      },
      {
        label: '导出',
        modelConfirm: {
          content: '您确定要导出该报表, 是否继续?',
          onOk: handleExport.bind(null, record.id),
        },
      },
      {
        ifShow: !record.enabledMark,
        label: '启用',
        modelConfirm: {
          content: '此操作将启用该报表，是否继续?',
          onOk: handleRelease.bind(null, record),
        },
      },
      {
        ifShow: !!record.enabledMark,
        label: '禁用',
        modelConfirm: {
          content: '此操作将禁用该报表，是否继续?',
          onOk: handleRelease.bind(null, record),
        },
      },
    ];
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id });
  }
  function handlePreview(record) {
    currRow.value = record;
    openPreviewModal(true, { type: 'report', id: record.id, fullName: record.fullName });
  }
  function previewPc() {
    openPreviewPopup(true, { id: currRow.value.id });
  }
  function handleDelete(id) {
    delDataReport(id).then(res => {
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
  function handleExport(id) {
    const token = getToken();
    const url = `${reportServer}/Data/${id}/Actions/Export?token=${token}`;
    downloadByUrl({ url });
  }
  async function getOptions() {
    const res = await baseStore.getDictionaryData('ReportSort');
    categoryList.value = res as any[];
    getForm().updateSchema({ field: 'category', componentProps: { options: res } });
    reload();
  }
  function handleRelease(record) {
    release(record.id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }

  onMounted(() => {
    getOptions();
  });
</script>
