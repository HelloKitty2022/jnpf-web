<template>
  <div class="jnpf-content-wrapper bg-white">
    <FlowList @select="onSelect" />
    <FlowParser @register="registerFlowParser" />
  </div>
</template>

<script lang="ts" setup>
  import { usePopup } from '/@/components/Popup';
  import FlowList from './FlowList.vue';
  import FlowParser from '/@/views/workFlow/components/FlowParser.vue';

  const [registerFlowParser, { openPopup: openFlowParser }] = usePopup();

  defineOptions({ name: 'workFlow-addFlow' });

  function onSelect(record) {
    const data = {
      id: '',
      flowId: record.id,
      opType: '-1',
    };
    openFlowParser(true, data);
  }
</script>
