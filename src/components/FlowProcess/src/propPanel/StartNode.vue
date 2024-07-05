<template>
  <section class="common-pane">
    <a-tabs v-model:activeKey="activeKey" size="small" class="pane-tabs">
      <a-tab-pane key="1" tab="基础设置"></a-tab-pane>
      <a-tab-pane key="2" tab="高级设置"></a-tab-pane>
      <a-tab-pane key="3" tab="表单权限"></a-tab-pane>
      <a-tab-pane key="4" tab="流程事件"></a-tab-pane>
      <a-tab-pane key="5" tab="流程通知"></a-tab-pane>
      <a-tab-pane key="6" tab="超时处理"></a-tab-pane>
    </a-tabs>
    <ScrollContainer class="config-content" v-show="activeKey !== '3'">
      <a-form :colon="false" layout="vertical" :model="formConf" class="config-form" v-show="activeKey === '1'">
        <a-form-item>
          <template #label>{{ flowType == 1 ? '功能' : '表单' }}设置</template>
          <FlowFormModal
            :value="formConf.formId"
            :title="formConf.formName"
            :flowType="flowType"
            :allowClear="false"
            @change="onFormIdChange"
            :disabled="!!formInfo.onlineDev"
            :placeholder="'请选择' + (flowType == 1 ? '功能' : '表单')" />
        </a-form-item>
        <a-form-item v-if="flowType != 1">
          <template #label>发起设置<BasicHelp text="谁可以发起 默认所有人,需要设置请选择" /></template>
          <jnpf-users-select v-model:value="formConf.initiator" buttonType="button" modalTitle="添加发起人" multiple @labelChange="onLabelChange" />
        </a-form-item>
        <a-form-item label="抄送设置">
          <jnpf-users-select v-model:value="formConf.circulateUser" buttonType="button" modalTitle="添加抄送人" multiple />
          <a-form-item class="!pt-10px">
            <template #label>抄送人范围<BasicHelp text="抄送人员增加人员选择范围附加条件" /></template>
            <jnpf-select v-model:value="formConf.extraCopyRule" :options="extraRuleOptions" />
          </a-form-item>
          <a-checkbox v-model:checked="formConf.isCustomCopy">允许自选抄送人</a-checkbox>
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
              <a-checkbox v-model:checked="formConf.hasSubmitBtn" disabled>提交</a-checkbox>
              <a-input v-model:value="formConf.submitBtnText" placeholder="请输入" />
            </div>
            <div class="btn-cell">
              <a-checkbox v-model:checked="formConf.hasSaveBtn" disabled>暂存</a-checkbox>
              <a-input v-model:value="formConf.saveBtnText" placeholder="请输入" />
            </div>
            <div class="btn-cell">
              <a-checkbox v-model:checked="formConf.hasRevokeBtn">撤回</a-checkbox>
              <a-input v-model:value="formConf.revokeBtnText" placeholder="请输入" />
            </div>
            <div class="btn-cell">
              <a-checkbox v-model:checked="formConf.hasPressBtn">催办</a-checkbox>
              <a-input v-model:value="formConf.pressBtnText" placeholder="请输入" />
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
          </a-form-item>
          <a-form-item label="标题设置">
            <jnpf-radio v-model:value="formConf.titleType" :options="titleTypeOptions" />
            <a-input class="!mt-10px" v-model:value="formConf.defaultContent" readonly v-if="formConf.titleType == 0" />
            <a-auto-complete
              class="!mt-10px"
              v-model:value="formConf.titleContent"
              :options="titleContentOptions"
              placeholder="请输入"
              allowClear
              @select="handleSelect"
              v-if="formConf.titleType == 1" />
          </a-form-item>
          <a-form-item>
            <template #label>异常处理<BasicHelp text="审批节点内设置的审批人员异常时遵循该规则" /></template>
            <jnpf-select v-model:value="formConf.errorRule" :options="errorRuleOptions" @change="formConf.errorRuleUser = []" />
            <jnpf-user-select v-model:value="formConf.errorRuleUser" buttonType="button" multiple class="mt-10px" v-if="formConf.errorRule === 2" />
          </a-form-item>
          <a-form-item label="撤回后处理规则">
            <jnpf-select v-model:value="formConf.revokeRule" :options="revokeRuleOptions" />
          </a-form-item>
          <a-form-item label="复活取值规则">
            <jnpf-select v-model:value="formConf.resurgenceDataRule" :options="resurgenceDataRuleOptions" />
          </a-form-item>
        </a-form>
        <a-form :colon="false" :model="formConf" labelAlign="left" :labelCol="{ style: { width: '100px' } }" class="config-form">
          <a-form-item class="normal-item-content">
            <template #label>手写签名<BasicHelp text="发起人在进行流程撤回操作时需手写签名" /></template>
            <a-switch v-model:checked="formConf.hasSign" />
          </a-form-item>
          <a-form-item class="normal-item-content">
            <template #label>意见填写<BasicHelp text="发起人在进行流程撤回操作需填写意见" /></template>
            <a-switch v-model:checked="formConf.hasOpinion" />
          </a-form-item>
          <a-form-item class="normal-item-content">
            <template #label>审核汇总<BasicHelp text="流程流转记录会按部门及岗位进行汇总展示" /></template>
            <a-switch v-model:checked="formConf.isSummary" />
          </a-form-item>
          <a-form-item class="!-mt-12px" v-if="formConf.isSummary">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">汇总设置</label></div>
            <a-select v-model:value="formConf.summaryType" placeholder="请选择">
              <a-select-option :value="0">汇总全部流转记录</a-select-option>
              <a-select-option :value="1">汇总通过及退回流转记录</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item class="normal-item-content">
            <template #label>流程评论<BasicHelp text="流程内涉及的用户均可进行意见评论" /></template>
            <a-switch v-model:checked="formConf.isComment" />
          </a-form-item>
          <a-form-item class="normal-item-content">
            <template #label>批量审批<BasicHelp text="流程待审批工单可进行批量操作" /></template>
            <a-switch v-model:checked="formConf.isBatchApproval" />
          </a-form-item>
        </a-form>
      </div>
      <div v-show="activeKey === '4'">
        <a-form :colon="false" :model="formConf" labelAlign="left" :labelCol="{ style: { width: '70px' } }" class="config-form">
          <a-form-item class="!mb-0" :labelCol="{ style: { width: '120px' } }">
            <template #label>事件处理规则<BasicHelp text="发起、撤回、同意、退回四个事件按此规则执行" /></template>
          </a-form-item>
          <a-form-item label="">
            <jnpf-select v-model:value="formConf.funcConfigRule" :options="funcConfigOptions" />
          </a-form-item>
          <a-form-item label="发起事件" class="normal-item-content">
            <a-switch v-model:checked="formConf.initFuncConfig.on" />
          </a-form-item>
          <a-form-item class="!-mt-12px" v-if="formConf.initFuncConfig.on">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">接口设置</label></div>
            <select-interface
              :value="formConf.initFuncConfig.interfaceId"
              :title="formConf.initFuncConfig.interfaceName"
              :templateJson="formConf.initFuncConfig.templateJson"
              :fieldOptions="funcOptions"
              :sourceType="3"
              showSystemFullLabel
              isFlow
              @change="(val, data) => onFuncChange(keyMap.initFuncConfig, val, data)"
              @fieldChange="onRelationFieldChange" />
          </a-form-item>
          <a-form-item label="结束事件" class="normal-item-content">
            <a-switch v-model:checked="formConf.endFuncConfig.on" />
          </a-form-item>
          <a-form-item class="!-mt-12px" v-if="formConf.endFuncConfig.on">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">接口设置</label></div>
            <select-interface
              :value="formConf.endFuncConfig.interfaceId"
              :title="formConf.endFuncConfig.interfaceName"
              :templateJson="formConf.endFuncConfig.templateJson"
              :fieldOptions="funcOptions"
              :sourceType="3"
              showSystemFullLabel
              isFlow
              @change="(val, data) => onFuncChange(keyMap.endFuncConfig, val, data)"
              @fieldChange="onRelationFieldChange" />
          </a-form-item>
          <a-form-item label="撤回事件" class="normal-item-content">
            <a-switch v-model:checked="formConf.flowRecallFuncConfig.on" />
          </a-form-item>
          <a-form-item class="!-mt-12px" v-if="formConf.flowRecallFuncConfig.on">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">接口设置</label></div>
            <select-interface
              :value="formConf.flowRecallFuncConfig.interfaceId"
              :title="formConf.flowRecallFuncConfig.interfaceName"
              :templateJson="formConf.flowRecallFuncConfig.templateJson"
              :fieldOptions="funcOptions"
              :sourceType="3"
              showSystemFullLabel
              isFlow
              @change="(val, data) => onFuncChange(keyMap.flowRecallFuncConfig, val, data)"
              @fieldChange="onRelationFieldChange" />
          </a-form-item>
        </a-form>
      </div>
      <div v-show="activeKey === '5'">
        <a-alert message="该通知设置在【消息中心】-【消息发送配置】维护，选择默认则站内信提醒，选择关闭则不提醒。" type="warning" showIcon class="!mb-10px" />
        <a-form :colon="false" :model="formConf" layout="vertical" class="config-form">
          <a-form-item>
            <template #label>流程待办<BasicHelp text="流程处于等待的时候" /></template>
            <jnpf-select v-model:value="formConf.waitMsgConfig.on" :options="noticeOptions" />
          </a-form-item>
          <a-form-item v-if="formConf.waitMsgConfig.on === 1">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">发送配置</label></div>
            <msg-modal
              :value="formConf.waitMsgConfig.msgId"
              :title="formConf.waitMsgConfig.msgName"
              @change="(val, data) => onMsgChange(keyMap.waitMsgConfig, val, data)" />
            <div class="ant-form-item-label mt-12px"><label class="ant-form-item-no-colon">参数设置</label></div>
            <a-table :data-source="formConf.waitMsgConfig.templateJson" :columns="msgTemplateJsonColumns" size="small" :pagination="false">
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
            <template #label>流程结束<BasicHelp text="流程结束的时候" /></template>
            <jnpf-select v-model:value="formConf.endMsgConfig.on" :options="noticeOptions" />
          </a-form-item>
          <a-form-item v-if="formConf.endMsgConfig.on === 1">
            <div class="ant-form-item-label"><label class="ant-form-item-no-colon">发送配置</label></div>
            <msg-modal
              :value="formConf.endMsgConfig.msgId"
              :title="formConf.endMsgConfig.msgName"
              @change="(val, data) => onMsgChange(keyMap.endMsgConfig, val, data)" />
            <div class="ant-form-item-label mt-12px"><label class="ant-form-item-no-colon">参数设置</label></div>
            <a-table :data-source="formConf.endMsgConfig.templateJson" :columns="msgTemplateJsonColumns" size="small" :pagination="false">
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
            <template #label>节点同意<BasicHelp text="所有节点审核人同意的时候" /></template>
            <jnpf-select v-model:value="formConf.approveMsgConfig.on" :options="noticeOptions" />
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
            <template #label>节点退回<BasicHelp text="所有节点审核人退回的时候" /></template>
            <jnpf-select v-model:value="formConf.rejectMsgConfig.on" :options="noticeOptions" />
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
            <template #label>节点抄送<BasicHelp text="所有节点抄送的时候" /></template>
            <jnpf-select v-model:value="formConf.copyMsgConfig.on" :options="noticeOptions" />
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
            <template #label>节点超时<BasicHelp text="所有节点超时的时候" /></template>
            <jnpf-select v-model:value="formConf.overTimeMsgConfig.on" :options="noticeOptions" />
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
            <template #label>节点提醒<BasicHelp text="所有节点提醒的时候" /></template>
            <jnpf-select v-model:value="formConf.noticeMsgConfig.on" :options="noticeOptions" />
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
          <jnpf-select v-model:value="formConf.timeLimitConfig.on" :options="overTimeMsgOptions" @change="onTimeLimitChange($event)" />
        </a-form-item>
        <a-form-item v-if="formConf.timeLimitConfig.on === 1">
          <div class="ant-form-item-label"><label class="ant-form-item-no-colon font-semibold">节点处理截止时间</label></div>
          <div class="countersign-cell">
            <jnpf-select class="!w-500px" v-model:value="formConf.timeLimitConfig.nodeLimit" :options="overTimeOptions" disabled />
            <span class="!ml-10px">开始</span>
          </div>
          <div class="mt-10px" v-if="formConf.timeLimitConfig.nodeLimit === 2">
            <jnpf-select
              class="!w-500px"
              v-model:value="formConf.timeLimitConfig.formField"
              :options="usedFormItems"
              showSearch
              allowClear
              placeholder="请选择字段" />
          </div>
          <div class="countersign-cell mt-12px">
            <span class="w-120px inline-block">流程到达审批节点</span>
            <a-input-number v-model:value="formConf.timeLimitConfig.duringDeal" :min="1" :precision="0" class="!w-200px !mx-10px" />
            <span>小时未处理，视为超时。</span>
          </div>
          <a-form-item>
            <div class="ant-form-item-label mt-12px"><label class="ant-form-item-no-colon font-semibold">限时提醒规则</label></div>
            <jnpf-select v-model:value="formConf.noticeConfig.on" :options="overTimeMsgOptions" />
          </a-form-item>
          <a-form-item v-if="formConf.noticeConfig.on === 1">
            <div class="countersign-cell">
              <span class="w-120px inline-block">流程到达审批节点</span>
              <a-input-number v-model:value="formConf.noticeConfig.firstOver" :min="1" :precision="0" class="!w-200px !mx-10px" />
              <span>小时，开始提醒通知。</span>
            </div>
            <div class="countersign-cell mt-12px">
              <span class="w-120px inline-block">每间隔</span>
              <a-input-number v-model:value="formConf.noticeConfig.overTimeDuring" :min="1" :precision="0" class="!w-200px !mx-10px" />
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
              <a-input-number v-model:value="formConf.noticeConfig.overEventTime" :min="1" :precision="0" class="!w-200px !mx-10px" />
              <span>次时，执行提醒事件。</span>
            </div>
          </a-form-item>
        </a-form-item>
        <a-form-item>
          <template #label>超时设置</template>
          <jnpf-select v-model:value="formConf.overTimeConfig.on" :options="overTimeMsgOptions" :disabled="formConf.timeLimitConfig.on == 0" />
        </a-form-item>
        <a-form-item v-if="formConf.overTimeConfig.on === 1">
          <div class="countersign-cell">
            <span class="w-120px inline-block">超时</span>
            <a-input-number v-model:value="formConf.overTimeConfig.firstOver" :min="0" :precision="0" class="!w-200px !mx-10px" />
            <span>小时，开始超时通知。</span>
          </div>
          <div class="countersign-cell mt-12px">
            <span class="w-120px inline-block">每间隔</span>
            <a-input-number v-model:value="formConf.overTimeConfig.overTimeDuring" :min="1" :precision="0" class="!w-200px !mx-10px" />
            <span>小时，超时通知一次。</span>
          </div>
          <div class="ant-form-item-label !mt-12px"><label class="ant-form-item-no-colon">超时事务</label></div>
          <a-row class="leading-32px">
            <a-checkbox v-model:checked="formConf.overTimeConfig.overNotice">
              超时通知<BasicHelp text="勾选后才能进行提醒消息发送（站内信系统默认发送，第三方超时消息需在节点通知内配置）" />
            </a-checkbox>
          </a-row>
          <a-row class="leading-32px">
            <a-checkbox v-model:checked="formConf.overTimeConfig.overEvent">超时事件<BasicHelp text="请在节点事件内配置提醒事件" /></a-checkbox>
          </a-row>
          <div class="countersign-cell" v-if="formConf.overTimeConfig.overEvent">
            <span class="w-120px inline-block">在超时通知第</span>
            <a-input-number v-model:value="formConf.overTimeConfig.overEventTime" :min="1" :precision="0" class="!w-200px !mx-10px" />
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
            <a-input-number v-model:value="formConf.overTimeConfig.overAutoApproveTime" :min="1" :precision="0" class="!w-200px !mx-10px" />
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
  </section>
