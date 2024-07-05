<template>
  <div :class="`${prefixCls} ${prefixCls + '-' + align}`">
    <a-button v-bind="getBindValue">{{ buttonText }}</a-button>
  </div>
</template>

<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import { buttonProps } from './props';
  import { omit } from 'lodash-es';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useDesign } from '/@/hooks/web/useDesign';

  defineOptions({ name: 'JnpfButton', inheritAttrs: false });
  const props = defineProps(buttonProps);
  const attrs = useAttrs({ excludeDefaultKeys: false });
  const { prefixCls } = useDesign('button');
  const getBindValue = computed(() => omit({ ...unref(attrs), ...props }, ['align', 'buttonText']));
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-button';
  .@{prefix-cls} {
    width: 100%;
    &&-left {
      text-align: left;
    }
    &&-center {
      text-align: center;
    }
    &&-right {
      text-align: right;
    }
  }
</style>
