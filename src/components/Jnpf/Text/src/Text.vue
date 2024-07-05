<template>
  <p :class="`${prefixCls}`" :style="getStyle">{{ content }}</p>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';

  defineOptions({ name: 'JnpfText', inheritAttrs: false });
  const props = defineProps({
    content: { type: String, default: '' },
    textStyle: {
      type: Object,
      default: () => ({
        // 'font-size': ' 12px',
        // "color": '#00000',
        // 'text-align': 'center',
        // 'line-height': '32px',
        // 'font-weight': 'normal',
        // 'font-style': 'normal',
        // 'text-decoration': 'none',
      }),
    },
  });
  const { prefixCls } = useDesign('text');

  const getStyle = computed(() => ({
    ...props.textStyle,
    'line-height': props.textStyle['line-height'] + 'px',
    'font-size': props.textStyle['font-size'] + 'px',
  }));
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-text';
  .@{prefix-cls} {
    padding: 3px 0;
    margin: 0;
  }
</style>
