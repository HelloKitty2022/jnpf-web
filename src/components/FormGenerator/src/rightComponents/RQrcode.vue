<template>
  <a-form-item label="实点颜色">
    <jnpf-color-picker v-model:value="activeData.colorDark" size="small" />
  </a-form-item>
  <a-form-item label="尺寸">
    <a-input-number v-model:value="activeData.width" placeholder="请输入" :min="0" :precision="0" />
  </a-form-item>
  <a-form-item label="默认值">
    <jnpf-select v-model:value="activeData.dataType" :options="dataTypeOptions" />
  </a-form-item>
  <a-form-item label="固定值" v-if="activeData.dataType === 'static'">
    <a-input v-model:value="activeData.staticText" placeholder="请输入" allowClear />
  </a-form-item>
  <a-form-item label="选择组件" v-if="activeData.dataType === 'relation'">
    <jnpf-select v-model:value="activeData.relationField" :options="drawingOptions" allowClear showSearch />
  </a-form-item>
</template>
<script lang="ts" setup>
  import { computed, unref } from 'vue';
  defineOptions({ inheritAttrs: false });
  const props = defineProps(['activeData', 'drawingOptions', 'formInfo']);

  const modelType = computed(() => unref(props.formInfo).type);
  const dataTypeOptions = computed(() => {
    const options = [
      { id: 'static', fullName: '固定值' },
      { id: 'relation', fullName: '组件联动' },
    ];
    if (unref(modelType) == 1 || unref(modelType) == 6) options.push({ id: 'form', fullName: '当前表单路径' });
    return options;
  });
</script>
