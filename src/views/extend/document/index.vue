<template>
  <div class="jnpf-content-wrapper document-wrapper bg-white">
    <a-tabs v-model:activeKey="activeKey" tab-position="left" class="common-left-tabs">
      <a-tab-pane key="all">
        <template #tab><i class="icon-ym icon-ym-extend-folder-open"></i>全部文档</template>
        <div class="container">
          <Breadcrumb class="!mb-10px">
            <BreadcrumbItem v-if="levelList.length > 1" @click="handleJump(levelList[levelList.length - 2], levelList.length - 2)">
              <a>返回上一级</a>
            </BreadcrumbItem>
            <BreadcrumbItem v-for="(item, i) in levelList" :key="i">
              <span v-if="i + 1 >= levelList.length">{{ item.fullName }}</span>
              <a v-else @click="handleJump(item, i)">{{ item.fullName }}</a>
            </BreadcrumbItem>
          </Breadcrumb>
          <div class="jnpf-common-search-box">
            <BasicForm class="search-form" @register="registerAllForm" @submit="handleAllSubmit" @reset="handleAllReset"></BasicForm>
            <div class="jnpf-common-search-box-right">
              <a-button @click="addFolder()">新建文件夹</a-button>
              <a-button type="primary" preIcon="icon-ym icon-ym-btn-upload" @click="uploadFile()" class="ml-10px">上传文件</a-button>
            </div>
          </div>
          <BasicTable @register="registerAllTable" :searchInfo="allListSearchInfo">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'fullName'">
                <span v-if="record.type">
                  <i :class="'icon-ym ' + toFileExt(record.fileExtension) + ' i-default'" />
                  {{ record.fullName }}
                </span>
                <span class="cursor-pointer" v-else @click="openFolder(record)">
                  <i class="icon-ym icon-ym-extend-folder text-warning" />
                  {{ record.fullName }}
                </span>
              </template>
              <template v-if="column.key === 'isShare'">
                <span v-if="record.type && record.isShare" title="共享文件"><i class="icon-ym icon-ym-extend-thumbs-up i-default"></i></span>
              </template>
              <template v-if="column.key === 'fileSize'">
                {{ toFileSize(record.fileSize) }}
              </template>
              <template v-if="column.key === 'action'">
                <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
              </template>
            </template>
          </BasicTable>
        </div>
      </a-tab-pane>
      <a-tab-pane key="shareOut">
        <template #tab><i class="icon-ym icon-ym-extend-thumbs-up"></i>我的共享</template>
        <div class="container">
          <Breadcrumb class="!mb-10px">
            <BreadcrumbItem>我的共享</BreadcrumbItem>
          </Breadcrumb>
          <BasicTable @register="registerShareOutTable">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'fullName'">
                <i :class="'icon-ym ' + toFileExt(record.fileExtension) + ' i-default'" />
                {{ record.fullName }}
              </template>
              <template v-if="column.key === 'fileSize'">
                {{ toFileSize(record.fileSize) }}
              </template>
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small" color="error" @click="handleUnshare(record.id)" class="!px-0">取消共享</a-button>
              </template>
            </template>
          </BasicTable>
        </div>
      </a-tab-pane>
      <a-tab-pane key="shareTome">
        <template #tab><i class="icon-ym icon-ym-extend-share"></i>共享给我</template>
        <div class="container">
          <Breadcrumb class="!mb-10px">
            <BreadcrumbItem>共享给我</BreadcrumbItem>
          </Breadcrumb>
          <BasicTable @register="registerShareTomeTable">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'fullName'">
                <i :class="'icon-ym ' + toFileExt(record.fileExtension) + ' i-default'" />
                {{ record.fullName }}
              </template>
              <template v-if="column.key === 'fileSize'">
                {{ toFileSize(record.fileSize) }}
              </template>
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small" @click="handleDownload(record.id)" class="!px-0">下载</a-button>
              </template>
            </template>
          </BasicTable>
        </div>
      </a-tab-pane>
      <a-tab-pane key="trash">
        <template #tab><i class="icon-ym icon-ym-extend-trash"></i>回收站</template>
        <div class="container">
          <Breadcrumb class="!mb-10px">
            <BreadcrumbItem>回收站</BreadcrumbItem>
          </Breadcrumb>
          <BasicTable @register="registerTrashTable">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'fullName'">
                <span v-if="record.type">
                  <i :class="'icon-ym ' + toFileExt(record.fileExtension) + ' i-default'" />
                  {{ record.fullName }}
                </span>
                <span v-else>
                  <i class="icon-ym icon-ym-extend-folder text-warning" />
                  {{ record.fullName }}
                </span>
              </template>
              <template v-if="column.key === 'fileSize'">
                {{ toFileSize(record.fileSize) }}
              </template>
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small" @click="handleRecovery(record.id)" class="!px-0">还原</a-button>
                <a-button type="link" color="error" size="small" @click="handleTrashDel(record.id)" class="!px-0 ml-10px">删除</a-button>
              </template>
            </template>
          </BasicTable>
        </div>
      </a-tab-pane>
    </a-tabs>
    <FileUploader ref="fileUploaderRef" :parentId="allListSearchInfo.parentId" @fileSuccess="reloadAllTable({ page: 1 })" />
    <Form @register="registerFormModal" @reload="reloadAllTable()" />
    <UserBox @register="registerUserBox" @reload="reloadAllTable()" />
    <FolderTree @register="registerFolderTree" @reload="reloadAllTable()" />
    <Preview ref="filePreviewRef" />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, toRefs, watch, onMounted, ref, nextTick } from 'vue';
  import { Breadcrumb, BreadcrumbItem } from 'ant-design-vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import { BasicTable, useTable, TableAction, ActionItem } from '/@/components/Table';
  import {
    getAllList,
    download,
    delDocument,
    getShareOutList,
    shareCancel,
    getShareTomeList,
    getTrashList,
    trashRecovery,
    trashDelete,
  } from '/@/api/extend/document';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { toFileSize } from '/@/utils/jnpf';
  import { downloadByUrl } from '/@/utils/file/download';
  import { useModal } from '/@/components/Modal';
  import FileUploader from './FileUploader.vue';
  import Form from './Form.vue';
  import UserBox from './UserBox.vue';
  import FolderTree from './FolderTree.vue';
  import Preview from './Preview.vue';

  interface State {
    activeKey: string;
    levelList: any[];
    parentId: string;
  }

  defineOptions({ name: 'extend-document' });
  const { t } = useI18n();
  const { createMessage, createConfirm } = useMessage();
  const fileUploaderRef = ref<any>(null);
  const filePreviewRef = ref<any>(null);
  const state = reactive<State>({
    activeKey: 'all',
    levelList: [{ id: '0', fullName: '全部文档' }],
    parentId: '0',
  });
  const { activeKey, levelList } = toRefs(state);
  const allListSearchInfo = reactive({
    keyword: '',
    parentId: '0',
  });
  const formConfig: any = {
    baseColProps: { span: 8 },
    schemas: [
      {
        field: 'keyword',
        label: '文件名',
        component: 'Input',
        componentProps: {
          placeholder: '搜索我的文件',
          submitOnPressEnter: true,
        },
      },
    ],
  };
  const [registerFormModal, { openModal: openFormModal }] = useModal();
  const [registerUserBox, { openModal: openUserBox }] = useModal();
  const [registerFolderTree, { openModal: openFolderTree }] = useModal();
  const [registerAllForm, { resetFields }] = useForm({
    baseColProps: { span: 8 },
    showActionButtonGroup: true,
    showAdvancedButton: true,
    compact: true,
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
  });
  const [registerAllTable, { reload: reloadAllTable }] = useTable({
    api: getAllList,
    columns: [
      { title: '文件名', dataIndex: 'fullName' },
      { title: '', dataIndex: 'isShare', width: 35 },
      { title: '大小', dataIndex: 'fileSize', width: 90 },
      { title: '创建日期', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    ],
    showTableSetting: false,
    pagination: false,
    immediate: false,
    resizeHeightOffset: 10,
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
    },
  });
  const [registerShareOutTable, { getForm: getShareOutForm, reload: reloadShareOutTable }] = useTable({
    api: getShareOutList,
    columns: [
      { title: '文件名', dataIndex: 'fullName' },
      { title: '大小', dataIndex: 'fileSize', width: 90 },
      { title: '共享日期', dataIndex: 'shareTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
      { title: '操作', dataIndex: 'action', width: 80 },
    ],
    useSearchForm: true,
    formConfig: formConfig,
    resizeHeightOffset: 10,
    showTableSetting: false,
    pagination: false,
    immediate: false,
  });
  const [registerShareTomeTable, { getForm: getShareTomeForm }] = useTable({
    api: getShareTomeList,
    columns: [
      { title: '文件名', dataIndex: 'fullName' },
      { title: '大小', dataIndex: 'fileSize', width: 90 },
      { title: '共享日期', dataIndex: 'shareTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
      { title: '操作', dataIndex: 'action', width: 50 },
    ],
    useSearchForm: true,
    formConfig: formConfig,
    resizeHeightOffset: 10,
    showTableSetting: false,
    pagination: false,
    immediate: false,
  });
  const [registerTrashTable, { getForm: getTrashForm, reload: reloadTrashTable }] = useTable({
    api: getTrashList,
    columns: [
      { title: '文件名', dataIndex: 'fullName' },
      { title: '大小', dataIndex: 'fileSize', width: 90 },
      { title: '删除日期', dataIndex: 'deleteTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
      { title: '操作', dataIndex: 'action', width: 100 },
    ],
    useSearchForm: true,
    formConfig: formConfig,
    resizeHeightOffset: 10,
    showTableSetting: false,
    pagination: false,
    immediate: false,
  });

  watch(
    () => state.activeKey,
    val => {
      if (val === 'all') {
        state.levelList = [{ id: '0', fullName: '全部文档' }];
        allListSearchInfo.parentId = '0';
        resetFields();
      } else {
        nextTick(() => initData());
      }
    },
  );

  function getTableActions(record): ActionItem[] {
    return [
      {
        label: '下载',
        disabled: !record.type,
        onClick: handleDownload.bind(null, record.id),
      },
      {
        label: t('common.delText'),
        color: 'error',
        modelConfirm: {
          content: '您确定要把所选文件放入回收站, 是否继续?',
          onOk: handleDelete.bind(null, record.id),
        },
      },
    ];
  }
  function getDropDownActions(record): ActionItem[] {
    return [
      {
        label: '预览',
        ifShow: !!record.isPreview,
        onClick: handlePreview.bind(null, record),
      },
      {
        label: '共享',
        ifShow: !!record.type,
        onClick: handleShare.bind(null, record.id),
      },
      {
        label: '重命名',
        onClick: handleRename.bind(null, record.id),
      },
      {
        label: '移动到',
        onClick: handleMoveTo.bind(null, record.id, record.parentId),
      },
    ];
  }
  function handleJump(item, i) {
    allListSearchInfo.parentId = item.id;
    state.levelList = state.levelList.slice(0, i + 1);
    reloadAllTable({ page: 1 });
  }
  function handleAllSubmit(values) {
    allListSearchInfo.keyword = values?.keyword || '';
    allListSearch();
  }
  function handleAllReset() {
    allListSearchInfo.keyword = '';
    allListSearch();
  }
  function allListSearch() {
    reloadAllTable({ page: 1 });
  }
  function uploadFile() {
    fileUploaderRef.value?.openUploader();
  }
  function addFolder() {
    openFormModal(true, { parentId: allListSearchInfo.parentId, id: '' });
  }
  function handleRename(id) {
    openFormModal(true, { parentId: allListSearchInfo.parentId, id });
  }
  function handlePreview(record) {
    const file = {
      name: record.fullName,
      fileId: record.filePath,
      fileVersionId: null,
      url: record.uploaderUrl,
    };
    filePreviewRef.value?.init(file);
  }
  function handleShare(id) {
    openUserBox(true, { id });
  }
  function handleMoveTo(id, parentId) {
    openFolderTree(true, { id, parentId });
  }
  function openFolder(record) {
    allListSearchInfo.parentId = record.id;
    state.levelList.push(record);
    reloadAllTable({ page: 1 });
  }
  function toFileExt(ext) {
    if (ext) ext = ext.replace('.', '');
    if (ext == 'doc' || ext == 'docx') {
      return 'icon-ym-file-word';
    }
    if (ext == 'xls' || ext == 'xlsx') {
      return 'icon-ym-file-excel';
    }
    if (ext == 'ppt' || ext == 'pptx') {
      return 'icon-ym-file-ppt';
    }
    if (ext == 'rar' || ext == 'zip') {
      return 'icon-ym-file-zip';
    }
    if (ext == 'txt' || ext == 'log') {
      return 'icon-ym-file-text';
    }
    if (ext == 'html' || ext == 'cs' || ext == 'xml') {
      return 'icon-ym-file-code';
    }
    if (ext == 'gif' || ext == 'jpg' || ext == 'jpeg' || ext == 'bmp' || ext == 'png') {
      return 'icon-ym-file-image1';
    }
    if (ext == 'pdf') {
      return 'icon-ym-file-pdf';
    }
    if (ext == 'mp3') {
      return 'icon-ym-file-audio';
    }
    if (ext == 'mp4') {
      return 'icon-ym-file-movie';
    }
    return 'icon-ym-file-blank';
  }
  function handleDownload(id) {
    download(id).then(res => {
      downloadByUrl({ url: res.data.url, fileName: res.data.name });
    });
  }
  function handleDelete(id) {
    delDocument(id).then(res => {
      createMessage.success(res.msg).then(() => {
        reloadAllTable({ page: 1 });
      });
    });
  }
  function handleUnshare(id) {
    createConfirm({
      iconType: 'warning',
      title: '提示',
      content: '您确定要取消共享, 是否继续?',
      onOk: () => {
        shareCancel(id).then(res => {
          createMessage.success(res.msg).then(() => {
            reloadShareOutTable();
          });
        });
      },
    });
  }
  function handleRecovery(id) {
    createConfirm({
      iconType: 'warning',
      title: '提示',
      content: '您确定要还原选中的文件?',
      onOk: () => {
        trashRecovery(id).then(res => {
          createMessage.success(res.msg).then(() => {
            reloadTrashTable();
          });
        });
      },
    });
  }
  function handleTrashDel(id) {
    createConfirm({
      iconType: 'warning',
      title: '提示',
      content: '文件删除后将无法恢复，您确定要彻底删除所选文件吗?',
      onOk: () => {
        trashDelete(id).then(res => {
          createMessage.success(res.msg).then(() => {
            reloadTrashTable();
          });
        });
      },
    });
  }
  function initData() {
    if (state.activeKey === 'all') return handleAllReset();
    if (state.activeKey === 'shareOut') return getShareOutForm().resetFields();
    if (state.activeKey === 'shareTome') return getShareTomeForm().resetFields();
    if (state.activeKey === 'trash') return getTrashForm().resetFields();
  }

  onMounted(() => {
    initData();
  });
</script>

<style lang="less" scoped>
  .document-wrapper {
    padding: 10px;
    :deep(.ant-table-container) {
      .ant-table-cell::before {
        display: none !important;
      }
    }
    :deep(.common-left-tabs) {
      width: 100%;
      .ant-tabs-tab {
        .icon-ym {
          font-size: 14px;
          margin-right: 8px;
        }
      }
      .ant-tabs-content-holder {
        width: 100% !important;
        .ant-tabs-content-left {
          height: 100%;
          & > .ant-tabs-tabpane {
            padding-left: 10px;
            height: 100%;
          }
        }
      }
      .container {
        height: 100%;
        overflow: hidden;
        padding-top: 10px;
        .icon-ym {
          font-size: 14px;
        }
      }
    }
    .jnpf-common-search-box {
      padding-left: 10px;
      margin-bottom: 10px;
      .jnpf-common-search-box-right {
        right: 0;
        top: 10px;
      }
    }
  }
</style>
