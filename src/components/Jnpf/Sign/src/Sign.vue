<template>
  <div :class="getClass">
    <img class="sign-img" :src="innerValue" @click="handlePreview" v-if="innerValue" />
    <div @click="openSignModal" class="sign-tip" :class="{ 'disabled-btn': disabled }" v-if="!detailed">
      <i class="icon-ym icon-ym-signature sign-icon"></i>
      <span class="sign-text" v-if="!innerValue">{{ signTip }}</span>
    </div>
    <SignModal ref="signModalRef" :isDefault="isDefault" :submitOnConfirm="submitOnConfirm" @confirm="handleSubmit" />
  </div>
</template>

<script lang="ts" setup>
  import { Form } from 'ant-design-vue';
  import { ref, unref, watch, computed } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { ThemeEnum } from '/@/enums/appEnum';
  import { createImgPreview } from '/@/components/Preview/index';
  import SignModal from './SignModal.vue';

  defineOptions({ name: 'JnpfSign', inheritAttrs: false });
  const props = defineProps({
    value: String,
    signTip: { type: String, default: '手写签名' },
    disabled: { type: Boolean, default: false },
    detailed: { type: Boolean, default: false },
    isDefault: { type: Number, default: 0 },
    submitOnConfirm: { type: Boolean, default: false },
  });
  const emit = defineEmits(['update:value', 'change']);
  const { prefixCls } = useDesign('sign');
  const formItemContext = Form.useInjectFormItemContext();
  const signModalRef = ref(null);
  const innerValue = ref('');
  const { getDarkMode } = useRootSetting();

  const isDark = computed(() => getDarkMode.value === ThemeEnum.DARK);
  const getClass = computed(() => [
    prefixCls,
    {
      [`${prefixCls}--dark`]: unref(isDark),
    },
  ]);

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
    const signRef = unref(signModalRef) as any;
    signRef?.openModal();
  }
  function handleSubmit(value) {
    innerValue.value = value;
    emit('update:value', innerValue.value);
    emit('change', innerValue.value);
    formItemContext.onFieldChange();
  }
  function handlePreview() {
    if (!innerValue.value) return;
    const imageList = [innerValue.value];
    createImgPreview({ imageList });
  }
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-sign';

  .@{prefix-cls} {
    display: flex;
    align-items: center;
    .disabled-btn {
      cursor: no-drop !important;
    }
    .sign-img {
      width: 80px;
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
    &--dark {
      .sign-img {
        background: #fff;
      }
    }
  }
</style>
