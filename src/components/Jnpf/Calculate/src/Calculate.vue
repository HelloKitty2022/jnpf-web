<template>
  <div :class="`${prefixCls}`">
    <template v-if="!detailed">
      <Input v-model:value="getValue" readonly :disabled="disabled" placeholder="用于展示计算结果，且数据同时会保存入库" v-if="isStorage" />
      <Input v-model:value="getValue" readonly :disabled="disabled" placeholder="用于展示计算结果，且数据不会保存" v-else />
    </template>
    <p class="leading-32px" :title="getValue" v-else> {{ getValue }}</p>
    <p v-if="isAmountChinese && getChineseName" class="amount-chinese-name">{{ getChineseName }}</p>
  </div>
</template>

<script lang="ts" setup>
  import { Input, Form } from 'ant-design-vue';
  import { computed, ref, unref, watch } from 'vue';
  import { mergeNumberOfExps, toRPN, calcRPN } from '/@/components/FormGenerator/src/helper/utils';
  import { useDebounceFn } from '@vueuse/core';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { getAmountChinese, thousandsFormat } from '/@/utils/jnpf';

  defineOptions({ name: 'JnpfCalculate', inheritAttrs: false });
  const props = defineProps({
    value: [Number, String],
    formData: Object,
    expression: Array,
    tableVModel: String,
    componentVModel: String,
    isStorage: {
      type: Number,
      default: 0,
    },
    rowIndex: Number,
    detailed: {
      type: Boolean,
      default: false,
    },
    isAmountChinese: {
      type: Boolean,
      default: false,
    },
    thousands: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    precision: Number,
  });
  const emit = defineEmits(['update:value', 'change']);
  const { prefixCls } = useDesign('calculate');
  const innerValue = ref<any>('');
  const computeExps = ref<any>(null);
  const formItemContext = Form.useInjectFormItemContext();

  const getExp = computed(() => toRPN(mergeNumberOfExps(props.expression)));
  const getChineseName = computed(() => (!props.isAmountChinese || (!innerValue.value && innerValue.value !== 0) ? '' : getAmountChinese(innerValue.value)));
  const getValue = computed(() => (props.thousands ? thousandsFormat(innerValue.value) : innerValue.value));

  watch(
    () => props.formData,
    val => {
      if (!val) return;
      if (!computeExps.value) {
        // formData更新可能比较频繁
        computeExps.value = useDebounceFn(execRPN, 100);
      }
      unref(computeExps)();
    },
    { immediate: true, deep: true },
  );
  watch(
    () => props.value,
    val => {
      innerValue.value = val;
    },
    { immediate: true },
  );

  /**
   * 获取指定组件的值
   */
  function getFormVal(vModel) {
    try {
      if (vModel.indexOf('.') > -1) {
        let [tableVModel, cmpVModel] = vModel.split('.');
        if (typeof props.rowIndex === 'number') {
          if (!Array.isArray(props.formData[tableVModel]) || props.formData[tableVModel].length < props.rowIndex + 1) return 0;
          return props.formData[tableVModel][props.rowIndex][cmpVModel] || 0;
        } else {
          if (!props.formData[tableVModel].length) return 0;
          return props.formData[tableVModel].reduce((sum, c) => (c[cmpVModel] ? Number(c[cmpVModel]) : 0) + sum, 0);
        }
      }
      return props.formData[vModel] || 0;
    } catch (error) {
      console.warn('计算公式出错, 可能包含无效的组件值', error);
      return 0;
    }
  }
  /**
   * 计算表达式
   */
  function execRPN() {
    const temp = unref(getExp).map(t => (typeof t === 'object' ? getFormVal(t.__vModel__) : t));
    innerValue.value = Number.parseFloat(calcRPN(temp));
    if (isNaN(innerValue.value as unknown as number)) (innerValue.value as unknown as number) = 0;
    innerValue.value = Number.parseFloat(innerValue.value.toFixed(props.precision || 0));
    if (props.rowIndex >= 0 && props.componentVModel && props.tableVModel) {
      if (props.formData[props.tableVModel][props.rowIndex] && props.formData[props.tableVModel][props.rowIndex][props.componentVModel] !== innerValue.value) {
        if (props.isStorage) {
          emit('update:value', innerValue.value);
          emit('change', innerValue.value);
          formItemContext.onFieldChange();
        }
      }
    } else {
      if (props.isStorage) {
        emit('update:value', innerValue.value);
        formItemContext.onFieldChange();
      }
    }
  }
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-calculate';
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
