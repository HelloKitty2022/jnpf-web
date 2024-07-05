<template>
  <CheckboxGroup button-style="solid" v-bind="getBindValue" v-model:value="innerValue" @change="onChange">
    <Checkbox v-for="item in getOptions" :key="item[getFieldNames.value]" :value="item[getFieldNames.value]" :disabled="item[getFieldNames.disabled]">
      {{ item[getFieldNames.label] }}
    </Checkbox>
  </CheckboxGroup>
</template>

<script lang="ts" setup>
  import { CheckboxGroup, Checkbox } from 'ant-design-vue';
  import { computed, ref, unref, watch } from 'vue';
  import { checkboxProps, FieldNames } from './props';
  import { useAttrs } from '/@/hooks/core/useAttrs';

  defineOptions({ name: 'JnpfCheckbox', inheritAttrs: false });
  const props = defineProps(checkboxProps);
  const emit = defineEmits(['update:value', 'change']);
  const attrs: any = useAttrs({ excludeDefaultKeys: false });
  const innerValue = ref([]);

  const getBindValue = computed(() => ({
    ...unref(attrs),
    class: unref(attrs).class ? `jnpf-${props.direction}-checkbox ${unref(attrs).class}` : `jnpf-${props.direction}-checkbox`,
  }));
  const getOptions = computed<any[]>(() => props.options);
  const getFieldNames = computed((): Required<FieldNames> => {
    const { fieldNames } = props;
    return {
      disabled: 'disabled',
      label: 'fullName',
      value: 'id',
      ...fieldNames,
    };
  });

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
  function onChange(val) {
    let list: any[] = [];
    for (let i = 0; i < val.length; i++) {
      const item = unref(getOptions).filter(o => o[unref(getFieldNames).value] === val[i]);
      list = [...list, ...item];
    }
    emit('update:value', val);
    emit('change', val, list);
  }
</script>
<style lang="less">
  .jnpf-vertical-checkbox {
    .ant-checkbox-wrapper {
      display: flex;
      margin-left: 0 !important;
      .ant-checkbox + span {
        word-break: break-all;
      }
    }
  }
</style>
