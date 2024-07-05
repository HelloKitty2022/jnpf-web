<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" title="提取变量" class="full-popup">
    <div class="jnpf-content-wrapper-search-box pl-10px mt-10px">
      <BasicForm class="search-form" @register="registerSearchForm" @submit="handleSubmit" @reset="handleReset" />
    </div>
    <BasicTable @register="registerTable" :columns="menuTableColumns" :searchInfo="getSearchInfo">
      <template #tableTitle>
        <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
        <jnpf-upload-btn url="/api/system/DataInterfaceVariate/Actions/Import" accept=".ffa" @on-success="reload"></jnpf-upload-btn>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'icon'">
          <i :class="record.icon + ' table-icon'" />
        </template>
        <template v-if="column.key === 'enabledMark'">
          <a-tag :color="record.enabledMark == 1 ? 'success' : 'error'">{{ record.enabledMark == 1 ? '启用' : '禁用' }}</a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
        </template>
      </template>
    </BasicTable>
    <Form @register="registerForm" @reload="reload" />
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { computed, reactive, nextTick, unref } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { getList, copy, del, exportData } from '/@/api/systemData/variate';
  import { useModal } from '/@/components/Modal';
  import { downloadByUrl } from '/@/utils/file/download';
  import Form from './Form.vue';

  interface State {
    listQuery: any;
    id: string;
  }

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const state = reactive<State>({
    listQuery: {
      keyword: '',
    },
    id: '',
  });

  const getSearchInfo = computed(() => ({ id: unref(state.id), keyword: state.listQuery.keyword }));

  const menuTableColumns: BasicColumn[] = [
    { title: '变量名', dataIndex: 'fullName', width: 260 },
    { title: '变量值', dataIndex: 'value', width: 260 },
    { title: '创建人', dataIndex: 'creatorUser', width: 100 },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '最后修改时间', dataIndex: 'lastModifyTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
  ];
  const [registerPopup] = usePopupInner(init);
  const [registerSearchForm] = useForm({
    baseColProps: { span: 6 },
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
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerTable, { reload }] = useTable({
    api: getList,
    searchInfo: getSearchInfo,
    immediate: false,
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
    },
    pagination: false,
  });

  function init(data) {
    state.id = data.id;
    state.listQuery.keyword = '';
    nextTick(() => reload({ page: 1 }));
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
  function getDropDownActions(record): ActionItem[] {
    return [
      {
        label: '复制',
        modelConfirm: {
          content: '您确定要复制该功能模板, 是否继续?',
          onOk: handleCopy.bind(null, record.id),
        },
      },
      {
        label: '导出',
        modelConfirm: {
          content: '您确定要导出该变量, 是否继续?',
          onOk: handleExport.bind(null, record.id),
        },
      },
    ];
  }
  function handleSubmit(values) {
    state.listQuery.keyword = values?.keyword || '';
    handleSearch();
  }
  function handleReset() {
    state.listQuery.keyword = '';
    handleSearch();
  }
  function handleSearch() {
    nextTick(() => reload());
  }
  function handleDelete(id) {
    del(id).then(res => {
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
    exportData(id).then(res => {
      downloadByUrl({ url: res.data.url });
    });
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id, interfaceId: state.id });
  }
</script>
<style lang="less" scoped>
  .jnpf-content-wrapper-search-box {
    border-bottom: 1px solid @border-color-base;
  }
</style>
