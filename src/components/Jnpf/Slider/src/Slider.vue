<template>
  <Slider v-bind="getBindValue">
    <template #[item]="data" v-for="item in Object.keys($slots)"><slot :name="item" v-bind="data || {}"></slot></template>
  </Slider>
</template>

<script lang="ts" setup>
  import { Slider } from 'ant-design-vue';
  import { computed, unref } from 'vue';
  import { useAttrs } from '/@/hooks/core/useAttrs';

  defineOptions({ name: 'JnpfSlider', inheritAttrs: false });

  const attrs = useAttrs({ excludeDefaultKeys: false });

  const getBindValue: any = computed(() => ({ ...unref(attrs) }));
</script>
