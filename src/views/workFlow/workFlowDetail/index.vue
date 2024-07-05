<template>
  <div class="jnpf-content-wrapper bg-white">
    <FlowParser @register="registerFlowParser" @reload="closeCurrent()" />
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, computed, unref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { usePopup } from '/@/components/Popup';
  import FlowParser from '/@/views/workFlow/components/FlowParser.vue';
  import { decodeByBase64 } from '/@/utils/cipher';
  import { checkInfo } from '/@/api/workFlow/flowBefore';
  import { useTabs } from '/@/hooks/web/useTabs';

  defineOptions({ name: 'workFlowDetail' });

  const route = useRoute();
  const { closeCurrent } = useTabs();
  const [registerFlowParser, { openPopup: openFlowParser }] = usePopup();

  const getConfig = computed(() => route.query.config);

  watch(
    () => unref(getConfig),
    () => {
      // initData();
    },
    { deep: true },
  );

  function initData() {
    // type 1-我发起的 2-待办 3-抄送
    if (!unref(getConfig)) return;
    const config = JSON.parse(decodeByBase64(unref(getConfig) as string));
    const data = {
      id: config.processId,
      flowId: config.flowId,
      opType: config.type == 1 ? 0 : config.type == 2 ? 1 : config.type,
      taskNodeId: config.taskNodeId,
      taskId: config.taskOperatorId,
      hideCancelBtn: true,
    };
    if (config.type == 2) {
      checkInfo(config.taskOperatorId)
        .then(res => {
          if (res.data && res.data.isCheck) data.opType = 3;
          openFlowParser(true, data);
        })
        .catch(() => {
          closeCurrent();
        });
    } else {
      openFlowParser(true, data);
    }
  }

  onMounted(() => {
    initData();
  });
</script>
