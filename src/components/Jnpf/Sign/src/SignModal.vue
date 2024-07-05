<template>
  <a-modal v-model:visible="visible" title="请签名" class="jnpf-sign-modal" centered :maskClosable="false" :keyboard="false" :width="600">
    <template #closeIcon>
      <ModalClose :canFullscreen="false" @cancel="handleCancel" />
    </template>
    <template #footer>
      <a-button @click="handleReset">{{ t('common.cleanText') }}</a-button>
      <a-button type="primary" :loading="confirmLoading" @click="handleSubmit">{{ t('common.okText') }}</a-button>
    </template>
    <div class="sign-main">
      <vue-esign ref="esignRef" :height="300" :width="580" :lineWidth="lineWidth" />
      <div class="tip" v-show="!hasDrew">请在此区域使用鼠标手写签名</div>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
  import { createSign } from '/@/api/permission/userSetting';
  import { Modal as AModal } from 'ant-design-vue';
  import { ref, unref, watch, nextTick } from 'vue';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import vueEsign from './esign.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { useI18n } from '/@/hooks/web/useI18n';

  const props = defineProps({
    lineWidth: { type: Number, default: 3 },
    isDefault: { type: Number, default: 0 },
    submitOnConfirm: { type: Boolean, default: false },
  });
  const emit = defineEmits(['register', 'confirm']);
  defineExpose({ openModal });
  const hasDrew = ref(false);
  const esignRef = ref(null);
  const visible = ref(false);
  const confirmLoading = ref(false);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const userStore = useUserStore();

  watch(
    () => (getESign() as unknown as Recordable)?.hasDrew,
    val => {
      hasDrew.value = val;
    },
  );

  function openModal() {
    visible.value = true;
    confirmLoading.value = false;
    nextTick(() => {
      handleReset();
    });
  }
  function handleCancel() {
    visible.value = false;
  }
  function getESign() {
    const esign = unref(esignRef);
    if (!esign) return null;
    return esign;
  }
  function handleReset() {
    hasDrew.value = false;
    (getESign() as unknown as Recordable).reset();
  }
  function handleSubmit() {
    (getESign() as unknown as Recordable)
      .generate()
      .then(res => {
        if (!props.submitOnConfirm) {
          emit('confirm', res);
          visible.value = false;
          return;
        }
        confirmLoading.value = true;
        const query = {
          signImg: res,
          isDefault: props.isDefault,
        };
        createSign(query)
          .then(res => {
            if (props.isDefault == 0) {
              createMessage.success(res.msg);
            }
            if (props.isDefault == 1 || (props.isDefault == 0 && !userStore.getUserInfo.signImg)) {
              userStore.setUserInfo({ signImg: query.signImg });
            }
            confirmLoading.value = false;
            visible.value = false;
            emit('confirm', query.signImg);
          })
          .catch(() => {
            confirmLoading.value = false;
          });
      })
      .catch(() => {
        createMessage.warning('请签名');
      });
  }
</script>
<style lang="less">
  html[data-theme='dark'] {
    .jnpf-sign-modal {
      .sign-main {
        background-color: #fff;
      }
    }
  }
  .jnpf-sign-modal {
    .ant-modal-body {
      padding: 10px !important;
    }
    .sign-main {
      border: 1px solid @border-color-base1;
      width: 100%;
      height: 300px;
      box-sizing: border-box;
      background-color: @app-content-background;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: hidden;
      .tip {
        height: 300px;
        text-align: center;
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        color: @text-color-secondary;
        font-size: 16px;
        pointer-events: none;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
</style>
