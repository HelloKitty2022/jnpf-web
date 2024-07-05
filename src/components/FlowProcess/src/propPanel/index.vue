<template>
  <BasicDrawer
    class="full-drawer propPanel-drawer"
    @register="registerDrawer"
    :width="value && isConditionNode() ? 750 : 600"
    @visible-change="onDrawerVisibleChange"
    showFooter
    :maskClosable="false"
    @ok="handleOk">
    <template #title>
      <template v-if="value && (value.type == 'condition' || value.type == 'approver' || value.type == 'subFlow' || value.type == 'start')">
        <a-input v-model:value="properties.title" placeholder="请输入" class="!w-200px" />
      </template>
      <span v-else>{{ properties.title }}</span>
    </template>
    <!-- 发起节点配置 -->
    <StartNode ref="startRef" v-bind="getBindValue" :formConf="startForm" @updateFormFieldList="updateFormFieldList" v-if="value && isStartNode()" />
    <!-- 定时器节点配置 -->
    <TimerNode ref="timerRef" v-bind="getBindValue" :formConf="state.timerForm" v-if="value && isTimerNode()" />
    <!-- 条件节点配置 -->
    <ConditionNode ref="conditionRef" v-bind="getBindValue" :formConf="state.conditionForm" v-if="value && isConditionNode()" />
    <!-- 审批节点配置 -->
    <ApproverNode
      ref="approverRef"
      v-bind="getBindValue"
      :formConf="state.approverForm"
      @updateFormFieldList="updateFormFieldList"
      v-if="value && isApproverNode()" />
    <!-- 子流程节点配置 -->
    <SubFlowNode ref="subFlowRef" v-bind="getBindValue" :formConf="state.subFlowForm" v-if="value && isSubFlowNode()" />
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { computed, reactive, ref, toRefs, watch, unref } from 'vue';
  import { NodeUtils } from '../helper/util';
  import nodeConfig from '../helper/config';
  import { cloneDeep, omit } from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicDrawer, useDrawer } from '/@/components/Drawer';
  import StartNode from './StartNode.vue';
  import TimerNode from './TimerNode.vue';
  import ConditionNode from './ConditionNode.vue';
  import ApproverNode from './ApproverNode.vue';
  import SubFlowNode from './SubFlowNode.vue';
  import { getInfo as getFormInfo } from '/@/api/workFlow/formDesign';
  import { getPrintDevSelector } from '/@/api/system/printDev';
  import { systemFieldOptions } from '../helper/define';

  interface State {
    properties: any;
    activeKey: string;
    startForm: any;
    timerForm: any;
    conditionForm: any;
    approverForm: any;
    subFlowForm: any;
    formFieldList: any[];
    printTplOptions: any[];
    prevNodeList: any[];
    isPrevNodeWithSubForm: boolean;
    nodeOptions: any[];
    beforeNodeOptions: any[];
    oldFormId: string;
  }
  interface ComType {
    getContent: () => any;
  }
  interface OperateNodeType extends ComType {
    updateCheckStatus: () => any;
  }

  const props = defineProps([/* 当前节点数据 */ 'value', /* 整个节点数据 */ 'processData', 'formInfo']);
  const emit = defineEmits(['cancel', 'confirm']);
  const { createMessage } = useMessage();
  const [registerDrawer, { openDrawer, closeDrawer }] = useDrawer();
  const state = reactive<State>({
    properties: {}, // 当前节点数据
    activeKey: '1',
    startForm: cloneDeep(nodeConfig.defaultStartForm),
    timerForm: {},
    conditionForm: {},
    approverForm: cloneDeep(nodeConfig.defaultApproverForm),
    subFlowForm: cloneDeep(nodeConfig.defaultSubFlowForm),
    formFieldList: [],
    printTplOptions: [],
    prevNodeList: [],
    isPrevNodeWithSubForm: false,
    nodeOptions: [],
    beforeNodeOptions: [],
    oldFormId: '',
  });
  const { properties, startForm } = toRefs(state);
  const startRef = ref<Nullable<OperateNodeType>>(null);
  const timerRef = ref<Nullable<ComType>>(null);
  const conditionRef = ref<Nullable<ComType>>(null);
  const approverRef = ref<Nullable<OperateNodeType>>(null);
  const subFlowRef = ref<Nullable<ComType>>(null);

  const flowType = computed(() => props.formInfo?.type || 0);
  // 所有表单字段
  const formFieldsOptions = computed(() => state.formFieldList.filter(o => o.__config__.jnpfKey !== 'table').map(o => ({ ...o, disabled: false })));
  // 不包含子表的表单字段
  const usedFormItems = computed(() => unref(formFieldsOptions).filter(o => o.id.indexOf('-') < 0));
  // 流程时间表单字段
  const funcOptions = computed(() => {
    const options = unref(formFieldsOptions);
    return options.map(o => ({ ...o, label: o.fullName ? o.id + '(' + o.fullName + ')' : o.id }));
  });
  // 通知等用到表单字段
  const msgOptions = computed(() => {
    const options = [...systemFieldOptions, ...unref(formFieldsOptions)];
    return options.map(o => ({ ...o, label: o.fullName ? o.id + '(' + o.fullName + ')' : o.id }));
  });
  // 必填字段
  const funcRequiredOptions = computed(() => {
    const options = unref(formFieldsOptions).filter(o => o.__config__ && o.__config__.required);
    return options.map(o => ({ ...o, label: o.fullName ? o.id + '(' + o.fullName + ')' : o.id }));
  });
  const funcSystemFieldOptions = computed(() => {
    return systemFieldOptions.map(o => ({ ...o, label: o.fullName ? o.id + '(' + o.fullName + ')' : o.id }));
  });
  const getBindValue = computed(() => ({
    ...props,
    formFieldList: state.formFieldList,
    printTplOptions: state.printTplOptions,
    flowType: unref(flowType),
    formFieldsOptions: unref(formFieldsOptions),
    usedFormItems: unref(usedFormItems),
    funcOptions: unref(funcOptions),
    funcRequiredOptions: unref(funcRequiredOptions),
    msgOptions: unref(msgOptions),
    funcSystemFieldOptions: unref(funcSystemFieldOptions),
    initFormOperates,
    updateAllNodeFormOperates,
    getFormFieldList,
    transformFormJson,
    transformFieldList,
    nodeOptions: state.nodeOptions,
    beforeNodeOptions: state.beforeNodeOptions,
    prevNodeList: state.prevNodeList,
  }));

  watch(
    () => props.value,
    val => {
      if (val && val.properties) {
        state.properties = cloneDeep(val.properties);
        openDrawer();
      }
    },
  );

  function getPrintTplList() {
    getPrintDevSelector('1').then(res => {
      state.printTplOptions = res.data.list.filter(o => o.children && o.children.length).map(o => ({ ...o, hasChildren: true }));
    });
  }
  // 初始化发起人节点数据
  function initStartNodeData() {
    let properties = cloneDeep(props.value.properties);
    Object.assign(state.startForm, properties);
    state.oldFormId = state.startForm.formId;
    if (!state.oldFormId) return;
    let formFieldList: any[] = [];
    if (state.startForm.allFormMap && state.startForm.allFormMap['form_' + state.oldFormId]) {
      formFieldList = state.startForm.allFormMap['form_' + state.oldFormId] || [];
    }
    state.formFieldList = formFieldList;
    unref(startRef)?.updateCheckStatus();
  }
  // 发起人节点确认保存
  function startNodeConfirm() {
    if (state.startForm.errorRule == 2 && !state.startForm.errorRuleUser.length) return createMessage.error('请选择异常处理人');
    const titleObj = { title: state.properties.title };
    Object.assign(state.properties, state.startForm, titleObj);
    const content = unref(startRef)?.getContent();
    emit('confirm', state.properties, content);
    closeDrawer();
  }
  // 初始化定时器节点数据
  function initTimerNodeData() {
    let properties = cloneDeep(props.value.properties);
    Object.assign(state.timerForm, properties);
  }
  // 定时器节点确认保存
  function timerNodeConfirm() {
    Object.assign(state.properties, state.timerForm);
    const content = unref(timerRef)?.getContent();
    emit('confirm', state.properties, content);
    closeDrawer();
  }
  // 初始化条件节点数据
  function initConditionNodeData() {
    getConditionNodeFieldList();
    getSwerveNodeOption();
    let properties = cloneDeep(props.value.properties);
    Object.assign(state.conditionForm, properties);
    // 初始化条件表单数据
    let nodeConditions = props.value.properties && props.value.properties.conditions;
    for (let i = 0; i < nodeConditions.length; i++) {
      for (let j = 0; j < unref(usedFormItems).length; j++) {
        if (nodeConditions[i].id === unref(usedFormItems)[j].id) {
          nodeConditions[i] = { ...nodeConditions[i], ...unref(usedFormItems)[j] };
        }
      }
    }
    state.conditionForm.conditions = cloneDeep(nodeConditions || []);
    state.conditionForm.matchLogic = props.value.properties.matchLogic || 'and';
  }
  // 条件节点确认保存
  function conditionNodeConfirm() {
    if (!conditionExist()) return;
    if (state.conditionForm.conditionType == 1 && !state.conditionForm.swerveNode) return createMessage.error('请设置转向节点');
    const titleObj = { title: state.properties.title };
    Object.assign(state.properties, state.conditionForm, titleObj);
    const content = unref(conditionRef)?.getContent();
    emit('confirm', state.properties, content || '请设置条件');
    closeDrawer();
  }
  // 初始化审批节点数据
  function initApproverNodeData() {
    state.isPrevNodeWithSubForm = false;
    let properties = cloneDeep(props.value.properties);
    let formFieldList: any[] = [];
    const formId = properties.formId || props.processData.properties.formId;
    state.oldFormId = formId;
    if (formId && props.processData.properties.allFormMap && props.processData.properties.allFormMap['form_' + formId]) {
      formFieldList = props.processData.properties.allFormMap['form_' + formId] || [];
    }
    state.formFieldList = formFieldList;
    state.approverForm.formOperates = initFormOperates(props.value);
    Object.assign(state.approverForm, properties);
    unref(approverRef)?.updateCheckStatus();
    getNodeOption();
    getPrevNodeOption();
  }
  // 审批节点确认保存
  function approverNodeConfirm() {
    if (!state.properties.title) return createMessage.error('请输入节点名称');
    const assigneeType = state.approverForm.assigneeType;
    if (assigneeType == 6 && !state.approverForm.approvers.length) return createMessage.error('请设置审批人');
    if (assigneeType == 4 && !state.approverForm.formField) return createMessage.error('请选择表单字段');
    if (assigneeType == 5 && !state.approverForm.nodeId) return createMessage.error('请选择节点');
    if (assigneeType == 9 && !state.approverForm.interfaceConfig.interfaceId) return createMessage.error('请选择接口模板');
    if (state.approverForm.hasAgreeRule && !state.approverForm.agreeRules.length) return createMessage.error('请选择同意规则配置');
    const titleObj = { title: state.properties.title };
    Object.assign(state.properties, state.approverForm, titleObj);
    const content = unref(approverRef)?.getContent();
    emit('confirm', state.properties, content || '请设置审批人');
    closeDrawer();
  }
  // 子流程审批节点数据
  function initSubFlowNodeData() {
    getNodeOption();
    getPrevNodeOption();
    let properties = cloneDeep(props.value.properties);
    Object.assign(state.subFlowForm, properties);
    const prevNode = state.prevNodeList[0];
    let formFieldList: any[] = [];
    const formId = prevNode.properties.formId || props.processData.properties.formId;
    if (formId && props.processData.properties.allFormMap && props.processData.properties.allFormMap['form_' + formId]) {
      formFieldList = props.processData.properties.allFormMap['form_' + formId] || [];
    }
    state.formFieldList = formFieldList;
  }
  // 子流程节点确认保存
  function subFlowNodeConfirm() {
    if (!state.properties.title) return createMessage.error('请输入子流程名称');
    const initiateType = state.subFlowForm.initiateType;
    if (initiateType == 6 && !state.subFlowForm.initiator.length) return createMessage.error('请设置发起人');
    if (initiateType == 4 && !state.subFlowForm.formField) return createMessage.error('请选择表单字段');
    if (initiateType == 5 && !state.subFlowForm.nodeId) return createMessage.error('请选择节点');
    if (initiateType == 9 && !state.subFlowForm.interfaceConfig.interfaceId) return createMessage.error('请选择接口模板');
    if (!state.subFlowForm.flowId) return createMessage.error('请选择子流程表单');
    if (state.subFlowForm.errorRule == 2 && !state.subFlowForm.errorRuleUser.length) return createMessage.error('请选择异常处理人');
    const titleObj = { title: state.properties.title };
    Object.assign(state.properties, state.subFlowForm, titleObj);
    const content = unref(subFlowRef)?.getContent();
    emit('confirm', state.properties, content || '请设置发起人');
    closeDrawer();
  }
  const requiredDisabled = jnpfKey => {
    return ['billRule', 'createUser', 'createTime', 'modifyTime', 'modifyUser', 'currPosition', 'currOrganize', 'table'].includes(jnpfKey);
  };
  const getDataType = data => {
    if (!data.__config__ || !data.__config__.jnpfKey) return '';
    const jnpfKey = data.__config__.jnpfKey;
    if (['inputNumber', 'datePicker', 'rate', 'slider'].includes(jnpfKey)) {
      return 'number';
    } else if (['checkbox', 'uploadFile', 'uploadImg', 'cascader', 'organizeSelect', 'areaSelect'].includes(jnpfKey)) {
      return 'array';
    } else if (
      ['select', 'treeSelect', 'depSelect', 'posSelect', 'userSelect', 'usersSelect', 'roleSelect', 'groupSelect', 'popupSelect', 'popupTableSelect'].includes(
        jnpfKey,
      )
    ) {
      if (data.multiple) return 'array';
    }
    return '';
  };
  function initFormOperates(target, isUpdate = false, isSameForm = false) {
    const formOperates = (target.properties && target.properties.formOperates) || [];
    let res: any[] = [];
    const getWriteById = id => {
      const arr = formOperates.filter(o => o.id === id);
      return arr.length ? arr[0].write : NodeUtils.isStartNode(target);
    };
    const getReadById = id => {
      const arr = formOperates.filter(o => o.id === id);
      return arr.length ? arr[0].read : true;
    };
    const getRequiredById = id => {
      const arr = formOperates.filter(o => o.id === id);
      return arr.length ? arr[0].required : false;
    };
    if (!formOperates.length || isUpdate) {
      for (let i = 0; i < state.formFieldList.length; i++) {
        const data = state.formFieldList[i];
        res.push({
          id: data.id,
          name: data.fullName,
          required: !isSameForm ? data.__config__.required : data.__config__.required || getRequiredById(data.id),
          requiredDisabled: requiredDisabled(data.__config__.jnpfKey) || data.__config__.required,
          jnpfKey: data.__config__.jnpfKey,
          dataType: getDataType(data),
          read: !isSameForm ? true : getReadById(data.id),
          write: !isSameForm ? NodeUtils.isStartNode(target) : getWriteById(data.id),
        });
      }
    } else {
      res = formOperates;
    }
    return res;
  }
  function updateAllNodeFormOperates(isSameForm = false) {
    const loop = data => {
      if (Array.isArray(data)) data.forEach(d => loop(d));
      if (data.type === 'approver' && !data.properties.formId) {
        data.properties.formOperates = initFormOperates(data, true, isSameForm);
      }
      if (data.conditionNodes && Array.isArray(data.conditionNodes)) loop(data.conditionNodes);
      if (data.childNode) loop(data.childNode);
    };
    loop(props.processData);
  }
  function getFormFieldList(id, form, isSameForm = false) {
    getFormInfo(id).then(res => {
      const { formType = 1, propertyJson } = res.data;
      let formJson: any = {},
        fieldList: any = [];
      if (propertyJson) formJson = JSON.parse(propertyJson);
      if (formType == 1) {
        fieldList = transformFormJson(formJson);
      } else {
        fieldList = formJson.fields;
      }
      let list: any[] = transformFieldList(fieldList);
      state.formFieldList = list;
      state[form].formOperates = initFormOperates(props.value, true, isSameForm);
      updateAllFormMap(id, form, list);
      // 更新所有没设置表单的节点的表单权限
      if (form === 'startForm') updateAllNodeFormOperates(isSameForm);
    });
  }
  // 更新allFormMap
  function updateAllFormMap(id, form, list) {
    if (form === 'startForm') {
      if (!state[form].allFormMap) state[form].allFormMap = {};
      if (state.oldFormId && !getHasSameFormId(state.oldFormId)) delete state[form].allFormMap['form_' + state.oldFormId];
      if (id) state[form].allFormMap['form_' + id] = list;
    } else {
      if (!props.processData.properties.allFormMap) props.processData.properties.allFormMap = {};
      if (state.oldFormId && !getHasSameFormId(state.oldFormId)) delete props.processData.properties.allFormMap['form_' + state.oldFormId];
      if (id) props.processData.properties.allFormMap['form_' + id] = list;
    }
    state.oldFormId = id;
  }
  // 判断其他节点是否跟当前节点旧表单同一表单
  function getHasSameFormId(formId) {
    if (!formId) return false;
    let hasSameFormId = false;
    const loop = data => {
      if (Array.isArray(data)) data.forEach(d => loop(d));
      if ((data.type === 'approver' || data.type === 'start') && data.nodeId !== props.value.nodeId && data.properties.formId === formId) {
        return (hasSameFormId = true);
      }
      if (data.conditionNodes && Array.isArray(data.conditionNodes)) loop(data.conditionNodes);
      if (data.childNode) loop(data.childNode);
    };
    loop(props.processData);
    return hasSameFormId;
  }
  function transformFormJson(list) {
    const fieldList = list.map(o => ({
      __config__: {
        label: o.filedName,
        jnpfKey: o.jnpfKey || '',
        required: o.required || false,
      },
      __vModel__: o.filedId,
      multiple: o.multiple || false,
    }));
    return fieldList;
  }
  function transformFieldList(formFieldList) {
    let list: any[] = [];
    const loop = (data, parent?) => {
      if (!data) return;
      if (data.__vModel__) {
        const isTableChild = parent && parent.__config__ && parent.__config__.jnpfKey === 'table';
        list.push({
          id: isTableChild ? parent.__vModel__ + '-' + data.__vModel__ : data.__vModel__,
          fullName: isTableChild ? parent.__config__.label + '-' + data.__config__.label : data.__config__.label,
          ...omit(data, ['__config__', 'on', 'style', 'options', 'props', 'templateJson', 'columnOptions', 'addTableConf', 'tableConf']),
          __vModel__: isTableChild ? parent.__vModel__ + '-' + data.__vModel__ : data.__vModel__,
          __config__: {
            label: isTableChild ? parent.__config__.label + '-' + data.__config__.label : data.__config__.label,
            jnpfKey: data.__config__.jnpfKey,
            required: data.__config__.required,
            isSubTable: data.__config__.isSubTable,
          },
        });
      }
      if (Array.isArray(data)) data.forEach(d => loop(d, parent));
      if (data.__config__ && data.__config__.children && Array.isArray(data.__config__.children)) {
        loop(data.__config__.children, data);
      }
    };
    loop(formFieldList);
    return list;
  }
  function updateFormFieldList(data, form) {
    state.formFieldList = data;
    updateAllFormMap('', form, data);
  }
  function getConditionNodeFieldList() {
    getPrevNodeOption();
    if (!state.prevNodeList.length) {
      state.formFieldList = [];
    } else {
      let prevNode = state.prevNodeList[0];
      let formFieldList: any[] = [];
      const formId = prevNode.properties.formId || props.processData.properties.formId;
      if (formId && props.processData.properties.allFormMap && props.processData.properties.allFormMap['form_' + formId]) {
        formFieldList = props.processData.properties.allFormMap['form_' + formId] || [];
      }
      state.formFieldList = formFieldList.filter(o => o.__config__.jnpfKey !== 'table');
    }
  }
  // 获取上一节数据
  function getPrevNodeOption() {
    let prevNode = NodeUtils.getPreviousNode(props.value.prevId, props.processData);
    let node = cloneDeep(prevNode);
    delete node.childNode;
    let prevNodeList: any[] = [];
    const loop = nodeData => {
      if (nodeData.conditionNodes) {
        let hasCondition = nodeData.conditionNodes.some(o => o.nodeId === props.value.nodeId);
        if (hasCondition) return prevNodeList.push(nodeData);
      }
      if (nodeData.childNode) {
        loop(nodeData.childNode);
      } else if (nodeData.conditionNodes && !nodeData.childNode) {
        for (let c of nodeData.conditionNodes) {
          loop(c);
        }
      } else {
        prevNodeList.push(nodeData);
      }
    };
    loop(node);
    state.prevNodeList = prevNodeList;
    getPrevNodeRealList();
  }
  function getPrevNodeRealList() {
    const loop = data => {
      inner: for (let i = 0; i < data.length; i++) {
        if (['condition', 'subFlow', 'timer'].includes(data[i].type)) {
          if (data[i].type === 'subFlow') state.isPrevNodeWithSubForm = true;
          let prevNode = NodeUtils.getPreviousNode(data[i].prevId, props.processData);
          let node = cloneDeep(prevNode);
          delete node.childNode;
          let prevNodeList: any[] = [];
          const getPrevNodeAllList = nodeData => {
            if (nodeData.conditionNodes) {
              let hasCondition = nodeData.conditionNodes.some(o => o.nodeId === data[i].nodeId);
              if (hasCondition) return prevNodeList.push(nodeData);
            }
            if (nodeData.childNode) {
              getPrevNodeAllList(nodeData.childNode);
            } else if (nodeData.conditionNodes && !nodeData.childNode) {
              for (let c of nodeData.conditionNodes) {
                getPrevNodeAllList(c);
              }
            } else {
              prevNodeList.push(nodeData);
            }
          };
          getPrevNodeAllList(node);
          data.splice(i, 1, ...prevNodeList);
          loop(data);
          break inner;
        }
      }
    };
    loop(state.prevNodeList);
    state.prevNodeList = unique(state.prevNodeList, 'nodeId');
  }
  // 去重
  function unique(arr, attrName) {
    const res = new Map();
    // 根据对象的某个属性值去重
    return arr.filter(o => !res.has(o[attrName]) && res.set(o[attrName], 1));
  }
  // 条件字段验证
  function conditionExist() {
    let isOk = true;
    outer: for (let i = 0; i < state.conditionForm.conditions.length; i++) {
      const e = state.conditionForm.conditions[i];
      for (let j = 0; j < e.groups.length; j++) {
        const child = e.groups[j];
        if (!child.field) {
          const msg = child.fieldType === 1 ? '条件字段不能为空' : '公式不能为空';
          createMessage.error(msg);
          isOk = false;
          break outer;
        }
        if (!child.symbol) {
          createMessage.error('运算符号不能为空');
          isOk = false;
          break outer;
        }
      }
    }
    return isOk;
  }
  // 获取节点选项
  function getNodeOption() {
    let list: any[] = [];
    const loop = data => {
      if (Array.isArray(data)) data.forEach(d => loop(d));
      if (data.type === 'approver') list.push(data);
      if (data.conditionNodes && Array.isArray(data.conditionNodes)) loop(data.conditionNodes);
      if (data.childNode) loop(data.childNode);
    };
    loop(props.processData);
    let beforeNodeList: any[] = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].nodeId === props.value.nodeId) break;
      beforeNodeList.push(list[i]);
    }
    state.beforeNodeOptions = beforeNodeList.map(o => ({ id: o.nodeId, fullName: o.properties.title }));
    state.nodeOptions = list.filter(o => o.nodeId !== props.value.nodeId).map(o => ({ id: o.nodeId, fullName: o.properties.title }));
  }
  // 获取转向节点选项
  function getSwerveNodeOption() {
    let list: any[] = [];
    const loop = data => {
      if (Array.isArray(data)) data.forEach(d => loop(d));
      if (data.type === 'approver' || data.type === 'start') list.push(data);
      if (data.conditionNodes && Array.isArray(data.conditionNodes)) loop(data.conditionNodes);
      if (data.childNode) loop(data.childNode);
    };
    loop(props.processData);
    const prevNode = state.prevNodeList[0];
    let beforeNodeList: any[] = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].nodeId === prevNode.nodeId) break;
      beforeNodeList.push(list[i]);
    }
    state.beforeNodeOptions = beforeNodeList.map(o => ({ id: o.nodeId, fullName: o.properties.title }));
  }
  // 判断是否是发起节点
  function isStartNode() {
    return props.value ? NodeUtils.isStartNode(props.value) : false;
  }
  // 判断是否是定时器节点
  function isTimerNode() {
    return props.value ? NodeUtils.isTimerNode(props.value) : false;
  }
  // 判断是否是条件节点
  function isConditionNode() {
    return props.value ? NodeUtils.isConditionNode(props.value) : false;
  }
  // 判断是否是审批节点
  function isApproverNode() {
    return props.value ? NodeUtils.isApproverNode(props.value) : false;
  }
  //  判断是否是子流程节点
  function isSubFlowNode() {
    return props.value ? NodeUtils.isSubFlowNode(props.value) : false;
  }
  function onDrawerVisibleChange(val) {
    if (!val) {
      // 重置数据为默认状态
      state.startForm = cloneDeep(nodeConfig.defaultStartForm);
      state.approverForm = cloneDeep(nodeConfig.defaultApproverForm);
      state.subFlowForm = cloneDeep(nodeConfig.defaultSubFlowForm);
      emit('cancel');
      return;
    }
    isStartNode() && initStartNodeData();
    isTimerNode() && initTimerNodeData();
    isConditionNode() && initConditionNodeData();
    isApproverNode() && initApproverNodeData();
    isSubFlowNode() && initSubFlowNodeData();
    getPrintTplList();
  }
  function handleOk() {
    isStartNode() && startNodeConfirm();
    isTimerNode() && timerNodeConfirm();
    isConditionNode() && conditionNodeConfirm();
    isApproverNode() && approverNodeConfirm();
    isSubFlowNode() && subFlowNodeConfirm();
  }
</script>
