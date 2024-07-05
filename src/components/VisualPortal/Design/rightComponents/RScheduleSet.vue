<template>
  <a-collapse-panel>
    <template #header>日程设置</template>
    <a-form-item label="默认视图">
      <jnpf-radio v-model:value="activeData.defaultView" :options="defaultViewOptions" optionType="button" button-style="solid" />
    </a-form-item>
    <a-form-item label="显示农历">
      <a-switch v-model:checked="activeData.showLunarCalendar" />
    </a-form-item>
    <a-form-item label="周第一天">
      <jnpf-select v-model:value="activeData.firstDay" :options="firstDayOptions" placeholder="请选择" />
    </a-form-item>
    <a-form-item label="默认时长">
      <jnpf-select v-model:value="activeData.duration" :options="durationOptions" placeholder="请选择" />
    </a-form-item>
    <Refresh :refresh="activeData.refresh" />
  </a-collapse-panel>
</template>
<script lang="ts" setup>
  import Refresh from './RRefresh.vue';
  import { firstDayOptions, defaultViewOptions, durationOptions } from '../helper/dataMap';

  defineProps(['activeData', 'showType']);
</script>
