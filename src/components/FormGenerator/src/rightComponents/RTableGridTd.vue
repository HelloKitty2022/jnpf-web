<template>
  <a-form-item label="背景颜色">
    <jnpf-color-picker v-model:value="activeData.__config__.backgroundColor" size="small" />
  </a-form-item>
</template>
<script lang="ts" setup>
  defineOptions({ inheritAttrs: false });
  defineProps(['activeData']);
</script>
