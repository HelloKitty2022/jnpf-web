<template>
  <div class="jnpf-content-wrapper bg-white">
    <iframe :src="state.url" width="100%" height="100%" frameborder="0" />
  </div>
</template>
<script lang="ts" setup>
  import { reactive, onMounted } from 'vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { getToken } from '/@/utils/auth';
  import { useRoute } from 'vue-router';
  import { getDataReportInfo } from '/@/api/onlineDev/dataReport';

  interface State {
    url: string;
  }

  defineOptions({ name: 'dynamicDataReport' });
  defineEmits(['register']);
  const { report } = useGlobSetting();
  const state = reactive<State>({
    url: '',
  });

  function init() {
    const route = useRoute();
    const id = route.meta.relationId;
    if (!id) return;
    let targetUrl = `${report}/preview.html?id=${id}&token=${getToken()}&page=1&from=menu`;
    getDataReportInfo(id).then(res => {
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

  onMounted(() => {
    init();
  });
</script>
