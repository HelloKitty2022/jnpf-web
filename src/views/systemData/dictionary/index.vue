<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-left">
      <BasicLeftTree
        title="字典分类"
        ref="leftTreeRef"
        :treeData="treeData"
        :loading="treeLoading"
        @reload="reloadTree"
        @select="handleTreeSelect"
        :dropDownActions="leftDropDownActions" />
    </div>
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable" :searchInfo="searchInfo" :tableSetting="tableSetting">
          <template #tableTitle>
            <a-button
              type="primary"
              preIcon="icon-ym icon-ym-btn-add"
              @click="addOrUpdateHandle()"
              :disabled="searchInfo.typeId === '0' || searchInfo.typeId === '1'">
              {{ t('common.addText') }}
            </a-button>
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
    <TypeList @register="registerDrawer" @visible-change="onVisibleChange" />
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref, onMounted, nextTick } from 'vue';
  import { BasicLeftTree, TreeItem, TreeActionType } from '/@/components/Tree';
  import { getDictionaryType, getDictionaryDataList, delDictionaryData } from '/@/api/systemData/dictionary';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import { useBaseStore } from '/@/store/modules/base';
  import Form from './Form.vue';
  import TypeList from './components/index.vue';

  defineOptions({ name: 'systemData-dictionary' });

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerDrawer, { openDrawer }] = useDrawer();

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
  const leftDropDownActions = [
    {
      label: '分类管理',
      onClick: handleTypeManage,
    },
  ];
  const leftTreeRef = ref<Nullable<TreeActionType>>(null);
  const treeLoading = ref(false);
  const treeData = ref<TreeItem[]>([]);
  const [registerTable, { reload, setLoading, getForm }] = useTable({
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
          componentProps: {
            placeholder: t('common.enterKeyword'),
            submitOnPressEnter: true,
          },
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
  function initData(isInit = false) {
    treeLoading.value = true;
    if (isInit) setLoading(true);
    getDictionaryType().then(res => {
      treeData.value = res.data.list;
      nextTick(() => {
        if (isInit) {
          searchInfo.typeId = unref(treeData)[0].id;
          searchInfo.isTree = unref(treeData)[0].isTree;
        }
        const leftTree = unref(leftTreeRef);
        leftTree?.setSelectedKeys([searchInfo.typeId]);
        tableSetting.expand = !!searchInfo.isTree;
        if (isInit) searchInfo.typeId && reload();
        treeLoading.value = false;
      });
    });
  }
  function reloadTree() {
    treeData.value = [];
    initData();
  }
  function handleTreeSelect(id) {
    if (!id || searchInfo.typeId === id) return;
    searchInfo.typeId = id;
    const leftTree = unref(leftTreeRef);
    const selectedNode = leftTree?.getSelectedNode(searchInfo.typeId);
    searchInfo.isTree = (selectedNode as TreeItem).isTree;
    tableSetting.expand = !!searchInfo.isTree;
    getForm().resetFields();
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
  function handleTypeManage() {
    openDrawer(true);
  }
  function onVisibleChange(visible: boolean) {
    if (!visible) reloadTree();
  }

  onMounted(() => {
    initData(true);
  });
</script>
