<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" title="批量审批" class="full-popup">
    <BasicTable :columns="columns" @register="registerTable">
      <template #headerTop>
        <a-alert message="请先选择所属流程、名称和节点。（同一流程同一节点的审批数据才能使用批量审批）" type="warning" show-icon />
      </template>
      <template #tableTitle>
        <a-button type="warning" :disabled="!nodeCode || state.allBtnDisabled" @click="handleBatch(2)">批量转审</a-button>
        <a-button type="primary" :disabled="!nodeCode || state.allBtnDisabled" @click="handleBatch(0)">批量通过</a-button>
        <a-button type="error" :disabled="!nodeCode || state.allBtnDisabled" @click="handleBatch(1)">批量退回</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'fullName'">
          <a-tag color="success" v-if="record.delegateUser">委托</a-tag>
          {{ record.fullName }}
        </template>
        <template v-if="column.key === 'flowVersion'">
          <a-tag color="processing">V:{{ record.flowVersion }}</a-tag>
        </template>
        <template v-if="column.key === 'status'">
          <a-tag color="success" v-if="record.status == 2">审核通过</a-tag>
          <a-tag color="error" v-else-if="record.status == 3">审核退回</a-tag>
          <a-tag v-else-if="record.status == 4 || record.status == 7">流程撤回</a-tag>
          <a-tag v-else-if="record.status == 5">审核终止</a-tag>
          <a-tag color="processing" v-else>等待审核</a-tag>
        </template>
      </template>
    </BasicTable>
    <ErrorModal @register="registerError" @confirm="handleBatchOperation" />
    <ActionModal @register="registerAction" @confirm="approvalReceiver" />
    <ApprovalModal @register="registerApproval" @confirm="approvalReceiver" />
  </BasicPopup>
