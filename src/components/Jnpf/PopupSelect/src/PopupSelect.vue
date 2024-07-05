<template>
  <div class="common-container">
    <a-select
      v-model:value="innerValue"
      v-bind="getSelectBindValue"
      :options="options"
      @change="onChange"
      @click="openSelectModal"
      v-if="popupType !== 'popover' || (popupType == 'popover' && !!disabled)" />
    <template v-if="popupType === 'dialog'">
      <a-modal
        v-model:visible="visible"
        :title="popupTitle"
        :width="popupWidth"
        class="common-container-modal"
        @ok="handleSubmit"
        @cancel="handleCancel"
        :maskClosable="false">
        <template #closeIcon>
          <ModalClose :canFullscreen="false" @cancel="handleCancel" />
        </template>
        <div class="jnpf-common-search-box jnpf-common-search-box-modal">
          <a-form :colon="false" labelAlign="right" :model="listQuery" ref="formElRef" :class="getFormClass">
            <a-row :gutter="10">
              <a-col :span="8">
                <a-form-item :label="t('common.keyword')" name="keyword">
                  <a-input v-model:value="listQuery.keyword" :placeholder="t('common.enterKeyword')" allowClear @pressEnter="handleSearch" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label=" ">
                  <a-button type="primary" class="mr-2" @click="handleSearch">{{ t('common.queryText') }}</a-button>
                  <a-button @click="handleReset">{{ t('common.resetText') }}</a-button>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
          <div class="jnpf-common-search-box-right">
            <a-tooltip placement="top">
              <template #title>
                <span>{{ t('common.redo') }}</span>
              </template>
              <RedoOutlined class="jnpf-common-search-box-right-icon" @click="initData" />
            </a-tooltip>
          </div>
        </div>
        <a-table :data-source="list" v-bind="getTableBindValues" @change="handleTableChange" ref="tableElRef"></a-table>
      </a-modal>
    </template>
    <template v-if="popupType === 'drawer'">
      <a-drawer :title="popupTitle" :width="popupWidth" v-model:visible="visible" :class="drawerPrefixCls + ' common-container-drawer'">
        <div class="common-container-drawer-body">
          <div class="jnpf-common-search-box jnpf-common-search-box-modal">
            <a-form :colon="false" labelAlign="right" :model="listQuery" ref="formElRef" :class="getFormClass">
              <a-row :gutter="10">
                <a-col :span="8">
                  <a-form-item :label="t('common.keyword')" name="keyword">
                    <a-input v-model:value="listQuery.keyword" :placeholder="t('common.enterKeyword')" allowClear @pressEnter="handleSearch" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item label=" ">
                    <a-button type="primary" class="mr-2" @click="handleSearch">{{ t('common.queryText') }}</a-button>
                    <a-button @click="handleReset">{{ t('common.resetText') }}</a-button>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
            <div class="jnpf-common-search-box-right">
              <a-tooltip placement="top">
                <template #title>
                  <span>{{ t('common.redo') }}</span>
                </template>
                <RedoOutlined class="jnpf-common-search-box-right-icon" @click="initData" />
              </a-tooltip>
            </div>
          </div>
          <a-table :data-source="list" v-bind="getTableBindValues" @change="handleTableChange" ref="tableElRef"></a-table>
        </div>
        <div :class="drawerFooterPrefixCls" :style="getDrawerFooterStyle">
          <a-button @click="handleCancel" class="mr-10px">{{ t('common.cancelText') }}</a-button>
          <a-button type="primary" @click="handleSubmit" class="mr-10px">{{ t('common.okText') }}</a-button>
        </div>
      </a-drawer>
    </template>
    <a-popover v-model:visible="visible" trigger="click" placement="bottom" v-if="popupType === 'popover' && !disabled" overlayClassName="popup-select-popover">
      <template #content>
        <div class="jnpf-common-search-box jnpf-common-search-box-modal">
          <a-form :colon="false" labelAlign="right" :model="listQuery" ref="formElRef" :class="getFormClass">
            <a-row :gutter="10">
              <a-col :span="8">
                <a-form-item :label="t('common.keyword')" name="keyword">
                  <a-input v-model:value="listQuery.keyword" :placeholder="t('common.enterKeyword')" allowClear @pressEnter="handleSearch" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label=" ">
                  <a-button type="primary" class="mr-2" @click="handleSearch">{{ t('common.queryText') }}</a-button>
                  <a-button @click="handleReset">{{ t('common.resetText') }}</a-button>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
          <div class="jnpf-common-search-box-right">
            <a-tooltip placement="top">
              <template #title>
                <span>{{ t('common.redo') }}</span>
              </template>
              <RedoOutlined class="jnpf-common-search-box-right-icon" @click="initData" />
            </a-tooltip>
          </div>
        </div>
        <a-table :data-source="list" v-bind="getTableBindValues" @change="handleTableChange" ref="tableElRef"></a-table>
        <a-space class="popover-bottom-btns" :size="10">
          <a-button @click="handleCancel">{{ t('common.cancelText') }}</a-button>
          <a-button type="primary" @click="handleSubmit">{{ t('common.okText') }}</a-button>
        </a-space>
      </template>
      <a-select v-model:value="innerValue" v-bind="getSelectBindValue" :options="options" @change="onChange" @click="openSelectModal" />
    </a-popover>
  </div>
