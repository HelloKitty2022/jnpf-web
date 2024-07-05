<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    defaultFullscreen
    :footer="null"
    :closable="false"
    :keyboard="false"
    class="jnpf-full-modal full-modal"
    :class="`${prefixCls}`">
    <template #title>
      <div class="jnpf-full-modal-header">
        <div class="header-title">
          <img src="../../../assets/images/jnpf.png" class="header-logo" />
          <a-tooltip :title="formInfo.fullName">
            <p class="header-txt"> · {{ formInfo.fullName }}</p>
          </a-tooltip>
        </div>
        <div class="text-20px leading-60px">系统集成设计</div>
        <a-space class="options" :size="10">
          <a-button type="primary" @click="handleSubmit()" :loading="btnLoading">{{ t('common.saveText') }}</a-button>
          <a-button @click="closeModal()">{{ t('common.cancelText') }}</a-button>
        </a-space>
      </div>
    </template>
    <ProcessMain ref="integrateProcess" :conf="templateJson" :formInfo="formInfo" v-if="!loading" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, nextTick, ref, unref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getInfo, update } from '/@/api/onlineDev/integrate';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useDesign } from '/@/hooks/web/useDesign';
  import ProcessMain from './Main.vue';

  interface State {
    dataForm: any;
    btnLoading: boolean;
    formInfo: any;
    templateJson: any;
    loading: boolean;
  }
  const state = reactive<State>({
    dataForm: {},
    btnLoading: false,
    formInfo: {},
    templateJson: null,
    loading: true,
  });
  const { formInfo, templateJson, btnLoading, loading } = toRefs(state);
  const { t } = useI18n();
  const integrateProcess = ref<any>();
  const { createMessage } = useMessage();
  const emit = defineEmits(['register', 'reload']);
  const { prefixCls } = useDesign('basic-integrate-process');
  const [registerModal, { closeModal, changeLoading }] = useModalInner(init);

  function init(data) {
    if (!data.id) return;
    state.loading = true;
    changeLoading(true);
    getInfo(data.id)
      .then(res => {
        state.formInfo = res.data;
        state.templateJson = res.data.templateJson ? JSON.parse(res.data.templateJson) : null;
        nextTick(() => {
          changeLoading(false);
          state.loading = false;
        });
      })
      .catch(() => {
        changeLoading(false);
        state.loading = false;
      });
  }
  function handleSubmit() {
    unref(integrateProcess)
      .getData()
      .then(res => {
        state.templateJson = res.data;
        let query = {
          ...state.formInfo,
          templateJson: JSON.stringify(state.templateJson),
        };
        state.btnLoading = true;
        update(query)
          .then(() => {
            state.btnLoading = false;
            closeModal();
            emit('reload');
          })
          .catch(() => {
            state.btnLoading = false;
          });
      })
      .catch(err => {
        err.msg && createMessage.warning(err.msg);
      });
  }
</script>
