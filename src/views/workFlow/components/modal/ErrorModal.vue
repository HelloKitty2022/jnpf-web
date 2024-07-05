<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="异常处理" @ok="handleSubmit" :minHeight="52" destroyOnClose :closeFunc="onClose">
    <a-form :colon="false" :labelCol="{ style: { width: '100px' } }" :model="dataForm" ref="formElRef">
      <a-form-item :label="item.nodeName" :name="['nodeList', i, 'value']" v-for="(item, i) in dataForm.nodeList" :key="i" :rules="item.rules">
        <jnpf-user-select v-model:value="item.value" multiple placeholder="请选择" :key="item.key" />
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
  }

  const emit = defineEmits(['register', 'confirm', 'close']);

  const formElRef = ref<FormInstance>();
  const state = reactive<State>({
    dataForm: {
      nodeList: [],
    },
  });
  const { dataForm } = toRefs(state);
  const [registerModal, { changeOkLoading }] = useModalInner(init);

  function init(data) {
    changeOkLoading(false);
    state.dataForm.nodeList = data.errorData.map(o => ({
      ...o,
      value: [],
      rules: [{ required: true, message: `必填`, trigger: 'change', type: 'array' }],
      key: +new Date(),
    }));
    nextTick(() => {
      formElRef.value?.clearValidate();
    });
  }
  async function handleSubmit() {
    try {
      const values = await formElRef.value?.validate();
      if (!values) return;
      let nodeList = {};
      for (let i = 0; i < state.dataForm.nodeList.length; i++) {
        nodeList[state.dataForm.nodeList[i].nodeId] = state.dataForm.nodeList[i].value;
      }
      changeOkLoading(true);
      emit('confirm', nodeList);
    } catch (_) {}
  }
  async function onClose() {
    emit('close');
    return true;
  }
</script>
