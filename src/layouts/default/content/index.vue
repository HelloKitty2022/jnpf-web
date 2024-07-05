<template>
  <div :class="[prefixCls, getLayoutContentMode]" v-loading="getOpenPageLoading && getPageLoading" :copyright="copyright">
    <div class="app-main h-full">
      <PageLayout />
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import PageLayout from '/@/layouts/page/index.vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { useTransitionSetting } from '/@/hooks/setting/useTransitionSetting';
  import { useContentViewHeight } from './useContentViewHeight';
  import { useAppStore } from '/@/store/modules/app';

  export default defineComponent({
    name: 'LayoutContent',
    components: { PageLayout },
    setup() {
      const { prefixCls } = useDesign('layout-content');
      const { getOpenPageLoading } = useTransitionSetting();
      const { getLayoutContentMode, getPageLoading } = useRootSetting();
      const appStore = useAppStore();
      const { copyright } = appStore.getSysConfigInfo;

      useContentViewHeight();
      return {
        prefixCls,
        getOpenPageLoading,
        getLayoutContentMode,
        getPageLoading,
        copyright,
      };
    },
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-layout-content';

  .@{prefix-cls} {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    height: calc(100vh - @header-height - @multiple-height);
    overflow: hidden;
    padding: 10px;
    box-sizing: border-box;
    background: url('/@/assets/images/loading-iframe.gif') no-repeat center center;
    background-color: @app-main-background;
    background-size: 600px 450px;
    &::before {
      content: attr(copyright);
      font-size: 14px;
      text-align: center;
      color: #999;
      text-align: center;
      width: 100%;
      display: block;
      position: absolute;
      bottom: 20px;
      left: 0;
    }
    .app-main {
      overflow: hidden auto;
      position: relative;
    }

    &.fixed {
      width: 1200px;
      margin: 0 auto;
    }

    &-loading {
      position: absolute;
      top: 200px;
      z-index: @page-loading-z-index;
    }
  }
</style>
