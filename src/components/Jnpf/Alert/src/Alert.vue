<template>
  <Alert :message="title" v-bind="getBindValue">
    <template #[item]="data" v-for="item in Object.keys($slots)"><slot :name="item" v-bind="data || {}"></slot></template>
  </Alert>
</template>

<script lang="ts" setup>
  import { Alert } from 'ant-design-vue';
  import { computed, unref } from 'vue';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { omit } from 'lodash-es';

  defineOptions({ name: 'JnpfAlert', inheritAttrs: false });
  const props = defineProps({
    title: { type: String, default: '' },
    type: { type: String, default: 'warning' },
    showIcon: { type: Boolean, default: false },
    closable: { type: Boolean, default: false },
    closeText: { type: String, default: '' },
  });
  const attrs = useAttrs({ excludeDefaultKeys: false });

  const getBindValue: any = computed(() => omit({ ...unref(attrs), ...props, closeText: props.closable ? props.closeText : '' }, ['title']));
</script>
