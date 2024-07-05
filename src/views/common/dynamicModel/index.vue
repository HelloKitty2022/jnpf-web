<template>
  <component :is="currentView" :config="config" :modelId="modelId" :isPreview="isPreview" v-if="showPage" />
</template>
<script lang="ts" setup>
  import { reactive, onMounted, toRefs, markRaw } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { getConfigData } from '/@/api/onlineDev/visualDev';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useTabs } from '/@/hooks/web/useTabs';
  import { useBaseStore } from '/@/store/modules/base';
  import Form from './form/index.vue';
  import List from './list/index.vue';

  interface State {
    currentView: any;
    showPage: boolean;
    isPreview: boolean;
    modelId: string;
    config: any;
  }

  defineOptions({ name: 'dynamicModel' });
  const { createMessage } = useMessage();
  const baseStore = useBaseStore();
  const { close } = useTabs();
  const state = reactive<State>({
    currentView: '',
    showPage: false,
    isPreview: false,
    modelId: '',
    config: {},
  });
  const { currentView, showPage, isPreview, modelId, config } = toRefs(state);
  const router = useRouter();

  async function init() {
    const route = useRoute();
    await baseStore.getDictionaryAll();
    state.isPreview = (route.query.isPreview as unknown as boolean) || false;
    state.modelId = state.isPreview ? (route.query.id as string) : (route.meta.relationId as string);
    const type = route.query.previewType || '';
    if (!state.modelId) return;
    getConfig(type);
  }
  function getConfig(type) {
    getConfigData(state.modelId, { type }).then(res => {
      if (res.code !== 200 || !res.data) {
        close();
        router.replace('/404');
        createMessage.error(res.msg || '请求出错，请重试');
        return;
      }
      state.config = res.data;
      state.currentView = res.data.webType == '1' ? markRaw(Form) : markRaw(List);
      state.showPage = true;
    });
  }

  onMounted(() => {
    init();
  });
</script>
