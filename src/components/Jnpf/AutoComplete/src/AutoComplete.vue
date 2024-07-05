<template>
  <a-auto-complete v-bind="getBindValue" v-model:value="innerValue" :options="options" @search="debounceOnSearch" @change="onChange" @focus="onFocus">
    <template #[item]="data" v-for="item in Object.keys($slots)"><slot :name="item" v-bind="data || {}"></slot></template>
  </a-auto-complete>
</template>

<script lang="ts" setup>
  import { getDataInterfaceDataSelect } from '/@/api/systemData/dataInterface';
  import { Form } from 'ant-design-vue';
  import { unref, watch, computed, reactive, toRefs } from 'vue';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { autoCompleteProps } from './props';
  import { useDebounceFn } from '@vueuse/core';

  interface State {
    innerValue: any;
    options: any[];
  }

  defineOptions({ name: 'JnpfAutoComplete', inheritAttrs: false });
  const props = defineProps(autoCompleteProps);
  const emit = defineEmits(['update:value', 'change']);
  const attrs: any = useAttrs({ excludeDefaultKeys: false });
  const formItemContext = Form.useInjectFormItemContext();
  const state = reactive<State>({
    innerValue: undefined,
    options: [],
  });
  const { innerValue, options } = toRefs(state);

  const getBindValue = computed(() => ({
    ...unref(attrs),
    placeholder: props.placeholder,
    allowClear: props.allowClear,
    disabled: props.disabled,
  }));

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
  function onChange(val) {
    emit('update:value', val);
    emit('change', val);
    formItemContext.onFieldChange();
  }
  function onFocus() {
    onSearch(state.innerValue);
  }
  function onSearch(searchText: string) {
    if (!props.interfaceId) return (state.options = []);
    const paramList = getParamList();
    paramList.forEach(res => {
      if (res.relationField === '@keyword') res.defaultValue = searchText;
    });
    const query = {
      interfaceId: props.interfaceId,
      relationField: props.relationField,
      pageSize: 50,
      paramList,
    };
    getDataInterfaceDataSelect(query)
      .then(res => {
        if (!res.data.list) return (state.options = []);
        let list = res.data.list.map(o => ({ ...o, value: o[props.relationField] }));
        if (list.length) list = unique(list, props.relationField);
        state.options = props.total ? list.splice(0, props.total) : list;
      })
      .catch(() => {
        state.options = [];
      });
  }
  function unique(arr, attrName) {
    const res = new Map();
    // 根据对象的某个属性值去重
    return arr.filter(o => !res.has(o[attrName]) && res.set(o[attrName], 1));
  }
  const debounceOnSearch = useDebounceFn(onSearch, 200);
  function getParamList() {
    let templateJson: any[] = props.templateJson;
    if (!props.formData) return templateJson;
    for (let i = 0; i < templateJson.length; i++) {
      if (templateJson[i].relationField && templateJson[i].sourceType == 1) {
        if (templateJson[i].relationField.includes('-')) {
          let tableVModel = templateJson[i].relationField.split('-')[0];
          let childVModel = templateJson[i].relationField.split('-')[1];
          templateJson[i].defaultValue =
            (props.formData[tableVModel] &&
              props.formData[tableVModel][props.rowIndex as unknown as number] &&
              props.formData[tableVModel][props.rowIndex as unknown as number][childVModel]) ||
            '';
        } else {
          templateJson[i].defaultValue = props.formData[templateJson[i].relationField] || '';
        }
      }
    }
    return templateJson;
  }
</script>
<style lang="less">
  .popup-select-popover {
    .ant-popover-inner-content {
      width: 700px;
      overflow: hidden;
      padding: 10px;
      .popover-bottom-btns {
        margin-top: 10px;
        width: 100%;
        justify-content: flex-end;
      }
    }
  }
</style>
