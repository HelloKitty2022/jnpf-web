<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-left">
      <BasicLeftTree
        title="项目分类"
        ref="leftTreeRef"
        :treeData="industryTypeList"
        :loading="treeLoading"
        @reload="reloadTree"
        @select="handleTreeSelect"
        showToolbar />
    </div>
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, toRefs, nextTick, ref, unref } from 'vue';
  import { BasicLeftTree, TreeActionType } from '/@/components/Tree';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { getTableListByType } from '/@/api/extend/table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useBaseStore } from '/@/store/modules/base';

  defineOptions({ name: 'extend-tableDemo-treeTable' });

  interface State {
    industryTypeList: any[];
    treeLoading: boolean;
  }

  const state = reactive<State>({
    industryTypeList: [],
    treeLoading: false,
  });
  const { industryTypeList, treeLoading } = toRefs(state);
  const leftTreeRef = ref<Nullable<TreeActionType>>(null);
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const columns: BasicColumn[] = [
    { title: '项目名称', dataIndex: 'projectName', width: 200 },
    { title: '项目编码', dataIndex: 'projectCode', width: 160 },
    {
      title: '项目类型',
      dataIndex: 'projectType',
      width: 120,
      customRender: ({ record }) => {
        let item = state.industryTypeList.filter(o => o.id == record.projectType)[0];
        return item && item.fullName ? item.fullName : '';
      },
    },
    { title: '项目阶段', dataIndex: 'projectPhase', width: 120 },
    { title: '客户名称', dataIndex: 'customerName', width: 200 },
    { title: '负责人', dataIndex: 'principal', width: 80 },
    { title: '立项人', dataIndex: 'jackStands', width: 80 },
    { title: '交互时间', dataIndex: 'interactionDate', width: 100, format: 'date|YYYY-MM-DD' },
    { title: '费用金额', dataIndex: 'costAmount', width: 100 },
    { title: '已用金额', dataIndex: 'tunesAmount', width: 100 },
    { title: '预计收入', dataIndex: 'projectedIncome', width: 100 },
    { title: '登记人', dataIndex: 'registrant', width: 80 },
    { title: '登记时间', dataIndex: 'registerDate', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '备注', dataIndex: 'description', width: 100 },
  ];
  const searchInfo = reactive({
    typeId: '',
  });
  const [registerTable, { reload, setLoading, getForm }] = useTable({
    api: getTableListByType,
    columns,
    searchInfo,
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
      ],
    },
  });

  async function init(isInit = false) {
    state.treeLoading = true;
    if (isInit) setLoading(true);
    const list = (await baseStore.getDictionaryData('IndustryType')) as any[];
    list.map(o => {
      o.children = [];
      return o;
    });
    state.industryTypeList = list;
    nextTick(() => {
      if (isInit) searchInfo.typeId = state.industryTypeList[0].id;
      const leftTree = unref(leftTreeRef);
      leftTree?.setSelectedKeys([searchInfo.typeId]);
      if (isInit) searchInfo.typeId && reload();
      state.treeLoading = false;
    });
  }
  function reloadTree() {
    state.industryTypeList = [];
    init();
  }
  function handleTreeSelect(id) {
    if (!id || searchInfo.typeId === id) return;
    searchInfo.typeId = id;
    getForm().resetFields();
  }

  onMounted(() => init(true));
</script>
