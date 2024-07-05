<template>
  <Checkbox v-model:checked="innerValue" v-bind="getBindValue" @change="onChange">{{ label }}</Checkbox>
</template>

<script lang="ts" setup>
  import { Checkbox } from 'ant-design-vue';
  import { computed, ref, unref, watch } from 'vue';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { omit } from 'lodash-es';

  defineOptions({ name: 'JnpfCheckboxSingle', inheritAttrs: false });
  const props = defineProps({
    checkedValue: { type: [Number, Boolean, String], default: 1 },
    unCheckedValue: { type: [Number, Boolean, String], default: 0 },
    value: { type: [Number, Boolean, String] },
    label: { type: String, default: '' },
  });
  const emit = defineEmits(['update:value', 'change']);
  const attrs = useAttrs({ excludeDefaultKeys: false });
  const innerValue = ref(false);

  const getBindValue = computed(() => ({ ...unref(attrs), ...omit(props, ['value']) }));

  watch(
    () => props.value,
    val => {
      setValue(val);
    },
    { immediate: true },
  );

  function setValue(value) {
    innerValue.value = value === props.checkedValue;
  }
  function onChange(e) {
    const value = e.target.checked ? props.checkedValue : props.unCheckedValue;
    emit('update:value', value);
    emit('change', value);
  }
</script>
