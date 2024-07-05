<template>
  <div :class="`${prefixCls}`">
    <InputNumber v-model:value="innerValue" v-bind="getBindValue" @change="onChange" v-if="!detailed">
      <template #[item]="data" v-for="item in Object.keys($slots)">
        <slot :name="item" v-bind="data || {}"></slot>
      </template>
    </InputNumber>
    <p class="leading-32px" :title="thousands ? thousandsFormat(innerValue) : innerValue" v-if="detailed">
      <span v-if="$attrs.addonBefore">{{ $attrs.addonBefore }}</span>
      {{ thousands ? thousandsFormat(innerValue) : innerValue }}
      <span v-if="$attrs.addonAfter">{{ $attrs.addonAfter }}</span>
    </p>
    <p v-if="isAmountChinese && getChineseName" class="amount-chinese-name">{{ getChineseName }}</p>
  </div>
</template>

<script lang="ts" setup>
  import { InputNumber } from 'ant-design-vue';
  import { computed, ref, unref, watch } from 'vue';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { getAmountChinese, thousandsFormat } from '/@/utils/jnpf';

  defineOptions({ name: 'JnpfInputNumber', inheritAttrs: false });
  const props = defineProps({
    value: [Number, String],
    thousands: { type: Boolean, default: false },
    isAmountChinese: { type: Boolean, default: false },
    detailed: { type: Boolean, default: false },
  });
  const emit = defineEmits(['update:value', 'change']);
  const attrs: any = useAttrs({ excludeDefaultKeys: false });
  const { prefixCls } = useDesign('input-number');
  const innerValue = ref<number | undefined | null>(undefined);

  const getBindValue = computed(() => {
    const bindValue = {
      ...unref(attrs),
      precision: Reflect.has(unref(attrs), 'precision') && (unref(attrs).precision || unref(attrs).precision === 0) ? unref(attrs).precision : undefined,
    };
    if (props.thousands) {
      bindValue.formatter = value => thousandsFormat(value);
      bindValue.parser = value => value.replace(/\$\s?|(,*)/g, '');
    }
    return bindValue;
  });
  const getChineseName = computed(() => (!props.isAmountChinese || (!innerValue.value && innerValue.value !== 0) ? '' : getAmountChinese(innerValue.value)));

  watch(
    () => props.value,
    val => {
      setValue(val);
    },
    { immediate: true },
  );

  function setValue(value) {
    innerValue.value = (!value && value !== 0) || isNaN(value) ? null : props.detailed ? value : Number(value);
  }
  function onChange(value) {
    emit('update:value', value);
    emit('change', value);
  }
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-input-number';
  .@{prefix-cls} {
    .amount-chinese-name {
      font-size: 14px;
      line-height: 20px;
      margin-top: 4px;
      color: @text-color-secondary;
    }
  }
  .ant-table {
    .@{prefix-cls} {
      .leading-32px {
        line-height: 22px !important;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
</style>
