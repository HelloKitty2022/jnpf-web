<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center bg-white">
      <a-form :colon="false" labelAlign="right" :labelCol="{ style: { width: '100px' } }" class="right-board-form h-full">
        <a-tabs class="jnpf-content-wrapper-tabs" v-model:activeKey="activeKey" type="card">
          <a-tab-pane :key="1" tab="基本设置" class="p-30px">
            <a-row>
              <a-col :span="24">
                <a-form-item label="系统图标">
                  <div class="img-list">
                    <JnpfUploadImgSingle v-model:value="baseForm.loginIcon" tipText="登录图标" />
                    <JnpfUploadImgSingle v-model:value="baseForm.logoIcon" tipText="LOGO图标" />
                    <JnpfUploadImgSingle v-model:value="baseForm.appIcon" tipText="APP图标" />
                  </div>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="系统标题">
                  <a-input v-model:value="baseForm.title" placeholder="请输入" allowClear />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="系统名称">
                  <a-input v-model:value="baseForm.sysName" placeholder="请输入" allowClear />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="系统版本">
                  <a-input v-model:value="baseForm.sysVersion" placeholder="请输入" allowClear readonly />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="公司名称">
                  <a-input v-model:value="baseForm.companyName" placeholder="请输入" allowClear />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="版权信息">
                  <a-input v-model:value="baseForm.copyright" placeholder="请输入" allowClear />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="公司简称">
                  <a-input v-model:value="baseForm.companyCode" placeholder="请输入" allowClear />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="公司地址">
                  <a-input v-model:value="baseForm.companyAddress" placeholder="请输入" allowClear />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="公司法人">
                  <a-input v-model:value="baseForm.companyContacts" placeholder="请输入" allowClear />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="公司电话">
                  <a-input v-model:value="baseForm.companyTelePhone" placeholder="请输入" allowClear />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="公司邮箱">
                  <a-input v-model:value="baseForm.companyEmail" placeholder="请输入" allowClear />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="系统描述">
                  <a-textarea v-model:value="baseForm.sysDescription" :autoSize="{ minRows: 5, maxRows: 10 }" placeholder="请输入" />
                </a-form-item>
              </a-col>
              <a-form-item label=" ">
                <a-button type="primary" @click.prevent="handleSubmit" :loading="btnLoading">保存</a-button>
              </a-form-item>
            </a-row>
          </a-tab-pane>
          <a-tab-pane :key="2" tab="安全设置" class="p-30px">
            <a-tabs v-model:activeKey="thirdTab" tab-position="left" style="height: 100%">
              <a-tab-pane :key="1" tab="登录策略">
                <a-row>
                  <a-col :span="8">
                    <a-form-item label="登录方式">
                      <jnpf-select v-model:value="baseForm.singleLogin" placeholder="请选择" :options="singleLoginOptions" />
                    </a-form-item>
                    <a-form-item label="超时登出">
                      <a-input-number
                        v-model:value="baseForm.tokenTimeout"
                        :min="1"
                        :precision="0"
                        addonAfter="分钟"
                        @change="onNumberChange($event, 'tokenTimeout')" />
                    </a-form-item>
                    <a-form-item label="密码错误次数">
                      <a-input-number
                        v-model:value="baseForm.passwordErrorsNumber"
                        :min="1"
                        :precision="0"
                        addonAfter="次"
                        @change="onNumberChange($event, 'passwordErrorsNumber')" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <div class="common-tip ml-100px">输入密码错误将用户锁定，设置3以下值表示不启动该功能</div>
                <a-row class="mt-10px">
                  <a-col :span="10">
                    <a-form-item label=" ">
                      <jnpf-radio v-model:value="baseForm.lockType" :options="lockTypeOptions" />
                      <div class="mt-10px">
                        <a-form-item label="延迟时间" v-if="baseForm.lockType === 2">
                          <a-input-number
                            v-model:value="baseForm.lockTime"
                            :min="1"
                            :precision="0"
                            addonAfter="分钟"
                            @change="onNumberChange($event, 'lockTime')" />
                        </a-form-item>
                      </div>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row>
                  <a-col :span="8">
                    <a-form-item label="登录验证码">
                      <jnpf-switch v-model:value="baseForm.enableVerificationCode" />
                    </a-form-item>
                    <a-form-item label="验证码位数" v-if="baseForm.enableVerificationCode">
                      <a-input-number
                        v-model:value="baseForm.verificationCodeNumber"
                        :min="3"
                        :max="6"
                        :precision="0"
                        addonAfter="位"
                        @change="onNumberChange($event, 'verificationCodeNumber')" />
                    </a-form-item>
                    <a-form-item label="登录提示语">
                      <jnpf-switch v-model:value="baseForm.lastLoginTimeSwitch" />
                    </a-form-item>
                    <a-form-item v-if="baseForm.lastLoginTimeSwitch" label=" ">
                      <a-card size="small" style="width: 300px" :body-style="{ padding: '0px 20px' }">
                        <template #title>
                          <span>上次登录信息提示</span>
                        </template>
                        <template #extra>
                          <i class="icon-ym icon-ym-nav-close card-extra" />
                        </template>
                        <div class="card-item">
                          <p>时间：2018-10-17 12:40</p>
                          <p>地点：上海市</p>
                          <p>IP：255.255.0.0</p>
                        </div>
                      </a-card>
                    </a-form-item>
                    <a-form-item label="白名单验证">
                      <jnpf-switch v-model:value="baseForm.whitelistSwitch" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row>
                  <a-col :span="12">
                    <a-form-item label="白名单设置" v-if="baseForm.whitelistSwitch">
                      <a-textarea v-model:value="baseForm.whiteListIp" :autoSize="{ minRows: 3, maxRows: 10 }" placeholder="允许访问IP" />
                      <div class="common-tip mt-10px">多个IP设置，用英文符号隔开，如192.168.0.1,192.168.0.2</div>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item label=" ">
                  <a-button type="primary" @click.prevent="handleSubmit" :loading="btnLoading">保存</a-button>
                </a-form-item>
              </a-tab-pane>
              <a-tab-pane :key="2" tab="密码策略">
                <a-row>
                  <a-col :span="8">
                    <a-form-item label="密码定期更新" :labelCol="{ style: { width: '120px' } }">
                      <jnpf-switch v-model:value="baseForm.passwordIsUpdatedRegularly" />
                    </a-form-item>
                    <template v-if="baseForm.passwordIsUpdatedRegularly">
                      <a-form-item label="更新周期" :labelCol="{ style: { width: '120px' } }">
                        <a-input-number
                          v-model:value="baseForm.updateCycle"
                          :min="1"
                          :precision="0"
                          addonAfter="天"
                          @change="onNumberChange($event, 'updateCycle')" />
                      </a-form-item>
                      <a-form-item label="提前" :labelCol="{ style: { width: '120px' } }">
                        <a-input-number
                          v-model:value="baseForm.updateInAdvance"
                          :min="1"
                          :precision="0"
                          addonAfter="天提醒更新"
                          @change="onNumberChange($event, 'updateInAdvance')" />
                      </a-form-item>
                    </template>
                    <a-form-item label="密码强度限制" :labelCol="{ style: { width: '120px' } }">
                      <jnpf-switch v-model:value="baseForm.passwordStrengthLimit" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row>
                  <a-col :span="10">
                    <a-form-item label=" " v-if="baseForm.passwordStrengthLimit" :labelCol="{ style: { width: '120px' } }">
                      <div class="flex">
                        <JnpfCheckboxSingle class="checkbox mr-20px" label="最小长度" v-model:value="baseForm.passwordLengthMin" />
                        <a-input-number
                          v-model:value="baseForm.passwordLengthMinNumber"
                          :min="1"
                          :precision="0"
                          @change="onNumberChange($event, 'passwordLengthMinNumber')" /><br />
                      </div>
                      <JnpfCheckboxSingle class="checkbox" label="包含数字" v-model:value="baseForm.containsNumbers" /><br />
                      <JnpfCheckboxSingle class="checkbox" label="包含小写字母" v-model:value="baseForm.includeLowercaseLetters" /><br />
                      <JnpfCheckboxSingle class="checkbox" label="包含大写字母" v-model:value="baseForm.includeUppercaseLetters" /><br />
                      <JnpfCheckboxSingle class="checkbox" label="包含字符" v-model:value="baseForm.containsCharacters" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row>
                  <a-col :span="8">
                    <a-form-item label="禁用旧密码" :labelCol="{ style: { width: '120px' } }">
                      <jnpf-switch v-model:value="baseForm.disableOldPassword" />
                    </a-form-item>
                    <a-form-item label="禁用个数" v-if="baseForm.disableOldPassword" :labelCol="{ style: { width: '120px' } }">
                      <a-input-number
                        v-model:value="baseForm.disableTheNumberOfOldPasswords"
                        :min="1"
                        :precision="0"
                        addonAfter="个"
                        @change="onNumberChange($event, 'disableTheNumberOfOldPasswords')" />
                    </a-form-item>
                    <a-form-item label="修改初始密码提醒" :labelCol="{ style: { width: '120px' } }">
                      <jnpf-switch v-model:value="baseForm.mandatoryModificationOfInitialPassword" />
                    </a-form-item>
                    <a-form-item :labelCol="{ style: { width: '120px' } }">
                      <template #label>新用户默认密码<BasicHelp text="修改后，新的默认密码仅针对后续新建的用户有效" /></template>
                      <a-input v-model:value="baseForm.newUserDefaultPassword" placeholder="请输入" @change="handleDefaultPasswordChange" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item label=" " :labelCol="{ style: { width: '120px' } }">
                  <a-button type="primary" @click.prevent="handleSubmit" :loading="btnLoading">保存</a-button>
                </a-form-item>
              </a-tab-pane>
            </a-tabs>
          </a-tab-pane>
          <a-tab-pane :key="3" tab="同步设置" class="p-30px">
            <a-tabs v-model:activeKey="thirdTab" tab-position="left" style="height: 100%">
              <a-tab-pane :key="1" tab="企业微信">
                <a-row :gutter="20">
                  <a-col :span="12" :offset="6" :pull="6">
                    <a-form-item label="企业号Id">
                      <a-input v-model:value="baseForm.qyhCorpId" allowClear placeholder="请输入CorpId" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12" :offset="6" :pull="6">
                    <a-form-item label="应用凭证">
                      <a-input v-model:value="baseForm.qyhAgentId" allowClear placeholder="请输入AgentId" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12" :offset="6" :pull="6">
                    <a-form-item label="凭证密钥">
                      <a-input v-model:value="baseForm.qyhAgentSecret" allowClear placeholder="请输入AppSecret">
                        <template #addonAfter>
                          <loading-outlined class="mr-5px" v-if="testQyLoading" />
                          <span class="cursor-pointer" @click="checkQy(0)">连接测试</span>
                        </template>
                      </a-input>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12" :offset="6" :pull="6">
                    <a-form-item label="同步密钥">
                      <a-input v-model:value="baseForm.qyhCorpSecret" allowClear placeholder="请输入CorpSecret">
                        <template #addonAfter>
                          <loading-outlined class="mr-5px" v-if="testSyncLoading" />
                          <span class="cursor-pointer" @click="checkQy(1)">同步测试</span>
                        </template>
                      </a-input>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item label="触发事件">
                  <a-table bordered :dataSource="wxEventsList" :columns="eventsColumns" :pagination="false" size="small">
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.dataIndex === 'select'">
                        <a-checkbox v-model:checked="record.select" />
                      </template>
                    </template>
                  </a-table>
                </a-form-item>
                <a-form-item label="同步反馈">
                  <a-table bordered :dataSource="wxResultsList" :columns="resultsColumns" :pagination="false" size="small">
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.dataIndex === 'synDate'">
                        <p>{{ dayjs(record.synDate).format('YYYY-MM-DD HH:mm:ss') }}</p>
                      </template>
                      <template v-if="column.dataIndex === 'action'">
                        <a-button class="action-btn" type="link" @click="handleSyncWxChart(record)" size="small">同步</a-button>
                      </template>
                    </template>
                  </a-table>
                </a-form-item>
                <a-form-item label=" ">
                  <a-button type="primary" @click.prevent="handleSubmit" :loading="btnLoading">保存</a-button>
                </a-form-item>
              </a-tab-pane>
              <a-tab-pane :key="2" tab="阿里钉钉">
                <a-row :gutter="20">
                  <a-col :span="12" :offset="6" :pull="6">
                    <a-form-item label="企业号Id">
                      <a-input v-model:value="baseForm.dingAgentId" allowClear placeholder="请输入AgentId" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12" :offset="6" :pull="6">
                    <a-form-item label="应用凭证">
                      <a-input v-model:value="baseForm.dingSynAppKey" allowClear placeholder="请输入AppKey" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12" :offset="6" :pull="6">
                    <a-form-item label="凭证密钥">
                      <a-input v-model:value="baseForm.dingSynAppSecret" allowClear placeholder="请输入AppSecret">
                        <template #addonAfter>
                          <loading-outlined class="mr-5px" v-if="testDingLoading" />
                          <span class="cursor-pointer" @click="checkDing">连接测试</span>
                        </template>
                      </a-input>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-form-item label="触发事件">
                  <a-table bordered :dataSource="ddEventsList" :columns="eventsColumns" :pagination="false" size="small">
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.dataIndex === 'select'">
                        <a-checkbox v-model:checked="record.select" />
                      </template>
                    </template>
                  </a-table>
                </a-form-item>
                <a-form-item label="同步反馈">
                  <a-table bordered :dataSource="ddResultsList" :columns="resultsColumns" :pagination="false" size="small">
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.dataIndex === 'synDate'">
                        <p>{{ dayjs(record.synDate).format('YYYY-MM-DD HH:mm:ss') }}</p>
                      </template>
                      <template v-if="column.dataIndex === 'action'">
                        <a-button class="action-btn" type="link" @click="handleSyncDing(record)" size="small">同步</a-button>
                      </template>
                    </template>
                  </a-table>
                </a-form-item>
                <a-form-item label=" ">
                  <a-button type="primary" @click.prevent="handleSubmit" :loading="btnLoading">保存</a-button>
                </a-form-item>
              </a-tab-pane>
            </a-tabs>
          </a-tab-pane>
          <a-tab-pane :key="4" tab="管理员设置" class="p-30px">
            <a-row>
              <a-col :span="12">
                <a-form-item label="超级管理员">
                  <jnpf-user-select v-model:value="adminIds" placeholder="请选择" multiple />
                </a-form-item>
                <a-form-item label=" ">
                  <a-button type="primary" @click.prevent="handleAdminSubmit" :loading="btnLoading">保存</a-button>
                </a-form-item>
              </a-col>
            </a-row>
          </a-tab-pane>
          <a-tab-pane :key="5" tab="流程设置" class="p-30px">
            <a-row>
              <a-col :span="8">
                <a-form-item :labelCol="{ style: { width: '120px' } }">
                  <template #label>链接时效性<BasicHelp text="审批链接是否有效：审批链接发送时间 + 审批链接时效性。" /></template>
                  <a-input-number
                    v-model:value="baseForm.linkTime"
                    placeholder="请输入"
                    :min="1"
                    :precision="0"
                    addonAfter="小时"
                    @change="onNumberChange($event, 'linkTime')" />
                </a-form-item>
                <a-form-item :labelCol="{ style: { width: '120px' } }">
                  <template #label>链接点击失效<BasicHelp text="禁用：不判断点击次数；启用：根据失效次数判断，点击超过次数链接失效。" /></template>
                  <jnpf-switch v-model:value="baseForm.isClick" />
                </a-form-item>
                <a-form-item :labelCol="{ style: { width: '120px' } }" v-if="baseForm.isClick">
                  <template #label>失效次数</template>
                  <a-input-number
                    v-model:value="baseForm.unClickNum"
                    placeholder="请输入"
                    :min="1"
                    :precision="0"
                    addonAfter="次"
                    @change="onNumberChange($event, 'unClickNum')" />
                </a-form-item>
                <a-form-item :labelCol="{ style: { width: '120px' } }" label=" ">
                  <a-button type="primary" @click.prevent="handleSubmit">保存</a-button>
                </a-form-item>
              </a-col>
            </a-row>
          </a-tab-pane>
        </a-tabs>
      </a-form>
    </div>
    <BasicModal v-bind="$attrs" @register="registerModal" title="数据同步" :footer="null" :width="450" class="sync-dialog">
      <div class="add-item">
        <i class="add-icon syn-icon icon-ym icon-ym-upload"></i>
        <div class="add-txt">
          <p class="add-title">同步到{{ synData.name }}</p>
          <p class="add-desc">把系统数据同步到{{ synData.name }}</p>
        </div>
        <a-button type="primary" @click="synData.name === '企业微信' ? syncQy(0) : syncDing(0)" :loading="weChatLoading" :disabled="dingLoading">
          同步
        </a-button>
      </div>
      <div class="add-item ding-item">
        <i class="add-icons syn-icon icon-ym icon-ym-download"></i>
        <div class="add-txt">
          <p class="add-title">同步到系统</p>
          <p class="add-desc">把{{ synData.name }}同步到系统</p>
        </div>
        <a-button type="primary" @click="synData.name === '企业微信' ? syncQy(1) : syncDing(1)" :loading="dingLoading" :disabled="weChatLoading">
          同步
        </a-button>
      </div>
    </BasicModal>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, toRefs, watch } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { useAppStore } from '/@/store/modules/app';
  import { LoadingOutlined } from '@ant-design/icons-vue';
  import {
    getSysConfig,
    update,
    testQy,
    testDing,
    getSynData,
    synAllOrganizeSysToDing,
    synAllUserSysToDing,
    synAllOrganizeSysToQy,
    synAllUserSysToQy,
    getAdminList,
    setAdminList,
  } from '/@/api/system/sysConfig';
  import dayjs from 'dayjs';
  import { useRoute } from 'vue-router';

  interface State {
    baseForm: any;
    activeKey: number;
    adminIds: any[];
    btnLoading: boolean;
    thirdTab: number;
    singleLoginOptions: any[];
    lockTypeOptions: any[];
    testQyLoading: boolean;
    testSyncLoading: boolean;
    testDingLoading: boolean;
    eventsColumns: any[];
    resultsColumns: any[];
    wxEventsList: any[];
    wxResultsList: any[];
    ddEventsList: any[];
    ddResultsList: any[];
    synData: any;
    weChatLoading: boolean;
    dingLoading: boolean;
  }

  defineOptions({ name: 'system-sysConfig' });

  const state = reactive<State>({
    baseForm: {},
    activeKey: 1,
    adminIds: [],
    btnLoading: false,
    thirdTab: 1,
    singleLoginOptions: [
      { fullName: '单一登录', id: 1 },
      { fullName: '同时登录', id: 2 },
    ],
    lockTypeOptions: [
      { fullName: '账号锁定', id: 1 },
      { fullName: '延时登录', id: 2 },
    ],
    testQyLoading: false,
    testSyncLoading: false,
    testDingLoading: false,
    eventsColumns: [
      { title: '', dataIndex: 'select', width: 50, align: 'center' },
      { title: '触发事件', dataIndex: 'title' },
      { title: '描述', dataIndex: 'desc' },
    ],
    resultsColumns: [
      { title: '同步类型', dataIndex: 'synType' },
      { title: '总数', dataIndex: 'recordTotal' },
      { title: '同步成功数', dataIndex: 'synSuccessCount' },
      { title: '同步失败数', dataIndex: 'synFailCount' },
      { title: '未同步数', dataIndex: 'unSynCount' },
      { title: '同步时间', dataIndex: 'synDate' },
      { title: '操作', dataIndex: 'action', width: 50 },
    ],
    wxEventsList: [
      { select: false, title: '启用同步组织', desc: '新增、删除、修改组织信息触发同步组织事件' },
      { select: false, title: '启用同步用户', desc: '新增、删除、修改用户信息触发同步用户事件' },
    ],
    wxResultsList: [
      { recordTotal: '', synDate: '', synFailCount: '', synSuccessCount: '', synType: '组织', unSynCount: '' },
      { recordTotal: '', synDate: '', synFailCount: '', synSuccessCount: '', synType: '用户', unSynCount: '' },
    ],
    ddEventsList: [
      { select: false, title: '启用同步组织', desc: '新增、删除、修改组织信息触发同步组织事件' },
      { select: false, title: '启用同步用户', desc: '新增、删除、修改用户信息触发同步用户事件' },
    ],
    ddResultsList: [
      { recordTotal: '', synDate: '', synFailCount: '', synSuccessCount: '', synType: '组织', unSynCount: '' },
      { recordTotal: '', synDate: '', synFailCount: '', synSuccessCount: '', synType: '用户', unSynCount: '' },
    ],
    synData: {},
    weChatLoading: false,
    dingLoading: false,
  });
  const {
    baseForm,
    activeKey,
    thirdTab,
    adminIds,
    btnLoading,
    singleLoginOptions,
    lockTypeOptions,
    testQyLoading,
    testSyncLoading,
    testDingLoading,
    wxEventsList,
    eventsColumns,
    wxResultsList,
    resultsColumns,
    ddEventsList,
    ddResultsList,
    synData,
    weChatLoading,
    dingLoading,
  } = toRefs(state);
  const { createConfirm, createMessage } = useMessage();
  const { t } = useI18n();
  const appStore = useAppStore();
  const [registerModal, { openModal: openModal, closeModal }] = useModal();

  watch(
    () => state.activeKey,
    val => {
      if (val === 4) getAdminListData();
    },
  );
  watch(
    () => state.thirdTab,
    val => {
      getSynDataFun(val);
    },
    { immediate: true },
  );

  function getAdminListData() {
    getAdminList().then(res => {
      if (!res.data) return;
      state.adminIds = res.data.map(o => o.id);
    });
  }
  function initData() {
    state.testQyLoading = false;
    state.testSyncLoading = false;
    state.testDingLoading = false;
    getSysConfig().then(res => {
      state.baseForm = res.data;
      state.wxEventsList[0].select = state.baseForm.qyhIsSynOrg ? true : false;
      state.wxEventsList[1].select = state.baseForm.qyhIsSynUser ? true : false;
      state.ddEventsList[0].select = state.baseForm.dingSynIsSynOrg ? true : false;
      state.ddEventsList[1].select = state.baseForm.dingSynIsSynUser ? true : false;
      state.baseForm.smsCompany = state.baseForm.smsCompany ? state.baseForm.smsCompany : '1';
      state.baseForm.lockType = state.baseForm.lockType ? state.baseForm.lockType : 1;
      state.baseForm.lockTime = state.baseForm.lockTime ? state.baseForm.lockTime : 10;
      state.baseForm.linkTime = state.baseForm.linkTime ? state.baseForm.linkTime : 24;
      state.baseForm.unClickNum = state.baseForm.unClickNum ? state.baseForm.unClickNum : 1;
    });
  }
  function handleSubmit() {
    state.baseForm.qyhIsSynOrg = state.wxEventsList[0].select ? 1 : 0;
    state.baseForm.qyhIsSynUser = state.wxEventsList[1].select ? 1 : 0;
    state.baseForm.dingSynIsSynOrg = state.ddEventsList[0].select ? 1 : 0;
    state.baseForm.dingSynIsSynUser = state.ddEventsList[1].select ? 1 : 0;
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '您确定要保存，是否继续?',
      onOk: () => {
        state.btnLoading = true;
        update(state.baseForm)
          .then(res => {
            createMessage.success(res.msg);
            state.btnLoading = false;
            const sysConfigInfo = {
              sysName: state.baseForm.sysName,
              sysVersion: state.baseForm.sysVersion,
              loginIcon: state.baseForm.loginIcon,
              copyright: state.baseForm.copyright,
              newUserDefaultPassword: state.baseForm.newUserDefaultPassword,
              companyName: state.baseForm.companyName,
              logoIcon: state.baseForm.logoIcon,
              appIcon: state.baseForm.appIcon,
              title: state.baseForm.title,
            };
            appStore.setProjectConfig({ sysConfigInfo });
            initData();
          })
          .catch(() => {
            state.btnLoading = false;
          });
      },
    });
  }
  function handleAdminSubmit() {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '您确定要保存，是否继续?',
      onOk: () => {
        state.btnLoading = true;
        setAdminList({ adminIds: state.adminIds }).then(res => {
          createMessage.success(res.msg);
          state.btnLoading = false;
        });
      },
    });
  }
  function checkQy(type) {
    type === 1 ? (state.testSyncLoading = true) : (state.testQyLoading = true);
    const data = {
      qyhAgentId: state.baseForm.qyhAgentId,
      qyhAgentSecret: state.baseForm.qyhAgentSecret,
      qyhCorpId: state.baseForm.qyhCorpId,
      qyhCorpSecret: state.baseForm.qyhCorpSecret,
    };
    testQy(data, type)
      .then(res => {
        createMessage.success(res.msg);
        type === 1 ? (state.testSyncLoading = false) : (state.testQyLoading = false);
      })
      .catch(() => {
        type === 1 ? (state.testSyncLoading = false) : (state.testQyLoading = false);
      });
  }
  function checkDing() {
    state.testDingLoading = true;
    const data = {
      dingAgentId: state.baseForm.dingAgentId,
      dingSynAppKey: state.baseForm.dingSynAppKey,
      dingSynAppSecret: state.baseForm.dingSynAppSecret,
    };
    testDing(data)
      .then(res => {
        createMessage.success(res.msg);
        state.testDingLoading = false;
      })
      .catch(() => {
        state.testDingLoading = false;
      });
  }
  function handleSyncWxChart(record) {
    state.synData = record;
    state.synData.name = '企业微信';
    openModal(true);
  }
  function handleSyncDing(record) {
    state.synData = record;
    state.synData.name = '阿里钉钉';
    openModal(true);
  }
  function syncQy(type) {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '同步以后会丢失现有数据，是否继续?',
      onOk: () => {
        type == 0 ? (state.weChatLoading = true) : (state.dingLoading = true);
        const method = state.synData.synType == '组织' ? synAllOrganizeSysToQy : synAllUserSysToQy;
        method(type)
          .then(res => {
            type == 0 ? (state.weChatLoading = false) : (state.dingLoading = false);
            closeModal();
            if (res.msg === '正在进行同步,请稍等') return createMessage.success(res.msg);
            state.synData.recordTotal = res.data.recordTotal;
            state.synData.synDate = res.data.synDate;
            state.synData.synFailCount = res.data.synFailCount;
            state.synData.synSuccessCount = res.data.synSuccessCount;
            state.synData.synType = res.data.synType;
            state.synData.unSynCount = res.data.unSynCount;
            createMessage.success('同步成功');
          })
          .catch(() => {
            type == 0 ? (state.weChatLoading = false) : (state.dingLoading = false);
          });
      },
    });
  }
  function syncDing(type) {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '同步以后会丢失现有数据，是否继续?',
      onOk: () => {
        type == 0 ? (state.weChatLoading = true) : (state.dingLoading = true);
        const method = state.synData.synType == '组织' ? synAllOrganizeSysToDing : synAllUserSysToDing;
        method(type)
          .then(res => {
            type == 0 ? (state.weChatLoading = false) : (state.dingLoading = false);
            if (res.msg === '正在进行同步,请稍等') return createMessage.success(res.msg);
            state.synData.recordTotal = res.data.recordTotal;
            state.synData.synDate = res.data.synDate;
            state.synData.synFailCount = res.data.synFailCount;
            state.synData.synSuccessCount = res.data.synSuccessCount;
            state.synData.synType = res.data.synType;
            state.synData.unSynCount = res.data.unSynCount;
            createMessage.success('同步成功');
          })
          .catch(() => {
            type == 0 ? (state.weChatLoading = false) : (state.dingLoading = false);
          });
      },
    });
  }
  function getSynDataFun(type) {
    getSynData(type).then(res => {
      let list = res.data.map(o => ({ loading: false, ...o }));
      type == 1 ? (state.wxResultsList = list) : (state.ddResultsList = list);
    });
  }
  function onNumberChange(val, key) {
    if (val) return;
    if (key === 'verificationCodeNumber') return (state.baseForm[key] = 3);
    state.baseForm[key] = 1;
  }

  function handleDefaultPasswordChange(e) {
    if (e.target.value) return;
    state.baseForm.newUserDefaultPassword = '0000';
  }

  onMounted(() => {
    const route = useRoute();
    if (route.query.type == '1') state.activeKey = 3;
    initData();
  });
