import { defineComponent, computed, unref } from 'vue';
import { BasicDrawer } from '/@/components/Drawer/index';
import { Divider } from 'ant-design-vue';
import { TypePicker, ThemeColorPicker, SwitchItem, SelectItem, InputNumberItem } from './components';

import { AppDarkModeToggle } from '/@/components/Application';

import { TriggerEnum } from '/@/enums/menuEnum';

import { useRootSetting } from '/@/hooks/setting/useRootSetting';
import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
import { useHeaderSetting } from '/@/hooks/setting/useHeaderSetting';
import { useMultipleTabSetting } from '/@/hooks/setting/useMultipleTabSetting';
import { useTransitionSetting } from '/@/hooks/setting/useTransitionSetting';
import { useLocale } from '/@/locales/useLocale';
import { useI18n } from '/@/hooks/web/useI18n';

import { baseHandler } from './handler';

import {
  HandlerEnum,
  contentModeOptions,
  topMenuAlignOptions,
  getMenuTriggerOptions,
  routerTransitionOptions,
  menuTypeList,
  mixSidebarTriggerOptions,
} from './enum';

import { HEADER_PRESET_BG_COLOR_LIST, SIDE_BAR_BG_COLOR_LIST, APP_PRESET_COLOR_LIST } from '/@/settings/designSetting';

const { t } = useI18n();

