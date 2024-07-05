<template>
  <div>
    <a-form-item label="文本大小">
      <a-input-number v-model:value="activeData.option.textFontSize" :min="12" :max="25" placeholder="请输入" />
    </a-form-item>
    <a-form-item label="文本加粗">
      <a-switch v-model:checked="activeData.option.textFontWeight" />
    </a-form-item>
    <a-form-item label="文本斜体" v-if="activeData.jnpfKey == 'text'">
      <a-switch v-model:checked="activeData.option.textFontStyle" />
    </a-form-item>
    <a-form-item label="文本颜色">
      <jnpf-color-picker v-model:value="activeData.option.textFontColor" size="small" />
    </a-form-item>
    <a-form-item label="文本位置">
      <jnpf-radio v-model:value="activeData.option.textLeft" :options="alignList" optionType="button" buttonStyle="solid" class="right-radio" />
    </a-form-item>
    <a-form-item label="文本下划线" v-if="activeData.jnpfKey == 'text'">
      <jnpf-radio v-model:value="activeData.option.textUnderLine" :options="underLineList" optionType="button" buttonStyle="solid" />
    </a-form-item>
    <a-form-item label="背景色">
      <jnpf-color-picker v-model:value="activeData.option.textBgColor" size="small" />
    </a-form-item>
  </div>
</template>
<script lang="ts" setup>
  import { alignList, underLineList } from '../helper/dataMap';

  defineProps(['activeData']);
</script>
