<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'postilCount'">
              <span style="color: #ff5b5b" class="cursor-pointer" @click="addOrUpdateHandle(record.id)"> 批注({{ record.postilCount || 0 }}) </span>
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
  </div>
  <Form @register="registerForm" @reload="reload" />
</template>
<script lang="ts" setup>
  import { onMounted, reactive } from 'vue';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { getTableList } from '/@/api/extend/table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useBaseStore } from '/@/store/modules/base';
  import { useModal } from '/@/components/Modal';
  import Form from './Form.vue';

  defineOptions({ name: 'extend-tableDemo-postilTable' });

  interface State {
    industryTypeList: any[];
  }

  const state = reactive<State>({
    industryTypeList: [],
  });
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
    { title: '表格批注', dataIndex: 'postilCount', width: 100 },
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
  const [registerTable, { reload }] = useTable({
    api: getTableList,
    columns,
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
  });
  const [registerForm, { openModal: openFormModal }] = useModal();

  async function init() {
    state.industryTypeList = (await baseStore.getDictionaryData('IndustryType')) as any[];
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id });
  }

  onMounted(() => init());
</script>