</script>
<style lang="less" scoped>
  .img-list {
    display: flex;
    .single-img-container {
      margin-right: 20px;
      :last-child {
        margin-right: 0;
      }
    }
  }
  .common-tip {
    color: @text-color-secondary;
    font-size: 14px;
    line-height: 1;
  }

  .card-extra {
    float: right;
    font-size: 12px;
    padding: 8px 0;
  }
  .card-item {
    p {
      line-height: 32px;
    }
  }
  :deep(.ant-tabs-content-left) {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .sync-dialog {
    .ding-item {
      margin-bottom: 20px;
    }

    .add-item {
      width: 100%;
      height: 100px;
      display: flex;
      align-items: center;
      cursor: pointer;
      .add-icon {
        background: #75d8f791 !important;
        color: #08c0f8 !important;
      }
      .syn-icon {
        width: 56px;
        height: 56px;
        margin-right: 10px;
        background: #cefae2;
        border-radius: 50%;
        color: #0eac5c;
        flex-shrink: 0;
        font-size: 30px;
        line-height: 56px;
        text-align: center;
      }
      .add-txt {
        height: 56px;
        flex: 1;
        P {
          line-height: 28px;
        }
        .add-title {
          font-size: 18px;
          font-weight: bold;
        }
        .add-desc {
          color: #8d8989;
          font-size: 12px;
          width: 150px;
        }
      }
    }
  }
  .checkbox {
    line-height: 32px;
    flex-shrink: 0;
  }
</style>