</template>

<script lang="ts" setup>
  import { getDataInterfaceDataSelect, getDataInterfaceDataInfoByIds } from '/@/api/systemData/dataInterface';
  import { Form, Modal as AModal, Drawer as ADrawer } from 'ant-design-vue';
  import { ref, unref, watch, computed, nextTick, inject, reactive, toRefs, onMounted } from 'vue';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { cloneDeep, pick } from 'lodash-es';
  import { popupSelectProps } from './props';
  import { useGeneratorStore } from '/@/store/modules/generator';
  import { RedoOutlined } from '@ant-design/icons-vue';
  import type { FormInstance } from 'ant-design-vue';
  import type { CSSProperties } from 'vue';

  interface State {
    list: any[];
    listQuery: any;
    loading: boolean;
    total: number;
    selectedRowKeys: any[];
    selectedRows: any[];
    cacheSelectedRowKeys: any[];
    cacheSelectedRows: any[];
  }

  defineOptions({ name: 'JnpfPopupSelect', inheritAttrs: false });
  const props = defineProps(popupSelectProps);
  const emit = defineEmits(['update:value', 'change']);
  const attrs: any = useAttrs({ excludeDefaultKeys: false });
  const formItemContext = Form.useInjectFormItemContext();
  const generatorStore = useGeneratorStore();
  const emitter: any = inject('emitter');
  const { t } = useI18n();
  const { prefixCls: drawerPrefixCls } = useDesign('basic-drawer');
  const { prefixCls: formPrefixCls } = useDesign('basic-form');
  const { prefixCls: tablePrefixCls } = useDesign('basic-table');
  const { prefixCls: drawerFooterPrefixCls } = useDesign('basic-drawer-footer');
  const innerValue = ref<string | any[] | undefined>(undefined);
  const selectRow = ref<any>(null);
  const visible = ref(false);
  const options = ref<any[]>([]);
  const formElRef = ref<FormInstance>();
  const tableElRef = ref<any>(null);
  const indexColumn = { width: 50, title: '序号', dataIndex: 'index', key: 'index', align: 'center', customRender: ({ index }) => index + 1 };
  const state = reactive<State>({
    list: [],
    listQuery: {
      keyword: '',
      currentPage: 1,
      pageSize: 20,
    },
    loading: false,
    total: 0,
    selectedRowKeys: [],
    selectedRows: [],
    cacheSelectedRowKeys: [],
    cacheSelectedRows: [],
  });
  const { listQuery, list } = toRefs(state);

  const getFormClass = computed(() => {
    return [formPrefixCls, `${formPrefixCls}--compact`, 'search-form'];
  });
  const getDrawerFooterStyle = computed((): CSSProperties => {
    const heightStr = `60px`;
    return {
      height: heightStr,
      lineHeight: `calc(${heightStr} - 1px)`,
    };
  });
  const getColumns = computed<any[]>(() => {
    const columns = (props.columnOptions as any).map(o => ({ title: o.label, dataIndex: o.value, ellipsis: true }));
    return [indexColumn, ...columns];
  });
  const searchInfo = computed(() => {
    const paramList = getParamList();
    const info: any = {
      interfaceId: props.interfaceId,
      propsValue: props.propsValue,
      relationField: props.relationField,
      columnOptions: (props.columnOptions as any).map(o => o.value).join(','),
      paramList,
    };
    return info;
  });
  const getPagination = computed<any>(() => {
    if (!props.hasPage) return false;
    return {
      current: state.listQuery.currentPage,
      pageSize: state.listQuery.pageSize,
      size: 'small',
      defaultPageSize: state.listQuery.pageSize,
      showTotal: total => t('component.table.total', { total }),
      showSizeChanger: true,
      pageSizeOptions: ['20', '50', '80', '100'],
      showQuickJumper: true,
      total: state.total,
    };
  });
  const getRowSelection = computed<any>(() => ({
    type: props.multiple ? 'checkbox' : 'radio',
    selectedRowKeys: state.selectedRowKeys,
    onChange: setSelectedRowKeys,
  }));
  const getScrollY = computed(() => {
    if (props.popupType === 'popover') return 250;
    let height = props.popupType === 'drawer' ? window.innerHeight - 120 - 52 - 38 : window.innerHeight * 0.7 - 52 - 38;
    if (props.hasPage) height -= 44;
    return height;
  });
  const getTableBindValues = computed(() => {
    return {
      columns: unref(getColumns),
      pagination: unref(getPagination),
      rowSelection: unref(getRowSelection),
      size: 'small',
      loading: state.loading,
      rowKey: props.propsValue,
      scroll: {
        y: unref(getScrollY),
      },
      class: unref(tablePrefixCls),
    };
  });
  const getSelectBindValue = computed(() => {
    let className = unref(attrs).class ? 'w-full ' + unref(attrs).class : 'w-full';
    return {
      ...pick(props, ['size', 'disabled']),
      fieldNames: { label: unref(props).relationField, value: unref(props).propsValue },
      placeholder: unref(props).placeholder,
      mode: props.multiple ? 'multiple' : '',
      open: false,
      showSearch: false,
      showArrow: true,
      allowClear: props.disabled ? false : props.allowClear,
      class: className,
    };
  });

  watch(
    () => props.value,
    val => {
      setValue(val);
    },
    { immediate: true },
  );

  function setValue(value) {
    const relationData = generatorStore.getRelationData;
    if ((props.multiple && (!props.value || !(props.value as any[]).length)) || (!props.multiple && !props.value && props.value !== 0)) {
      setNullValue();
      return;
    }
    if (!props.interfaceId) return;
    const ids: any[] = props.multiple ? (props.value as any[]) : [props.value];
    if (!Array.isArray(ids)) return;
    if (!ids.length) return;
    const paramList = getParamList();
    const query = {
      ids,
      interfaceId: props.interfaceId,
      propsValue: props.propsValue,
      relationField: props.relationField,
      paramList,
    };
    getDataInterfaceDataInfoByIds(props.interfaceId, query).then(res => {
      if ((props.multiple && (!props.value || !(props.value as any[]).length)) || (!props.multiple && !props.value && props.value !== 0)) {
        setNullValue();
        return;
      }
      const data = res.data && res.data.length ? res.data[0] : {};
      innerValue.value = value;
      options.value = res.data;
      selectRow.value = res.data;
      state.selectedRowKeys = value;
      state.selectedRows = res.data;
      if (!props.field || props.multiple) return;
      relationData[props.field] = data;
      generatorStore.setRelationData(relationData);
      emitter.emit('setRelationData', { jnpfRelationField: props.field, ...data });
    });
  }
  function setNullValue() {
    const relationData = generatorStore.getRelationData;
    innerValue.value = props.multiple ? [] : undefined;
    options.value = [];
    selectRow.value = null;
    state.selectedRowKeys = [];
    state.selectedRows = [];
    if (!props.field || props.multiple) return;
    relationData[props.field] = {};
    generatorStore.setRelationData(relationData);
    emitter.emit('setRelationData', { jnpfRelationField: props.field });
  }
  function onChange(val, option) {
    if (!val || !val.length) {
      options.value = [];
      emit('update:value', props.multiple ? [] : '');
      emit('change', '', props.multiple ? [] : {});
      state.selectedRowKeys = [];
      state.selectedRows = [];
    } else {
      options.value = option;
      emit('update:value', val);
      emit('change', '', props.multiple ? options.value : options.value[0]);
    }
    const value = props.multiple ? val : [val];
    state.selectedRowKeys = state.selectedRowKeys.filter(o => value.some(l => l == o));
    state.selectedRows = state.selectedRows.filter(o => value.some(l => l == o[props.propsValue]));
    formItemContext.onFieldChange();
  }
  function getForm() {
    const form = unref(formElRef);
    if (!form) {
      throw new Error('form is null!');
    }
    return form;
  }
  async function openSelectModal() {
    if (props.disabled) return;
    visible.value = true;
    setTimeout(() => {
      nextTick(() => {
        handleReset();
        const tableEl = tableElRef.value?.$el;
        let bodyEl = tableEl.querySelector('.ant-table-body');
        bodyEl!.style.height = `${unref(getScrollY)}px`;
        if ((!props.multiple && innerValue.value) || (props.multiple && innerValue.value?.length)) {
          state.selectedRowKeys = props.multiple ? (innerValue.value as any[]) : [innerValue.value];
        } else {
          state.selectedRowKeys = [];
          state.selectedRows = [];
        }
        state.cacheSelectedRowKeys = cloneDeep(state.selectedRowKeys);
        state.cacheSelectedRows = cloneDeep(state.selectedRows);
      });
    }, 50);
  }
  function handleCancel() {
    visible.value = false;
    state.selectedRowKeys = cloneDeep(state.cacheSelectedRowKeys);
    state.selectedRows = cloneDeep(state.cacheSelectedRows);
  }
  function handleSubmit() {
    if (props.multiple) {
      updateSelectRow();
      options.value = selectRow.value;
      innerValue.value = unref(selectRow).map(o => o[props.propsValue]);
    } else {
      if (!state.selectedRowKeys.length && !state.selectedRows.length) return;
      if (!state.selectedRows.length) {
        emit('update:value', innerValue.value);
        emit('change', innerValue.value, props.multiple ? options.value : options.value[0]);
        formItemContext.onFieldChange();
        visible.value = false;
        return;
      }
      options.value = state.selectedRows;
      selectRow.value = state.selectedRows;
      innerValue.value = unref(selectRow)[0][props.propsValue];
    }
    emit('update:value', unref(innerValue));
    emit('change', unref(innerValue), props.multiple ? unref(selectRow) : unref(selectRow)[0]);
    formItemContext.onFieldChange();
    visible.value = false;
  }
  function updateSelectRow() {
    if (!selectRow.value) selectRow.value = [];
    const newSelectRow = state.selectedRows;
    for (let i = 0; i < newSelectRow.length; i++) {
      const item = newSelectRow[i];
      if (!selectRow.value.some(o => o[props.propsValue] === item[props.propsValue])) {
        selectRow.value.push(item);
      }
    }
    selectRow.value = selectRow.value.filter(
      o => !(state.list.some(l => l[props.propsValue] === o[props.propsValue]) && !newSelectRow.some(l => l[props.propsValue] === o[props.propsValue])),
    );
  }
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
  function handleSearch() {
    state.listQuery.currentPage = 1;
    state.listQuery.pageSize = props.hasPage ? props.pageSize : 100000;
    updateSelectRow();
    nextTick(() => initData());
  }
  function handleReset() {
    getForm().resetFields();
    state.listQuery.keyword = '';
    handleSearch();
  }
  function initData() {
    if (!props.interfaceId) return;
    state.loading = true;
    const query = {
      ...state.listQuery,
      ...unref(searchInfo),
    };
    getDataInterfaceDataSelect(query)
      .then(res => {
        state.list = res.data.list || [];
        state.total = res.data.pagination.total;
        state.loading = false;
      })
      .catch(() => {
        state.loading = false;
      });
  }
  function handleTableChange(pagination) {
    state.listQuery.currentPage = pagination.current;
    state.listQuery.pageSize = pagination.pageSize;
    updateSelectRow();
    nextTick(() => initData());
  }
  function setSelectedRowKeys(selectedRowKeys, selectedRows) {
    state.selectedRowKeys = selectedRowKeys;
    state.selectedRows = selectedRows;
  }

  onMounted(() => {
    state.listQuery.pageSize = props.hasPage ? props.pageSize : 100000;
  });
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
