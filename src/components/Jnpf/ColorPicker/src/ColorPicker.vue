<template>
  <a-popover
    v-model:visible="showPicker"
    trigger="click"
    class="jnpf-color-picker"
    :class="[colorSize ? 'jnpf-color-picker--' + colorSize : '']"
    v-bind="$attrs"
    v-if="!colorDisabled">
    <template #content>
      <div class="ant-color-dropdown__main-wrapper">
        <SvPanel ref="svPanel" :color="color" />
        <HueSlider ref="hue" class="hue-slider" :color="color" vertical />
      </div>
      <AlphaSlider v-if="showAlpha" ref="alpha" :color="color" />
      <preDefine v-if="predefine.length" ref="predefine" :color="color" :colors="predefine" />
      <div class="ant-color-dropdown__btns">
        <span class="ant-color-dropdown__value">
          <a-input v-model:value="customInput" size="small" @pressEnter="handleConfirm" @blur="handleConfirm" />
        </span>
        <div class="ant-dropdown__btns">
          <a-button type="link" size="small" class="ant-cancel-button" @click="clear">清空</a-button>
          <a-button size="small" @click="confirmValue">确定</a-button>
        </div>
      </div>
    </template>
    <div class="ant-color-picker__trigger" @click="handleTrigger">
      <span class="ant-color-picker__color" :class="{ 'is-alpha': showAlpha }">
        <span class="ant-color-picker__color-inner" :style="{ backgroundColor: displayedColor }">
          <DownOutlined v-show="value || showPanelColor" style="color: #909399" />
          <CloseOutlined v-if="!value && !showPanelColor" style="color: #909399" />
        </span>
      </span>
    </div>
  </a-popover>
  <div class="jnpf-color-picker ant-color-picker__trigger is-disabled" :class="[colorSize ? 'jnpf-color-picker--' + colorSize : '']" v-if="colorDisabled">
    <span class="ant-color-picker__color" :class="{ 'is-alpha': showAlpha }">
      <span class="ant-color-picker__color-inner" :style="{ backgroundColor: displayedColor }">
        <DownOutlined v-show="value || showPanelColor" style="color: #909399" />
        <CloseOutlined v-if="!value && !showPanelColor" style="color: #909399" />
      </span>
    </span>
  </div>
