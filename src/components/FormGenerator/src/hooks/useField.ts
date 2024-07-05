import { useDebounceFn } from '@vueuse/core';
import { getDataInterfaceInfo } from '/@/api/systemData/dataInterface';
import { reactive, toRefs } from 'vue';

export function useField(activeData) {
  interface State {
    options: any[];
    allOptions: any[];
  }

  const state = reactive<State>({
    options: [],
    allOptions: [],
  });
  const { options, allOptions } = toRefs(state);
  const debounceOnSearch = useDebounceFn(onSearch, 300);

  function onSearch(searchText: string) {
    state.options = state.allOptions.filter(o => o.value.toLowerCase().indexOf(searchText.toLowerCase()) !== -1);
  }
  function onFocus(searchText) {
    onSearch(searchText);
  }
  function initFieldData() {
    const jnpfKey = activeData.__config__.jnpfKey;
    const list = ['popupTableSelect', 'popupSelect', 'autoComplete'];
    if (list.includes(jnpfKey)) {
      if (!activeData.interfaceId) return (state.allOptions = []);
    } else {
      if (activeData.__config__.dataType !== 'dynamic' || !activeData.__config__.propsUrl) return (state.allOptions = []);
    }
    const url = list.includes(jnpfKey) ? activeData.interfaceId : activeData.__config__.propsUrl;
    getDataInterfaceInfo(url).then(res => {
      const data = res.data;
      let list = data.fieldJson ? JSON.parse(data.fieldJson) : [];
      state.allOptions = list.map(o => ({ ...o, value: o.defaultValue }));
    });
  }

  return {
    options,
    allOptions,
    debounceOnSearch,
    onFocus,
    initFieldData,
  };
}
