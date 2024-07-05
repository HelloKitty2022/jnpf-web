<template>
  <Divider :orientation="contentPosition" v-bind="getBindValue">{{ content }}</Divider>
</template>

<script lang="ts" setup>
  import { Divider } from 'ant-design-vue';
  import { computed, unref } from 'vue';
  import { useAttrs } from '/@/hooks/core/useAttrs';

  defineOptions({ name: 'JnpfDivider', inheritAttrs: false });
  defineProps({
    content: {
      type: String,
      default: '',
    },
    contentPosition: {
      type: String as PropType<'left' | 'center' | 'right'>,
      default: 'left',
    },
  });
  const attrs = useAttrs({ excludeDefaultKeys: false });

  const getBindValue = computed(() => ({ ...unref(attrs) }));
</script>
