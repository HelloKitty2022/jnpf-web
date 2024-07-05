<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable" @row-click="handleRowClick">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
          </template>
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.flag === 'INDEX'">
              <span>{{ index + 1 }}</span>
            </template>
            <template v-else>
              <template v-if="state.tabClickId == record.id">
                <jnpf-date-picker v-if="column.key === 'interactionDate'" v-model:value="record[column.key]" format="YYYY-MM-DD" allowClear />
                <span v-else-if="column.key === 'registrant'">{{ record[column.key] }}</span>
                <span v-else-if="column.key === 'registerDate'"> {{ record[column.key] ? dayjs(record[column.key]).format('YYYY-MM-DD HH:mm:ss') : '' }}</span>
                <jnpf-select v-else-if="column.key === 'projectType'" v-model:value="record[column.key]" :options="state.industryTypeList" />
                <template v-else-if="column.key === 'action'">
                  <TableAction :actions="getTableActions(record)" />
                </template>
                <a-input v-else v-model:value="record[column.key]" />
              </template>
              <template v-else>
                <span v-if="column.key === 'interactionDate'">{{ record[column.key] ? dayjs(record[column.key]).format('YYYY-MM-DD') : '' }}</span>
                <span v-else-if="column.key === 'registerDate'">{{ record[column.key] ? dayjs(record[column.key]).format('YYYY-MM-DD HH:mm:ss') : '' }}</span>
                <span v-else-if="column.key === 'projectType'">
                  {{
                    state.industryTypeList.filter(o => o.id == record.projectType)[0]
                      ? state.industryTypeList.filter(o => o.id == record.projectType)[0].fullName
                      : ''
                  }}
                </span>
                <span v-else>{{ record[column.key] }}</span>
              </template>
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
  import { getTableList, delTable, updateTableRow } from '/@/api/extend/table';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useBaseStore } from '/@/store/modules/base';
  import Form from '../commonForm/index.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import dayjs from 'dayjs';

  defineOptions({ name: 'extend-tableDemo-redactTable' });

  interface State {
    industryTypeList: any[];
    tabClickId: string;
  }

  const state = reactive<State>({
    industryTypeList: [],
    tabClickId: '',
  });
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const { createMessage, createConfirm } = useMessage();
  const columns: BasicColumn[] = [
    { title: '项目名称', dataIndex: 'projectName', width: 200 },
    { title: '项目编码', dataIndex: 'projectCode', width: 160 },
    { title: '项目类型', dataIndex: 'projectType', width: 120 },
    { title: '项目阶段', dataIndex: 'projectPhase', width: 120 },
    { title: '客户名称', dataIndex: 'customerName', width: 200 },
    { title: '负责人', dataIndex: 'principal', width: 80 },
    { title: '立项人', dataIndex: 'jackStands', width: 80 },
    { title: '交互时间', dataIndex: 'interactionDate', width: 100 },
    { title: '费用金额', dataIndex: 'costAmount', width: 100 },
    { title: '已用金额', dataIndex: 'tunesAmount', width: 100 },
    { title: '预计收入', dataIndex: 'projectedIncome', width: 100 },
    { title: '登记人', dataIndex: 'registrant', width: 80 },
    { title: '登记时间', dataIndex: 'registerDate', width: 150 },
    { title: '备注', dataIndex: 'description', width: 100 },
    { title: '操作', dataIndex: 'action', width: 100 },
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
  });
  function handleRowClick(item) {
    state.tabClickId = item.id;
  }
  function handleUpdate(row) {
    updateTableRow(row).then(res => {
      createMessage.success(res.msg);
      state.tabClickId = '';
    });
  }
  function handleDel(id) {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: t('common.tipTitle'),
      onOk: () => {
        delTable(id).then(res => {
          reload();
          createMessage.success(res.msg);
        });
      },
    });
  }
  function getTableActions(record): ActionItem[] {
    return [
      { label: '保存', onClick: handleUpdate.bind(null, record) },
      { label: '删除', color: 'error', onClick: handleDel.bind(null, record.id) },
    ];
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id, industryTypeList: state.industryTypeList });
  }
  async function init() {
    state.industryTypeList = (await baseStore.getDictionaryData('IndustryType')) as any[];
  }

  onMounted(() => init());
</script>
