<template>
  <BasicModal v-bind="$attrs" @register="registerModal" width="400px" title="页面设置" @ok="handleSubmit">
    <a-form :model="dataForm" layout="vertical" class="page-size-content">
      <a-form-item label="纸张设置">
        <jnpf-select v-model:value="dataForm.type" :options="options" placeholder="请选择" @change="onPageSizeChange"></jnpf-select>
      </a-form-item>
      <a-form-item label="" v-if="dataForm.type">
        <a-row :gutter="10">
          <a-col :span="12">
            <a-input-number :disabled="dataForm.type != '6'" v-model:value="dataForm.width" :min="1" addon-before="宽" addon-after="mm" />
          </a-col>
          <a-col :span="12">
            <a-input-number :disabled="dataForm.type != '6'" v-model:value="dataForm.height" :min="1" addon-before="高" addon-after="mm" />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="方向">
        <a-radio-group v-model:value="dataForm.direction" button-style="solid" @input="onDirectionChange">
          <a-radio-button v-for="(item, index) in directions" :key="index" :value="item.label">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="页边距">
        <a-row :gutter="10">
          <a-col :span="12">
            <a-input-number v-model:value="dataForm.mt" :min="1" addon-before="上" addon-after="mm" />
          </a-col>
          <a-col :span="12">
            <a-input-number v-model:value="dataForm.mb" :min="1" addon-before="下" addon-after="mm" />
          </a-col>
        </a-row>
        <a-row class="mt-10px" :gutter="10">
          <a-col :span="12">
            <a-input-number v-model:value="dataForm.ml" :min="1" addon-before="左" addon-after="mm" />
          </a-col>
          <a-col :span="12">
            <a-input-number v-model:value="dataForm.mr" :min="1" addon-before="右" addon-after="mm" />
          </a-col>
        </a-row>
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive, toRefs } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { cloneDeep } from 'lodash-es';

  const emit = defineEmits(['register', 'change']);

  interface State {
    options: any[];
    directions: any[];
    dataForm: any;
    sizeMap: any;
  }

  const defaultData = {
    type: '2',
    width: '210',
    height: '297',
    mt: '10',
    mb: '10',
    ml: '10',
    mr: '10',
    direction: '纵向',
  };
  const state = reactive<State>({
    options: [
      { fullName: 'A3', id: '1' },
      { fullName: 'A4', id: '2' },
      { fullName: 'A5', id: '3' },
      { fullName: 'B3', id: '4' },
      { fullName: 'B5', id: '5' },
      { fullName: '自定义', id: '6' },
    ],
    directions: [{ label: '纵向' }, { label: '横向' }],
    dataForm: defaultData,
    sizeMap: {
      '1': [297, 420],
      '2': [210, 297],
      '3': [148, 210],
      '4': [353, 500],
      '5': [176, 250],
    },
  });
  const { createMessage } = useMessage();
  const { dataForm, options, directions } = toRefs(state);
  const [registerModal, { closeModal }] = useModalInner(init);

  function handleSubmit() {
    try {
      let width = state.dataForm.width;
      let height = state.dataForm.height;
      let mt = state.dataForm.mt || 1;
      let mb = state.dataForm.mb || 1;
      let ml = state.dataForm.ml || 1;
      let mr = state.dataForm.mr || 1;
      if (width <= Number(ml) + Number(mr)) return createMessage.warning('左右边距合计不能超过纸张宽度');
      if (height <= Number(mt) + Number(mb)) return createMessage.warning('上下边距合计不能超过纸张高度');
      closeModal();
      setTimeout(() => {
        emit('change', state.dataForm);
      }, 200);
    } catch (error) {
      closeModal();
    }
  }
  function onPageSizeChange(e) {
    if (e == '6') {
      state.dataForm.width = '';
      state.dataForm.height = '';
      return;
    }
    let data = state.sizeMap[e];
    state.dataForm.width = data[0];
    state.dataForm.height = data[1];
  }
  function onDirectionChange() {
    let temp = state.dataForm.height;
    state.dataForm.height = state.dataForm.width;
    state.dataForm.width = temp;
  }
  function init(data) {
    state.dataForm = cloneDeep(data.pageParam ? data.pageParam : defaultData);
  }
</script>
