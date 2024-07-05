<template>
  <div class="dashboard-container" v-loading="loading">
    <template v-if="!noData">
      <template v-if="!ajaxing">
        <template v-if="portalId">
          <PortalLayout :layout="layout" :enabledLock="enabledLock" v-if="type === 0" @layoutUpdatedEvent="layoutUpdatedEvent" />
          <div class="custom-page" v-if="type === 1">
            <component :is="currentView" v-if="linkType === 0" />
            <embed :src="url" width="100%" height="100%" type="text/html" v-if="linkType === 1" />
          </div>
        </template>
        <div class="portal-layout-nodata" v-else>
          <jnpf-empty :image="emptyImage" />
        </div>
      </template>
      <Setting @register="registerSettingDrawer" @refresh="refresh" />
      <a-button type="primary" preIcon="icon-ym icon-ym-left" class="setting-btn" size="large" @click="openSettingDrawer(true, { id: portalId })"></a-button>
    </template>
    <template v-else>
      <ScrollContainer class="dashboard-container">
        <Default />
      </ScrollContainer>
    </template>
  </div>
</template>
<script lang="ts" setup>
  import { toRefs, computed, onMounted, onUnmounted, unref } from 'vue';
  import PortalLayout from '/@/components/VisualPortal/Portal/Layout/index.vue';
  import { ScrollContainer } from '/@/components/Container';
  import { useUserStore } from '/@/store/modules/user';
  import { useDrawer } from '/@/components/Drawer';
  import Default from './Default.vue';
  import Setting from './Setting.vue';
  import { usePortal } from '/@/views/basic/home/hooks/usePortal';
  import emptyImage from '/@/assets/images/dashboard-nodata.png';

  const { state, initData, clearAutoRefresh, layoutUpdatedEvent } = usePortal();
  const { portalId, layout, type, linkType, currentView, url, ajaxing, loading, noData, enabledLock } = toRefs(state);
  const userStore = useUserStore();
  const [registerSettingDrawer, { openDrawer: openSettingDrawer }] = useDrawer();

  const getUserInfo = computed(() => userStore.getUserInfo || {});

  function init() {
    state.systemId = unref(getUserInfo)?.systemId;
    state.portalId = unref(getUserInfo)?.portalId as string;
    initData();
  }
  function refresh(id) {
    if (!id) return;
    state.portalId = id;
    clearAutoRefresh();
    initData();
  }

  onMounted(() => init());
  onUnmounted(() => clearAutoRefresh());
</script>
<style lang="less" scoped>
  .dashboard-container {
    width: 100%;
    height: 100%;
    background: @app-main-background;
    position: relative;
    .custom-page {
      width: 100%;
      height: 100%;
    }
    :deep(.layout-area) {
      width: 100%;
      border-radius: 4px;
      overflow: hidden;
    }
    .setting-btn {
      position: fixed;
      top: 300px;
      right: 0px;
      height: 40px;
      width: 40px;
      text-align: center;
      padding: 0;
      border-radius: 20px 0 0 20px;
      z-index: 100;
      :deep(i) {
        font-size: 20px;
        font-weight: 580;
      }
    }
    :deep(.vue-grid-layout) {
      margin: -10px;
    }
    :deep(.scrollbar__view) {
      overflow: hidden;
    }
  }
</style>
<style lang="less">
  @import '/@/components/VisualPortal/style/index.less';
</style>
