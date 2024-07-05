<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" destroyOnClose class="full-popup basic-flow-parser">
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
    <a-tabs v-model:activeKey="state.activeKey" class="flow-parser-tabs" :class="{ 'no-head-margin': state.activeKey == '3' }" v-loading="loading">
      <a-tab-pane key="2" tab="流程信息" class="!overflow-hidden">
        <a-tabs v-model:activeKey="state.subFlowTab" class="flow-parser-tabs" type="card" @change="setCurrFlow">
          <a-tab-pane v-for="(item, index) in state.subFlowList" :key="index" :tab="item.flowTaskInfo.fullName" class="!overflow-hidden">
            <FlowProcessMain :conf="item.flowTemplateInfo.flowTemplateJson" :isPreview="true" :isEnd="item.flowTaskInfo.completion == 100" />
          </a-tab-pane>
        </a-tabs>
      </a-tab-pane>
      <a-tab-pane key="3" tab="流转记录" class="!p-0" v-if="config.opType != '-1'">
        <RecordList
          :list="state.flowTaskOperatorRecordList"
          :endTime="state.endTime"
          :flowId="config.flowId"
          :opType="config.opType"
          @viewDetail="viewNodeDetail"
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
  <NodeFormParser @register="registerNodeFormParser" />
</template>
<script lang="ts" setup>
  import { computed, reactive, toRefs, watch, ref } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { usePopup } from '/@/components/Popup';
  import { getSubFlowInfo } from '/@/api/workFlow/flowBefore';
  import FlowProcessMain from '/@/components/FlowProcess/src/Main.vue';
  import RecordList from './RecordList.vue';
  import RecordSummary from './RecordSummary.vue';
  import Comment from './Comment.vue';
  import NodeFormParser from './NodeFormParser.vue';

  interface State {
    config: any;
    properties: any;
    loading: boolean;
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
    thisStep: string;
    endTime: any;
    currentView: any;
    formData: any;
    eventType: string;
    candidateType: number;
    isComment: boolean;
    isSummary: boolean;
    summaryType: number;
    subFlowList: any[];
    currFlow: any;
    subFlowTab: number;
  }

  defineEmits(['register']);
  const [registerPopup] = usePopupInner(init);
  const [registerNodeFormParser, { openPopup: openNodeFormParserPopup }] = usePopup();

  const flowUrgentList = [
    { id: 1, fullName: '普通' },
    { id: 2, fullName: '重要' },
    { id: 3, fullName: '紧急' },
  ];
  const commentRef = ref<any>(null);
  const recordSummaryRef = ref<any>(null);
  const state = reactive<State>({
    config: {},
    properties: {},
    loading: false,
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
    thisStep: '',
    endTime: 0,
    currentView: null,
    formData: {},
    eventType: '',
    candidateType: 1,
    isComment: false,
    isSummary: false,
    summaryType: 0,
    subFlowList: [],
    currFlow: {},
    subFlowTab: 0,
  });
  const { config, loading } = toRefs(state);

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

  watch(
    () => state.activeKey,
    val => {
      if (val === '4') return recordSummaryRef.value?.init();
      if (val === '5') commentRef.value?.init();
    },
  );

  function init(data) {
    state.loading = true;
    state.config = data;
    state.activeKey = '2';
    state.subFlowList = [];
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
    getSubFlowInfo(config.nodeId)
      .then(res => {
        state.subFlowList = res.data || [];
        for (let index = 0; index < state.subFlowList.length; index++) {
          let element = state.subFlowList[index];
          element.flowTemplateInfo.flowTemplateJson = element.flowTemplateInfo ? JSON.parse(element.flowTemplateInfo.flowTemplateJson) : {};
          if (element.flowTaskNodeList.length) {
            for (let i = 0; i < element.flowTaskNodeList.length; i++) {
              const nodeItem = element.flowTaskNodeList[i];
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
              loop(element.flowTemplateInfo.flowTemplateJson);
            }
          } else {
            element.flowTemplateInfo.flowTemplateJson.state = 'state-curr';
          }
        }
        state.subFlowTab = 0;
        setCurrFlow(0);
        state.loading = false;
      })
      .catch(() => {
        state.loading = false;
      });
  }
  function setCurrFlow(key) {
    state.currFlow = state.subFlowList[key];
    state.flowFormInfo = state.currFlow.flowFormInfo;
    state.flowTaskInfo = state.currFlow.flowTaskInfo || {};
    state.flowTemplateInfo = state.currFlow.flowTemplateInfo;
    const fullName = state.config.opType == '-1' ? state.flowTemplateInfo.fullName : state.flowTaskInfo.fullName;
    state.config.fullName = fullName;
    state.config.flowId = state.flowTaskInfo.flowId;
    state.config.status = state.flowTaskInfo.status;
    state.config.id = state.flowTaskInfo.id;
    state.thisStep = state.flowTaskInfo.thisStep || '';
    state.flowUrgent = state.flowTaskInfo.flowUrgent || 1;
    state.flowTaskNodeList = state.currFlow.flowTaskNodeList || [];
    state.flowTemplateJson = state.flowTemplateInfo.flowTemplateJson;
    state.properties = state.currFlow.approversProperties || {};
    state.isComment = state.flowTemplateJson.properties.isComment;
    state.isSummary = state.flowTemplateJson.properties.isSummary;
    state.summaryType = state.flowTemplateJson.properties.summaryType;
    state.flowTaskOperatorRecordList = (state.currFlow.flowTaskOperatorRecordList || []).reverse();
    state.endTime = state.flowTaskInfo.completion == 100 ? state.flowTaskInfo.endTime : 0;
  }
  function handleUrgentClick({ key }) {
    state.flowUrgent = key;
  }
  // 流程监控查看各节点表单详情
  function viewNodeDetail(data) {
    openNodeFormParserPopup(true, { ...data, flowId: state.config.flowId });
  }
</script>
<style lang="less">
  @import './style/index.less';
</style>
