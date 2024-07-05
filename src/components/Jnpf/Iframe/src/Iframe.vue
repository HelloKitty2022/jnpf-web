<template>
  <div :class="`${prefixCls}`">
    <iframe
      class="iframe"
      :style="{
        '--height': (height || 300) + 'px',
        '--borderType': borderType,
        '--borderColor': borderColor,
        '--borderWidth': borderWidth + 'px',
      }"
      :src="href"
      scrolling="yes"
      frameborder="0" />
  </div>
</template>
<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';

  defineOptions({ name: 'JnpfIframe', inheritAttrs: false });
  const { prefixCls } = useDesign('iframe');

  defineProps({
    href: { type: String, default: '' },
    height: { type: Number, default: 300 },
    borderType: { type: String, default: 'solid' },
    borderColor: { type: String, default: '#E2E0E0' },
    borderWidth: { type: Number, default: 1 },
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-iframe';

  .@{prefix-cls} {
    .iframe {
      width: 100%;
      height: var(--height);
      border: var(--borderWidth) var(--borderType) var(--borderColor);
    }
  }
</style>
