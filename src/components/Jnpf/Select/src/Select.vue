<template>
  <a-select v-bind="getBindValue" v-model:value="innerValue" @change="onChange" ref="selectRef">
    <template #[item]="data" v-for="item in Object.keys($slots)"><slot :name="item" v-bind="data || {}"></slot></template>
  </a-select>
</template>

<script lang="ts" setup>
  import { computed, ref, unref, watch } from 'vue';
  import { selectProps, FieldNames } from './props';
  import { useAttrs } from '/@/hooks/core/useAttrs';

  defineOptions({ name: 'JnpfSelect', inheritAttrs: false });
  defineExpose({ getSelectRef });
  const props = defineProps(selectProps);
  const emit = defineEmits(['update:value', 'change']);
  const attrs = useAttrs({ excludeDefaultKeys: false });
  const innerValue = ref('');
  const selectRef = ref(null);

  const getFieldNames = computed((): Required<FieldNames> => {
    const { fieldNames } = props;
    return {
      options: '',
      label: 'fullName',
      value: 'id',
      disabled: 'disabled',
      ...fieldNames,
    };
  });
  const getOptionFilterProp = computed(() => props.optionFilterProp || unref(getFieldNames).label);
  const getBindValue = computed(() => ({
    ...unref(attrs),
    ...props,
    optionFilterProp: unref(getOptionFilterProp),
    fieldNames: unref(getFieldNames),
    mode: props.multiple ? 'multiple' : '',
    showArrow: Reflect.has(unref(attrs), 'showArrow') ? (unref(attrs) as { showArrow: boolean }).showArrow : true,
    getPopupContainer: () => document.body,
  }));

  watch(
    () => props.value,
    val => {
      setValue(val);
    },
    { immediate: true },
  );

  function setValue(value) {
    innerValue.value = value || value === 0 ? value : undefined;
  }
  function onChange(val, option) {
    emit('update:value', val);
    emit('change', val, option);
  }
  function getSelectRef() {
    const select = unref(selectRef);
    if (!select) {
      throw new Error('select is null!');
    }
    return select;
  }
</script>
