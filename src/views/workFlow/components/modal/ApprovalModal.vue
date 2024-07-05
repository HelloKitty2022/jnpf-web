<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="state.title" @ok="handleSubmit" :minHeight="52" :closeFunc="onClose">
    <a-form
      :colon="false"
      :labelCol="{ style: { width: dataForm.candidateList.length || branchList.length ? '130px' : '80px' } }"
      :model="dataForm"
      ref="formElRef">
      <template v-if="eventType === 'freeApprover'">
        <a-form-item label="加签人员" name="freeApproverUserId" :rules="[{ required: true, message: `必填`, trigger: 'change' }]">
          <jnpf-user-select v-model:value="dataForm.freeApproverUserId" placeholder="请选择" allowClear />
        </a-form-item>
        <a-form-item label="加签类型" name="freeApproverType">
          <a-radio-group v-model:value="dataForm.freeApproverType" button-style="solid">
            <a-radio-button :value="1">审批前</a-radio-button>
            <a-radio-button :value="2">审批后</a-radio-button>
          </a-radio-group>
        </a-form-item>
      </template>
      <template v-if="eventType === 'audit' || (eventType === 'freeApprover' && dataForm.freeApproverType === 2)">
        <a-form-item
          label="分支选择"
          name="branchList"
          :rules="[{ required: true, message: `必填`, trigger: 'change', type: 'array' }]"
          v-if="branchList.length">
          <jnpf-select v-model:value="dataForm.branchList" multiple placeholder="请选择" allowClear @change="onBranchChange" :options="branchList" showSearch />
        </a-form-item>
        <a-form-item
          :label="item.nodeName + item.label"
          :name="['candidateList', i, 'value']"
          v-for="(item, i) in dataForm.candidateList"
          :key="i"
          :rules="item.rules">
          <candidate-user-select
            v-model:value="item.value"
            multiple
            :placeholder="'请选择' + item.label"
            :taskId="state.taskId"
            :formData="state.formData"
            :nodeId="item.nodeId"
            v-if="item.hasCandidates" />
          <jnpf-user-select v-model:value="item.value" multiple :placeholder="'请选择' + item.label" modalTitle="候选人员" v-else />
        </a-form-item>
      </template>
      <template v-if="eventType === 'reject' && properties.rejectType && showReject">
        <a-form-item label="退回节点" name="rejectStep" :rules="[{ required: true, message: `必填`, trigger: 'change' }]">
          <jnpf-select
            v-model:value="dataForm.rejectStep"
            placeholder="请选择"
            :options="state.rejectList"
            :disabled="properties.rejectStep !== '2'"
            showSearch />
        </a-form-item>
        <a-form-item label=" " name="rejectType" v-if="properties.rejectType == 3">
          <a-radio-group v-model:value="dataForm.rejectType">
            <a-radio :value="1">重新审批<BasicHelp text="若流程为A->B->C，C退回至A，则C->A->B->C" /></a-radio>
            <a-radio :value="2">直接提交给我<BasicHelp text="若流程为A->B->C，C退回至A，则C->A->C" /></a-radio>
          </a-radio-group>
        </a-form-item>
      </template>
      <a-form-item label="抄送人员" name="copyIds" v-if="eventType !== 'freeApprover' && properties.isCustomCopy">
        <jnpf-user-select v-model:value="dataForm.copyIds" multiple allowClear />
      </a-form-item>
      <template v-if="properties.hasOpinion">
        <a-form-item :label="`${label}意见`" name="handleOpinion">
          <jnpf-textarea v-model:value="dataForm.handleOpinion" placeholder="请输入" />
          <CommonWordsPopover ref="commonWordsPopoverRef" @confirm="insertOpinion" />
        </a-form-item>
        <a-form-item :label="`${label}附件`" name="fileList">
          <jnpf-upload-file v-model:value="dataForm.fileList" type="workFlow" :limit="3" />
        </a-form-item>
      </template>
      <a-form-item
        :label="eventType == 'freeApprover' ? '手写签名' : '审批签名'"
        name="signImg"
        v-if="properties.hasSign"
        :rules="[{ required: true, message: `请签名`, trigger: 'change' }]">
        <jnpf-sign v-model:value="dataForm.signImg" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive, ref, toRefs, unref, nextTick, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import CandidateUserSelect from './CandidateUserSelect.vue';
  import { useUserStore } from '/@/store/modules/user';
  import CommonWordsPopover from './CommonWordsPopover.vue';

  interface State {
    dataForm: any;
    defaultCandidateList: any[];
    branchList: any[];
    taskId: string;
    formData: any;
    eventType: string;
    showReject: boolean;
    properties: any;
    rejectList: any[];
    title: string;
    label: string;
  }

  const emit = defineEmits(['register', 'confirm']);
  const userStore = useUserStore();
  const formElRef = ref<FormInstance>();
  const commonWordsPopoverRef = ref();
  const state = reactive<State>({
    dataForm: {
      copyIds: [],
      branchList: [],
      candidateList: [],
      fileList: [],
      handleOpinion: '',
      signImg: '',
      rejectType: 1,
      rejectStep: '',
      // 加签使用
      freeApproverUserId: '',
      freeApproverType: 1,
    },
    defaultCandidateList: [],
    branchList: [],
    taskId: '',
    formData: {},
    eventType: '',
    showReject: false,
    properties: {},
    rejectList: [],
    title: '',
    label: '',
  });
  const { dataForm, branchList, properties, showReject, eventType, label } = toRefs(state);
  const [registerModal, { changeOkLoading }] = useModalInner(init);

  const getUserInfo = computed(() => userStore.getUserInfo || {});

  function init(data) {
    changeOkLoading(false);
    state.dataForm = {
      copyIds: [],
      branchList: [],
      candidateList: [],
      fileList: [],
      handleOpinion: '',
      signImg: '',
      rejectType: 1,
      rejectStep: '',
      freeApproverUserId: '',
      freeApproverType: 1,
    };
    state.branchList = data.branchList.map(o => ({ id: o.nodeId, fullName: o.nodeName, isCandidates: o.isCandidates, hasCandidates: o.hasCandidates }));
    state.taskId = data.taskId || '';
    state.formData = data.formData;
    state.eventType = data.eventType;
    state.title = state.eventType === 'freeApprover' ? '加签' : state.eventType === 'audit' ? '审批通过' : '审批退回';
    state.label = state.eventType === 'freeApprover' ? '加签' : '审批';
    state.showReject = data.showReject;
    state.properties = data.properties;
    state.rejectList = data.rejectList.map(o => ({ id: o.nodeCode, fullName: o.nodeName }));
    if (state.properties.hasSign) state.dataForm.signImg = unref(getUserInfo).signImg;
    state.dataForm.rejectStep = data.rejectList.length ? data.rejectList[0].nodeCode : '';
    state.defaultCandidateList = data.candidateList.map(o => ({
      ...o,
      label: '审批人',
      value: [],
      rules: [{ required: true, message: `审批人不能为空`, trigger: 'change', type: 'array' }],
    }));
    state.dataForm.candidateList = state.defaultCandidateList;
    nextTick(() => {
      formElRef.value?.clearValidate();
    });
  }
  function insertOpinion(val) {
    state.dataForm.handleOpinion += val;
  }
  function onBranchChange(val) {
    if (!val.length) return (state.dataForm.candidateList = state.defaultCandidateList);
    let list: any[] = [];
    for (let i = 0; i < val.length; i++) {
      inner: for (let j = 0; j < state.branchList.length; j++) {
        let o = state.branchList[j];
        if (val[i] === o.id && o.isCandidates) {
          list.push({
            nodeId: o.id,
            nodeName: o.fullName,
            isCandidates: o.isCandidates,
            hasCandidates: o.hasCandidates,
            label: '审批人',
            value: [],
            rules: [{ required: true, message: `审批人不能为空`, trigger: 'change', type: 'array' }],
          });
          break inner;
        }
      }
    }
    state.dataForm.candidateList = [...state.defaultCandidateList, ...list];
  }
  async function handleSubmit() {
    try {
      unref(commonWordsPopoverRef)?.closePopover();
      const values = await formElRef.value?.validate();
      if (!values) return;
      let candidateList = {};
      if (state.dataForm.candidateList.length) {
        for (let i = 0; i < state.dataForm.candidateList.length; i++) {
          candidateList[state.dataForm.candidateList[i].nodeId] = state.dataForm.candidateList[i].value;
        }
      }
      changeOkLoading(true);
      const data = {
        ...state.dataForm,
        candidateList,
        copyIds: state.dataForm.copyIds.join(','),
      };
      if (state.properties.rejectType != 3) data.rejectType = state.properties.rejectType;
      if (state.eventType !== 'freeApprover') {
        delete data.freeApproverType;
        delete data.freeApproverUserId;
      }
      emit('confirm', data);
    } catch (_) {}
  }
  async function onClose() {
    unref(commonWordsPopoverRef)?.closePopover();
    return true;
  }
</script>
