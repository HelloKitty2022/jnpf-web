<template>
  <a-form-item label="展示文本">
    <a-input v-model:value="activeData.content" placeholder="请输入" />
  </a-form-item>
  <a-form-item label="文本位置">
    <jnpf-radio v-model:value="activeData.contentPosition" :options="positionOptions" optionType="button" button-style="solid" class="right-radio" />
  </a-form-item>
</template>
<script lang="ts" setup>
  defineOptions({ inheritAttrs: false });
  defineProps(['activeData']);

  const positionOptions = [
    { id: 'left', fullName: '左边' },
    { id: 'center', fullName: '中间' },
    { id: 'right', fullName: '右边' },
  ];
</script>
