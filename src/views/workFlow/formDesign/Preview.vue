<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="state.title" class="full-popup" destroyOnClose :closeFunc="onClose">
    <div class="h-full p-10px overflow-y-auto">
      <component :is="state.currentView" :config="state.config" @setPageLoad="setPageLoad" />
    </div>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { getInfo } from '/@/api/workFlow/formDesign';
  import { defineAsyncComponent, reactive, markRaw } from 'vue';
  import { importViewsFile } from '/@/utils';

  interface State {
    currentView: any;
    title: string;
    config: any;
  }

  defineEmits(['register']);
  const [registerPopup, { changeLoading }] = usePopupInner(init);
  const state = reactive<State>({
    currentView: null,
    title: '',
    config: {},
  });

  function init(data) {
    changeLoading(true);
    state.title = '预览表单【' + data.fullName + '】';
    getInfo(data.formId).then(res => {
      const dataSource = data.dataSource === 'propertyJson' ? 'propertyJson' : 'draftJson';
      if (!res.data || !res.data[dataSource]) return changeLoading(false);
      data.formConf = res.data[dataSource];
      data.type = res.data.type;
      data.formOperates = [];
      state.config = data;
      const formUrl =
        res.data.formType == 2
          ? 'workFlow/workFlowForm/dynamicForm'
          : res.data.urlAddress
          ? res.data.urlAddress.replace(/\s*/g, '')
          : `workFlow/workFlowForm/${res.data.enCode}`;
      state.currentView = markRaw(defineAsyncComponent(() => importViewsFile(formUrl)));
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
