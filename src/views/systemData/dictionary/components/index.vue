<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" title="字典分类管理" width="700px" class="full-drawer" destroy-on-close>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
        <jnpf-upload-btn url="/api/system/DictionaryData/Actions/Import" accept=".bdd" @on-success="reload"></jnpf-upload-btn>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'isTree'">
          <a-tag :color="record.isTree == 1 ? 'success' : 'error'">{{ record.isTree == 1 ? '是' : '否' }}</a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <TableAction :actions="getTableActions(record)" />
        </template>
      </template>
    </BasicTable>
  </BasicDrawer>
  <BasicForm @register="registerForm" @reload="reload" />
</template>
<script lang="ts" setup>
  import { getDictionaryType, delDictionaryType, exportData } from '/@/api/systemData/dictionary';
  import BasicForm from './Form.vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useBaseStore } from '/@/store/modules/base';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { downloadByUrl } from '/@/utils/file/download';

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const [registerDrawer, {}] = useDrawerInner();
  const [registerForm, { openModal: openFormModal }] = useModal();
  const columns: BasicColumn[] = [
    {
      title: '名称',
      dataIndex: 'fullName',
    },
    {
      title: '编码',
      dataIndex: 'enCode',
    },
    {
      title: '排序',
      dataIndex: 'sortCode',
      width: 70,
      align: 'center',
    },
    {
      title: '是否树',
      dataIndex: 'isTree',
      width: 70,
      align: 'center',
    },
  ];
  const [registerTable, { reload }] = useTable({
    api: getDictionaryType,
    columns,
    pagination: false,
    isTreeTable: true,
    resizeHeightOffset: -10,
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
    },
  });

  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id });
  }
  function getTableActions(record): ActionItem[] {
    if (record.id === '0' || record.id === '1') return [];
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
      {
        label: t('common.exportText'),
        modelConfirm: {
          onOk: handleExport.bind(null, record.id),
          content: '您确定要导出该字典分类, 是否继续?',
        },
      },
    ];
  }
  function handleDelete(id) {
    delDictionaryType(id).then(res => {
      createMessage.success(res.msg);
      baseStore.setDictionaryList();
      reload();
    });
  }
  function handleExport(id) {
    exportData(id).then(res => {
      downloadByUrl({ url: res.data.url });
    });
  }
</script>
