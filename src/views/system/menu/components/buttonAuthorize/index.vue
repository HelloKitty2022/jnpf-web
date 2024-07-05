<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" :title="title" :width="700" class="full-drawer">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
        <a-dropdown>
          <template #overlay>
            <a-menu>
              <a-menu-item v-for="(item, i) in btnList" :key="i" @click="handleAdd(item)">{{ item.fullName }}</a-menu-item>
            </a-menu>
          </template>
          <a-button type="link" :loading="loading" preIcon="icon-ym icon-ym-btn-add">常用按钮权限<DownOutlined /></a-button>
        </a-dropdown>
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
  </BasicDrawer>
  <Form @register="registerForm" @reload="reload" />
</template>
<script lang="ts" setup>
  import { getButtonAuthorizeList, del, create } from '/@/api/system/buttonAuthorize';
  import { reactive, toRefs, nextTick } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { DownOutlined } from '@ant-design/icons-vue';
  import Form from './Form.vue';

  interface State {
    id: string;
    title: string;
    loading: boolean;
  }

  const state = reactive<State>({
    id: '',
    title: '',
    loading: false,
  });
  const { title, loading } = toRefs(state);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerDrawer, {}] = useDrawerInner(init);
  const [registerForm, { openModal: openFormModal }] = useModal();
  const btnList = [
    { fullName: '新增', id: 'btn_add' },
    { fullName: '编辑', id: 'btn_edit' },
    { fullName: '详情', id: 'btn_detail' },
    { fullName: '删除', id: 'btn_remove' },
    { fullName: '批量删除', id: 'btn_batchRemove' },
    { fullName: '批量打印', id: 'btn_batchPrint' },
    { fullName: '复制', id: 'btn_copy' },
    { fullName: '导入', id: 'btn_upload' },
    { fullName: '导出', id: 'btn_download' },
  ];
  const columns: BasicColumn[] = [
    { title: '按钮名称', dataIndex: 'fullName', width: 160 },
    { title: '按钮编码', dataIndex: 'enCode' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
    { title: '状态', dataIndex: 'enabledMark', width: 70, align: 'center' },
  ];
  const searchInfo = reactive({
    id: '',
  });
  const [registerTable, { reload }] = useTable({
    api: getButtonAuthorizeList,
    searchInfo,
    columns,
    pagination: false,
    immediate: false,
    showIndexColumn: false,
    actionColumn: {
      width: 100,
      title: '操作',
      dataIndex: 'action',
    },
  });

  function init(data) {
    state.id = data.id;
    state.title = `按钮权限 - ${data.fullName}`;
    searchInfo.id = data.id;
    nextTick(() => {
      reload();
    });
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
        disabled: record.isMain == 1,
        modelConfirm: {
          onOk: handleDelete.bind(null, record.id),
        },
      },
    ];
  }
  function handleDelete(id) {
    del(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { moduleId: state.id, id });
  }
  function handleAdd(item) {
    state.loading = true;
    let query = {
      parentId: '-1',
      moduleId: state.id,
      fullName: item.fullName,
      enCode: item.id,
      sortCode: 0,
      icon: '',
      enabledMark: 1,
      description: '',
    };
    create(query)
      .then(res => {
        createMessage.success(res.msg);
        reload();
        state.loading = false;
      })
      .catch(() => {
        state.loading = false;
      });
  }
</script>
