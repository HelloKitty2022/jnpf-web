<template>
  <div class="common-container">
    <a-select v-model:value="innerValue" v-bind="getSelectBindValue" :options="options" @change="onChange" @click="openSelectModal" />
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
    <Detail ref="detailRef" />
  </div>
</template>

<script lang="ts" setup>
  import { getFieldDataSelect, getDataChange, getConfigData } from '/@/api/onlineDev/visualDev';
  import { Form, Modal as AModal, Drawer as ADrawer } from 'ant-design-vue';
  import { ref, unref, watch, computed, nextTick, inject, reactive, toRefs, onMounted } from 'vue';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { pick } from 'lodash-es';
  import { relationFormProps } from './props';
  import { useGeneratorStore } from '/@/store/modules/generator';
  import Detail from '/@/views/common/dynamicModel/list/detail/index.vue';
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
  }

  defineOptions({ name: 'JnpfRelationForm', inheritAttrs: false });
  const props = defineProps(relationFormProps);
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
  const detailRef = ref<any>(null);
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
    return {
      modelId: props.modelId,
      relationField: props.relationField,
      columnOptions: (props.columnOptions as any).map(o => o.value).join(','),
    };
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
    type: 'radio',
    selectedRowKeys: state.selectedRowKeys,
    onChange: setSelectedRowKeys,
  }));
  const getScrollY = computed(() => {
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
      rowKey: 'id',
      scroll: {
        y: unref(getScrollY),
      },
      class: unref(tablePrefixCls),
    };
  });
  const getSelectBindValue = computed(() => {
    let className = unref(attrs).class ? 'w-full ' + unref(attrs).class : 'w-full';
    if (props.disabled) className += ' disabled-select';
    return {
      ...pick(props, ['size']),
      fieldNames: { label: unref(props).relationField, value: 'id' },
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
    if ((props.multiple && !(props.value as any[]).length) || (!props.multiple && !props.value && props.value !== 0)) {
      setNullValue();
      return;
    }
    if (!props.modelId) return;
    if (!props.multiple) {
      getDataChange(props.modelId, value).then(res => {
        if ((props.multiple && !(props.value as any[]).length) || (!props.multiple && !props.value && props.value !== 0)) {
          setNullValue();
          return;
        }
        if (!res.data || !res.data.data) return;
        const data = JSON.parse(res.data.data);
        innerValue.value = value;
        options.value = [{ ...data, id: res.data.id }];
        if (!props.field) return;
        relationData[props.field] = { ...data, id: res.data.id };
        generatorStore.setRelationData(relationData);
        emitter.emit('setRelationData', { jnpfRelationField: props.field, ...data, id: res.data.id });
      });
    }
  }
  function setNullValue() {
    const relationData = generatorStore.getRelationData;
    innerValue.value = props.multiple ? [] : undefined;
    options.value = [];
    selectRow.value = null;
    if (!props.field) return;
    relationData[props.field] = {};
    generatorStore.setRelationData(relationData);
    emitter.emit('setRelationData', { jnpfRelationField: props.field });
  }
  function onChange() {
    options.value = [];
    emit('update:value', '');
    emit('change', '', {});
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
    if (props.disabled) {
      if (!props.value) return;
      getConfigData(props.modelId).then(res => {
        if (!res.data || !res.data.formData) return;
        const formConf = JSON.parse(res.data.formData);
        formConf.popupType = 'general';
        const data = { id: props.value, formConf, modelId: props.modelId };
        detailRef.value?.init(data);
      });
      return;
    }
    visible.value = true;
    nextTick(() => {
      handleReset();
      state.selectedRowKeys = innerValue.value ? [innerValue.value] : [];
      const tableEl = tableElRef.value?.$el;
      let bodyEl = tableEl.querySelector('.ant-table-body');
      bodyEl!.style.height = `${unref(getScrollY)}px`;
    });
  }
  function handleCancel() {
    visible.value = false;
  }
  function handleSubmit() {
    if (!state.selectedRowKeys.length && !state.selectedRows.length) return;
    if (!state.selectedRows.length) {
      emit('update:value', innerValue.value);
      emit('change', innerValue.value, options.value[0]);
      formItemContext.onFieldChange();
      handleCancel();
      return;
    }
    selectRow.value = state.selectedRows[0];
    options.value = state.selectedRows;
    innerValue.value = unref(selectRow).id;
    emit('update:value', unref(selectRow).id);
    emit('change', unref(selectRow).id, unref(selectRow));
    formItemContext.onFieldChange();
    handleCancel();
  }
  function handleSearch() {
    state.listQuery.currentPage = 1;
    state.listQuery.pageSize = props.hasPage ? props.pageSize : 10000;
    initData();
  }
  function handleReset() {
    getForm().resetFields();
    state.listQuery.keyword = '';
    handleSearch();
  }
  function initData() {
    if (!props.modelId || !props.relationField) return;
    state.loading = true;
    const query = {
      ...state.listQuery,
      ...unref(searchInfo),
    };
    getFieldDataSelect(query)
      .then(res => {
        state.list = res.data.list;
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
    initData();
  }
  function setSelectedRowKeys(selectedRowKeys, selectedRows) {
    state.selectedRowKeys = selectedRowKeys;
    state.selectedRows = selectedRows;
  }

  onMounted(() => {
    state.listQuery.pageSize = props.hasPage ? props.pageSize : 10000;
  });
</script>
