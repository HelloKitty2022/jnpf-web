<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" destroyOnClose :closeFunc="onClose" class="full-popup basic-flow-parser">
    <template #title>
      <div class="header-title">{{ config.title }}</div>
    </template>
    <div class="p-10px h-full overflow-auto">
      <component :is="state.currentView" ref="formRef" :config="config" @setPageLoad="setPageLoad" />
    </div>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, defineAsyncComponent, markRaw, ref } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { importViewsFile } from '/@/utils';
  import { getFlowBeforeInfo } from '/@/api/workFlow/flowBefore';

  interface State {
    config: any;
    properties: any;
    flowTaskInfo: any;
    flowFormInfo: any;
    flowTemplateInfo: any;
    flowTemplateJson: any;
    formData: any;
    currentView: any;
  }

  defineEmits(['register']);
  const [registerPopup, { changeLoading }] = usePopupInner(init);

  const formRef = ref<any>(null);
  const state = reactive<State>({
    config: {},
    properties: {},
    flowTaskInfo: {},
    flowFormInfo: {},
    flowTemplateInfo: {},
    flowTemplateJson: {},
    formData: {},
    currentView: null,
  });
  const { config } = toRefs(state);

  function init(data) {
    changeLoading(true);
    state.config = data;
    getBeforeInfo(state.config);
  }
  function getBeforeInfo(config) {
    const query = { taskNodeId: config.taskNodeId, taskOperatorId: config.taskId, flowId: config.flowId };
    getFlowBeforeInfo(config.id || '0', query)
      .then(res => {
        state.flowFormInfo = res.data.flowFormInfo;
        state.flowTaskInfo = res.data.flowTaskInfo || {};
        state.flowTemplateInfo = res.data.flowTemplateInfo;
        const fullName = state.flowTaskInfo.fullName;
        config.fullName = fullName;
        config.type = state.flowTemplateInfo.type;
        config.draftData = res.data.draftData || null;
        config.formData = res.data.formData || {};
        config.formEnCode = state.flowFormInfo.enCode;
        state.flowTemplateJson = state.flowTemplateInfo.flowTemplateJson ? JSON.parse(state.flowTemplateInfo.flowTemplateJson) : null;
        state.properties = res.data.approversProperties || {};
        config.formConf = state.flowFormInfo.propertyJson;
        config.formOperates = res.data.formOperates || [];
        if (config.opType == 0) {
          for (let i = 0; i < config.formOperates.length; i++) {
            config.formOperates[i].write = false;
          }
        }
        config.flowTemplateJson = state.flowTemplateJson;
        const formUrl =
          state.flowFormInfo.formType == 2
            ? 'workFlow/workFlowForm/dynamicForm'
            : state.flowFormInfo.urlAddress
            ? state.flowFormInfo.urlAddress.replace(/\s*/g, '')
            : `workFlow/workFlowForm/${state.flowFormInfo.enCode}`;
        state.currentView = markRaw(defineAsyncComponent(() => importViewsFile(formUrl)));
      })
      .catch(() => {
        changeLoading(false);
      });
  }
  function setPageLoad(val: any = false) {
    changeLoading(!!val);
  }
  function onClose() {
    state.currentView = null;
    return true;
  }
</script>
<style lang="less">
  @import './style/index.less';
</style>
