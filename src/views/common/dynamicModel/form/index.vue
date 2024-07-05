<template>
  <div class="jnpf-content-wrapper bg-white">
    <FormPopup @register="registerFormPopup" />
    <FlowParser @register="registerFlowParser" @reload="getFlowOptions()" />
    <SelectFlowModal @register="registerSelectFlowModal" @change="selectFlow" />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, onMounted } from 'vue';
  import { getFlowList } from '/@/api/workFlow/flowEngine';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useModal } from '/@/components/Modal';
  import { usePopup } from '/@/components/Popup';
  import FormPopup from './FormPopup.vue';
  import FlowParser from '/@/views/workFlow/components/FlowParser.vue';
  import { SelectFlowModal } from '/@/components/CommonModal';

  interface State {
    flowList: any[];
    flowItem: any;
  }

  const props = defineProps(['config', 'modelId', 'isPreview']);
  const { createMessage } = useMessage();
  const [registerFormPopup, { openPopup: openFormPopup }] = usePopup();
  const [registerFlowParser, { openPopup: openFlowParser }] = usePopup();
  const [registerSelectFlowModal, { openModal: openSelectFlowModal }] = useModal();
  const state = reactive<State>({
    flowList: [],
    flowItem: {},
  });

  function getFlowOptions() {
    getFlowList(props.config.flowId, '1').then(res => {
      const flowList = res.data || [];
      state.flowList = flowList;
      if (state.flowItem.id) return selectFlow(state.flowItem);
      if (!flowList.length) return createMessage.error('流程不存在');
      if (flowList.length === 1) return selectFlow(flowList[0]);
      openSelectFlowModal(true, { flowList: state.flowList });
    });
  }
  function selectFlow(item) {
    state.flowItem = item;
    const data = {
      id: '',
      flowId: item.id,
      opType: '-1',
      hideCancelBtn: true,
      modelId: props.modelId,
      isPreview: props.isPreview,
    };
    openFlowParser(true, data);
  }
  function init() {
    if (props.config.enableFlow) return getFlowOptions();
    const data = {
      modelId: props.modelId,
      isPreview: props.isPreview,
      ...props.config,
    };
    openFormPopup(true, data);
  }

  onMounted(() => {
    init();
  });
</script>
