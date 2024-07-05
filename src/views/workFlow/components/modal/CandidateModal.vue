<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="提交审核" @ok="handleSubmit" :minHeight="52" destroyOnClose>
    <a-form
      :colon="false"
      :labelCol="{ style: { width: dataForm.candidateList.length || branchList.length ? '130px' : '80px' } }"
      :model="dataForm"
      ref="formElRef">
      <a-form-item label="分支选择" name="branchList" :rules="[{ required: true, message: `必填`, trigger: 'change', type: 'array' }]" v-if="branchList.length">
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
          placeholder="请选择"
          :taskId="state.taskId"
          :formData="state.formData"
          :nodeId="item.nodeId"
          v-if="item.hasCandidates" />
        <jnpf-user-select v-model:value="item.value" multiple placeholder="请选择" modalTitle="候选人员" v-else />
      </a-form-item>
      <a-form-item label="抄送人员" name="copyIds" v-if="isCustomCopy">
        <jnpf-user-select v-model:value="dataForm.copyIds" multiple allowClear />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive, ref, toRefs, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import CandidateUserSelect from './CandidateUserSelect.vue';

  interface State {
    dataForm: any;
    defaultCandidateList: any[];
    branchList: any[];
    isCustomCopy: boolean;
    taskId: string;
    formData: any;
  }

  const emit = defineEmits(['register', 'confirm']);

  const formElRef = ref<FormInstance>();
  const state = reactive<State>({
    dataForm: {
      copyIds: [],
      branchList: [],
      candidateList: [],
    },
    defaultCandidateList: [],
    branchList: [],
    isCustomCopy: false,
    taskId: '',
    formData: {},
  });
  const { dataForm, branchList, isCustomCopy } = toRefs(state);
  const [registerModal, { changeOkLoading }] = useModalInner(init);

  function init(data) {
    changeOkLoading(false);
    state.branchList = data.branchList.map(o => ({ id: o.nodeId, fullName: o.nodeName, isCandidates: o.isCandidates, hasCandidates: o.hasCandidates }));
    state.isCustomCopy = data.isCustomCopy;
    state.taskId = data.taskId || '';
    state.formData = data.formData;
    state.dataForm.copyIds = [];
    state.dataForm.branchList = [];
    state.defaultCandidateList = data.candidateList.map(o => ({
      ...o,
      label: '审批人',
      value: [],
      rules: [{ required: true, message: `必填`, trigger: 'change', type: 'array' }],
    }));
    state.dataForm.candidateList = state.defaultCandidateList;
    nextTick(() => {
      formElRef.value?.clearValidate();
    });
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
            rules: [{ required: true, message: `必填`, trigger: 'change', type: 'array' }],
          });
          break inner;
        }
      }
    }
    state.dataForm.candidateList = [...state.defaultCandidateList, ...list];
  }
  async function handleSubmit() {
    try {
      const values = await formElRef.value?.validate();
      if (!values) return;
      let candidateList = {};
      for (let i = 0; i < state.dataForm.candidateList.length; i++) {
        candidateList[state.dataForm.candidateList[i].nodeId] = state.dataForm.candidateList[i].value;
      }
      changeOkLoading(true);
      emit('confirm', {
        candidateList,
        branchList: state.dataForm.branchList,
        copyIds: state.dataForm.copyIds.join(','),
      });
    } catch (_) {}
  }
</script>
