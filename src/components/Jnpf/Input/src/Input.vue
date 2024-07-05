<template>
  <component :is="Comp" :class="prefixCls" v-bind="getBindValue" v-model:value="innerValue" @change="onChange" v-if="!detailed">
    <template #[item]="data" v-for="item in Object.keys($slots)"><slot :name="item" v-bind="data || {}"></slot></template>
    <template #prefix v-if="prefixIcon">
      <i :class="prefixIcon"></i>
    </template>
    <template #suffix v-if="suffixIcon">
      <i :class="suffixIcon"></i>
    </template>
  </component>
  <p class="break-all detail-text" :class="{ ellipsis: showOverflow }" :title="showOverflow ? maskedValue : ''" v-else>
    <span v-if="$attrs.addonBefore">{{ $attrs.addonBefore }}</span>
    {{ maskedValue }}
    <span v-if="$attrs.addonAfter">{{ $attrs.addonAfter }}</span>
  </p>
</template>

<script lang="ts" setup>
  import { Input } from 'ant-design-vue';
  import { computed, ref, unref, watch } from 'vue';
  import { inputProps } from './props';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useDebounceFn } from '@vueuse/core';
  import { useTextMask } from '/@/hooks/web/useTextMask';

  const InputPassword = Input.Password;
  defineOptions({ name: 'JnpfInput', inheritAttrs: false });
  const props = defineProps(inputProps);
  const emit = defineEmits(['update:value', 'change']);
  const attrs = useAttrs({ excludeDefaultKeys: false });
  const innerValue = ref('');
  const maskedValue = ref('');
  const Comp = props.showPassword ? InputPassword : Input;
  const { prefixCls } = useDesign('input');
  const debounceOnChange = useDebounceFn(value => {
    emit('change', value);
  }, 200);

  const getBindValue = computed(() => ({ ...unref(attrs) }));

  watch(
    () => props.value,
    val => {
      setValue(val);
    },
    { immediate: true },
  );

  function setValue(value) {
    innerValue.value = value;
    if (!props.useMask) return (maskedValue.value = value);
    const { getMaskedText } = useTextMask(props.maskConfig);
    maskedValue.value = getMaskedText(value);
  }
  function onChange(e) {
    emit('update:value', e.target.value);
    debounceOnChange(e.target.value);
  }
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-input';

  .@{prefix-cls} {
    :deep(.ant-input-prefix),
    :deep(.ant-input-suffix) {
      i {
        line-height: 20px;
        color: @text-color-help-dark;
      }
    }
  }
  .ant-table {
    .detail-text {
      white-space: pre-wrap;
      line-height: 22px !important;
      &.ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
</style>
