<template>
  <Dropdown
    placement="bottom"
    :trigger="['click']"
    :dropMenuList="localeList"
    :selectedKeys="selectedKeys"
    @menu-event="handleMenuEvent"
    overlayClassName="app-locale-picker-overlay">
    <span class="cursor-pointer flex items-center">
      <Icon icon="ion:language" />
      <span v-if="showText" class="ml-1">{{ getLocaleText }}</span>
    </span>
  </Dropdown>
</template>
<script lang="ts" setup>
  import type { LocaleType } from '/#/config';
  import type { DropMenu } from '/@/components/Dropdown';
  import { ref, watchEffect, unref, computed } from 'vue';
  import { Dropdown } from '/@/components/Dropdown';
  import { Icon } from '/@/components/Icon';
  import { useLocale } from '/@/locales/useLocale';
  import { localeList } from '/@/settings/localeSetting';
  import { updateLanguage } from '/@/api/permission/userSetting';
  import { useMessage } from '/@/hooks/web/useMessage';

  const props = defineProps({
    /**
     * Whether to display text
     */
    showText: { type: Boolean, default: true },
    /**
     * Whether to refresh the interface when changing
     */
    reload: { type: Boolean, default: true },
  });

  const selectedKeys = ref<string[]>([]);

  const { changeLocale, getLocale } = useLocale();
  const { createMessage } = useMessage();

  const getLocaleText = computed(() => {
    const key = selectedKeys.value[0];
    if (!key) {
      return '';
    }
    return localeList.find(item => item.event === key)?.text;
  });

  watchEffect(() => {
    selectedKeys.value = [unref(getLocale)];
  });

  async function toggleLocale(lang: LocaleType | string) {
    await changeLocale(lang as LocaleType);
    selectedKeys.value = [lang as string];
    props.reload && location.reload();
  }

  function handleMenuEvent(menu: DropMenu) {
    if (unref(getLocale) === menu.event) return;
    updateLanguage({ language: menu.event }).then(() => {
      let msg = '切换成功';
      if (menu.event === 'en') msg = 'Switch Language Success';
      if (menu.event === 'zh_TW') msg = '切換成功';
      createMessage.success(msg);
      toggleLocale(menu.event as string);
    });
  }
</script>
