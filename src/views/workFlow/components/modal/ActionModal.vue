<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="state.title" @ok="handleSubmit" :minHeight="52">
    <a-form :colon="false" :labelCol="{ style: { width: '80px' } }" :model="dataForm" ref="formElRef">
      <template v-if="eventType === 'transfer' || eventType === 'assign' || eventType === 'cancel'">
        <a-form-item label="指派节点" name="nodeCode" v-if="eventType === 'assign'" :rules="[{ required: true, message: '必填', trigger: 'change' }]">
          <jnpf-select v-model:value="dataForm.nodeCode" placeholder="请选择" :options="state.assignNodeList" showSearch />
        </a-form-item>
        <a-form-item
          :label="label + '给谁'"
          name="freeApproverUserId"
          v-if="eventType === 'transfer' || eventType === 'assign'"
          :rules="[{ required: true, message: '必填', trigger: 'change' }]">
          <jnpf-user-select v-model:value="dataForm.freeApproverUserId" placeholder="请选择" />
        </a-form-item>
        <template v-if="eventType === 'assign' || eventType === 'cancel' || (eventType === 'transfer' && properties && properties.hasOpinion)">
          <a-form-item :label="`${label}原因`" name="handleOpinion">
            <jnpf-textarea v-model:value="dataForm.handleOpinion" placeholder="请输入" />
          </a-form-item>
          <a-form-item :label="`${label}附件`" name="fileList">
            <jnpf-upload-file v-model:value="dataForm.fileList" type="workFlow" :limit="3" />
          </a-form-item>
        </template>
        <a-form-item
          label="手写签名"
          name="signImg"
          v-if="properties.hasSign && eventType === 'transfer'"
          :rules="[{ required: true, message: '必填', trigger: 'change' }]">
          <jnpf-sign v-model:value="dataForm.signImg" />
        </a-form-item>
      </template>
      <template v-else>
        <template v-if="properties.hasOpinion">
          <a-form-item :label="`${label}原因`" name="handleOpinion">
            <jnpf-textarea v-model:value="dataForm.handleOpinion" placeholder="请输入" />
          </a-form-item>
          <a-form-item :label="`${label}附件`" name="fileList">
            <jnpf-upload-file v-model:value="dataForm.fileList" type="workFlow" :limit="3" />
          </a-form-item>
        </template>
        <a-form-item label="手写签名" name="signImg" v-if="properties.hasSign" :rules="[{ required: true, message: `请签名`, trigger: 'change' }]">
          <jnpf-sign v-model:value="dataForm.signImg" />
        </a-form-item>
      </template>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive, ref, toRefs, nextTick, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { useUserStore } from '/@/store/modules/user';

  interface State {
    dataForm: any;
    properties: any;
    eventType: string;
    title: string;
    label: string;
    assignNodeList: any[];
  }

  const emit = defineEmits(['register', 'confirm']);
  const userStore = useUserStore();
  const formElRef = ref<FormInstance>();
  const state = reactive<State>({
    dataForm: {
      handleOpinion: '',
      freeApproverUserId: '',
      nodeCode: '',
      fileList: [],
      signImg: '',
    },
    properties: {},
    eventType: '',
    title: '',
    label: '',
    assignNodeList: [],
  });
  const { dataForm, eventType, label, properties } = toRefs(state);
  const [registerModal, { changeOkLoading }] = useModalInner(init);

  const getUserInfo = computed(() => userStore.getUserInfo || {});

  function init(data) {
    changeOkLoading(false);
    state.dataForm = {
      handleOpinion: '',
      freeApproverUserId: '',
      nodeCode: '',
      fileList: [],
      signImg: '',
    };
    state.properties = data.properties;
    state.eventType = data.eventType;
    if (state.properties.hasSign) state.dataForm.signImg = unref(getUserInfo).signImg;
    state.assignNodeList = (data.assignNodeList || []).map(o => ({ id: o.nodeCode, fullName: o.nodeName }));
    switch (data.eventType) {
      case 'transfer':
        state.title = '转审';
        state.label = '转审';
        break;
      case 'revoke':
        state.title = '撤回流程';
        state.label = '撤回';
        break;
      case 'recall':
        state.title = '撤回审核';
        state.label = '撤回';
        break;
      case 'assign':
        state.title = '指派';
        state.label = '指派';
        break;
      case 'cancel':
        state.title = '终止审核不可恢复';
        state.label = '终止';
        break;
      case 'approvalCancel':
        state.title = '审批驳回终止流程';
        state.label = '驳回';
        break;
      default:
        break;
    }
    nextTick(() => {
      formElRef.value?.clearValidate();
    });
  }
  async function handleSubmit() {
    try {
      const values = await formElRef.value?.validate();
      if (!values) return;
      changeOkLoading(true);
      emit('confirm', state.dataForm);
    } catch (_) {}
  }
</script>
