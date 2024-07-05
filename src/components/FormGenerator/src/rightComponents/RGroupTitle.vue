<template>
  <a-form-item label="分组标题">
    <a-input v-model:value="activeData.content" placeholder="请输入" />
  </a-form-item>
  <a-form-item label="标题提示">
    <a-input v-model:value="activeData.helpMessage" placeholder="请输入" />
  </a-form-item>
  <a-form-item label="标签对齐">
    <jnpf-radio v-model:value="activeData.contentPosition" :options="positionOptions" optionType="button" button-style="solid" class="right-radio" />
  </a-form-item>
</template>
<script lang="ts" setup>
  defineOptions({ inheritAttrs: false });
  defineProps(['activeData']);

  const positionOptions = [
    { id: 'left', fullName: '左对齐' },
    { id: 'center', fullName: '居中对齐' },
    { id: 'right', fullName: '右对齐' },
  ];
</script>
