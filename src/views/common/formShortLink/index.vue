<template>
  <component :is="currentView" :config="config" :modelId="modelId" :isPreview="isPreview" v-if="showPage" />
</template>
<script lang="ts" setup>
  import { reactive, onMounted, toRefs, markRaw } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { getConfigData } from '/@/api/onlineDev/shortLink';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useTabs } from '/@/hooks/web/useTabs';
  import Form from './form/index.vue';
  import List from './list/index.vue';
  import { AesEncryption } from '/@/utils/cipher';

  interface State {
    currentView: any;
    showPage: boolean;
    isPreview: boolean;
    modelId: string;
    config: any;
    encryption: string;
  }

  defineOptions({ name: 'formShortLink' });
  const { createMessage } = useMessage();
  const { close } = useTabs();
  const state = reactive<State>({
    currentView: '',
    showPage: false,
    isPreview: false,
    modelId: '',
    config: {},
    encryption: '',
  });
  const { currentView, showPage, isPreview, modelId, config } = toRefs(state);
  const router = useRouter();

  function init() {
    const route = useRoute();
    if (!route.query.encryption) return;
    state.encryption = route.query.encryption as string;
    const aesEncryption = new AesEncryption({ useHex: true });
    const configStr = aesEncryption.decryptByAES(state.encryption);
    if (!configStr) return;
    const config = JSON.parse(configStr);
    state.modelId = config.modelId;
    if (!state.modelId) return;
    getConfig(config.type);
  }
  function getConfig(type) {
    getConfigData(state.modelId, state.encryption).then(res => {
      if (res.code !== 200 || !res.data) {
        close();
        router.replace('/404');
        createMessage.error(res.msg || '请求出错，请重试');
        return;
      }
      state.config = { ...res.data, encryption: state.encryption };
      state.currentView = type == 'form' ? markRaw(Form) : markRaw(List);
      state.showPage = true;
    });
  }

  onMounted(() => {
    init();
  });
</script>
