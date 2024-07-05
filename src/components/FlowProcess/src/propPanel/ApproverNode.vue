<template>
  <section class="common-pane">
    <a-tabs v-model:activeKey="activeKey" size="small" class="pane-tabs">
      <a-tab-pane key="1" tab="基础设置"></a-tab-pane>
      <a-tab-pane key="2" tab="高级设置"></a-tab-pane>
      <a-tab-pane key="3" tab="表单权限"></a-tab-pane>
      <a-tab-pane key="4" tab="节点事件"></a-tab-pane>
      <a-tab-pane key="5" tab="节点通知"></a-tab-pane>
      <a-tab-pane key="6" tab="超时处理"></a-tab-pane>
    </a-tabs>
    <ScrollContainer class="config-content" v-show="activeKey !== '3'">
      <a-form :colon="false" layout="vertical" :model="formConf" class="config-form" v-show="activeKey === '1'">
        <a-form-item v-if="flowType !== 1">
          <template #label>表单设置<BasicHelp text="审批节点不设置表单，默认引用发起节点表单" /></template>
          <FlowFormModal :value="formConf.formId" :title="formConf.formName" :flowType="flowType" @change="onFormIdChange" placeholder="请选择" />
        </a-form-item>
        <a-form-item v-if="flowType !== 1">
          <template #label>
            数据传递
            <BasicHelp :text="['不设置传递规则时字段名称相同自动赋值', '设置传递规则时相同名称字段会自动赋值字段后再按传递规则赋值']" />
          </template>
          <a-input :value="formConf.assignList.length ? '已设置' : ''" placeholder="请设置数据传递规则" readonly class="hand" @click="openTransmitRuleBox">
            <template #suffix>
              <span class="ant-select-arrow"><down-outlined /></span>
            </template>
          </a-input>
        </a-form-item>
        <a-form-item label="审批设置">
          <jnpf-radio v-model:value="formConf.assigneeType" :options="typeOptions" class="type-radio" @change="onAssigneeTypeChange" />
          <div :class="{ 'mb-10px': formConf.assigneeType !== 2 && formConf.assigneeType !== 3, 'mt-10px': true }">
            <div v-if="formConf.assigneeType === 1" class="common-tip">发起者主管将作为审批人处理审批单</div>
            <div v-if="formConf.assigneeType === 2" class="common-tip">发起者的部门主管将作为审批人处理审批单</div>
            <div v-if="formConf.assigneeType === 3" class="common-tip">发起者自己将作为审批人处理审批单</div>
            <div v-if="formConf.assigneeType === 4" class="common-tip">选择流程表单字段的值作为审批人</div>
            <div v-if="formConf.assigneeType === 5" class="common-tip">设置审批人为审批流程中某个环节的审批人</div>
            <div v-if="formConf.assigneeType === 6" class="common-tip">指定审批人处理审批单</div>
            <div v-if="formConf.assigneeType === 7" class="common-tip">默认所有人，需要设置请指定候选人范围处理审批单</div>
            <div v-if="formConf.assigneeType === 9" class="common-tip">从目标服务中获取审批人</div>
          </div>
          <a-form-item label="发起者的" class="!mb-0" v-if="formConf.assigneeType === 1">
            <a-select v-model:value="formConf.managerLevel">
              <a-select-option v-for="item in 10" :key="item" :value="item">{{ item === 1 ? '直属主管' : '第' + item + '级主管' }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="表单字段" class="!mb-0" v-if="formConf.assigneeType === 4">
            <a-input-group compact>
              <a-select v-model:value="formConf.formFieldType" placeholder="请选择" class="!w-100px">
                <a-select-option :value="1">用户</a-select-option>
                <a-select-option :value="2">部门</a-select-option>
                <a-select-option :value="3">岗位</a-select-option>
                <a-select-option :value="4">角色</a-select-option>
                <a-select-option :value="5">分组</a-select-option>
              </a-select>
              <jnpf-select
                v-model:value="formConf.formField"
                placeholder="请选择"
                :options="usedFormItems"
                :fieldNames="{ options: 'options1' }"
                showSearch
                style="width: calc(100% - 100px)" />
            </a-input-group>
          </a-form-item>
          <a-form-item label="审批节点" class="!mb-0" v-if="formConf.assigneeType === 5">
            <jnpf-select v-model:value="formConf.nodeId" placeholder="请选择" showSearch :options="nodeOptions" />
          </a-form-item>
          <a-form-item class="!mb-0" v-if="formConf.assigneeType === 9">
            <template #label>请求路径<BasicHelp text='请求自带参数：taskId、taskNodeId，返回结构：JSON对象{"handleId":"id1,id2"}' /></template>
            <select-interface
              :value="formConf.interfaceConfig.interfaceId"
              :title="formConf.interfaceConfig.interfaceName"
              :templateJson="formConf.interfaceConfig.templateJson"
              :fieldOptions="funcOptions"
              isFlow
              showSystemFullLabel
              @change="(val, data) => onFuncChange(keyMap.interfaceConfig, val, data)"
              @fieldChange="onRelationFieldChange" />
          </a-form-item>
          <div v-if="formConf.assigneeType === 6 || formConf.assigneeType === 7">
            <jnpf-users-select
              v-model:value="formConf.approvers"
              buttonType="button"
              :modalTitle="formConf.assigneeType === 6 ? '添加审批人' : '添加候选人'"
              multiple
              @Change="onApproversChange"
              @labelChange="onLabelChange" />
          </div>
          <a-form-item class="!mb-0 !mt-10px" v-if="formConf.assigneeType === 6">
            <template #label>审批人范围<BasicHelp text="指定成员增加人员选择范围附加条件" /></template>
            <jnpf-select v-model:value="formConf.extraRule" placeholder="请选择" :options="extraRuleOptions" />
          </a-form-item>
        </a-form-item>
        <a-form-item label="审批方式">
          <jnpf-radio v-model:value="formConf.counterSign" :options="counterSignOptions" class="counterSign-radio" />
        </a-form-item>
        <a-form-item label="设置会签流转规则" v-if="formConf.counterSign == 1">
          <div class="countersign-cell mb-10px">
            <span class="w-70px inline-block">同意规则</span>
            <jnpf-select v-model:value="formConf.counterSignConfig.auditType" :options="auditTypeOptions" class="!w-120px !mx-10px" />
            <a-select v-model:value="formConf.counterSignConfig.auditRatio" class="!w-120px !mr-10px" v-if="formConf.counterSignConfig.auditType === 1">
              <a-select-option v-for="item in 10" :key="item" :value="item * 10">{{ item * 10 + '%' }}</a-select-option>
            </a-select>
            <a-input-number
              class="!w-120px !mr-10px"
              v-model:value="formConf.counterSignConfig.auditNum"
              placeholder="请输入"
              :precision="0"
              :min="1"
              @change="onSignNumberChange($event, 'auditNum')"
              v-if="formConf.counterSignConfig.auditType === 2" />
            <span>同意时进入下一节点</span>
          </div>
          <div class="countersign-cell">
            <span class="w-70px inline-block">不同意规则</span>
            <jnpf-select v-model:value="formConf.counterSignConfig.rejectType" :options="rejectTypeOptions" class="!w-120px !mx-10px" />
            <a-select v-model:value="formConf.counterSignConfig.rejectRatio" class="!w-120px !mr-10px" v-if="formConf.counterSignConfig.rejectType === 1">
              <a-select-option v-for="item in 10" :key="item" :value="item * 10">{{ item * 10 + '%' }}</a-select-option>
            </a-select>
            <a-input-number
              class="!w-120px !mr-10px"
              v-model:value="formConf.counterSignConfig.rejectNum"
              placeholder="请输入"
              :precision="0"
              :min="1"
              @change="onSignNumberChange($event, 'rejectNum')"
              v-if="formConf.counterSignConfig.rejectType === 2" />
            <span v-if="formConf.counterSignConfig.rejectType">不同意时退回</span>
          </div>
        </a-form-item>
        <a-form-item label="设置依次审批顺序" v-if="getCanSetApproversSort">
          <a-button preIcon="icon-ym icon-ym-btn-add" @click="openApproversSortListModal">设置审批顺序</a-button>
        </a-form-item>
        <a-form-item>
          <template #label>退回设置<BasicHelp text="纯表单流程设置退回到发起节点无效" /></template>
          <div class="form-item-content"></div>
          <a-form-item label="被退回的节点重新提交时">
            <a-radio-group v-model:value="formConf.rejectType" class="common-radio" @change="onRejectTypeChange">
              <a-radio :value="1">重新审批<BasicHelp text="若流程为A->B->C，C退回至A，则C->A->B->C" /></a-radio>
              <a-radio :value="2">从当前节点审批<BasicHelp text="若流程为A->B->C，C退回至A，则C->A->C" /></a-radio>
              <a-radio :value="3">自定义审批<BasicHelp text="由用户选择重新审批或从当前节点审批" /></a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="设置退回到的节点" class="!mb-0px">
            <jnpf-select v-model:value="formConf.rejectStep" placeholder="请选择" :options="rejectStepOptions" showSearch />
          </a-form-item>
        </a-form-item>
        <a-form-item label="进度设置">
          <a-select v-model:value="formConf.progress">
            <a-select-option v-for="item in progressOptions" :key="item" :value="item">{{ item + '%' }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="抄送设置">
          <jnpf-users-select v-model:value="formConf.circulateUser" buttonType="button" modalTitle="添加抄送人" multiple />
          <a-form-item class="!pt-10px">
            <template #label>抄送人范围<BasicHelp text="抄送人员增加人员选择范围附加条件" /></template>
            <jnpf-select v-model:value="formConf.extraCopyRule" :options="extraCopyRuleOptions" />
          </a-form-item>
          <a-checkbox v-model:checked="formConf.isCustomCopy">允许自选抄送人</a-checkbox>
          <div class="mt-10px">
            <a-checkbox v-model:checked="formConf.isInitiatorCopy">抄送给流程发起人</a-checkbox>
          </div>
          <div class="mt-10px">
            <a-checkbox v-model:checked="formConf.isFormFieldCopy">抄送给表单变量</a-checkbox>
          </div>
          <div v-if="formConf.isFormFieldCopy" class="common-tip my-10px">选择流程表单字段的值作为抄送人</div>
          <a-form-item class="!mb-0" v-if="formConf.isFormFieldCopy">
            <a-input-group compact>
              <a-select v-model:value="formConf.copyFormFieldType" placeholder="请选择" class="!w-100px">
                <a-select-option :value="1">用户</a-select-option>
                <a-select-option :value="2">部门</a-select-option>
                <a-select-option :value="3">岗位</a-select-option>
                <a-select-option :value="4">角色</a-select-option>
                <a-select-option :value="5">分组</a-select-option>
              </a-select>
              <jnpf-select
                v-model:value="formConf.copyFormField"
                placeholder="请选择"
                :options="usedFormItems"
                :fieldNames="{ options: 'options1' }"
                showSearch
                style="width: calc(100% - 100px)" />
            </a-input-group>
          </a-form-item>
        </a-form-item>
      </a-form>
      <div v-show="activeKey === '2'">
        <a-form :colon="false" layout="vertical" :model="formConf" class="config-form">
          <a-form-item label="操作设置">
            <div class="btn-cell">
              <a-checkbox v-model:checked="formConf.hasSaveBtn">暂存</a-checkbox>
              <a-input v-model:value="formConf.saveBtnText" placeholder="请输入" />
            </div>
            <div class="btn-cell">
              <a-checkbox v-model:checked="formConf.hasAuditBtn">同意</a-checkbox>
              <a-input v-model:value="formConf.auditBtnText" placeholder="请输入" />
            </div>
            <div class="btn-cell">
              <a-checkbox v-model:checked="formConf.hasRejectBtn">退回</a-checkbox>
              <a-input v-model:value="formConf.rejectBtnText" placeholder="请输入" />
            </div>
            <div class="btn-cell">
              <a-checkbox v-model:checked="formConf.hasRevokeBtn">撤回</a-checkbox>
              <a-input v-model:value="formConf.revokeBtnText" placeholder="请输入" />
            </div>
            <div class="btn-cell">
              <a-checkbox v-model:checked="formConf.hasTransferBtn">转审</a-checkbox>
              <a-input v-model:value="formConf.transferBtnText" placeholder="请输入" />
            </div>
            <div class="btn-cell">
              <a-checkbox v-model:checked="formConf.hasCancelBtn">驳回</a-checkbox>
              <a-input v-model:value="formConf.cancelBtnText" placeholder="请输入" />
            </div>
            <div class="btn-cell">
              <a-checkbox v-model:checked="formConf.hasPrintBtn">打印</a-checkbox>
              <a-input v-model:value="formConf.printBtnText" placeholder="请输入" />
            </div>
            <div class="btn-cell" v-if="formConf.hasPrintBtn">
              <p class="w-90px flex-shrink-0"></p>
              <jnpf-tree-select
                v-model:value="formConf.printId"
                placeholder="请选择"
                :options="printTplOptions"
                multiple
                lastLevel
                :showCheckedStrategy="TreeSelect.SHOW_CHILD" />
            </div>
            <div class="btn-cell">
              <a-checkbox v-model:checked="formConf.hasFreeApproverBtn">加签<BasicHelp text="允许在审批单中增加临时审批人" /></a-checkbox>
              <a-input v-model:value="formConf.hasFreeApproverBtnText" />
            </div>
          </a-form-item>
        </a-form>
        <a-form :colon="false" :model="formConf" labelAlign="left" :labelCol="{ style: { width: '100px' } }" class="config-form">
          <a-form-item class="normal-item-content">
            <template #label>
              自动同意
              <BasicHelp :text="['当前审批节点表单必填字段为空工单流转时不做校验', '下一审批节点设置候选人员、选择分支、异常节点时当前审批节点规则失效']" />
            </template>
            <a-switch v-model:checked="formConf.hasAgreeRule" />
          </a-form-item>
          <a-form-item class="!-mt-12px" v-if="formConf.hasAgreeRule">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">同意规则配置</label></div>
            <a-select v-model:value="formConf.agreeRules" placeholder="请选择" mode="multiple" allowClear showArrow>
              <a-select-option :value="2">审批人为发起人</a-select-option>
              <a-select-option :value="4">审批人与上一审批节点处理人相同</a-select-option>
              <a-select-option :value="3">审批人审批过</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item class="normal-item-content">
            <template #label>手写签名<BasicHelp text="审批人在进行审批操作时需手写签名" /></template>
            <a-switch v-model:checked="formConf.hasSign" />
          </a-form-item>
          <a-form-item class="normal-item-content">
            <template #label>意见填写<BasicHelp text="审批人在进行审批操作需填写意见" /></template>
            <a-switch v-model:checked="formConf.hasOpinion" />
          </a-form-item>
          <a-form-item label="说明" class="normal-item-content">
            <jnpf-textarea v-model:value="formConf.description" placeholder="请输入" />
          </a-form-item>
        </a-form>
      </div>
      <div v-show="activeKey === '4'">
        <a-alert message="开启后可配置触发事件同时进行参数赋值" type="warning" showIcon class="!mb-10px" />
        <a-form :colon="false" :model="formConf" labelAlign="left" :labelCol="{ style: { width: '70px' } }" class="config-form">
          <a-form-item label="同意事件" class="normal-item-content">
            <a-switch v-model:checked="formConf.approveFuncConfig.on" />
          </a-form-item>
          <a-form-item class="!-mt-12px" v-if="formConf.approveFuncConfig.on">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">接口设置</label></div>
            <select-interface
              :value="formConf.approveFuncConfig.interfaceId"
              :title="formConf.approveFuncConfig.interfaceName"
              :templateJson="formConf.approveFuncConfig.templateJson"
              :fieldOptions="funcOptions"
              :sourceType="3"
              showSystemFullLabel
              isFlow
              @change="(val, data) => onFuncChange(keyMap.approveFuncConfig, val, data)"
              @fieldChange="onRelationFieldChange" />
          </a-form-item>
          <a-form-item label="退回事件" class="normal-item-content">
            <a-switch v-model:checked="formConf.rejectFuncConfig.on" />
          </a-form-item>
          <a-form-item class="!-mt-12px" v-if="formConf.rejectFuncConfig.on">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">接口设置</label></div>
            <select-interface
              :value="formConf.rejectFuncConfig.interfaceId"
              :title="formConf.rejectFuncConfig.interfaceName"
              :templateJson="formConf.rejectFuncConfig.templateJson"
              :fieldOptions="funcOptions"
              :sourceType="3"
              showSystemFullLabel
              isFlow
              @change="(val, data) => onFuncChange(keyMap.rejectFuncConfig, val, data)"
              @fieldChange="onRelationFieldChange" />
          </a-form-item>
          <a-form-item label="撤回事件" class="normal-item-content">
            <a-switch v-model:checked="formConf.recallFuncConfig.on" />
          </a-form-item>
          <a-form-item class="!-mt-12px" v-if="formConf.recallFuncConfig.on">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">接口设置</label></div>
            <select-interface
              :value="formConf.recallFuncConfig.interfaceId"
              :title="formConf.recallFuncConfig.interfaceName"
              :templateJson="formConf.recallFuncConfig.templateJson"
              :fieldOptions="funcOptions"
              :sourceType="3"
              showSystemFullLabel
              isFlow
              @change="(val, data) => onFuncChange(keyMap.recallFuncConfig, val, data)"
              @fieldChange="onRelationFieldChange" />
          </a-form-item>
          <a-form-item label="超时事件" class="normal-item-content">
            <a-switch v-model:checked="formConf.overTimeFuncConfig.on" />
          </a-form-item>
          <a-form-item class="!-mt-12px" v-if="formConf.overTimeFuncConfig.on">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">接口设置</label></div>
            <select-interface
              :value="formConf.overTimeFuncConfig.interfaceId"
              :title="formConf.overTimeFuncConfig.interfaceName"
              :templateJson="formConf.overTimeFuncConfig.templateJson"
              :fieldOptions="funcOptions"
              :sourceType="3"
              showSystemFullLabel
              isFlow
              @change="(val, data) => onFuncChange(keyMap.overTimeFuncConfig, val, data)"
              @fieldChange="onRelationFieldChange" />
          </a-form-item>
          <a-form-item label="提醒事件" class="normal-item-content">
            <a-switch v-model:checked="formConf.noticeFuncConfig.on" />
          </a-form-item>
          <a-form-item class="!-mt-12px" v-if="formConf.noticeFuncConfig.on">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">接口设置</label></div>
            <select-interface
              :value="formConf.noticeFuncConfig.interfaceId"
              :title="formConf.noticeFuncConfig.interfaceName"
              :templateJson="formConf.noticeFuncConfig.templateJson"
              :fieldOptions="funcOptions"
              :sourceType="3"
              showSystemFullLabel
              isFlow
              @change="(val, data) => onFuncChange(keyMap.noticeFuncConfig, val, data)"
              @fieldChange="onRelationFieldChange" />
          </a-form-item>
        </a-form>
      </div>
      <div v-show="activeKey === '5'">
        <a-alert message="该通知设置在【消息中心】-【消息发送配置】维护，选择默认则站内信提醒，选择关闭则不提醒。" type="warning" showIcon class="!mb-10px" />
        <a-form :colon="false" :model="formConf" layout="vertical" class="config-form">
          <a-form-item>
            <template #label>节点同意<BasicHelp text="当前节点审核人同意的时候" /></template>
            <jnpf-select v-model:value="formConf.approveMsgConfig.on" :options="nodeNoticeOptions" />
          </a-form-item>
          <a-form-item v-if="formConf.approveMsgConfig.on === 1">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">发送配置</label></div>
            <msg-modal
              :value="formConf.approveMsgConfig.msgId"
              :title="formConf.approveMsgConfig.msgName"
              @change="(val, data) => onMsgChange(keyMap.approveMsgConfig, val, data)" />
            <div class="ant-form-item-label mt-12px"><label class="ant-form-item-no-colon">参数设置</label></div>
            <a-table :data-source="formConf.approveMsgConfig.templateJson" :columns="msgTemplateJsonColumns" size="small" :pagination="false">
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
          <a-form-item>
            <template #label>节点退回<BasicHelp text="当前节点审核人退回的时候" /></template>
            <jnpf-select v-model:value="formConf.rejectMsgConfig.on" :options="nodeNoticeOptions" />
          </a-form-item>
          <a-form-item v-if="formConf.rejectMsgConfig.on === 1">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">发送配置</label></div>
            <msg-modal
              :value="formConf.rejectMsgConfig.msgId"
              :title="formConf.rejectMsgConfig.msgName"
              @change="(val, data) => onMsgChange(keyMap.rejectMsgConfig, val, data)" />
            <div class="ant-form-item-label mt-12px"><label class="ant-form-item-no-colon">参数设置</label></div>
            <a-table :data-source="formConf.rejectMsgConfig.templateJson" :columns="msgTemplateJsonColumns" size="small" :pagination="false">
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
          <a-form-item>
            <template #label>节点抄送<BasicHelp text="当前节点抄送的时候" /></template>
            <jnpf-select v-model:value="formConf.copyMsgConfig.on" :options="nodeNoticeOptions" />
          </a-form-item>
          <a-form-item v-if="formConf.copyMsgConfig.on === 1">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">发送配置</label></div>
            <msg-modal
              :value="formConf.copyMsgConfig.msgId"
              :title="formConf.copyMsgConfig.msgName"
              @change="(val, data) => onMsgChange(keyMap.copyMsgConfig, val, data)" />
            <div class="ant-form-item-label mt-12px"><label class="ant-form-item-no-colon">参数设置</label></div>
            <a-table :data-source="formConf.copyMsgConfig.templateJson" :columns="msgTemplateJsonColumns" size="small" :pagination="false">
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
          <a-form-item>
            <template #label>节点超时<BasicHelp text="当前节点超时的时候" /></template>
            <jnpf-select v-model:value="formConf.overTimeMsgConfig.on" :options="nodeNoticeOptions" />
          </a-form-item>
          <a-form-item v-if="formConf.overTimeMsgConfig.on === 1">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">发送配置</label></div>
            <msg-modal
              :value="formConf.overTimeMsgConfig.msgId"
              :title="formConf.overTimeMsgConfig.msgName"
              @change="(val, data) => onMsgChange(keyMap.overTimeMsgConfig, val, data)" />
            <div class="ant-form-item-label mt-12px"><label class="ant-form-item-no-colon">参数设置</label></div>
            <a-table :data-source="formConf.overTimeMsgConfig.templateJson" :columns="msgTemplateJsonColumns" size="small" :pagination="false">
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
          <a-form-item>
            <template #label>节点提醒<BasicHelp text="当前节点提醒的时候" /></template>
            <jnpf-select v-model:value="formConf.noticeMsgConfig.on" :options="nodeNoticeOptions" />
          </a-form-item>
          <a-form-item v-if="formConf.noticeMsgConfig.on === 1">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">发送配置</label></div>
            <msg-modal
              :value="formConf.noticeMsgConfig.msgId"
              :title="formConf.noticeMsgConfig.msgName"
              @change="(val, data) => onMsgChange(keyMap.noticeMsgConfig, val, data)" />
            <div class="ant-form-item-label mt-12px"><label class="ant-form-item-no-colon">参数设置</label></div>
            <a-table :data-source="formConf.noticeMsgConfig.templateJson" :columns="msgTemplateJsonColumns" size="small" :pagination="false">
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
      <a-form :colon="false" :model="formConf" layout="vertical" class="config-form" v-show="activeKey === '6'">
        <a-form-item label="限时设置">
          <jnpf-select v-model:value="formConf.timeLimitConfig.on" :options="nodeOverTimeMsgOptions" @change="onTimeLimitChange($event)" />
        </a-form-item>
        <a-form-item v-if="formConf.timeLimitConfig.on === 1">
          <div class="ant-form-item-label"><label class="ant-form-item-no-colon font-semibold">节点处理截止时间</label></div>
          <div class="countersign-cell">
            <jnpf-select class="!w-500px" v-model:value="formConf.timeLimitConfig.nodeLimit" :options="overTimeOptions" />
            <span class="!ml-10px">开始</span>
          </div>
          <div class="mt-10px" v-if="formConf.timeLimitConfig.nodeLimit === 2">
            <jnpf-select class="!w-500px" v-model:value="formConf.timeLimitConfig.formField" :options="usedFormItems" showSearch allowClear />
          </div>
          <div class="countersign-cell mt-12px">
            <span class="w-120px inline-block">流程到达审批节点</span>
            <a-input-number v-model:value="formConf.timeLimitConfig.duringDeal" placeholder="请输入" :min="1" :precision="0" class="!w-200px !mx-10px" />
            <span>小时未处理，视为超时。</span>
          </div>
          <a-form-item>
            <div class="ant-form-item-label mt-12px"><label class="ant-form-item-no-colon font-semibold">限时提醒规则</label></div>
            <jnpf-select v-model:value="formConf.noticeConfig.on" :options="nodeOverTimeMsgOptions" />
          </a-form-item>
          <a-form-item v-if="formConf.noticeConfig.on === 1">
            <div class="countersign-cell">
              <span class="w-120px inline-block">流程到达审批节点</span>
              <a-input-number v-model:value="formConf.noticeConfig.firstOver" placeholder="请输入" :min="1" :precision="0" class="!w-200px !mx-10px" />
              <span>小时，开始提醒通知。</span>
            </div>
            <div class="countersign-cell mt-12px">
              <span class="w-120px inline-block">每间隔</span>
              <a-input-number v-model:value="formConf.noticeConfig.overTimeDuring" placeholder="请输入" :min="1" :precision="0" class="!w-200px !mx-10px" />
              <span>小时，提醒通知一次。</span>
            </div>
            <div class="ant-form-item-label !mt-12px"><label class="ant-form-item-no-colon">提醒事务</label></div>
            <a-row class="leading-32px">
              <a-checkbox v-model:checked="formConf.noticeConfig.overNotice">
                提醒通知<BasicHelp text="勾选后才能进行提醒消息发送（站内信系统默认发送，第三方超时消息需在节点通知内配置）" />
              </a-checkbox>
            </a-row>
            <a-row class="leading-32px">
              <a-checkbox v-model:checked="formConf.noticeConfig.overEvent">提醒事件<BasicHelp text="请在节点事件内配置提醒事件" /></a-checkbox>
            </a-row>
            <div class="countersign-cell mt-12px" v-if="formConf.noticeConfig.overEvent">
              <span class="w-120px inline-block">在提醒通知第</span>
              <a-input-number v-model:value="formConf.noticeConfig.overEventTime" placeholder="请输入" :min="1" :precision="0" class="!w-200px !mx-10px" />
              <span>次时，执行提醒事件。</span>
            </div>
          </a-form-item>
        </a-form-item>
        <a-form-item>
          <template #label>超时设置</template>
          <jnpf-select v-model:value="formConf.overTimeConfig.on" :options="nodeOverTimeMsgOptions" :disabled="formConf.timeLimitConfig.on == 0" />
        </a-form-item>
        <a-form-item v-if="formConf.overTimeConfig.on === 1">
          <div class="countersign-cell">
            <span class="w-120px inline-block">超时</span>
            <a-input-number v-model:value="formConf.overTimeConfig.firstOver" placeholder="请输入" :min="0" :precision="0" class="!w-200px !mx-10px" />
            <span>小时，开始超时通知。</span>
          </div>
          <div class="countersign-cell mt-12px">
            <span class="w-120px inline-block">每间隔</span>
            <a-input-number v-model:value="formConf.overTimeConfig.overTimeDuring" placeholder="请输入" :min="1" :precision="0" class="!w-200px !mx-10px" />
            <span>小时，超时通知一次。</span>
          </div>
          <div class="ant-form-item-label !mt-12px"><label class="ant-form-item-no-colon">提醒事务</label></div>
          <a-row class="leading-32px">
            <a-checkbox v-model:checked="formConf.overTimeConfig.overNotice">
              超时通知<BasicHelp text="勾选后才能进行超时消息发送（站内信系统默认发送，第三方超时消息需在节点通知内配置）" />
            </a-checkbox>
          </a-row>
          <a-row class="leading-32px">
            <a-checkbox v-model:checked="formConf.overTimeConfig.overEvent">超时事件<BasicHelp text="请在节点事件内配置超时事件" /></a-checkbox>
          </a-row>
          <div class="countersign-cell" v-if="formConf.overTimeConfig.overEvent">
            <span class="w-120px inline-block">在超时通知第</span>
            <a-input-number v-model:value="formConf.overTimeConfig.overEventTime" placeholder="请输入" :min="1" :precision="0" class="!w-200px !mx-10px" />
            <span>次时，执行超时事件。</span>
          </div>
          <a-row class="leading-32px">
            <a-checkbox v-model:checked="formConf.overTimeConfig.overAutoApprove">
              超时自动审批
              <BasicHelp text="当前审批节点表单必填字段为空工单流转时不做校验，下一审批节点设置候选人员、选择分支、异常节点时当前审批节点规则失效" />
            </a-checkbox>
          </a-row>
          <div class="countersign-cell" v-if="formConf.overTimeConfig.overAutoApprove">
            <span class="w-120px inline-block">在超时通知第</span>
            <a-input-number
              v-model:value="formConf.overTimeConfig.overAutoApproveTime"
              placeholder="请输入"
              :min="1"
              :precision="0"
              class="!w-200px !mx-10px" />
            <span>次时，执行超时自动审批。</span>
          </div>
        </a-form-item>
      </a-form>
    </ScrollContainer>
    <div v-show="activeKey === '3'">
      <a-table :data-source="formConf.formOperates" :columns="formOperatesColumns" size="small" :pagination="false" :scroll="{ y: 'calc(100vh - 197px)' }">
        <template #headerCell="{ column }">
          <template v-if="column.key === 'write'">
            <a-checkbox v-model:checked="readAllChecked" :indeterminate="isReadIndeterminate" @change="handleCheckAllChange($event, 1)">查看</a-checkbox>
            <a-checkbox v-model:checked="writeAllChecked" :indeterminate="isWriteIndeterminate" @change="handleCheckAllChange($event, 2)">编辑</a-checkbox>
            <a-checkbox v-model:checked="requiredAllChecked" :indeterminate="isRequiredIndeterminate" @change="handleCheckAllChange($event, 3)">
              必填
            </a-checkbox>
          </template>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'write'">
            <a-checkbox v-model:checked="record.read" @change="handleCheckedChange">查看</a-checkbox>
            <a-checkbox v-model:checked="record.write" @change="handleCheckedChange">编辑</a-checkbox>
            <a-checkbox v-model:checked="record.required" :disabled="record.requiredDisabled" @change="handleCheckedChange">必填</a-checkbox>
          </template>
        </template>
      </a-table>
    </div>
    <MsgTemplateDetail @register="registerDetail" />
    <ApproversSortModal @register="registerApproversSortModal" @confirm="updateApproversSortList" />
    <BasicModal v-bind="$attrs" @register="registerRuleModal" title="数据传递" :width="700" @ok="handleSubmitTransmitRule" class="rule-modal">
      <a-tabs size="small" class="node-tabs">
        <a-tab-pane :tab="item.title" v-for="(item, i) in state.assignList" :key="i">
          <div class="common-tip mb-10px">当节点流转到本节点时，将对应的上一节点的字段赋值给本节点</div>
          <a-row :gutter="10" v-for="(child, cIndex) in item.ruleList" :key="cIndex" class="mb-10px">
            <a-col :span="2" class="rule-cell">上节点</a-col>
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
            <a-col :span="2" class="rule-cell">本节点</a-col>
            <a-col :span="7" class="rule-cell">
              <jnpf-select
                v-model:value="child.childField"
                :options="formFieldsOptions"
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
  import { computed, reactive, toRefs, watch } from 'vue';
  import { TreeSelect } from 'ant-design-vue';
  import { ScrollContainer } from '/@/components/Container';
  import FlowFormModal from './FlowFormModal.vue';
  import ApproversSortModal from './ApproversSortModal.vue';
  import MsgModal from './MsgModal.vue';
  import MsgTemplateDetail from './MsgTemplateDetail.vue';
  import { SelectInterface } from '/@/components/Interface';
  import { typeOptions, defaultStep, nodeNoticeOptions, nodeOverTimeMsgOptions, overTimeOptions } from '../helper/define';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { cloneDeep } from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';

  interface State {
    activeKey: string;
    userLabel: string;
    assignList: any[];
    readAllChecked: boolean;
    writeAllChecked: boolean;
    requiredAllChecked: boolean;
    isReadIndeterminate: boolean;
    isWriteIndeterminate: boolean;
    isRequiredIndeterminate: boolean;
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
    'funcRequiredOptions',
    'msgOptions',
    'funcSystemFieldOptions',
    'initFormOperates',
    'updateAllNodeFormOperates',
    'getFormFieldList',
    'nodeOptions',
    'beforeNodeOptions',
    'prevNodeList',
  ]);
  const emit = defineEmits(['updateFormFieldList']);
  defineOptions({ name: 'approverNode', inheritAttrs: false });
  defineExpose({ getContent, updateCheckStatus });
  const { createMessage } = useMessage();
  const [registerRuleModal, { openModal: openRuleModal, closeModal: closeRuleModal }] = useModal();

  const extraRuleOptions = [
    { id: 1, fullName: '无审批人范围' },
    { id: 6, fullName: '同一公司' },
    { id: 2, fullName: '同一部门' },
    { id: 3, fullName: '同一岗位' },
    { id: 4, fullName: '发起人上级' },
    { id: 5, fullName: '发起人下属' },
  ];
  const extraCopyRuleOptions = extraRuleOptions.map(o => (o.id === 1 ? { id: 1, fullName: '无抄送人范围' } : o));
  const counterSignOptions = [
    { id: 0, fullName: '或签（一名审批人同意或退回即可）' },
    { id: 1, fullName: '会签（无序会签，当审批达到会签比例时，则该审批通过）' },
    { id: 2, fullName: '依次审批（按顺序依次审批）' },
  ];
  const auditTypeOptions = [
    { id: 1, fullName: '按百分比' },
    { id: 2, fullName: '按人数' },
  ];
  const rejectTypeOptions = [{ id: 0, fullName: '无' }, ...auditTypeOptions];
  const formOperatesColumns = [
    { title: '表单字段', dataIndex: 'name', key: 'name' },
    { title: '操作', dataIndex: 'write', key: 'write', align: 'center', width: 250 },
  ];
  const progressOptions = ['10', '20', '30', '40', '50', '60', '70', '80', '90'];
  const keyMap = {
    approveFuncConfig: 'approveFuncConfig',
    rejectFuncConfig: 'rejectFuncConfig',
    recallFuncConfig: 'recallFuncConfig',
    overTimeFuncConfig: 'overTimeFuncConfig',
    noticeFuncConfig: 'noticeFuncConfig',
    approveMsgConfig: 'approveMsgConfig',
    rejectMsgConfig: 'rejectMsgConfig',
    copyMsgConfig: 'copyMsgConfig',
    overTimeMsgConfig: 'overTimeMsgConfig',
    noticeMsgConfig: 'noticeMsgConfig',
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
  const [registerApproversSortModal, { openModal: openApproversSortModal }] = useModal();
  const state = reactive<State>({
    activeKey: '1',
    userLabel: '',
    assignList: [],
    readAllChecked: false,
    writeAllChecked: false,
    requiredAllChecked: false,
    isReadIndeterminate: false,
    isWriteIndeterminate: false,
    isRequiredIndeterminate: false,
  });
  const { activeKey, readAllChecked, writeAllChecked, requiredAllChecked, isReadIndeterminate, isWriteIndeterminate, isRequiredIndeterminate } = toRefs(state);

  const rejectStepOptions = computed(() => {
    let options = [...defaultStep, ...props.beforeNodeOptions];
    if (props.formConf.rejectType == 2) options = options.filter(o => o.id != '1');
    return options;
  });
  const getCanSetApproversSort = computed(() => {
    return (
      props.formConf.assigneeType === 6 &&
      props.formConf.approvers.length &&
      props.formConf.approvers.every(o => o.indexOf('--user') !== -1) &&
      props.formConf.counterSign == 2
    );
  });

  watch(
    () => state.activeKey,
    val => {
      if (val === '3') updateCheckStatus();
    },
  );

  function onFormIdChange(id, item) {
    if (!id) return handleNull();
    const isSameForm = props.formConf.formId === id;
    props.formConf.formName = item.fullName;
    props.formConf.formId = id;
    props.formConf.assignList = [];
    props.getFormFieldList(id, 'approverForm', isSameForm);
  }
  function handleNull() {
    props.formConf.formName = '';
    props.formConf.formId = '';
    let formFieldList = [];
    const formId = props.processData.properties.formId;
    if (formId && props.processData.properties.allFormMap && props.processData.properties.allFormMap['form_' + formId]) {
      formFieldList = props.processData.properties.allFormMap['form_' + formId] || [];
    }
    emit('updateFormFieldList', formFieldList, 'approverForm');
    props.formConf.formOperates = props.initFormOperates(props.value, true);
  }
  function onAssigneeTypeChange() {
    props.formConf.approvers = [];
    props.formConf.approversSortList = [];
  }
  function onApproversChange(val) {
    if (props.formConf.assigneeType != 6 || !val || !val.length || !val.every(o => o.indexOf('--user') !== -1)) return (props.formConf.approversSortList = []);
    if (!props.formConf.approversSortList.length) return (props.formConf.approversSortList = val);
    const arr = props.formConf.approversSortList.filter(o => val.indexOf(o) !== -1);
    const updated = val.filter(o => props.formConf.approversSortList.indexOf(o) === -1);
    props.formConf.approversSortList = [...arr, ...updated];
  }
  function onLabelChange(val) {
    state.userLabel = val;
  }
  function getContent() {
    let content = '';
    if (props.formConf.assigneeType != 6) {
      content = typeOptions.find(o => o.id === props.formConf.assigneeType)?.fullName || '';
    } else {
      content = state.userLabel;
    }
    return content;
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
    props.formConf[key].templateJson = row.templateJson.map(o => ({ ...o, relationField: '', sourceType: 1 })) || [];
  }
  function onRelationFieldChange(val, row) {
    if (!val) return;
    let list = props.funcOptions.filter(o => o.id === val);
    if (!list.length) return;
    let item = list[0];
    row.isSubTable = item.__config__ && item.__config__.isSubTable ? item.__config__.isSubTable : false;
  }
  function onRejectTypeChange(e) {
    if (e?.target?.value == 2 && props.formConf.rejectStep == '1') props.formConf.rejectStep = '0';
  }
  function openTransmitRuleBox() {
    const assignList = props.formConf.assignList ? cloneDeep(props.formConf.assignList) : [];
    getRealAssignList(assignList);
    openRuleModal(true);
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
          createMessage.error(`请选择${e.title}的上节点字段`);
          break;
        }
        if (!ruleList[j].childField) {
          boo = false;
          createMessage.error(`请选择${e.title}的本节点字段`);
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
  function updateCheckStatus() {
    const formOperatesLen = props.formConf.formOperates.length;
    const requiredDisabledCount = props.formConf.formOperates.filter(o => !o.requiredDisabled).length;
    let readCount = 0;
    let writeCount = 0;
    let requiredCount = 0;
    props.formConf.formOperates.forEach(item => {
      if (item.read) readCount++;
      if (item.write) writeCount++;
      if (item.required) requiredCount++;
    });
    state.readAllChecked = !!formOperatesLen ? formOperatesLen === readCount : false;
    state.writeAllChecked = !!formOperatesLen ? formOperatesLen === writeCount : false;
    state.requiredAllChecked = !!formOperatesLen ? requiredDisabledCount === requiredCount : false;
    state.isReadIndeterminate = !!readCount && readCount < formOperatesLen;
    state.isWriteIndeterminate = !!writeCount && writeCount < formOperatesLen;
    state.isRequiredIndeterminate = !!requiredCount && requiredCount < requiredDisabledCount;
  }
  function handleCheckAllChange(e, type) {
    const val = e.target.checked;
    if (type == 1) state.isReadIndeterminate = false;
    if (type == 2) state.isWriteIndeterminate = false;
    if (type == 3) state.isRequiredIndeterminate = false;
    props.formConf.formOperates.forEach(item => {
      if (type == 1) item.read = val;
      if (type == 2) item.write = val;
      if (type == 3 && !item.requiredDisabled) item.required = val;
    });
  }
  function handleCheckedChange() {
    updateCheckStatus();
  }
  function onSignNumberChange(val, key) {
    if (val) return;
    props.formConf.counterSignConfig[key] = 1;
  }
  function openApproversSortListModal() {
    openApproversSortModal(true, { ids: props.formConf.approversSortList });
  }
  function updateApproversSortList(data) {
    props.formConf.approversSortList = data;
  }
  function onTimeLimitChange(val) {
    if (val == 0) props.formConf.overTimeConfig.on = 0;
  }
</script>
