<template>
  <div :class="prefixCls" v-bind="getBindValue">
    <InputNumber v-model:value="min" placeholder="最小值" :precision="getPrecision" :controls="false" @change="onChange" />
    <span class="separator">-</span>
    <InputNumber v-model:value="max" placeholder="最大值" :precision="getPrecision" :controls="false" @change="onChange" />
  </div>
</template>

<script lang="ts" setup>
  import { InputNumber, Form } from 'ant-design-vue';
  import { computed, ref, unref, watch } from 'vue';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useDesign } from '/@/hooks/web/useDesign';

  defineOptions({ name: 'JnpfNumberRange', inheritAttrs: false });
  const props = defineProps({
    value: Array,
    precision: Number,
  });
  const emit = defineEmits(['update:value', 'change']);
  const attrs = useAttrs({ excludeDefaultKeys: false });
  const min = ref<undefined | number>(undefined);
  const max = ref<undefined | number>(undefined);
  const { prefixCls } = useDesign('number-range');
  const formItemContext = Form.useInjectFormItemContext();

  const getBindValue = computed(() => ({ ...unref(attrs) }));
  const getPrecision = computed(() => (props.precision || props.precision === 0 ? props.precision : undefined));

  watch(
    () => props.value,
    val => {
      setValue(val);
    },
    { immediate: true },
  );

  function setValue(value) {
    if (Array.isArray(value) && value.length === 2) {
      min.value = value[0] || value[0] == 0 ? value[0] : undefined;
      max.value = value[1] || value[1] == 0 ? value[1] : undefined;
    } else {
      min.value = undefined;
      max.value = undefined;
    }
  }
  function onChange() {
    if (!min.value && min.value !== 0 && !max.value && max.value !== 0) {
      emit('update:value', []);
      emit('change', []);
      formItemContext.onFieldChange();
      return;
    }
    emit('update:value', [min.value, max.value]);
    emit('change', [min.value, max.value]);
    formItemContext.onFieldChange();
  }
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-number-range';

  .@{prefix-cls} {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .ant-input-number {
      flex: 1;
      width: auto !important;
    }
    .separator {
      margin: 0 5px;
      flex-shrink: 0;
    }
  }
</style>
