<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="state.title" @ok="handleSubmit" :minHeight="52" destroyOnClose>
    <a-form :colon="false" :labelCol="{ style: { width: '80px' } }" :model="dataForm" ref="formElRef">
      <a-form-item label="挂起类型" name="suspend" v-if="eventType === 'suspend'">
        <a-select v-model:value="dataForm.suspend" placeholder="请选择">
          <a-select-option :value="0">全部流程挂起</a-select-option>
          <a-select-option :value="1" v-if="state.suspendType">主流程挂起</a-select-option>
        </a-select>
      </a-form-item>
      <template v-if="eventType !== 'suspend'">
        <a-form-item :label="`${label}节点`" name="taskNodeId" :rules="[{ required: true, message: '必填', trigger: 'change' }]">
          <jnpf-select v-model:value="dataForm.taskNodeId" placeholder="请选择" :options="state.nodeList" showSearch />
        </a-form-item>
      </template>
      <a-form-item :label="`${label}原因`" name="handleOpinion">
        <jnpf-textarea v-model:value="dataForm.handleOpinion" placeholder="请输入" />
      </a-form-item>
      <a-form-item :label="`${label}附件`" name="fileList">
        <jnpf-upload-file v-model:value="dataForm.fileList" type="workFlow" :limit="3" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive, ref, toRefs, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';

  interface State {
    dataForm: any;
    eventType: string;
    title: string;
    label: string;
    nodeList: any[];
    suspendType: boolean;
  }

  const emit = defineEmits(['register', 'confirm']);
  const formElRef = ref<FormInstance>();
  const state = reactive<State>({
    dataForm: {
      taskNodeId: '',
      handleOpinion: '',
      fileList: [],
      suspend: 0,
    },
    eventType: '',
    title: '',
    label: '',
    nodeList: [],
    suspendType: false,
  });
  const { dataForm, eventType, label } = toRefs(state);
  const [registerModal, { changeOkLoading }] = useModalInner(init);

  function init(data) {
    changeOkLoading(false);
    state.dataForm = {
      taskNodeId: '',
      handleOpinion: '',
      fileList: [],
      suspend: 0,
    };
    state.eventType = data.eventType;
    state.suspendType = data.suspendType || false;
    state.nodeList = (data.nodeList || []).map(o => ({ id: o.id, fullName: o.nodeName }));
    state.title = state.eventType === 'suspend' ? '挂起流程暂停' : state.eventType === 'resurgence' ? '复活' : '变更';
    state.label = state.eventType === 'suspend' ? '挂起' : state.eventType === 'resurgence' ? '复活' : '变更';
    nextTick(() => {
      formElRef.value?.clearValidate();
    });
  }
  async function handleSubmit() {
    try {
      const values = await formElRef.value?.validate();
      if (!values) return;
      changeOkLoading(true);
      const query = { ...state.dataForm, suspend: !!state.dataForm.suspend };
      emit('confirm', query);
    } catch (_) {}
  }
</script>