</template>
<script lang="ts">
  import { defineComponent, reactive, computed, provide, ref, watch, nextTick, onMounted } from 'vue';
  import { Form } from 'ant-design-vue';
  import { DownOutlined, CloseOutlined } from '@ant-design/icons-vue';
  import HueSlider from './components/hueSlider.vue';
  import SvPanel from './components/svPanel.vue';
  import AlphaSlider from './components/alphaSlider.vue';
  import preDefine from './components/preDefine.vue';
  import { useDebounceFn } from '@vueuse/core';
  import Color from './lib/color';
  import { isValidComponentSize } from './lib//validators';
  import type { PropType } from 'vue';
  import { ComponentSize } from './type/types';
  import { IUseOptions, OPTIONS_KEY } from './useOptions';

  const UPDATE_MODEL_EVENT = 'update:value';

  export default defineComponent({
    name: 'JnpfColorPicker',
    inheritAttrs: false,
    components: {
      HueSlider,
      SvPanel,
      preDefine,
      AlphaSlider,
      DownOutlined,
      CloseOutlined,
    },
    props: {
      value: {
        type: String,
      },
      showAlpha: {
        type: Boolean,
      },
      colorFormat: {
        type: String,
        default: '',
      },
      popperClass: {
        type: String,
      },
      predefine: {
        type: Array,
        default: () => [],
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      size: {
        type: String as PropType<ComponentSize>,
        validator: isValidComponentSize,
      },
    },
    emits: ['active-change', 'change', UPDATE_MODEL_EVENT],
    setup(props, { emit }) {
      // 区分popover的关闭是通过点击body关闭的还是通过按钮、输入框关闭的
      const hasClickBtn = ref<boolean>(false);
      const hue = ref<any>(null);
      const svPanel = ref<any>(null);
      const alpha = ref<any>(null);
      // data
      const color = reactive(
        new Color({
          enableAlpha: props.showAlpha,
          format: props.colorFormat,
        }),
      );
      const showPicker = ref(false);
      const showPanelColor = ref(false);
      const customInput = ref('');
      const formItemContext = Form.useInjectFormItemContext();
      // computed
      const displayedColor = computed(() => {
        if (!props.value && !showPanelColor.value) {
          return 'transparent';
        }
        return displayedRgb(color, props.showAlpha);
      });
      const colorSize = computed(() => {
        return props.size;
      });
      const colorDisabled = computed(() => {
        return props.disabled;
      });
      const currentColor = computed(() => {
        return !props.value && !showPanelColor.value ? '' : color.value;
      });
      // watch
      watch(
        () => props.value,
        newVal => {
          if (!newVal) {
            showPanelColor.value = false;
          } else if (newVal && newVal !== color.value) {
            color.fromString(newVal);
          }
        },
      );
      watch(
        () => currentColor.value,
        val => {
          customInput.value = val;
          emit('active-change', val);
        },
      );
      watch(
        () => color.value,
        () => {
          if (!props.value && !showPanelColor.value) {
            showPanelColor.value = true;
          }
        },
      );
      watch(
        () => showPicker.value,
        newVal => {
          if (newVal) {
            hasClickBtn.value = false;
          } else {
            if (!hasClickBtn.value) {
              hide();
            }
          }
          nextTick(() => {
            hue.value?.update();
            setTimeout(() => {
              svPanel.value?.update();
            }, 20);

            alpha.value?.update();
          });
        },
      );
      // methods
      function displayedRgb(color, showAlpha) {
        if (!(color instanceof Color)) {
          throw Error('color should be instance of _color Class');
        }
        const { r, g, b } = color.toRgb();
        return showAlpha ? `rgba(${r}, ${g}, ${b}, ${color.get('alpha') / 100})` : `rgb(${r}, ${g}, ${b})`;
      }
      function setShowPicker(value) {
        showPicker.value = value;
      }
      const debounceSetShowPicker = useDebounceFn(setShowPicker, 50);
      function hide() {
        debounceSetShowPicker(false);
        resetColor();
      }
      function resetColor() {
        nextTick(() => {
          if (props.value) {
            color.fromString(props.value);
          } else {
            showPanelColor.value = false;
          }
        });
      }
      function handleTrigger() {
        if (colorDisabled.value) return;
        debounceSetShowPicker(!showPicker.value);
      }
      function handleConfirm() {
        // hasClickBtn.value = true
        color.fromString(customInput.value);
      }
      function confirmValue() {
        hasClickBtn.value = true;
        const value = color.value;
        emit(UPDATE_MODEL_EVENT, value);
        emit('change', value);
        formItemContext.onFieldChange();
        debounceSetShowPicker(false);
        nextTick(() => {
          const newColor = new Color({
            enableAlpha: props.showAlpha,
            format: props.colorFormat,
          });
          newColor.fromString(props.value);
          if (!color.compare(newColor)) {
            resetColor();
          }
        });
        showPicker.value = false;
      }
      function clear() {
        hasClickBtn.value = true;
        debounceSetShowPicker(false);
        emit(UPDATE_MODEL_EVENT, null);
        emit('change', null);
        formItemContext.onFieldChange();
        resetColor();
        showPicker.value = false;
      }

      function getPopupContainer(triggerNode: HTMLElement) {
        return triggerNode.parentElement;
      }

      onMounted(() => {
        if (props.value) {
          color.fromString(props.value);
          customInput.value = currentColor.value;
        }
      });
      provide<IUseOptions>(OPTIONS_KEY, {
        currentColor,
      });
      return {
        showPicker,
        color: color as Color,
        customInput,
        displayedColor,
        colorSize,
        colorDisabled,
        svPanel,
        hue,
        alpha,
        showPanelColor,
        getPopupContainer,
        handleTrigger,
        handleConfirm,
        clear,
        confirmValue,
      };
    },
  });
</script>
<style lang="less" scoped>
  // default 大小
  .jnpf-color-picker {
    display: inline-block;
    position: relative;
    width: 36px;
    height: 36px;
    box-sizing: border-box;
    padding: 4px;
    border: 1px solid @border-color-base;
    border-radius: 2px;
    font-size: 0;
    cursor: pointer;
    &.is-disabled {
      color: #c0c4cc;
      cursor: not-allowed;
      background-color: #f5f5f5;
    }
    .ant-color-picker__color {
      box-sizing: border-box;
      position: relative;
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 2px;
      border: 1px solid @btn-info-color;
      text-align: center;
      &.is-alpha {
        background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==);
      }
    }
    .ant-color-picker__color-inner {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      font-size: 12px;
      line-height: 28px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .ant-color-dropdown__main-wrapper {
    display: flex;
    height: 180px;
    margin-bottom: 8px;
  }
  .ant-color-dropdown__btns {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    text-align: right;
  }
  .ant-color-dropdown__value {
    font-size: 12px;
    color: #000000;
  }
  .ant-cancel-button {
    margin-right: 6px;
  }

  // large 大小
  .jnpf-color-picker--large {
    width: 40px;
    height: 40px;
  }

  //small 大小
  .jnpf-color-picker--small {
    width: 32px;
    height: 32px;
  }
</style>
<style lang="less">
  html[data-theme='dark'] {
    .jnpf-color-picker {
      &.is-disabled {
        background-color: rgba(255, 255, 255, 0.08) !important;
      }
    }
  }
</style>