</template>
<script lang="ts" setup>
  import {
    getFlowBeforeList,
    getBatchFlowSelector,
    getBatchFlowJsonList,
    getNodeSelector,
    getRejectList,
    getBatchCandidate,
    batchOperation,
  } from '/@/api/workFlow/flowBefore';
  import { ref, reactive, watch } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useBaseStore } from '/@/store/modules/base';
  import { useDefineSetting } from '/@/hooks/setting/useDefineSetting';
  import { useModal } from '/@/components/Modal';
  import ApprovalModal from '/@/views/workFlow/components/modal/ApprovalModal.vue';
  import ActionModal from '/@/views/workFlow/components/modal/ActionModal.vue';
  import ErrorModal from '/@/views/workFlow/components/modal/ErrorModal.vue';
  import dayjs from 'dayjs';

  interface State {
    batchType: number;
    candidateType: number;
    allBtnDisabled: boolean;
    approvalData: any;
  }

  defineEmits(['register']);
  const baseStore = useBaseStore();
  const { createMessage, createConfirm } = useMessage();
  const { t } = useI18n();
  const [registerPopup] = usePopupInner(init);
  const [registerError, { openModal: openErrorModal, closeModal: closeErrorModal }] = useModal();
  const [registerAction, { openModal: openActionModal, closeModal: closeActionModal }] = useModal();
  const [registerApproval, { openModal: openApprovalModal, closeModal: closeApprovalModal }] = useModal();
  const { getUrgentText } = useDefineSetting();
  const columns: BasicColumn[] = [
    { title: '流程标题', dataIndex: 'fullName', width: 200 },
    { title: '所属流程', dataIndex: 'flowName', width: 150 },
    { title: '流程版本', dataIndex: 'flowVersion', width: 130, align: 'center' },
    { title: '发起时间', dataIndex: 'startTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '发起人员', dataIndex: 'userName', width: 120 },
    { title: '审批节点', dataIndex: 'thisStep', width: 150 },
    { title: '紧急程度', dataIndex: 'flowUrgent', width: 100, align: 'center' },
    { title: '流程状态', dataIndex: 'status', width: 120, align: 'center' },
    { title: '接收时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
  ];
  const defaultApprovalData = {
    branchList: [],
    fileList: [],
    handleOpinion: '',
    signImg: '',
    copyIds: '',
    rejectStep: '',
    rejectType: 1,
  };

  const nodeCode = ref('');
  const searchInfo = reactive({
    category: 4,
  });
  const state = reactive<State>({
    batchType: 0,
    candidateType: 1,
    allBtnDisabled: false,
    approvalData: {},
  });
  const [registerTable, { getForm, reload, getSelectRows, getSelectRowKeys, clearSelectedRowKeys }] = useTable({
    api: getFlowBeforeList,
    searchInfo: searchInfo,
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
          field: 'templateId',
          label: '所属流程',
          component: 'Select',
          componentProps: { placeholder: '请选择', showSearch: true, onChange: onTemplateIdChange },
        },
        {
          field: 'flowId',
          label: '所属名称',
          component: 'Select',
          componentProps: { placeholder: '请选择', showSearch: true, onChange: onFlowChange, onDropdownVisibleChange: visibleFlowChange },
        },
        {
          field: 'nodeCode',
          label: '所属节点',
          component: 'Select',
          componentProps: { placeholder: '请选择', showSearch: true, onChange: onNodeCodeChange, onDropdownVisibleChange: visibleNodeCodeChange },
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
          field: 'creatorUserId',
          label: '发起人员',
          component: 'UserSelect',
          componentProps: { placeholder: '请选择' },
        },
      ],
      fieldMapToTime: [['pickerVal', ['startTime', 'endTime']]],
      resetFunc: async () => {
        getForm().updateSchema([
          { field: 'flowId', componentProps: { options: [] } },
          { field: 'nodeCode', componentProps: { options: [] } },
        ]);
      },
    },
    immediate: false,
    tableSetting: { setting: false, redo: false },
    afterFetch: data => {
      const list = data.map(o => {
        o.flowUrgent = getUrgentText(o.flowUrgent);
        return o;
      });
      return list;
    },
    rowSelection: { type: 'checkbox' },
    clickToRowSelect: false,
  });

  watch(
    () => nodeCode.value,
    () => {
      reload();
    },
  );

  function init() {
    getOptions();
    reload({ page: 1 });
    state.allBtnDisabled = false;
  }
  function onTemplateIdChange(val) {
    nodeCode.value = '';
    getForm().setFieldsValue({ flowId: '', nodeCode: '' });
    getForm().updateSchema([
      { field: 'flowId', componentProps: { options: [] } },
      { field: 'nodeCode', componentProps: { options: [] } },
    ]);
    if (!val) return;
    getFlowOptions(val);
  }
  function onFlowChange(val) {
    nodeCode.value = '';
    getForm().setFieldsValue({ nodeCode: '' });
    getForm().updateSchema({ field: 'nodeCode', componentProps: { options: [] } });
    if (!val) return;
    getNodeOptions(val);
  }
  function onNodeCodeChange(val) {
    nodeCode.value = val || '';
  }
  function visibleFlowChange(val) {
    if (!val) return;
    const values = getForm().getFieldsValue();
    if (!values.templateId) createMessage.warning('请先选择所属流程');
  }
  function visibleNodeCodeChange(val) {
    if (!val) return;
    const values = getForm().getFieldsValue();
    if (!values.flowId) createMessage.warning('请先选择所属名称');
  }
  function getBatchTemplateOptions() {
    getBatchFlowSelector().then(res => {
      getForm().updateSchema({ field: 'templateId', componentProps: { options: res.data } });
    });
  }
  function getFlowOptions(val) {
    getBatchFlowJsonList(val).then(res => {
      getForm().updateSchema({ field: 'flowId', componentProps: { options: res.data } });
    });
  }
  function getNodeOptions(val) {
    getNodeSelector(val).then(res => {
      getForm().updateSchema({ field: 'nodeCode', componentProps: { options: res.data } });
    });
  }
  async function getOptions() {
    const res = await baseStore.getDictionaryData('WorkFlowCategory');
    getForm().updateSchema({ field: 'flowCategory', componentProps: { options: res } });
    getBatchTemplateOptions();
  }
  function handleBatch(batchType) {
    // batchType 0-通过 1-退回 2-转审
    state.batchType = batchType;
    const selectedData = getSelectRows();
    if (!selectedData.length) return createMessage.error('请选择一条数据');
    let isDiffer = selectedData.some(o => o.flowVersion !== selectedData[0].flowVersion);
    if (isDiffer) return createMessage.error('请选择相同的版本审批单');
    state.approvalData = { ...defaultApprovalData };
    const item = selectedData[0];
    const properties = item.approversProperties ? JSON.parse(item.approversProperties) : {};
    if (batchType === 0) {
      if (!properties.hasAuditBtn) return createMessage.error('当前审批节点无通过权限');
      state.allBtnDisabled = true;
      const query = { flowId: item.flowId, taskOperatorId: item.id };
      getBatchCandidate(query)
        .then(res => {
          const data = res.data;
          state.allBtnDisabled = false;
          state.candidateType = data.type;
          if (data.type == 3 && !properties.hasSign && !properties.hasOpinion && !properties.isCustomCopy) {
            createConfirm({
              iconType: 'warning',
              title: '提示',
              content: '此操作将通过该审批单，是否继续?',
              onOk: () => {
                handleBatchOperation();
              },
            });
            return;
          }
          let branchList = [];
          let candidateList = [];
          if (data.type == 1) {
            branchList = res.data.list.filter(o => o.isBranchFlow);
            candidateList = res.data.list.filter(o => !o.isBranchFlow && o.isCandidates);
          }
          if (data.type == 2) {
            candidateList = res.data.list.filter(o => o.isCandidates);
          }
          openApprovalModal(true, {
            branchList,
            candidateList,
            showReject: false,
            rejectList: [],
            taskId: item.id,
            formData: {
              flowId: item.flowId,
              data: {},
            },
            eventType: 'audit',
            properties,
          });
        })
        .catch(() => {
          state.allBtnDisabled = false;
        });
      return;
    }
    if (batchType === 1) {
      if (!properties.hasRejectBtn) return createMessage.error('当前审批节点无退回权限');
      state.allBtnDisabled = true;
      getRejectList(item.id)
        .then(res => {
          state.allBtnDisabled = false;
          const data = {
            showReject: res.data.isLastAppro,
            rejectList: res.data.list || [],
            branchList: [],
            candidateList: [],
            taskId: item.id,
            formData: {
              flowId: item.flowId,
              data: {},
            },
            eventType: 'reject',
            properties,
          };
          if (!properties.hasSign && !properties.hasOpinion && !properties.isCustomCopy && !data.showReject) {
            createConfirm({
              iconType: 'warning',
              title: '提示',
              content: '此操作将退回该审批单，是否继续?',
              onOk: () => {
                state.approvalData.rejectStep = data.rejectList.length ? data.rejectList[0].nodeCode : '';
                handleBatchOperation();
              },
            });
            return;
          }
          openApprovalModal(true, data);
        })
        .catch(() => {
          state.allBtnDisabled = false;
        });
      return;
    }
    if (batchType === 2) {
      if (!properties.hasTransferBtn) return createMessage.error('当前审批节点无转审权限');
      openActionModal(true, { properties: properties, eventType: 'transfer' });
    }
  }
  function approvalReceiver(data) {
    state.approvalData = data;
    handleBatchOperation();
  }
  function handleBatchOperation(errorRuleUserList: any = null) {
    state.allBtnDisabled = true;
    const query = {
      ...state.approvalData,
      batchType: state.batchType,
      candidateType: state.candidateType,
      ids: getSelectRowKeys(),
    };
    if (errorRuleUserList) query.errorRuleUserList = errorRuleUserList;
    batchOperation(query)
      .then(res => {
        handleError(res);
      })
      .catch(() => {
        state.allBtnDisabled = false;
      });
  }
  // 异常处理
  function handleError(res) {
    const errorData = res.data;
    if (errorData && Array.isArray(errorData) && errorData.length) {
      state.allBtnDisabled = false;
      openErrorModal(true, { errorData });
    } else {
      createMessage.success(res.msg).then(() => {
        closeErrorModal();
        closeApprovalModal();
        closeActionModal();
        clearSelectedRowKeys();
        state.allBtnDisabled = false;
        reload();
      });
    }
  }
</script>
