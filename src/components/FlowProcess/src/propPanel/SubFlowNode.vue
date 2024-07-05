<template>
  <section class="common-pane">
    <a-tabs v-model:activeKey="activeKey" size="small" class="pane-tabs">
      <a-tab-pane key="1" tab="基础设置"></a-tab-pane>
      <a-tab-pane key="2" tab="节点通知"></a-tab-pane>
    </a-tabs>
    <ScrollContainer class="config-content">
      <a-form :colon="false" layout="vertical" :model="formConf" class="config-form" v-show="activeKey === '1'">
        <a-form-item label="子流程类型">
          <a-radio-group v-model:value="formConf.isAsync" class="common-radio">
            <a-radio :value="false">同步</a-radio>
            <a-radio :value="true">异步</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="子流程表单">
          <FlowModal :value="formConf.flowId" :title="formConf.flowName" :flowType="flowType" @change="onSubFlowIdChange" placeholder="请选择" />
        </a-form-item>
        <a-form-item label="子流程传递">
          <a-input :value="formConf.assignList.length ? '已设置' : ''" placeholder="请设置子流程传递规则" readonly class="hand" @click="openTransmitRuleBox">
            <template #suffix>
              <span class="ant-select-arrow"><down-outlined /></span>
            </template>
          </a-input>
        </a-form-item>
        <a-form-item label="发起设置">
          <jnpf-radio v-model:value="formConf.initiateType" :options="typeOptions" class="type-radio" @change="formConf.initiator = []" />
          <div :class="{ 'mb-10px': formConf.initiateType !== 3, 'mt-10px': true }">
            <div v-if="formConf.initiateType === 1" class="common-tip">发起者的主管将作为子流程发起人</div>
            <div v-if="formConf.initiateType === 2" class="common-tip">发起者的部门主管将作为子流程发起人</div>
            <div v-if="formConf.initiateType === 3" class="common-tip">发起者自己将作为子流程发起人</div>
            <div v-if="formConf.initiateType === 4" class="common-tip">选择表单字段的值作为子流程发起人</div>
            <div v-if="formConf.initiateType === 5" class="common-tip">设置审批流程中某个环节的审批人作为子流程发起人</div>
            <div v-if="formConf.initiateType === 6" class="common-tip">所指定的成员将作为子流程发起人，多人时，发起多个子流程</div>
            <div v-if="formConf.initiateType === 7" class="common-tip">指定可供选择的候选人发起多个子流程</div>
            <div v-if="formConf.initiateType === 9" class="common-tip">从目标服务中获取子流程发起人</div>
          </div>
          <a-form-item label="发起者的" class="!mb-0" v-if="formConf.initiateType === 1">
            <a-select v-model:value="formConf.managerLevel">
              <a-select-option v-for="item in 10" :key="item" :value="item">{{ item === 1 ? '直属主管' : '第' + item + '级主管' }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="发起者的" class="!mb-0" v-if="formConf.initiateType === 2">
            <a-select v-model:value="formConf.departmentLevel">
              <a-select-option v-for="item in 10" :key="item" :value="item">{{ '第' + item + '级部门主管' }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="表单字段" class="!mb-0" v-if="formConf.initiateType === 4">
            <a-input-group compact>
              <a-select v-model:value="formConf.formFieldType" placeholder="请选择" class="!w-100px">
                <a-select-option :value="1">用户</a-select-option>
                <a-select-option :value="2">部门</a-select-option>
                <a-select-option :value="3">岗位</a-select-option>
                <a-select-option :value="4">角色</a-select-option>
                <a-select-option :value="5">分组</a-select-option>
              </a-select>
              <jnpf-select v-model:value="formConf.formField" placeholder="请选择" :options="childFieldOptions" showSearch style="width: calc(100% - 100px)" />
            </a-input-group>
          </a-form-item>
          <a-form-item label="审批节点" class="!mb-0" v-if="formConf.initiateType === 5">
            <jnpf-select v-model:value="formConf.nodeId" placeholder="请选择" showSearch :options="nodeOptions" />
          </a-form-item>
          <a-form-item class="!mb-0" v-if="formConf.initiateType === 9">
            <template #label>请求路径<BasicHelp text='请求自带参数：taskId、taskNodeId，返回结构：JSON对象{"handleId":"id1,id2"}' /></template>
            <select-interface
              :value="formConf.interfaceConfig.interfaceId"
              :title="formConf.interfaceConfig.interfaceName"
              :templateJson="formConf.interfaceConfig.templateJson"
              :fieldOptions="childFieldOptions"
              showSystemFullLabel
              isFlow
              @change="(val, data) => onFuncChange(keyMap.interfaceConfig, val, data)"
              @fieldChange="onRelationFieldChange" />
          </a-form-item>
          <div v-if="formConf.initiateType === 6 || formConf.initiateType === 7">
            <jnpf-users-select
              v-model:value="formConf.initiator"
              buttonType="button"
              :modalTitle="formConf.initiateType === 6 ? '添加发起人' : '添加候选人'"
              multiple
              @labelChange="onLabelChange" />
          </div>
        </a-form-item>
        <a-form-item>
          <template #label>异常处理<BasicHelp text="子流程发起节点人员异常时遵循该规则" /></template>
          <jnpf-select v-model:value="formConf.errorRule" :options="errorRuleOptions" @change="formConf.errorRuleUser = []" />
          <jnpf-user-select v-model:value="formConf.errorRuleUser" buttonType="button" multiple class="mt-10px" v-if="formConf.errorRule === 2" />
        </a-form-item>
        <a-form-item>
          <template #label>子流程发起后自动提交<BasicHelp text="流程发起的下一节点设置选择分支或候选审批人时无法自动发起审批" /></template>
          <a-radio-group v-model:value="formConf.autoSubmit" class="common-radio">
            <a-radio :value="false">否</a-radio>
            <a-radio :value="true">是</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
      <div v-show="activeKey === '2'">
        <a-alert message="该通知设置在【消息中心】-【消息发送配置】维护，选择默认则站内信提醒，选择关闭则不提醒。" type="warning" showIcon class="!mb-10px" />
        <a-form :colon="false" :model="formConf" layout="vertical" class="config-form">
          <a-form-item>
            <template #label>子流程发起<BasicHelp text="该子流程被发起的时候" /></template>
            <jnpf-select v-model:value="formConf.launchMsgConfig.on" :options="noticeOptions" />
          </a-form-item>
          <a-form-item v-if="formConf.launchMsgConfig.on === 1">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">发送配置</label></div>
            <msg-modal
              :value="formConf.launchMsgConfig.msgId"
              :title="formConf.launchMsgConfig.msgName"
              @change="(val, data) => onMsgChange(keyMap.launchMsgConfig, val, data)" />
            <div class="ant-form-item-label mt-12px"><label class="ant-form-item-no-colon">参数设置</label></div>
            <a-table :data-source="formConf.launchMsgConfig.templateJson" :columns="msgTemplateJsonColumns" size="small" :pagination="false">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'msgTemplateName'">
                  <p class="link-text" @click="goMsgDetail(record.templateId)">{{ record.msgTemplateName }}</p>
                </template>
                <template v-if="column.key === 'paramJson'">
                  <div class="parameter-box" :title="item.field + '(' + item.fieldName + ')'" v-for="(item, index) in record.paramJson" :key="index">
                    {{ item.field }}({{ item.fieldName }})
                  </div>
                </template>
                <template v-if="column.key === 'field'">
                  <jnpf-select
                    v-model:value="item.relationField"
                    :options="msgOptions"
                    allowClear
                    showSearch
                    :fieldNames="{ label: 'label', options: 'options1' }"
                    optionLabelProp="label"
                    class="!w-170px"
                    :class="{ '!mt-8px': index > 0 }"
                    @change="onRelationFieldChange($event, item)"
                    v-for="(item, index) in record.paramJson"
                    :key="index" />
                </template>
              </template>
              <template #emptyText>
                <p class="leading-60px">暂无数据</p>
              </template>
            </a-table>
          </a-form-item>
        </a-form>
      </div>
    </ScrollContainer>
    <MsgTemplateDetail @register="registerDetail" />
    <BasicModal v-bind="$attrs" @register="registerRuleModal" title="数据传递" :width="700" @ok="handleSubmitTransmitRule" class="rule-modal">
      <a-tabs size="small" class="node-tabs">
        <a-tab-pane :tab="item.title" v-for="(item, i) in state.assignList" :key="i">
          <div class="common-tip mb-10px">当父流程流转到子流程时，将对应的上一节点表单字段赋值给子流程发起节点</div>
          <a-row :gutter="10" v-for="(child, cIndex) in item.ruleList" :key="cIndex" class="mb-10px">
            <a-col :span="2" class="rule-cell">父流程</a-col>
            <a-col :span="7" class="rule-cell">
              <jnpf-select
                v-model:value="child.parentField"
                :options="[...sysFieldList, ...item.formFieldList]"
                :fieldNames="{ options: 'options1' }"
                showSearch
                allowClear
                placeholder="请选择字段"
                class="!w-full" />
            </a-col>
            <a-col :span="4" class="rule-cell mid">赋值给</a-col>
            <a-col :span="2" class="rule-cell">子流程</a-col>
            <a-col :span="7" class="rule-cell">
              <jnpf-select
                v-model:value="child.childField"
                :options="childFieldOptions"
                :fieldNames="{ options: 'options1' }"
                showSearch
                allowClear
                placeholder="请选择字段"
                class="!w-full" />
            </a-col>
            <a-col :span="2" class="rule-cell">
              <a-button type="danger" @click="delTransmitRule(i, cIndex)"><i class="icon-ym icon-ym-nav-close" /></a-button>
            </a-col>
          </a-row>
          <div class="table-add-action" @click="addTransmitRule(i)">
            <a-button type="link" preIcon="icon-ym icon-ym-btn-add">新增规则</a-button>
          </div>
        </a-tab-pane>
      </a-tabs>
    </BasicModal>
  </section>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, watch } from 'vue';
  import { ScrollContainer } from '/@/components/Container';
  import FlowModal from './FlowModal.vue';
  import MsgModal from './MsgModal.vue';
  import MsgTemplateDetail from './MsgTemplateDetail.vue';
  import { typeOptions, noticeOptions } from '../helper/define';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { cloneDeep } from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getFlowFormInfo } from '/@/api/workFlow/flowEngine';
  import { SelectInterface } from '/@/components/Interface';

  interface State {
    activeKey: string;
    userLabel: string;
    assignList: any[];
    childFieldOptions: any[];
  }

  const props = defineProps([
    'value' /* 当前节点数据 */,
    'processData' /* 整个节点数据 */,
    'formInfo',
    'formConf',
    'formFieldList',
    'printTplOptions',
    'flowType',
    'formFieldsOptions',
    'usedFormItems',
    'funcOptions',
    'msgOptions',
    'funcRequiredOptions',
    'funcSystemFieldOptions',
    'initFormOperates',
    'updateAllNodeFormOperates',
    'getFormFieldList',
    'transformFormJson',
    'transformFieldList',
    'nodeOptions',
    'beforeNodeOptions',
    'prevNodeList',
  ]);
  defineOptions({ name: 'subFlowNode', inheritAttrs: false });
  defineExpose({ getContent });
  const { createMessage } = useMessage();
  const [registerRuleModal, { openModal: openRuleModal, closeModal: closeRuleModal }] = useModal();

  const errorRuleOptions = [
    { id: 1, fullName: '超级管理员' },
    { id: 2, fullName: '指定人员' },
    { id: 6, fullName: '发起者本人' },
  ];
  const keyMap = {
    launchMsgConfig: 'launchMsgConfig',
    interfaceConfig: 'interfaceConfig',
  };
  const msgTemplateJsonColumns = [
    { width: 50, title: '序号', align: 'center', customRender: ({ index }) => index + 1 },
    { title: '模板名称', dataIndex: 'msgTemplateName', key: 'msgTemplateName' },
    { title: '参数名称', dataIndex: 'paramJson', key: 'paramJson', width: 170 },
    { title: '表单字段', dataIndex: 'field', key: 'field', width: 190 },
  ];
  const sysFieldList = [{ id: '@prevNodeFormId', fullName: '上节点表单Id' }];
  const [registerDetail, { openModal: openDetailModal }] = useModal();
  const state = reactive<State>({
    activeKey: '1',
    userLabel: '',
    assignList: [],
    childFieldOptions: [],
  });
  const { activeKey, childFieldOptions } = toRefs(state);

  watch(
    () => props.formConf.flowId,
    val => {
      getSubFlowFormInfo(val);
    },
    { immediate: true, deep: true },
  );

  function onLabelChange(val) {
    state.userLabel = val;
  }
  function getContent() {
    let content = '';
    if (props.formConf.initiateType != 6) {
      content = typeOptions.find(o => o.id === props.formConf.initiateType)?.fullName || '';
    } else {
      content = state.userLabel;
    }
    return content;
  }
  function onSubFlowIdChange(id, item) {
    if (!id) {
      props.formConf.flowId = '';
      props.formConf.flowName = '';
      props.formConf.assignList = [];
      return;
    }
    if (props.formConf.flowId === id) return;
    props.formConf.flowId = id;
    props.formConf.flowName = item.fullName;
    props.formConf.assignList = [];
  }
  function onFuncChange(key, val, row) {
    if (!val) {
      props.formConf[key].interfaceId = '';
      props.formConf[key].interfaceName = '';
      props.formConf[key].templateJson = [];
      return;
    }
    if (props.formConf[key].interfaceId === val) return;
    props.formConf[key].interfaceId = val;
    props.formConf[key].interfaceName = row.fullName;
    props.formConf[key].templateJson = row.templateJson.map(o => ({ ...o, sourceType: 1 })) || [];
  }
  function onMsgChange(key, val, row) {
    if (!val) {
      props.formConf[key].msgId = '';
      props.formConf[key].msgName = '';
      props.formConf[key].templateJson = [];
      return;
    }
    if (props.formConf[key].msgId === val) return;
    props.formConf[key].msgId = val;
    props.formConf[key].msgName = row.fullName;
    props.formConf[key].templateJson = row.templateJson || [];
  }
  function onRelationFieldChange(val, row) {
    if (!val) return;
    let list = props.msgOptions.filter(o => o.id === val);
    if (!list.length) return;
    let item = list[0];
    row.isSubTable = item.__config__ && item.__config__.isSubTable ? item.__config__.isSubTable : false;
  }
  function openTransmitRuleBox() {
    if (!props.formConf.flowId) return createMessage.error('请选择子流程表单');
    const assignList = props.formConf.assignList ? cloneDeep(props.formConf.assignList) : [];
    getRealAssignList(assignList);
    openRuleModal(true);
  }
  function getSubFlowFormInfo(flowId) {
    if (!flowId) return (state.childFieldOptions = []);
    getFlowFormInfo(flowId).then(res => {
      let { formType = 1, propertyJson } = res.data;
      let formJson: any = {},
        fieldList: any[] = [],
        fieldOptions: any[] = [];
      if (propertyJson) formJson = JSON.parse(propertyJson);
      if (formType == 1) {
        fieldList = props.transformFormJson(formJson);
      } else {
        fieldList = formJson.fields;
      }
      fieldOptions = props.transformFieldList(fieldList).filter(o => o.__config__.jnpfKey !== 'table');
      state.childFieldOptions = fieldOptions.map(o => ({ ...o, label: o.fullName ? o.id + '(' + o.fullName + ')' : o.id }));
    });
  }
  function getRealAssignList(assignList) {
    let newAssignList = props.prevNodeList.map(o => {
      let formFieldList: any[] = [];
      const formId = o.properties.formId || props.processData.properties.formId;
      if (formId && props.processData.properties.allFormMap && props.processData.properties.allFormMap['form_' + formId]) {
        formFieldList = props.processData.properties.allFormMap['form_' + formId] || [];
      }
      formFieldList = formFieldList.filter(o => o.__config__.jnpfKey !== 'table');
      return {
        nodeId: o.nodeId,
        title: o.properties.title,
        formFieldList,
        ruleList: [],
      };
    });
    if (!assignList.length) {
      state.assignList = newAssignList;
    } else {
      let list: any[] = [];
      // 去掉被删掉的节点
      for (let i = 0; i < assignList.length; i++) {
        const e = assignList[i];
        inter: for (let j = 0; j < newAssignList.length; j++) {
          if (e.nodeId === newAssignList[j].nodeId) {
            const item = {
              nodeId: e.nodeId,
              title: newAssignList[j].title,
              formFieldList: newAssignList[j].formFieldList,
              ruleList: e.ruleList,
            };
            list.push(item);
            break inter;
          }
        }
      }
      const addList = newAssignList.filter(o => !assignList.some(item => item.nodeId === o.nodeId));
      state.assignList = [...list, ...addList];
    }
  }
  function addTransmitRule(i) {
    state.assignList[i].ruleList.push({
      parentField: '',
      childField: '',
      childFieldOptions: [],
    });
  }
  function delTransmitRule(i, cIndex) {
    state.assignList[i].ruleList.splice(cIndex, 1);
  }
  function handleSubmitTransmitRule() {
    let boo = true;
    for (let i = 0; i < state.assignList.length; i++) {
      const e = state.assignList[i];
      const ruleList = e.ruleList;
      for (let j = 0; j < ruleList.length; j++) {
        if (!ruleList[j].parentField) {
          boo = false;
          createMessage.error(`请选择${e.title}的父流程字段`);
          break;
        }
        if (!ruleList[j].childField) {
          boo = false;
          createMessage.error(`请选择${e.title}的子流程字段`);
          break;
        }
      }
    }
    if (!boo) return;
    props.formConf.assignList = state.assignList;
    closeRuleModal();
    state.assignList = [];
  }
  function goMsgDetail(id) {
    openDetailModal(true, { id });
  }
</script>
