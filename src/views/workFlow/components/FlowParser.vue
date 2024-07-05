<template>
  <BasicPopup
    v-bind="$attrs"
    @register="registerPopup"
    :showBackIcon="!config.hideCancelBtn"
    :showCancelBtn="false"
    destroyOnClose
    :closeFunc="onClose"
    class="full-popup basic-flow-parser">
    <template #title>
      <a-space :size="10">
        <div class="header-title">{{ getTitle }}</div>
        <template v-if="!loading || getTitle">
          <a-dropdown :disabled="config.opType != '-1'">
            <template #overlay>
              <a-menu @click="handleUrgentClick">
                <a-menu-item :key="item.id" v-for="item in flowUrgentList">
                  <div class="flow-urgent-value" :class="'urgent' + item.id">{{ item.fullName }}</div>
                </a-menu-item>
              </a-menu>
            </template>
            <div class="flow-urgent-value" :class="'urgent' + state.flowUrgent">{{ getUrgentName }}</div>
          </a-dropdown>
        </template>
      </a-space>
    </template>
    <template #insertToolbar>
      <div class="header-options">
        <a-dropdown :disabled="loading || allBtnDisabled" v-if="state.moreBtnList.length">
          <template #overlay>
            <a-menu @click="handleBtnClick">
              <a-menu-item :key="item.id" v-for="item in state.moreBtnList" class="text-center">{{ item.fullName }}</a-menu-item>
            </a-menu>
          </template>
          <a-button>更多<DownOutlined /></a-button>
        </a-dropdown>
        <a-button type="primary" @click="eventLauncher('submit')" :loading="btnLoading" :disabled="loading || allBtnDisabled" v-if="config.opType == '-1'">
          {{ properties.submitBtnText || '提交' }}
        </a-button>
        <a-button
          type="primary"
          @click="eventLauncher('audit')"
          :loading="btnLoading"
          :disabled="loading || allBtnDisabled"
          v-if="config.opType == 1 && properties.hasAuditBtn">
          {{ properties.auditBtnText || '通过' }}
        </a-button>
        <a-button type="primary" @click="handlePress()" v-if="config.opType == 0 && config.status == 1 && properties.hasPressBtn">
          {{ properties.pressBtnText || '催办' }}
        </a-button>
        <a-button type="error" @click="actionLauncher('recall')" v-if="config.opType == 2 && properties.hasRevokeBtn">
          {{ properties.revokeBtnText || '撤回' }}
        </a-button>
        <a-button type="error" @click="actionLauncher('cancel')" v-if="config.opType == 4 && config.status == 1 && !noOperateAuth">终止</a-button>
        <a-button @click="handleClose()" :disabled="allBtnDisabled" v-if="!config.hideCancelBtn">
          {{ t('common.cancelText') }}
        </a-button>
      </div>
    </template>
    <div class="approve-result" v-if="(config.opType == 0 && state.activeKey === '1') || (config.opType == 4 && state.activeKey === '2')">
      <div class="approve-result-img" :class="getFlowStatusClass"></div>
    </div>
    <a-tabs v-model:activeKey="state.activeKey" class="flow-parser-tabs" :class="{ 'no-head-margin': state.activeKey == '3' }" v-loading="loading">
      <a-tab-pane key="1" tab="表单信息" v-if="config.opType != '4'">
        <component :is="state.currentView" ref="formRef" :config="config" @eventReceiver="eventReceiver" @setPageLoad="setPageLoad" />
      </a-tab-pane>
      <a-tab-pane key="2" tab="流程信息" class="!overflow-hidden">
        <FlowProcessMain
          :conf="state.flowTemplateJson"
          :isPreview="true"
          :isEnd="state.flowTaskInfo.completion == 100"
          v-if="state.flowTemplateJson.nodeId"
          @viewSubFlow="viewSubFlow" />
      </a-tab-pane>
      <a-tab-pane key="3" tab="流转记录" class="!p-0" v-if="config.opType != '-1' || (config.opType == '-1' && config.status == 7)">
        <RecordList
          :list="state.flowTaskOperatorRecordList"
          :endTime="state.endTime"
          :flowId="config.flowId"
          :opType="config.opType"
          @viewDetail="viewNodeDetail"
          @viewLog="viewNodeLog"
          v-if="state.activeKey == '3'" />
      </a-tab-pane>
      <a-tab-pane key="4" tab="审批汇总" forceRender v-if="config.opType != '-1' && state.isSummary">
        <RecordSummary :id="config.id" :summaryType="state.summaryType" ref="recordSummaryRef" />
      </a-tab-pane>
      <a-tab-pane key="5" tab="流程评论" forceRender v-if="config.opType != '-1' && state.isComment">
        <Comment :id="config.id" ref="commentRef" />
      </a-tab-pane>
    </a-tabs>
  </BasicPopup>
  <ErrorModal @register="registerError" @confirm="errorReceiver" @close="onErrorModalClose" />
  <CandidateModal @register="registerCandidate" @confirm="handleRequest" />
  <ActionModal @register="registerAction" @confirm="actionReceiver" />
  <ApprovalModal @register="registerApproval" @confirm="approvalReceiver" />
  <ResurgenceModal @register="registerResurgence" @confirm="resurgenceReceiver" />
  <NodeFormParser @register="registerNodeFormParser" />
  <LogList @register="registerNodeLog" />
  <SubFlowParser @register="registerSubFlowParser" />
  <PrintSelect @register="registerPrintSelect" @change="handleShowBrowse" />
  <PrintBrowse @register="registerPrintBrowse" />
