<template>
  <div class="jnpf-content-wrapper bg-white" v-loading="loading">
    <DetailMain :dataForm="dataForm" :isSend="isSend" class="overflow-auto" />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, toRefs, onMounted } from 'vue';
  import { getEmailInfo } from '/@/api/extend/email';
  import DetailMain from './DetailMain.vue';
  import { useRoute } from 'vue-router';

  defineOptions({ name: 'extend-email' });

  interface State {
    dataForm: any;
    isSend: boolean;
    loading: boolean;
  }

  defineEmits(['register']);
  const state = reactive<State>({
    dataForm: {},
    isSend: false,
    loading: false,
  });
  const route = useRoute();
  const { dataForm, isSend, loading } = toRefs(state);

  function init() {
    state.loading = true;
    const id = route.query.id;
    if (!id) return (state.loading = false);
    getEmailInfo(id).then(res => {
      state.dataForm = res.data;
      state.loading = false;
    });
  }

  onMounted(() => {
    init();
  });
</script>

<style scoped></style>
