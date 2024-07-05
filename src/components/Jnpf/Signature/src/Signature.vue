<template>
  <div :class="prefixCls">
    <img class="sign-img" :src="apiUrl + innerValue" @click="handlePreview" v-if="innerValue" />
    <div @click="openSignModal" class="sign-tip" :class="{ 'disabled-btn': disabled }" v-if="!detailed">
      <i class="icon-ym icon-ym-signature1 sign-icon"></i>
      <span class="sign-text" v-if="!innerValue">{{ signTip }}</span>
    </div>
    <SignatureModal ref="signatureModalRef" @confirm="handleSubmit" />
  </div>
</template>

<script lang="ts" setup>
  import { Form } from 'ant-design-vue';
  import { ref, unref, watch, computed } from 'vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { createImgPreview } from '/@/components/Preview/index';
  import SignatureModal from './SignatureModal.vue';

  defineOptions({ name: 'JnpfSignature', inheritAttrs: false });
  const props = defineProps({
    value: String,
    signTip: { type: String, default: '电子签章' },
    disabled: { type: Boolean, default: false },
    detailed: { type: Boolean, default: false },
    ableIds: { type: Array, default: [] },
  });
  const emit = defineEmits(['update:value', 'change']);
  const globSetting = useGlobSetting();
  const apiUrl = ref(globSetting.apiUrl);
  const { prefixCls } = useDesign('signature');
  const formItemContext = Form.useInjectFormItemContext();
  const signatureModalRef = ref(null);
  const innerValue = ref('');

  const getImgList = computed<string[]>(() => (innerValue.value ? [apiUrl.value + innerValue.value] : []));

  watch(
    () => props.value,
    val => {
      setValue(val);
    },
    { immediate: true },
  );

  function setValue(value) {
    innerValue.value = value;
  }
  function openSignModal() {
    if (props.disabled) return;
    const signRef = unref(signatureModalRef) as any;
    const data = { value: innerValue.value, ableIds: props.ableIds };
    signRef?.openModal(data);
  }
  function handleSubmit(value) {
    innerValue.value = value;
    emit('update:value', innerValue.value);
    emit('change', innerValue.value);
    formItemContext.onFieldChange();
  }
  function handlePreview() {
    if (!innerValue.value) return;
    createImgPreview({ imageList: unref(getImgList) });
  }
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-signature';

  .@{prefix-cls} {
    display: flex;
    align-items: center;
    .disabled-btn {
      cursor: no-drop !important;
    }
    .sign-img {
      width: 40px;
      height: 40px;
      object-fit: contain;
      cursor: pointer;
    }
    .sign-tip {
      height: 40px;
      font-size: 14px;
      display: flex;
      align-items: center;
      cursor: pointer;
      .sign-icon {
        font-size: 28px;
      }
    }
  }
</style>