</template>
<script lang="ts" setup>
  import { computed, reactive, toRefs, watch } from 'vue';
  import { TreeSelect } from 'ant-design-vue';
  import { ScrollContainer } from '/@/components/Container';
  import FlowFormModal from './FlowFormModal.vue';
  import MsgModal from './MsgModal.vue';
  import MsgTemplateDetail from './MsgTemplateDetail.vue';
  import { SelectInterface } from '/@/components/Interface';
  import { noticeOptions, overTimeMsgOptions, overTimeOptions } from '../helper/define';
  import { useModal } from '/@/components/Modal';

  interface State {
    activeKey: string;
    userLabel: string;
    temporaryContent: string;
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
    'msgOptions',
    'funcRequiredOptions',
    'funcSystemFieldOptions',
    'initFormOperates',
    'updateAllNodeFormOperates',
    'getFormFieldList',
  ]);
  const emit = defineEmits(['updateFormFieldList']);
  defineOptions({ name: 'startNode', inheritAttrs: false });
  defineExpose({ getContent, updateCheckStatus });

  const extraRuleOptions = [
    { id: 1, fullName: '无抄送人范围' },
    { id: 6, fullName: '同一公司' },
    { id: 2, fullName: '同一部门' },
    { id: 3, fullName: '同一岗位' },
    { id: 4, fullName: '发起人上级' },
    { id: 5, fullName: '发起人下属' },
  ];
  const errorRuleOptions = [
    { id: 1, fullName: '超级管理员' },
    { id: 2, fullName: '指定人员' },
    { id: 3, fullName: '上一节点审批人指定' },
    { id: 4, fullName: '默认审批通过' },
    { id: 5, fullName: '无法提交' },
  ];
  const revokeRuleOptions = [
    { id: 2, fullName: '撤回后可以重新提交流程' },
    { id: 1, fullName: '撤回后终止流程' },
  ];
  const resurgenceDataRuleOptions = [
    { id: 0, fullName: '复活后，取最后流转数据' },
    { id: 1, fullName: '复活后，恢复到当时数据' },
  ];
  const titleTypeOptions = [
    { id: 0, fullName: '默认' },
    { id: 1, fullName: '自定义' },
  ];
  const funcConfigOptions = [
    { id: 0, fullName: '事件执行失败，流程继续流转。' },
    { id: 1, fullName: '事件执行失败，终止后续节点。' },
  ];
  const formOperatesColumns = [
    { title: '表单字段', dataIndex: 'name', key: 'name' },
    { title: '操作', dataIndex: 'write', key: 'write', align: 'center', width: 250 },
  ];
  const keyMap = {
    initFuncConfig: 'initFuncConfig',
    endFuncConfig: 'endFuncConfig',
    flowRecallFuncConfig: 'flowRecallFuncConfig',
    waitMsgConfig: 'waitMsgConfig',
    endMsgConfig: 'endMsgConfig',
    approveMsgConfig: 'approveMsgConfig',
    rejectMsgConfig: 'rejectMsgConfig',
    copyMsgConfig: 'copyMsgConfig',
    overTimeMsgConfig: 'overTimeMsgConfig',
    noticeMsgConfig: 'noticeMsgConfig',
  };
  const msgTemplateJsonColumns = [
    { width: 50, title: '序号', align: 'center', customRender: ({ index }) => index + 1 },
    { title: '模板名称', dataIndex: 'msgTemplateName', key: 'msgTemplateName' },
    { title: '参数名称', dataIndex: 'paramJson', key: 'paramJson', width: 170 },
    { title: '表单字段', dataIndex: 'field', key: 'field', width: 190 },
  ];
  const [registerDetail, { openModal: openDetailModal }] = useModal();
  const state = reactive<State>({
    activeKey: '1',
    userLabel: '',
    temporaryContent: '',
    readAllChecked: false,
    writeAllChecked: false,
    requiredAllChecked: false,
    isReadIndeterminate: false,
    isWriteIndeterminate: false,
    isRequiredIndeterminate: false,
  });
  const { activeKey, readAllChecked, writeAllChecked, requiredAllChecked, isReadIndeterminate, isWriteIndeterminate, isRequiredIndeterminate } = toRefs(state);

  const titleContentOptions = computed(() => {
    const sysOptions = [
      { id: '@flowFullName', fullName: '流程名称' },
      { id: '@flowFullCode', fullName: '流程编码' },
      { id: '@launchUserName', fullName: '发起用户名' },
      { id: '@launchTime', fullName: '发起时间' },
    ];
    const fields = props.usedFormItems.filter(
      o => o.__config__.jnpfKey === 'input' || o.__config__.jnpfKey === 'textarea' || o.__config__.jnpfKey === 'inputNumber',
    );
    const options = [...sysOptions, ...fields].map(o => ({ value: o.id, label: o.id + '(' + o.fullName + ')' }));
    return options;
  });

  watch(
    () => props.formConf.titleContent,
    val => {
      state.temporaryContent = val;
    },
  );
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
    props.getFormFieldList(id, 'startForm', isSameForm);
  }
  function handleNull() {
    props.formConf.formName = '';
    props.formConf.formId = '';
    let formFieldList = [];
    emit('updateFormFieldList', formFieldList, 'startForm');
    props.formConf.formOperates = props.initFormOperates(props.value, true);
    props.updateAllNodeFormOperates();
  }
  function onLabelChange(val) {
    state.userLabel = val;
  }
  function getContent() {
    return state.userLabel || '所有人';
  }
  function handleSelect(value) {
    state.temporaryContent += '{' + value + '}';
    props.formConf.titleContent = state.temporaryContent;
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
    props.formConf[key].templateJson = row.templateJson.map(o => ({ ...o, relationField: '', sourceType: 1 })) || [];
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
  function onTimeLimitChange(val) {
    if (val == 0) props.formConf.overTimeConfig.on = 0;
  }
</script>
