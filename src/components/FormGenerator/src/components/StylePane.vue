<template>
  <a-form :colon="false" labelAlign="left" :labelCol="{ style: { width: '90px' } }" class="right-board-form">
    <a-form-item label="控件栅格" v-if="!config.isSubTable">
      <a-slider v-model:value="activeData.__config__.span" :max="24" :min="2" :step="2" :marks="sliderMarks" />
    </a-form-item>
    <a-form-item label="标题宽度" v-if="!config.isSubTable && !layoutList.includes(jnpfKey)">
      <a-input-number v-model:value="activeData.__config__.labelWidth" placeholder="请输入" :min="0" />
    </a-form-item>
    <a-form-item v-if="!config.isSubTable && !noWithList.includes(jnpfKey) && activeData.style && showType === 'pc'">
      <template #label>
        控件宽度
        <BasicHelp text="支持%和px两种宽度设置" />
      </template>
      <a-input v-model:value="activeData.style.width" placeholder="请输入" />
    </a-form-item>
    <template v-if="config.isSubTable && showType === 'pc'">
      <a-form-item label="冻结方式">
        <jnpf-radio v-model:value="activeData.__config__.tableFixed" :options="fixedOptions" optionType="button" button-style="solid" class="right-radio" />
      </a-form-item>
      <a-form-item label="对齐方式">
        <jnpf-radio v-model:value="activeData.__config__.tableAlign" :options="alignOptions" optionType="button" button-style="solid" class="right-radio" />
      </a-form-item>
    </template>
    <a-form-item label="控件宽度" v-if="config.isSubTable">
      <a-input-number v-model:value="activeData.__config__.columnWidth" placeholder="请输入" :min="0" />
    </a-form-item>
    <a-form-item label="控件Class" v-if="modelType == 1 || modelType == 6">
      <jnpf-select v-model:value="activeData.__config__.className" multiple allowClear :options="getClassNameOptions" showSearch />
    </a-form-item>
    <a-form-item label="多端显示">
      <jnpf-checkbox v-model:value="activeData.__config__.visibility" :options="getVisibilityOptions" />
    </a-form-item>
  </a-form>
</template>
<script lang="ts" setup>
  import { inject, computed, unref } from 'vue';
  import { layoutList, noWithList } from '../helper/rightPanel';
  import type { ItemCfg } from '../types/genItem';

  const sliderMarks = { 2: 2, 4: 4, 6: 6, 8: 8, 10: 10, 12: 12, 14: 14, 16: 16, 18: 18, 20: 20, 22: 22, 24: 24 };
  const visibilityOptions = [
    { id: 'pc', fullName: 'Web' },
    { id: 'app', fullName: 'App' },
  ];
  const iframeVisibilityOptions = [{ id: 'pc', fullName: 'Web' }];
  const fixedOptions = [
    { id: 'none', fullName: '无' },
    { id: 'left', fullName: '左冻结' },
    { id: 'right', fullName: '右冻结' },
  ];
  const alignOptions = [
    { id: 'left', fullName: '左对齐' },
    { id: 'center', fullName: '居中对齐' },
    { id: 'right', fullName: '右对齐' },
  ];

  const props = defineProps(['activeData', 'formConf', 'drawingList', 'formInfo', 'dbType']);
  const getShowType: (() => string | undefined) | undefined = inject('getShowType');
  const showType = computed(() => (getShowType as () => string | undefined)());
  const modelType = computed(() => unref(props.formInfo).type);
  const config = computed<ItemCfg>(() => unref(props.activeData).__config__);
  const jnpfKey = computed(() => unref(props.activeData).__config__?.jnpfKey);
  const getClassNameOptions = computed(() => unref(props.formConf).classNames.map(o => ({ id: o, fullName: o })));
  const getVisibilityOptions = computed(() => (unref(jnpfKey) == 'iframe' ? iframeVisibilityOptions : visibilityOptions));
</script>
