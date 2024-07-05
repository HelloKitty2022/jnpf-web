<template>
  <div :class="[prefixCls, $attrs.class]" v-if="visibleRef">
    <PopupHeader v-bind="getProps" @close="onClose" @ok="handleOk">
      <template #[item]="data" v-for="item in Object.keys($slots)">
        <slot :name="item" v-bind="data || {}"></slot>
      </template>
    </PopupHeader>
    <div :class="prefixCls + '-body'">
      <ScrollContainer :style="getScrollContentStyle" v-loading="getLoading" :loading-tip="loadingText || t('common.loadingText')">
        <div :style="getBodyStyle">
          <slot></slot>
        </div>
      </ScrollContainer>
    </div>
  </div>
</template>
<script lang="ts">
  import type { PopupInstance, PopupProps } from './typing';
  import type { CSSProperties } from 'vue';
  import { defineComponent, ref, computed, watch, unref, nextTick, getCurrentInstance } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { isFunction, isNumber } from '/@/utils/is';
  import { deepMerge } from '/@/utils';
  import PopupHeader from './components/PopupHeader.vue';
  import { ScrollContainer } from '/@/components/Container';
  import { basicProps } from './props';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useAttrs } from '/@/hooks/core/useAttrs';

  export default defineComponent({
    components: { ScrollContainer, PopupHeader },
    inheritAttrs: false,
    props: basicProps,
    emits: ['visible-change', 'ok', 'close', 'register'],
    setup(props, { emit }) {
      const visibleRef = ref(false);
      const attrs = useAttrs({ excludeDefaultKeys: false });
      const propsRef = ref<Partial<Nullable<PopupProps>>>(null);

      const { t } = useI18n();
      const { prefixCls } = useDesign('basic-popup');

      const popupInstance: PopupInstance = {
        setPopupProps: setPopupProps,
        emitVisible: undefined,
      };

      const instance = getCurrentInstance();

      instance && emit('register', popupInstance, instance.uid);

      const getMergeProps = computed((): PopupProps => {
        return deepMerge(props, unref(propsRef)) as any;
      });

      const getProps = computed((): PopupProps => {
        const opt = {
          ...unref(attrs),
          ...unref(getMergeProps),
          visible: unref(visibleRef),
        };
        return opt as unknown as PopupProps;
      });

      const getBindValues = computed((): PopupProps => {
        return {
          ...attrs,
          ...unref(getProps),
        };
      });

      const getBodyStyle = computed((): CSSProperties => {
        const { width, zIndex } = unref(getProps);
        return {
          zIndex,
          width: !width ? '100%' : isNumber(width) ? `${width}px` : width,
          margin: '0 auto',
        };
      });
      const getScrollContentStyle = computed((): CSSProperties => {
        return {
          position: 'relative',
          height: `100%`,
        };
      });

      const getLoading = computed(() => {
        return !!unref(getProps)?.loading;
      });

      watch(
        () => props.visible,
        (newVal, oldVal) => {
          if (newVal !== oldVal) visibleRef.value = newVal;
        },
        { deep: true },
      );

      watch(
        () => visibleRef.value,
        visible => {
          nextTick(() => {
            emit('visible-change', visible);
            instance && popupInstance.emitVisible?.(visible, instance.uid);
          });
        },
      );

      // Cancel event
      async function onClose(e: Recordable) {
        const { closeFunc } = unref(getProps);
        emit('close', e);
        if (closeFunc && isFunction(closeFunc)) {
          const res = await closeFunc();
          visibleRef.value = !res;
          return;
        }
        visibleRef.value = false;
      }

      function setPopupProps(props: Partial<PopupProps>): void {
        // Keep the last setPopupProps
        propsRef.value = deepMerge(unref(propsRef) || ({} as any), props);
        if (Reflect.has(props, 'visible')) {
          visibleRef.value = !!props.visible;
        }
      }

      function handleOk() {
        emit('ok');
      }

      return {
        visibleRef,
        onClose,
        t,
        prefixCls,
        getMergeProps: getMergeProps as any,
        getBodyStyle,
        getScrollContentStyle,
        getProps: getProps as any,
        getLoading,
        getBindValues,
        handleOk,
      };
    },
  });
</script>
<style lang="less">
  @header-height: 60px;
  @prefix-cls: ~'@{namespace}-basic-popup';
  @prefix-cls-body: ~'@{namespace}-basic-popup-body';

  .@{prefix-cls} {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: @component-background;
    z-index: 900;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    &.full-popup {
      .@{prefix-cls-body}{
        & > .scrollbar {
         & > .scrollbar__bar {
             display: none !important;
         }
         & > .scrollbar__wrap {
           & > .scrollbar__view {
            height: 100%;
            overflow: hidden;
            padding: 0;
            & > div{
              height: 100%;
            }
          }
         }
        }
      }
    }
    .word-form{
      margin-bottom: 0;
    }

    .@{prefix-cls-body} {
      flex: 1;
      height: calc(100% - @header-height);
      padding: 0;
      background-color: @component-background;
      overflow: hidden;

       & > .scrollbar > .scrollbar__wrap {
        margin-bottom: 0 !important;
        & > .scrollbar__view {
          padding: 10px 0;
        }
      }

      > .scrollbar > .scrollbar__bar.is-horizontal {
        display: none;
      }
    }
  }
</style>
