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
          <a-tooltip :title="record.fullName">
            <p class="header-txt"> · {{ record.fullName }}</p>
          </a-tooltip>
        </div>
        <a-radio-group v-model:value="showType" button-style="solid">
          <a-radio-button value="pc" class="!px-10px">
            <a-tooltip placement="bottom" title="PC">
              <i class="icon-ym icon-ym-pc" />
            </a-tooltip>
          </a-radio-button>
          <a-radio-button value="app" class="!px-10px">
            <a-tooltip placement="bottom" title="APP">
              <i class="icon-ym icon-ym-mobile" />
            </a-tooltip>
          </a-radio-button>
        </a-radio-group>
        <a-space class="options-box" :size="10">
          <a-tooltip placement="bottom" title="撤销">
            <a-button type="text" :disabled="!getCanUndo" @click="handleRedoAndUndo(1)" class="btnOptions">
              <i class="icon-ym icon-ym-report-icon-undo" />
            </a-button>
          </a-tooltip>
          <a-tooltip placement="bottom" title="重做">
            <a-button type="text" :disabled="!getCanRedo" @click="handleRedoAndUndo(2)" class="btnOptions">
              <i class="icon-ym icon-ym-report-icon-restore" />
            </a-button>
          </a-tooltip>
          <a-tooltip placement="bottom" title="清空">
            <a-button type="text" @click="handleEmpty" class="btnOptions">
              <i class="icon-ym icon-ym-clean" />
            </a-button>
          </a-tooltip>
          <a-tooltip placement="bottom" title="预览">
            <a-button type="text" @click="handlePreview" class="btnOptions">
              <i class="icon-ym icon-ym-video-play" />
            </a-button>
          </a-tooltip>
          <a-divider type="vertical" class="divider" />
          <a-button type="primary" @click="handleSubmit(1)" :loading="btnLoading" :disabled="saveBtnLoading">保存并发布 </a-button>
          <a-button type="primary" @click="handleSubmit()" :loading="saveBtnLoading" :disabled="btnLoading">{{ t('common.saveText') }}</a-button>
          <a-button @click="closeModal()">{{ t('common.cancelText') }}</a-button>
        </a-space>
      </div>
    </template>
    <PortalDesigner ref="portalDesigner" :conf="formData" :showType="showType" @addRecord="handleAddRecord" v-if="!loading" />
  </BasicModal>
  <ReleaseModal @register="registerReleaseModal" @reload="handleCloseModal" />
</template>
<script lang="ts" setup>
  import { reactive, toRefs, nextTick, ref, unref } from 'vue';
  import { useRedo } from '../../FormGenerator/src/hooks/useRedo';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getInfo, updatePortal, createPortal } from '/@/api/onlineDev/portal';
  import PortalDesigner from './components/PortalDesigner.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useModal } from '/@/components/Modal';
  import ReleaseModal from '/@/views/onlineDev/visualPortal/components/ReleaseModal.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    dataForm: any;
    btnLoading: boolean;
    saveBtnLoading: boolean;
    showType: string;
    record: any;
    formData: any;
    loading: boolean;
  }
  const state = reactive<State>({
    dataForm: {},
    btnLoading: false,
    saveBtnLoading: false,
    showType: 'pc',
    record: {},
    formData: null,
    loading: true,
  });
  const { record, formData, btnLoading, saveBtnLoading, showType, loading } = toRefs(state);
  const { t } = useI18n();
  const portalDesigner = ref();
  const { createMessage } = useMessage();
  const emit = defineEmits(['register', 'reload']);
  const { prefixCls } = useDesign('basic-portal');
  const { initRedo, addRecord, handleUndo, handleRedo, getCanUndo, getCanRedo } = useRedo();
  const [registerModal, { closeModal, changeLoading }] = useModalInner(init);
  const [registerReleaseModal, { openModal: openReleaseModal }] = useModal();

  function init(data) {
    state.dataForm.id = data.id || '';
    state.record = data;
    state.showType = 'pc';
    state.formData = null;
    initRedo();
    if (state.record.id) {
      changeLoading(true);
      state.loading = true;
      getInfo(state.record.id)
        .then(res => {
          state.formData = JSON.parse(res.data.formData);
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
  }
  function handleSubmit(type?) {
    (unref(portalDesigner) as any)
      .getData()
      .then(res => {
        state.formData = res.formData;
        let query = {
          formData: JSON.stringify(state.formData),
          id: state.record.id,
        };
        type == 1 ? (state.btnLoading = true) : (state.saveBtnLoading = true);
        const formMethod = state.record.id ? updatePortal : createPortal;
        formMethod(query)
          .then(() => {
            state.saveBtnLoading = false;
            state.btnLoading = false;
            if (type === 1) {
              nextTick(() => openReleaseModal(true, state.record));
            } else {
              handleCloseModal();
            }
          })
          .catch(() => {
            state.saveBtnLoading = false;
            state.btnLoading = false;
          });
      })
      .catch(err => {
        err.msg && createMessage.warning(err.msg);
      });
  }
  function handleEmpty() {
    (unref(portalDesigner) as any).empty();
  }
  function handlePreview() {
    (unref(portalDesigner) as any).preview();
  }
  function handleAddRecord(val) {
    addRecord(val);
  }
  function handleRedoAndUndo(type) {
    const method = type == 1 ? handleUndo : handleRedo;
    method((unref(portalDesigner) as any).handleData);
  }
  function handleCloseModal() {
    closeModal();
    setTimeout(() => {
      emit('reload');
    }, 100);
  }
</script>
<style lang="less">
  @import '../style/index.less';
</style>
