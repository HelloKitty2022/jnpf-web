<template>
  <PopupSelect v-bind="getBindValue" />
</template>

<script lang="ts" setup>
  import PopupSelect from './PopupSelect.vue';
  import { computed, unref } from 'vue';
  import { useAttrs } from '/@/hooks/core/useAttrs';

  defineOptions({ name: 'JnpfPopupTableSelect', inheritAttrs: false });

  const attrs = useAttrs({ excludeDefaultKeys: false });

  const getBindValue: any = computed(() => unref(attrs));
</script>
