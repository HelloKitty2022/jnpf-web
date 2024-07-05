<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
          </template>
          <template #bodyCell="{ column, record }">
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
  import { onMounted, reactive } from 'vue';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { getTableList, delTable } from '/@/api/extend/table';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useBaseStore } from '/@/store/modules/base';
  import Form from '../commonForm/index.vue';

  defineOptions({ name: 'extend-tableDemo-commonTable' });

  interface State {
    industryTypeList: any[];
  }

  const state = reactive<State>({
    industryTypeList: [],
  });
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const { createMessage } = useMessage();
  const columns: BasicColumn[] = [
    { title: '项目名称', dataIndex: 'projectName', width: 80 },
    {
      title: '项目类型',
      dataIndex: 'projectType',
      width: 100,
      customRender: ({ record }) => {
        let item = state.industryTypeList.filter(o => o.id == record.projectType)[0];
        return item && item.fullName ? item.fullName : '';
      },
    },
    { title: '项目编码', dataIndex: 'projectCode', width: 80 },
    { title: '项目阶段', dataIndex: 'projectPhase', width: 80 },
    { title: '客户名称', dataIndex: 'customerName', width: 80 },
    { title: '负责人', dataIndex: 'principal', width: 80 },
    { title: '立项人', dataIndex: 'jackStands', width: 80 },
    { title: '交互时间', dataIndex: 'interactionDate', width: 90, format: 'date|YYYY-MM-DD' },
    { title: '费用金额', dataIndex: 'costAmount', width: 80 },
    { title: '已用金额', dataIndex: 'tunesAmount', width: 80 },
    { title: '预计收入', dataIndex: 'projectedIncome', width: 80 },
    { title: '登记人', dataIndex: 'registrant', width: 80 },
    { title: '登记时间', dataIndex: 'registerDate', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '备注', dataIndex: 'description', width: 80 },
  ];
  const [registerForm, { openModal: openFormModal }] = useModal();
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
    openFormModal(true, { id, industryTypeList: state.industryTypeList });
  }
  function handleDelete(id) {
    delTable(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  async function init() {
    state.industryTypeList = (await baseStore.getDictionaryData('IndustryType')) as any[];
  }

  onMounted(() => init());
</script>
