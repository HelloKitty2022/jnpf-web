<template>
  <Dropdown placement="bottom" :overlayClassName="`${prefixCls}-dropdown-overlay`">
    <span :class="[prefixCls, `${prefixCls}--${theme}`]" class="flex">
      <Avatar :class="`${prefixCls}__header`" :src="apiUrl + getUserInfo.headIcon" :size="26" />
      <span :class="`${prefixCls}__info hidden md:block`">
        <span :class="`${prefixCls}__name truncate`"> {{ getUserInfo.userName }}</span>
      </span>
    </span>
    <template #overlay>
      <Menu @click="handleMenuClick">
        <MenuItem key="profile" :text="t('layout.header.profile')" icon="icon-ym icon-ym-header-userInfo" />
        <MenuItem key="feedBack" :text="t('layout.header.feedback')" icon="icon-ym icon-ym-header-feedBack" />
        <MenuItem key="about" :text="t('layout.header.about')" icon="icon-ym icon-ym-header-about" />
        <MenuItem key="statement" :text="t('layout.header.statement')" icon="icon-ym icon-ym-generator-card" />
        <MenuItem key="lock" :text="t('layout.header.tooltipLock')" icon="icon-ym icon-ym-header-lockScreen" v-if="getUseLockPage" />
        <MenuDivider />
        <MenuItem key="logout" :text="t('layout.header.dropdownItemLoginOut')" icon="icon-ym icon-ym-header-loginOut" />
      </Menu>
    </template>
  </Dropdown>
  <AboutModal @register="registerAboutModal" />
  <StatementModal @register="registerStatementModal" />
</template>
<script lang="ts">
  import { Dropdown, Menu, Avatar } from 'ant-design-vue';
  import type { MenuInfo } from 'ant-design-vue/lib/menu/src/interface';
  import { defineComponent, computed } from 'vue';
  import { DOC_URL } from '/@/settings/siteSetting';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useUserStore } from '/@/store/modules/user';
  import { useLockStore } from '/@/store/modules/lock';
  import { useHeaderSetting } from '/@/hooks/setting/useHeaderSetting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { propTypes } from '/@/utils/propTypes';
  import { openWindow } from '/@/utils';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { useModal } from '/@/components/Modal';
  import AboutModal from '../AboutModal.vue';
  import StatementModal from '../StatementModal.vue';
  import { useGo } from '/@/hooks/web/usePage';

  export default defineComponent({
    name: 'UserDropdown',
    components: {
      Dropdown,
      Menu,
      Avatar,
      MenuItem: createAsyncComponent(() => import('./DropMenuItem.vue')),
      MenuDivider: Menu.Divider,
      AboutModal,
      StatementModal,
    },
    props: {
      theme: propTypes.oneOf(['dark', 'light']),
    },
    setup() {
      const globSetting = useGlobSetting();
      const apiUrl = globSetting.apiUrl;
      const { prefixCls } = useDesign('header-user-dropdown');
      const { t } = useI18n();
      const go = useGo();
      const { getUseLockPage } = useHeaderSetting();
      const userStore = useUserStore();
      const lockStore = useLockStore();
      const [registerAboutModal, { openModal: openAboutModal }] = useModal();
      const [registerStatementModal, { openModal: openStatementModal }] = useModal();

      const getUserInfo = computed(() => userStore.getUserInfo || {});

      function handleMenuClick(e: MenuInfo) {
        if (e.key === 'logout') return handleLoginOut();
        if (e.key === 'doc') return openDoc();
        if (e.key === 'lock') return handleLock();
        if (e.key === 'profile') return go('/profile');
        if (e.key === 'feedBack') return openFeedBack();
        if (e.key === 'statement') return openStatementModal(true);
        if (e.key === 'about') return openAboutModal(true);
      }
      function handleLock() {
        lockStore.setLockInfo({
          isLock: true,
        });
      }
      function handleLoginOut() {
        userStore.confirmLoginOut();
      }
      function openDoc() {
        openWindow(DOC_URL);
      }
      function openFeedBack() {
        openWindow('http://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=dA0dGhkVHQcbEgA0BQVaFxsZ');
      }

      return {
        apiUrl,
        prefixCls,
        t,
        getUserInfo,
        handleMenuClick,
        getUseLockPage,
        registerAboutModal,
        registerStatementModal,
      };
    },
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-header-user-dropdown';

  .@{prefix-cls} {
    height: @header-height;
    padding: 0 0 0 10px;
    padding-right: 10px;
    overflow: hidden;
    font-size: 12px;
    cursor: pointer;
    align-items: center;

    &__header {
      margin-right: 4px;
    }

    &__name {
      font-size: 14px;
    }

    &--dark {
      &:hover {
        background-color: @header-dark-bg-hover-color;
      }
    }

    &--light {
      &:hover {
        background-color: @header-light-bg-hover-color;
      }

      .@{prefix-cls}__name {
        color: @text-color-base;
      }

      .@{prefix-cls}__desc {
        color: @header-light-desc-color;
      }
    }
  }
</style>
