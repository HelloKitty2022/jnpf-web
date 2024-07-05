<template>
  <InputTextArea v-bind="getBindValue" v-model:value="innerValue" @change="onChange">
    <template #[item]="data" v-for="item in Object.keys($slots)"><slot :name="item" v-bind="data || {}"></slot></template>
  </InputTextArea>
</template>

<script lang="ts" setup>
  import { Input } from 'ant-design-vue';
  import { computed, ref, unref, watch } from 'vue';
  import { textareaProps } from './props';
  import { useAttrs } from '/@/hooks/core/useAttrs';

  const InputTextArea = Input.TextArea;
  defineOptions({ name: 'JnpfTextarea', inheritAttrs: false });
  const props = defineProps(textareaProps);
  const emit = defineEmits(['update:value', 'change']);
  const attrs = useAttrs({ excludeDefaultKeys: false });
  const innerValue = ref('');

  const getBindValue = computed(() => ({ ...unref(attrs), rows: props.rows }));

  watch(
    () => props.value,
    val => {
      setValue(val);
    },
    { immediate: true },
  );

  function setValue(value) {
    innerValue.value = value;
  }
  function onChange(e) {
    emit('update:value', e.target.value);
    emit('change', e.target.value);
  }
</script>