export default defineComponent({
  name: 'SettingDrawer',
  setup(_, { attrs }) {
    const {
      getContentMode,
      getShowFooter,
      getShowBreadCrumb,
      getShowBreadCrumbIcon,
      getShowLogo,
      getFullContent,
      getColorWeak,
      getGrayMode,
      getLockTime,
      getShowDarkModeToggle,
      getThemeColor,
      getOpenKeepAlive,
    } = useRootSetting();

    const { getOpenPageLoading, getBasicTransition, getEnableTransition, getOpenNProgress } = useTransitionSetting();

    const {
      getIsHorizontal,
      getShowMenu,
      getMenuType,
      getTrigger,
      getCollapsedShowTitle,
      getMenuFixed,
      getCollapsed,
      getCanDrag,
      getTopMenuAlign,
      getAccordion,
      getMenuWidth,
      getMenuBgColor,
      getIsTopMenu,
      getSplit,
      getIsMixSidebar,
      getCloseMixSidebarOnChange,
      getMixSideTrigger,
      getMixSideFixed,
    } = useMenuSetting();

    const { getShowHeader, getFixed: getHeaderFixed, getHeaderBgColor, getShowSearch } = useHeaderSetting();

    const { getShowMultipleTab, getShowIcon, getShowQuick, getShowRedo, getShowFold } = useMultipleTabSetting();

    const { getShowLocalePicker } = useLocale();

    const getShowMenuRef = computed(() => {
      return unref(getShowMenu) && !unref(getIsHorizontal);
    });

    function renderSidebar() {
      return (
        <>
          <TypePicker
            menuTypeList={menuTypeList}
            handler={(item: (typeof menuTypeList)[0]) => {
              baseHandler(HandlerEnum.CHANGE_LAYOUT, {
                mode: item.mode,
                type: item.type,
                split: unref(getIsHorizontal) ? false : undefined,
              });
            }}
            def={unref(getMenuType)}
          />
        </>
      );
    }

    function renderHeaderTheme() {
      return <ThemeColorPicker colorList={HEADER_PRESET_BG_COLOR_LIST} def={unref(getHeaderBgColor)} event={HandlerEnum.HEADER_THEME} />;
    }

    function renderSiderTheme() {
      return <ThemeColorPicker colorList={SIDE_BAR_BG_COLOR_LIST} def={unref(getMenuBgColor)} event={HandlerEnum.MENU_THEME} />;
    }

    function renderMainTheme() {
      return <ThemeColorPicker colorList={APP_PRESET_COLOR_LIST} def={unref(getThemeColor)} event={HandlerEnum.CHANGE_THEME_COLOR} />;
    }

    /**
     * @description:
     */
    function renderFeatures() {
      let triggerDef = unref(getTrigger);

      const triggerOptions = getMenuTriggerOptions(unref(getSplit));
      const some = triggerOptions.some(item => item.value === triggerDef);
      if (!some) {
        triggerDef = TriggerEnum.FOOTER;
      }

      return (
        <>
          <SwitchItem title={t('layout.setting.menuSearch')} event={HandlerEnum.HEADER_SEARCH} def={unref(getShowSearch)} disabled={!unref(getShowHeader)} />
          <SwitchItem
            title={t('layout.setting.toggleLocale')}
            event={HandlerEnum.HEADER_LOCALE}
            def={unref(getShowLocalePicker)}
            disabled={!unref(getShowHeader)}
          />
        </>
      );
    }

    function renderContent() {
      return (
        <>
          <SwitchItem title={t('layout.setting.tabs')} event={HandlerEnum.TABS_SHOW} def={unref(getShowMultipleTab)} />
          <SwitchItem title={t('layout.setting.tabsIcon')} event={HandlerEnum.TABS_SHOW_ICON} def={unref(getShowIcon)} />
          {/* <SwitchItem
            title={t('layout.setting.tabsRedoBtn')}
            event={HandlerEnum.TABS_SHOW_REDO}
            def={unref(getShowRedo)}
            disabled={!unref(getShowMultipleTab)}
          />
          <SwitchItem
            title={t('layout.setting.tabsQuickBtn')}
            event={HandlerEnum.TABS_SHOW_QUICK}
            def={unref(getShowQuick)}
            disabled={!unref(getShowMultipleTab)}
          /> */}
          {/* <SwitchItem
            title={t('layout.setting.tabsFoldBtn')}
            event={HandlerEnum.TABS_SHOW_FOLD}
            def={unref(getShowFold)}
            disabled={!unref(getShowMultipleTab)}
          /> */}

          {/* <SwitchItem title={t('layout.setting.header')} event={HandlerEnum.HEADER_SHOW} def={unref(getShowHeader)} />
          <SwitchItem title="Logo" event={HandlerEnum.SHOW_LOGO} def={unref(getShowLogo)} disabled={unref(getIsMixSidebar)} />
          <SwitchItem title={t('layout.setting.fullContent')} event={HandlerEnum.FULL_CONTENT} def={unref(getFullContent)} /> */}

          <SwitchItem title={t('layout.setting.grayMode')} event={HandlerEnum.GRAY_MODE} def={unref(getGrayMode)} />
          <SwitchItem title={t('layout.setting.colorWeak')} event={HandlerEnum.COLOR_WEAK} def={unref(getColorWeak)} />
          <SwitchItem title={t('layout.setting.cachePage')} event={HandlerEnum.OPEN_KEEP_ALIVE} def={unref(getOpenKeepAlive)} />
        </>
      );
    }

    function renderTransition() {
      return (
        <>
          <SwitchItem title={t('layout.setting.progress')} event={HandlerEnum.OPEN_PROGRESS} def={unref(getOpenNProgress)} />
          <SwitchItem title={t('layout.setting.switchLoading')} event={HandlerEnum.OPEN_PAGE_LOADING} def={unref(getOpenPageLoading)} />
          {/* <SwitchItem title={t('layout.setting.switchAnimation')} event={HandlerEnum.OPEN_ROUTE_TRANSITION} def={unref(getEnableTransition)} />
          <SelectItem
            title={t('layout.setting.animationType')}
            event={HandlerEnum.ROUTER_TRANSITION}
            def={unref(getBasicTransition)}
            options={routerTransitionOptions}
            disabled={!unref(getEnableTransition)}
          /> */}
        </>
      );
    }

    return () => (
      <BasicDrawer {...attrs} title={t('layout.setting.drawerTitle')} width={330} class="setting-drawer">
        <div class="p-20px">
          {unref(getShowDarkModeToggle) && <Divider>{() => t('layout.setting.darkMode')}</Divider>}
          {unref(getShowDarkModeToggle) && <AppDarkModeToggle class="mx-auto" />}
          <Divider>{() => t('layout.setting.navMode')}</Divider>
          {renderSidebar()}
          <Divider>{() => t('layout.setting.sysTheme')}</Divider>
          {renderMainTheme()}
          <Divider>{() => t('layout.setting.headerTheme')}</Divider>
          {renderHeaderTheme()}
          <Divider>{() => t('layout.setting.sidebarTheme')}</Divider>
          {renderSiderTheme()}
          <Divider>{() => t('layout.setting.interfaceFunction')}</Divider>
          {renderFeatures()}
          <Divider>{() => t('layout.setting.interfaceDisplay')}</Divider>
          {renderContent()}
          <Divider>{() => t('layout.setting.animation')}</Divider>
          {renderTransition()}
          {/* <Divider />
        <SettingFooter /> */}
        </div>
      </BasicDrawer>
    );
  },
});
