<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" class="full-popup report-popup">
    <iframe :src="state.url" width="100%" height="100%" frameborder="0" />
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { reactive, onMounted } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { useGlobSetting } from '/@/hooks/setting';
  import { getToken } from '/@/utils/auth';
  import { getDataReportInfo } from '/@/api/onlineDev/dataReport';
  interface State {
    url: string;
  }

  defineEmits(['register']);
  const { report } = useGlobSetting();
  const [registerPopup, { closePopup }] = usePopupInner(init);
  const state = reactive<State>({
    url: '',
  });

  function init(data) {
    let targetUrl = `${report}/preview.html?id=${data.id}&token=${getToken()}&page=1`;
    getDataReportInfo(data.id).then(res => {
      let item = {};
      if (res.data?.searchForm?.components && Array.isArray(res.data.searchForm.components)) {
        listQuery(res.data.searchForm.components, item);
        for (let key in item) {
          let item1 = '&' + key + '=' + item[key];
          targetUrl += item1;
        }
      }
      state.url = targetUrl;
    });
  }
  function listQuery(list, callback) {
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      let arrayList = [];
      if (item.hasOwnProperty('cols') && Array.isArray(item.cols)) {
        arrayList = arrayList.concat(item.cols);
      }
      if (item.hasOwnProperty('children') && Array.isArray(item.children)) {
        arrayList = arrayList.concat(item.children);
      }
      if (item.bindParameter && item.defaultValue) {
        callback[item.bindParameter] = item.defaultValue;
      }
      listQuery(arrayList, callback);
    }
  }
  function handleMessage(e) {
    const data = e.data;
    if (data !== 'closeDialog') return;
    state.url = '';
    closePopup();
  }

  onMounted(() => {
    window.addEventListener('message', handleMessage);
  });
</script>
<style lang="less">
  .report-popup {
    .jnpf-basic-popup-header {
      display: none !important;
    }
  }
</style>
