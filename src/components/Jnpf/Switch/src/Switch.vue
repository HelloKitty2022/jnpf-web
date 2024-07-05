<template>
  <Switch v-bind="getBindValue" v-model:checked="innerValue" @change="onChange">
    <template #[item]="data" v-for="item in Object.keys($slots)"><slot :name="item" v-bind="data || {}"></slot></template>
  </Switch>
</template>

<script lang="ts" setup>
  import { Switch } from 'ant-design-vue';
  import { omit } from 'lodash-es';
  import { computed, ref, unref, watch } from 'vue';
  import { switchProps } from './props';
  import { useAttrs } from '/@/hooks/core/useAttrs';

  defineOptions({ name: 'JnpfSwitch', inheritAttrs: false });
  const props = defineProps(switchProps);
  const emit = defineEmits(['update:value', 'change']);
  const attrs = useAttrs({ excludeDefaultKeys: false });
  const innerValue = ref<any>(undefined);

  const getBindValue = computed(() => ({ ...unref(attrs), ...omit(props, ['value']) }));

  watch(
    () => props.value,
    val => {
      setValue(val);
    },
    { immediate: true },
  );

  function setValue(value) {
    innerValue.value = value ? props.checkedValue : props.unCheckedValue;
    emit('update:value', innerValue.value);
  }
  function onChange(value) {
    emit('update:value', value);
    emit('change', value);
  }
</script>
