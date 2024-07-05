<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag color="success" v-if="record.status == 2">审核通过</a-tag>
              <a-tag color="error" v-else-if="record.status == 3">审核退回</a-tag>
              <a-tag v-else-if="record.status == 4 || record.status == 7">流程撤回</a-tag>
              <a-tag v-else-if="record.status == 5">审核终止</a-tag>
              <a-tag color="processing" v-else>等待审核</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <FlowParser @register="registerFlowParser" @reload="reload" />
  </div>
</template>
<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { getFlowBeforeList } from '/@/api/workFlow/flowBefore';
  import { getTreeList, getFlowList } from '/@/api/workFlow/flowEngine';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { usePopup } from '/@/components/Popup';
  import { useBaseStore } from '/@/store/modules/base';
  import FlowParser from '/@/views/workFlow/components/FlowParser.vue';
  import { useDefineSetting } from '/@/hooks/setting/useDefineSetting';
  import dayjs from 'dayjs';

  defineOptions({ name: 'workFlow-flowCirculate' });

  const { createMessage } = useMessage();
  const baseStore = useBaseStore();
  const { t } = useI18n();
  const { flowUrgentList, getUrgentText } = useDefineSetting();
  const [registerFlowParser, { openPopup: openFlowParser }] = usePopup();

  const columns: BasicColumn[] = [
    { title: '流程标题', dataIndex: 'fullName', width: 200 },
    { title: '所属流程', dataIndex: 'flowName', width: 150 },
    { title: '发起时间', dataIndex: 'startTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '发起人员', dataIndex: 'userName', width: 120 },
    { title: '审批节点', dataIndex: 'thisStep', width: 150 },
    { title: '紧急程度', dataIndex: 'flowUrgent', width: 100, align: 'center' },
    { title: '流程状态', dataIndex: 'status', width: 120, align: 'center' },
    { title: '抄送时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
  ];
  const [registerTable, { reload, getForm }] = useTable({
    api: getFlowBeforeList,
    columns,
    searchInfo: { category: 3 },
    useSearchForm: true,
    formConfig: {
      schemas: [
        {
          field: 'keyword',
          label: t('common.keyword'),
          component: 'Input',
          componentProps: { placeholder: t('common.enterKeyword'), submitOnPressEnter: true },
        },
        {
          field: 'pickerVal',
          label: '发起时间',
          component: 'DateRange',
          componentProps: {
            format: 'YYYY-MM-DD HH:mm:ss',
            showTime: { defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('23:59:59', 'HH:mm:ss')] },
            placeholder: ['开始时间', '结束时间'],
          },
        },
        {
          field: 'flowCategory',
          label: '分类',
          component: 'Select',
          componentProps: { placeholder: '请选择', showSearch: true },
        },
        {
          field: 'templateId',
          label: '所属流程',
          component: 'TreeSelect',
          componentProps: { placeholder: '请选择', lastLevel: true, onChange: onTemplateIdChange },
        },
        {
          field: 'flowId',
          label: '所属名称',
          component: 'Select',
          componentProps: { placeholder: '请选择', showSearch: true, onDropdownVisibleChange: visibleFlowChange },
        },
        {
          field: 'creatorUserId',
          label: '发起人员',
          component: 'UserSelect',
          componentProps: { placeholder: '请选择' },
        },
        {
          field: 'flowUrgent',
          label: '紧急程度',
          component: 'Select',
          componentProps: { placeholder: '请选择', showSearch: true, options: flowUrgentList },
        },
      ],
      fieldMapToTime: [['pickerVal', ['startTime', 'endTime']]],
      resetFunc: async () => {
        getForm().updateSchema({ field: 'flowId', componentProps: { options: [] } });
      },
    },
    actionColumn: {
      width: 60,
      title: '操作',
      dataIndex: 'action',
    },
    afterFetch: data => {
      const list = data.map(o => {
        o.flowUrgent = getUrgentText(o.flowUrgent);
        return o;
      });
      return list;
    },
  });

  function getTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.detailText'),
        onClick: toDetail.bind(null, record),
      },
    ];
  }
  function toDetail(record) {
    const data = {
      id: record.processId,
      flowId: record.flowId,
      opType: 3,
      taskNodeId: record.thisStepId,
      taskId: record.id,
    };
    openFlowParser(true, data);
  }
  function onTemplateIdChange(val) {
    getForm().setFieldsValue({ flowId: '' });
    getForm().updateSchema({ field: 'flowId', componentProps: { options: [] } });
    if (!val) return;
    getFlowOptions(val);
  }
  function visibleFlowChange(val) {
    if (!val) return;
    const values = getForm().getFieldsValue();
    if (!values.templateId) createMessage.warning('请先选择所属流程');
  }
  function getFlowOptions(val) {
    getFlowList(val).then(res => {
      getForm().updateSchema({ field: 'flowId', componentProps: { options: res.data } });
    });
  }
  function getFlowEngineList() {
    getTreeList().then(res => {
      getForm().updateSchema({ field: 'templateId', componentProps: { options: res.data.list || [] } });
    });
  }
  async function getOptions() {
    const res = await baseStore.getDictionaryData('WorkFlowCategory');
    getForm().updateSchema({ field: 'flowCategory', componentProps: { options: res } });
    getFlowEngineList();
  }
  onMounted(() => {
    getOptions();
  });
</script>