</template>
<script lang="ts" setup>
  import { computed, reactive, toRefs, watch, defineAsyncComponent, markRaw, ref } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { useModal } from '/@/components/Modal';
  import { usePopup } from '/@/components/Popup';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { importViewsFile } from '/@/utils';
  import {
    getFlowBeforeInfo,
    getCandidates,
    transfer,
    assign,
    recall,
    cancel,
    saveAudit,
    getRejectList,
    audit,
    reject,
    freeApprover,
    resurgence,
    getResurgenceList,
    suspend,
    getSuspendType,
    restore,
  } from '/@/api/workFlow/flowBefore';
  import { create, update } from '/@/api/workFlow/workFlowForm';
  import { revoke, press } from '/@/api/workFlow/flowLaunch';
  import FlowProcessMain from '/@/components/FlowProcess/src/Main.vue';
  import ErrorModal from './modal/ErrorModal.vue';
  import CandidateModal from './modal/CandidateModal.vue';
  import ActionModal from './modal/ActionModal.vue';
  import ApprovalModal from './modal/ApprovalModal.vue';
  import ResurgenceModal from './modal/ResurgenceModal.vue';
  import RecordList from './RecordList.vue';
  import RecordSummary from './RecordSummary.vue';
  import Comment from './Comment.vue';
  import NodeFormParser from './NodeFormParser.vue';
  import LogList from './LogList.vue';
  import SubFlowParser from './SubFlowParser.vue';
  import PrintSelect from '/@/components/PrintDesign/printSelect/index.vue';
  import PrintBrowse from '/@/components/PrintDesign/printBrowse/index.vue';

  interface State {
    config: any;
    properties: any;
    loading: boolean;
    btnLoading: boolean;
    allBtnDisabled: boolean;
    flowUrgent: any;
    moreBtnList: any[];
    activeKey: any;
    flowTaskInfo: any;
    flowFormInfo: any;
    flowTemplateInfo: any;
    flowTemplateJson: any;
    flowTaskNodeList: any;
    flowTaskOperatorRecordList: any;
    assignNodeList: any;
    thisStep: string;
    endTime: any;
    currentView: any;
    formData: any;
    eventType: string;
    candidateType: number;
    countersignOver: boolean;
    isComment: boolean;
    isSummary: boolean;
    summaryType: number;
    approvalData: any;
    resurgenceData: any;
    noOperateAuth: boolean;
  }

  const emit = defineEmits(['register', 'reload']);
  const { t } = useI18n();
  const { createMessage, createConfirm } = useMessage();
  const [registerPopup, { closePopup }] = usePopupInner(init);
  const [registerError, { openModal: openErrorModal, closeModal: closeErrorModal, setModalProps: setErrorModalProps }] = useModal();
  const [registerCandidate, { openModal: openCandidateModal, closeModal: closeCandidateModal, setModalProps: setCandidateModalProps }] = useModal();
  const [registerAction, { openModal: openActionModal, closeModal: closeActionModal, setModalProps: setActionModalProps }] = useModal();
  const [registerApproval, { openModal: openApprovalModal, closeModal: closeApprovalModal, setModalProps: setApprovalModalProps }] = useModal();
  const [registerResurgence, { openModal: openResurgenceModal, closeModal: closeResurgenceModal, setModalProps: setResurgenceModalProps }] = useModal();
  const [registerNodeFormParser, { openPopup: openNodeFormParserPopup }] = usePopup();
  const [registerNodeLog, { openPopup: openNodeLogPopup }] = usePopup();
  const [registerSubFlowParser, { openPopup: openSubFlowParserPopup }] = usePopup();
  const [registerPrintSelect, { openModal: openPrintSelect }] = useModal();
  const [registerPrintBrowse, { openModal: openPrintBrowse }] = useModal();

  const flowUrgentList = [
    { id: 1, fullName: '普通' },
    { id: 2, fullName: '重要' },
    { id: 3, fullName: '紧急' },
  ];
  const formRef = ref<any>(null);
  const recordSummaryRef = ref<any>(null);
  const commentRef = ref<any>(null);
  const state = reactive<State>({
    config: {},
    properties: {},
    loading: false,
    btnLoading: false,
    allBtnDisabled: false,
    flowUrgent: 1,
    moreBtnList: [],
    activeKey: ' 1',
    flowTaskInfo: {},
    flowFormInfo: {},
    flowTemplateInfo: {},
    flowTemplateJson: {},
    flowTaskNodeList: [],
    flowTaskOperatorRecordList: [],
    assignNodeList: [],
    thisStep: '',
    endTime: 0,
    currentView: null,
    formData: {},
    eventType: '',
    candidateType: 1,
    countersignOver: false,
    isComment: false,
    isSummary: false,
    summaryType: 0,
    approvalData: {},
    resurgenceData: {},
    noOperateAuth: false, // 是否没有操作权限
  });
  const { config, properties, loading, btnLoading, allBtnDisabled, noOperateAuth } = toRefs(state);

  const getTitle = computed(() => {
    const fullName = state.config.fullName;
    if ([2, 3, 4].includes(state.config.opType)) return fullName;
    return state.thisStep ? fullName + '/' + state.thisStep : fullName;
  });
  const getUrgentName = computed(() => {
    const list = flowUrgentList.filter(o => o.id === state.flowUrgent);
    if (!list.length) return '普通';
    return list[0].fullName || '普通';
  });
  const getFlowStatusClass = computed(() => {
    const status = state.flowTaskInfo.status;
    if (status == 1) return 'wait';
    if (status == 2) return 'adopt';
    if (status == 3) return 'reject';
    if (status == 4) return 'revoke';
    if (status == 5) return 'cancel';
    return '';
  });

  watch(
    () => state.activeKey,
    val => {
      if (val === '5') {
        commentRef.value?.init();
        state.moreBtnList.push({ id: 'comment', fullName: '评论' });
      } else {
        state.moreBtnList = state.moreBtnList.filter(o => o.id != 'comment');
      }
      if (val === '4') return recordSummaryRef.value?.init();
    },
  );

  function init(data) {
    state.loading = true;
    state.btnLoading = false;
    state.config = data;
    state.config.disabled = data.opType != 1 && data.opType != '-1';
    state.flowUrgent = 1;
    state.activeKey = data.opType == 4 ? '2' : '1';
    /**
     * opType
     * -1 - 我发起的新建/编辑
     * 0 - 我发起的详情
     * 1 - 待办事宜
     * 2 - 已办事宜
     * 3 - 抄送事宜
     * 4 - 流程监控
     */
    getBeforeInfo(state.config);
  }
  function getBeforeInfo(config) {
    const query = { taskNodeId: config.taskNodeId, taskOperatorId: config.taskId, flowId: config.flowId };
    getFlowBeforeInfo(config.id || '0', query)
      .then(res => {
        state.flowFormInfo = res.data.flowFormInfo;
        state.flowTaskInfo = res.data.flowTaskInfo || {};
        state.flowTemplateInfo = res.data.flowTemplateInfo;
        state.noOperateAuth = res.data.noOperateAuth || false;
        const fullName = config.opType == '-1' ? state.flowTemplateInfo.fullName : state.flowTaskInfo.fullName;
        config.fullName = fullName;
        state.thisStep = state.flowTaskInfo.thisStep || '';
        state.flowUrgent = state.flowTaskInfo.flowUrgent || 1;
        config.status = state.flowTaskInfo.status;
        config.type = state.flowTemplateInfo.type;
        config.draftData = res.data.draftData || null;
        config.formData = res.data.formData || {};
        config.formEnCode = state.flowFormInfo.enCode;
        state.flowTaskNodeList = res.data.flowTaskNodeList || [];
        state.flowTemplateJson = state.flowTemplateInfo.flowTemplateJson ? JSON.parse(state.flowTemplateInfo.flowTemplateJson) : null;
        state.properties = res.data.approversProperties || {};
        state.isComment = state.flowTemplateJson.properties.isComment;
        state.isSummary = state.flowTemplateJson.properties.isSummary;
        state.summaryType = state.flowTemplateJson.properties.summaryType;
        state.flowTaskOperatorRecordList = (res.data.flowTaskOperatorRecordList || []).reverse();
        state.endTime = state.flowTaskInfo.completion == 100 ? state.flowTaskInfo.endTime : 0;
        // 设置默认审批data
        state.approvalData = {
          branchList: [],
          fileList: [],
          handleOpinion: '',
          signImg: '',
          copyIds: '',
          rejectStep: '',
          rejectType: state.properties.rejectType || 1,
        };
        config.formConf = state.flowFormInfo.propertyJson;
        config.formOperates = res.data.formOperates || [];
        if (config.opType == 0) {
          for (let i = 0; i < config.formOperates.length; i++) {
            config.formOperates[i].write = false;
          }
        }
        config.flowTemplateJson = state.flowTemplateJson;
        if (state.flowTaskNodeList.length) {
          let assignNodeList: any[] = [];
          for (let i = 0; i < state.flowTaskNodeList.length; i++) {
            const nodeItem = state.flowTaskNodeList[i];
            config.opType == 4 && nodeItem.type == 1 && nodeItem.nodeType === 'approver' && assignNodeList.push(nodeItem);
            const loop = data => {
              if (Array.isArray(data)) data.forEach(d => loop(d));
              if (data.nodeId === nodeItem.nodeCode) {
                if (nodeItem.type == 0) data.state = 'state-past';
                if (nodeItem.type == 1) data.state = 'state-curr';
                if (nodeItem.nodeType === 'approver' || nodeItem.nodeType === 'start' || nodeItem.nodeType === 'subFlow') data.content = nodeItem.userName;
                return;
              }
              if (data.conditionNodes && Array.isArray(data.conditionNodes)) loop(data.conditionNodes);
              if (data.childNode) loop(data.childNode);
            };
            loop(state.flowTemplateJson);
          }
          state.assignNodeList = assignNodeList;
        } else {
          state.flowTemplateJson.state = 'state-curr';
        }
        initBtnList();
        if (config.opType == 4) {
          state.activeKey = '2';
          setPageLoad();
          return;
        }
        const formUrl =
          state.flowFormInfo.formType == 2
            ? 'workFlow/workFlowForm/dynamicForm'
            : state.flowFormInfo.urlAddress
            ? state.flowFormInfo.urlAddress.replace(/\s*/g, '')
            : `workFlow/workFlowForm/${state.flowFormInfo.enCode}`;
        state.currentView = markRaw(defineAsyncComponent(() => importViewsFile(formUrl)));
      })
      .catch(() => {
        state.loading = false;
      });
  }
  function initBtnList() {
    const list: any[] = [];
    const config = state.config;
    const opType = config.opType;
    const properties = state.properties;
    const flowTaskInfo = state.flowTaskInfo;
    if (opType == '-1' && !config.hideCancelBtn) list.push({ id: 'save', fullName: properties.saveBtnText || '暂存' });
    if (opType == 0 && config.status == 1 && properties.hasRevokeBtn) list.push({ id: 'revoke', fullName: properties.revokeBtnText || '撤回' });
    if (opType != 4 && config.id && properties.hasPrintBtn && properties.printId?.length) {
      list.push({ id: 'print', fullName: properties.printBtnText || '打印' });
    }
    if (opType == 1) {
      if (properties.hasTransferBtn) list.push({ id: 'transfer', fullName: properties.transferBtnText || '转审' });
      if (properties.hasSaveBtn) list.push({ id: 'saveAudit', fullName: properties.saveBtnText || '暂存' });
      if (properties.hasRejectBtn) list.push({ id: 'reject', fullName: properties.rejectBtnText || '退回' });
      if (properties.hasFreeApproverBtn) list.push({ id: 'freeApprover', fullName: properties.hasFreeApproverBtnText || '加签' });
      if (properties.hasCancelBtn) list.push({ id: 'approvalCancel', fullName: properties.cancelBtnText || '驳回' });
    }
    if (opType == 4) {
      if (state.noOperateAuth) return (state.moreBtnList = []);
      if (flowTaskInfo.completion == 100) list.push({ id: 'resurgence', fullName: '复活' });
      if (flowTaskInfo.completion > 0 && flowTaskInfo.completion < 100 && !flowTaskInfo.rejectDataId && (config.status == 1 || config.status == 3))
        list.push({ id: 'vary', fullName: '变更' });
      if (config.status == 1 && state.assignNodeList.length) list.push({ id: 'assign', fullName: '指派' });
      if (flowTaskInfo.status == 1) list.push({ id: 'suspend', fullName: '挂起' });
      if (flowTaskInfo.status == 6 && !flowTaskInfo.suspend) list.push({ id: 'restore', fullName: '恢复' });
    }
    state.moreBtnList = list;
  }
  function eventLauncher(eventType) {
    formRef.value?.dataFormSubmit(eventType, state.flowUrgent);
  }
  function eventReceiver(formData, eventType) {
    state.formData = formData;
    state.formData.flowId = state.config.flowId;
    state.formData.id = state.config.id;
    state.eventType = eventType;
    if (eventType === 'save' || eventType === 'submit') return submitOrSave();
    if (eventType === 'saveAudit') return handleSaveAudit();
    if (eventType === 'reject') {
      state.allBtnDisabled = true;
      getRejectList(state.config.taskId)
        .then(res => {
          state.allBtnDisabled = false;
          const data = {
            showReject: res.data.isLastAppro,
            rejectList: res.data.list || [],
            branchList: [],
            candidateList: [],
            taskId: state.config.taskId,
            formData: state.formData,
            eventType: state.eventType,
            properties: state.properties,
          };
          if (!state.properties.hasSign && !state.properties.hasOpinion && !state.properties.isCustomCopy && !data.showReject) {
            createConfirm({
              iconType: 'warning',
              title: '提示',
              content: '此操作将退回该审批单，是否继续?',
              onOk: () => {
                state.approvalData.rejectStep = data.rejectList.length ? data.rejectList[0].nodeCode : '';
                handleApproval();
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
    if (eventType === 'audit' || eventType === 'freeApprover') {
      eventType === 'freeApprover' ? (state.allBtnDisabled = true) : (state.btnLoading = true);
      getCandidates(state.config.taskId, state.formData)
        .then(res => {
          const data = res.data;
          eventType === 'freeApprover' ? (state.allBtnDisabled = false) : (state.btnLoading = false);
          state.candidateType = data.type;
          state.countersignOver = !!data.countersignOver;
          if (eventType === 'audit' && data.type == 3 && !state.properties.hasSign && !state.properties.hasOpinion && !state.properties.isCustomCopy) {
            createConfirm({
              iconType: 'warning',
              title: '提示',
              content: '此操作将通过该审批单，是否继续?',
              onOk: () => {
                handleApproval();
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
            taskId: state.config.taskId,
            formData: state.formData,
            eventType: state.eventType,
            properties: state.properties,
          });
        })
        .catch(() => {
          eventType === 'freeApprover' ? (state.allBtnDisabled = false) : (state.btnLoading = false);
        });
    }
  }
  // 提交或者暂存
  function submitOrSave() {
    state.formData.status = state.eventType === 'submit' ? 0 : 1;
    state.formData.flowUrgent = state.flowUrgent;
    //受委托人不为空的时候走委托创建流程
    if (state.config.delegateUserList) state.formData.delegateUserList = state.config.delegateUserList;
    if (state.eventType === 'save') return handleRequest();
    state.btnLoading = true;
    getCandidates('0', state.formData)
      .then(res => {
        const data = res.data;
        state.btnLoading = false;
        state.candidateType = data.type;
        state.countersignOver = !!data.countersignOver;
        if (data.type == 3 && !state.properties.isCustomCopy) {
          createConfirm({
            iconType: 'warning',
            title: '提示',
            content: '您确定要提交当前流程吗, 是否继续?',
            onOk: () => {
              handleRequest();
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
        openCandidateModal(true, {
          branchList,
          candidateList,
          isCustomCopy: state.properties.isCustomCopy,
          taskId: state.config.taskId,
          formData: state.formData,
        });
      })
      .catch(() => {
        state.btnLoading = false;
      });
  }
  // 提交或者暂存请求接口
  function handleRequest(candidateData: any = null) {
    if (candidateData) state.formData = { ...state.formData, ...candidateData };
    state.formData.candidateType = state.candidateType;
    state.formData.countersignOver = state.countersignOver;
    if (!state.formData.id) delete state.formData.id;
    state.allBtnDisabled = true;
    const formMethod = state.formData.id ? update : create;
    formMethod(state.formData)
      .then(res => {
        handleError(res);
      })
      .catch(() => {
        setCandidateModalProps({ confirmLoading: false });
        setErrorModalProps({ confirmLoading: false });
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
        closeCandidateModal();
        closeApprovalModal();
        closeResurgenceModal();
        state.allBtnDisabled = false;
        handleClose(true);
      });
    }
  }
  // 异常处理弹窗提交
  function errorReceiver(data) {
    state.formData.errorRuleUserList = data;
    if (state.eventType === 'submit') return handleRequest();
    if (state.eventType === 'audit' || state.eventType === 'reject') return handleApproval();
    if (state.eventType === 'resurgence' || state.eventType === 'vary') return handleResurgence();
  }
  // 关闭异常处理弹窗
  function onErrorModalClose() {
    setCandidateModalProps({ confirmLoading: false });
    setResurgenceModalProps({ confirmLoading: false });
    setApprovalModalProps({ confirmLoading: false });
    setErrorModalProps({ confirmLoading: false });
    state.allBtnDisabled = false;
  }
  // 审批通过/审批退回/加签
  function handleApproval() {
    const query = {
      candidateType: state.candidateType,
      countersignOver: state.countersignOver,
      ...state.approvalData,
      ...state.formData,
    };
    const approvalMethod = state.eventType === 'freeApprover' ? freeApprover : state.eventType === 'audit' ? audit : reject;
    state.allBtnDisabled = true;
    approvalMethod(state.config.taskId, query)
      .then(res => {
        handleError(res);
      })
      .catch(() => {
        setApprovalModalProps({ confirmLoading: false });
        setErrorModalProps({ confirmLoading: false });
        state.allBtnDisabled = false;
      });
  }
  // 审批通过/审批退回/加签弹窗提交
  function approvalReceiver(data) {
    state.approvalData = data;
    handleApproval();
  }
  // 审批暂存
  function handleSaveAudit() {
    state.allBtnDisabled = true;
    saveAudit(state.config.taskId, state.formData)
      .then(res => {
        createMessage.success(res.msg).then(() => {
          state.allBtnDisabled = false;
          handleClose(true);
        });
      })
      .catch(() => {
        state.allBtnDisabled = false;
      });
  }
  // 复活/变更/挂起
  function handleResurgence() {
    let query = {};
    if (state.eventType === 'suspend') {
      query = { ...state.resurgenceData, id: state.config.id };
    } else {
      query = {
        ...state.resurgenceData,
        ...state.formData,
        taskId: state.config.taskId,
        resurgence: state.eventType === 'resurgence',
      };
    }
    state.allBtnDisabled = true;
    const method = state.eventType === 'suspend' ? suspend : resurgence;
    method(query)
      .then(res => {
        handleError(res);
      })
      .catch(() => {
        setResurgenceModalProps({ confirmLoading: false });
        setErrorModalProps({ confirmLoading: false });
        state.allBtnDisabled = false;
      });
  }
  // 复活/变更/挂起弹窗提交
  function resurgenceReceiver(data) {
    state.resurgenceData = data;
    handleResurgence();
  }
  // 催办
  function handlePress() {
    createConfirm({
      iconType: 'warning',
      title: '提示',
      content: '此操作将提示该节点尽快处理，是否继续?',
      onOk: () => {
        press(state.config.id).then(res => {
          createMessage.success(res.msg);
        });
      },
    });
  }
  // 撤回、转办、终止、驳回等操作弹窗
  function actionLauncher(eventType) {
    state.eventType = eventType;
    if (['revoke', 'recall', 'approvalCancel'].includes(eventType) && !state.properties.hasOpinion && !state.properties.hasSign) {
      let content = '';
      if (eventType == 'revoke') content = '此操作将撤回该流程，是否继续？';
      if (eventType == 'recall') content = '此操作将撤回该审批单，是否继续？';
      if (eventType == 'approvalCancel') content = '此操作将审批驳回终止流程，是否继续？';
      createConfirm({
        iconType: 'warning',
        title: '提示',
        content,
        onOk: () => {
          actionReceiver();
        },
      });
      return;
    }
    openActionModal(true, { properties: state.properties, assignNodeList: state.assignNodeList, eventType });
  }
  // 撤回、转办、终止、驳回等操作请求
  function actionReceiver(data: any = null) {
    if (!data) data = { handleOpinion: '', signImg: '', fileList: [] };
    const id = state.eventType == 'revoke' || state.eventType == 'approvalCancel' ? state.config.id : state.config.taskId;
    if (state.eventType == 'approvalCancel') data.eventType = state.eventType;
    const actionMethod = getActionMethod();
    state.allBtnDisabled = true;
    actionMethod(id, data)
      .then(res => {
        state.allBtnDisabled = false;
        createMessage.success(res.msg).then(() => {
          closeActionModal();
          state.allBtnDisabled = false;
          handleClose(true);
        });
      })
      .catch(() => {
        setActionModalProps({ confirmLoading: false });
        state.allBtnDisabled = false;
      });
  }
  // 恢复流程
  function handleRestore() {
    state.allBtnDisabled = true;
    restore(state.config.id).then(res => {
      createMessage.success(res.msg).then(() => {
        state.allBtnDisabled = false;
        handleClose(true);
      });
    });
  }
  function getActionMethod() {
    if (state.eventType === 'transfer') return transfer;
    if (state.eventType === 'assign') return assign;
    if (state.eventType === 'revoke') return revoke;
    if (state.eventType === 'recall') return recall;
    if (state.eventType === 'cancel') return cancel;
    if (state.eventType === 'approvalCancel') return cancel;
    return cancel;
  }
  function handleUrgentClick({ key }) {
    state.flowUrgent = key;
  }
  function handleBtnClick({ key }) {
    state.eventType = key;
    if (key == 'saveAudit') return eventLauncher('saveAudit');
    if (key == 'reject') return eventReceiver({}, 'reject');
    if (key == 'revoke') return actionLauncher('revoke');
    if (key == 'transfer') return actionLauncher('transfer');
    if (key == 'assign') return actionLauncher('assign');
    if (key == 'approvalCancel') return actionLauncher('approvalCancel');
    if (key == 'resurgence' || key === 'vary') {
      getResurgenceList(state.config.taskId).then(res => {
        openResurgenceModal(true, { nodeList: res.data || [], eventType: key });
      });
      return;
    }
    if (key == 'suspend') {
      getSuspendType(state.config.id).then(res => {
        openResurgenceModal(true, { nodeList: [], eventType: key, suspendType: res.data || false });
      });
      return;
    }
    if (key == 'restore') return handleRestore();
    if (key == 'comment') return commentRef.value?.addComment();
    if (key == 'print') return handlePrint();
    eventLauncher(key);
  }
  function handlePrint() {
    if (!state.properties.printId?.length) return createMessage.error('未配置打印模板');
    if (state.properties.printId?.length === 1) return handleShowBrowse(state.properties.printId[0]);
    openPrintSelect(true, state.properties.printId);
  }
  function handleShowBrowse(id) {
    openPrintBrowse(true, { id, formId: state.config.id });
  }
  // 流程监控查看各节点表单详情
  function viewNodeDetail(data) {
    openNodeFormParserPopup(true, { ...data, flowId: state.config.flowId });
  }
  function viewNodeLog(data) {
    openNodeLogPopup(true, { ...data, flowId: state.config.flowId });
  }
  // 查看子流程
  function viewSubFlow(nodeCode) {
    let flowTaskNodeList = state.flowTaskNodeList.filter(o => o.nodeCode == nodeCode);
    if (!flowTaskNodeList.length) return;
    const data = {
      opType: state.config.opType,
      nodeId: flowTaskNodeList[0].id,
    };
    openSubFlowParserPopup(true, data);
  }
  function setPageLoad(val: any = false) {
    state.loading = !!val;
  }
  function handleClose(reload = false) {
    state.currentView = null;
    closePopup();
    if (reload) emit('reload');
  }
  function onClose() {
    state.currentView = null;
    return true;
  }
</script>
<style lang="less">
  @import './style/index.less';
</style>
