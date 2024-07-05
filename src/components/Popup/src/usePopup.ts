import type { UsePopupReturnType, PopupInstance, ReturnMethods, PopupProps, UsePopupInnerReturnType } from './typing';
import { ref, getCurrentInstance, unref, reactive, watchEffect, nextTick, toRaw, computed } from 'vue';
import { isProdMode } from '/@/utils/env';
import { isFunction } from '/@/utils/is';
import { tryOnUnmounted } from '@vueuse/core';
import { isEqual } from 'lodash-es';
import { error } from '/@/utils/log';

const dataTransferRef = reactive<any>({});

const visibleData = reactive<{ [key: number]: boolean }>({});

/**
 * @description: Applicable to separate popup and call outside
 */
export function usePopup(): UsePopupReturnType {
  if (!getCurrentInstance()) {
    throw new Error('usePopup() can only be used inside setup() or functional components!');
  }
  const popup = ref<PopupInstance | null>(null);
  const loaded = ref<Nullable<boolean>>(false);
  const uid = ref<string>('');

  function register(popupInstance: PopupInstance, uuid: string) {
    isProdMode() &&
      tryOnUnmounted(() => {
        popup.value = null;
        loaded.value = null;
        dataTransferRef[unref(uid)] = null;
      });

    if (unref(loaded) && isProdMode() && popupInstance === unref(popup)) {
      return;
    }
    uid.value = uuid;
    popup.value = popupInstance;
    loaded.value = true;

    popupInstance.emitVisible = (visible: boolean, uid: number) => {
      visibleData[uid] = visible;
    };
  }

  const getInstance = () => {
    const instance = unref(popup);
    if (!instance) {
      error('usePopup instance is undefined!');
    }
    return instance;
  };

  const methods: ReturnMethods = {
    setPopupProps: (props: Partial<PopupProps>): void => {
      getInstance()?.setPopupProps(props);
    },

    getVisible: computed((): boolean => {
      return visibleData[~~unref(uid)];
    }),

    openPopup: <T = any>(visible = true, data?: T, openOnSet = true): void => {
      getInstance()?.setPopupProps({
        visible: visible,
        confirmLoading: false,
      });
      if (!data) return;

      if (openOnSet) {
        dataTransferRef[unref(uid)] = null;
        dataTransferRef[unref(uid)] = toRaw(data);
        return;
      }
      const equal = isEqual(toRaw(dataTransferRef[unref(uid)]), toRaw(data));
      if (!equal) {
        dataTransferRef[unref(uid)] = toRaw(data);
      }
    },
    closePopup: () => {
      getInstance()?.setPopupProps({ visible: false });
    },
  };

  return [register, methods];
}

export const usePopupInner = (callbackFn?: Fn): UsePopupInnerReturnType => {
  const popupInstanceRef = ref<Nullable<PopupInstance>>(null);
  const currentInstance = getCurrentInstance();
  const uidRef = ref<string>('');

  if (!getCurrentInstance()) {
    throw new Error('usePopupInner() can only be used inside setup() or functional components!');
  }

  const getInstance = () => {
    const instance = unref(popupInstanceRef);
    if (!instance) {
      error('usePopupInner instance is undefined!');
      return;
    }
    return instance;
  };

  const register = (popupInstance: PopupInstance, uuid: string) => {
    isProdMode() &&
      tryOnUnmounted(() => {
        popupInstanceRef.value = null;
      });

    uidRef.value = uuid;
    popupInstanceRef.value = popupInstance;
    currentInstance?.emit('register', popupInstance, uuid);
  };

  watchEffect(() => {
    const data = dataTransferRef[unref(uidRef)];
    if (!data) return;
    if (!callbackFn || !isFunction(callbackFn)) return;
    nextTick(() => {
      callbackFn(data);
    });
  });

  return [
    register,
    {
      changeLoading: (loading = true) => {
        getInstance()?.setPopupProps({ loading });
      },

      changeOkLoading: (loading = true) => {
        getInstance()?.setPopupProps({ confirmLoading: loading });
      },

      changeContinueLoading: (loading = true) => {
        getInstance()?.setPopupProps({ continueLoading: loading });
      },

      getVisible: computed((): boolean => {
        return visibleData[~~unref(uidRef)];
      }),

      closePopup: () => {
        getInstance()?.setPopupProps({ visible: false });
      },

      setPopupProps: (props: Partial<PopupProps>) => {
        getInstance()?.setPopupProps(props);
      },
    },
  ];
};
