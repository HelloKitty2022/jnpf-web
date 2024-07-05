<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable" :searchInfo="searchInfo" :tableSetting="tableSetting">
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
    <Form @register="registerForm" @reload="reload" />
  </div>
</template>
<script lang="ts" setup>
  import { reactive, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { getDictionaryDataList, delDictionaryData } from '/@/api/systemData/dictionary';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { useBaseStore } from '/@/store/modules/base';
  import Form from './Form.vue';

  defineOptions({ name: 'dynamic-dictionary' });

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const route = useRoute();
  const [registerForm, { openModal: openFormModal }] = useModal();

  const columns: BasicColumn[] = [
    { title: '名称', dataIndex: 'fullName' },
    { title: '编码', dataIndex: 'enCode' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
    { title: '状态', dataIndex: 'enabledMark', width: 70, align: 'center' },
  ];
  const searchInfo = reactive({
    typeId: '',
    isTree: 0,
  });
  const tableSetting = reactive({
    expand: false,
  });
  const [registerTable, { reload }] = useTable({
    api: getDictionaryDataList,
    columns,
    immediate: false,
    pagination: false,
    isTreeTable: true,
    useSearchForm: true,
    formConfig: {
      schemas: [
        {
          field: 'keyword',
          label: t('common.keyword'),
          component: 'Input',
          componentProps: { placeholder: t('common.enterKeyword'), submitOnPressEnter: true },
          colProps: { span: 6 },
        },
      ],
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
    openFormModal(true, {
      id,
      ...searchInfo,
    });
  }
  function handleDelete(id) {
    delDictionaryData(id).then(res => {
      createMessage.success(res.msg);
      baseStore.setDictionaryList();
      reload();
    });
  }
  onMounted(() => {
    const { meta } = route;
    searchInfo.typeId = meta.relationId as string;
    searchInfo.isTree = (meta.isTree as number) || 0;
    tableSetting.expand = !!searchInfo.isTree;
    searchInfo.typeId && reload();
    reload();
  });
</script>
