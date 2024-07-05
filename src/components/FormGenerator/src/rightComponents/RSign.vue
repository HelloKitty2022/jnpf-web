<template>
  <a-form-item label="调用签名">
    <a-switch v-model:checked="activeData.__config__.defaultCurrent" />
  </a-form-item>
</template>
<script lang="ts" setup>
  defineOptions({ inheritAttrs: false });
  defineProps(['activeData']);
</script>
