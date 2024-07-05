<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable" :loading="loading" :key="key">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'enabledMark'">
              <a-tag :color="record.enabledMark == 1 ? 'success' : 'error'">{{ record.enabledMark == 1 ? '启用' : '禁用' }}</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <Form @register="registerForm" @reload="reloadTable" />
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { getAreaList, delArea } from '/@/api/system/area';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { reactive, ref } from 'vue';
  import Form from './Form.vue';

  defineOptions({ name: 'system-task' });

  const { t } = useI18n();
  const key = ref(+new Date());
  const { createMessage } = useMessage();
  const columns: BasicColumn[] = [
    { title: '区域名称', dataIndex: 'fullName' },
    { title: '区域编码', dataIndex: 'enCode' },
    { title: '排序', dataIndex: 'sortCode', width: 70 },
    { title: '状态', dataIndex: 'enabledMark', width: 70 },
  ];
  const [registerForm, { openModal: openFormModal }] = useModal();
  const searchInfo = reactive({
    nodeId: -1,
  });
  const loading = ref(false);
  const [registerTable, { reload }] = useTable({
    api: getAreaList,
    columns,
    searchInfo: { nodeId: -1 },
    isTreeTable: true,
    defaultExpandAllRows: false,
    pagination: false,
    tableSetting: {
      expand: false,
      redo: false,
    },
    afterFetch: data => {
      const list = data.map(o => {
        const obj = o;
        if (obj.hasChildren) obj.children = [];
        return obj;
      });
      return list;
    },
    onExpand: async (expanded, record) => {
      if (expanded) {
        if (record.children?.length) return;
        loading.value = true;
        searchInfo.nodeId = record.id;
        const res = await getAreaList(searchInfo);
        const list = res.data.list.map(o => {
          const obj = o;
          if (obj.hasChildren) obj.children = [];
          return obj;
        });
        loading.value = false;
        record.children = list;
      }
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
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id });
  }
  function handleDelete(id) {
    delArea(id).then(res => {
      createMessage.success(res.msg);
      reloadTable();
    });
  }
  function reloadTable() {
    key.value = +new Date();
    reload();
  }
</script>
