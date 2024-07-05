<template>
  <div :class="prefixCls">
    <Tooltip :title="t('layout.header.tooltipNotify')" placement="bottom" :mouseEnterDelay="0.5">
      <Badge :count="count" :offset="[-6, 16]">
        <BellOutlined />
      </Badge>
    </Tooltip>
  </div>
</template>
<script lang="ts" setup>
  import { Tooltip, Badge } from 'ant-design-vue';
  import { BellOutlined } from '@ant-design/icons-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useI18n } from '/@/hooks/web/useI18n';

  defineProps({
    count: { type: Number, default: 0 },
  });
  const { t } = useI18n();
  const { prefixCls } = useDesign('header-notify');
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-header-notify';

  .@{prefix-cls} {
    .ant-badge {
      font-size: 18px;

      .ant-badge-count {
        padding: 0 6px;
        min-width: 0;
        height: 18px;
        line-height: 18px;
      }

      svg {
        width: 0.9em;
      }
    }
  }
</style>
