<template>
  <div class="common-container">
    <a-select v-model:value="innerValue" v-bind="getSelectBindValue" :options="options" @change="onChange" @click="openSelectModal" />
    <a-modal
      v-model:visible="visible"
      :title="popupTitle"
      :width="1000"
      class="common-container-modal"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :maskClosable="false">
      <template #closeIcon>
        <ModalClose :canFullscreen="false" @cancel="handleCancel" />
      </template>
      <div class="jnpf-content-wrapper">
        <div class="jnpf-content-wrapper-left">
          <BasicLeftTree ref="leftTreeRef" :showSearch="false" :treeData="treeData" :loading="treeLoading" @select="handleTreeSelect" />
        </div>
        <div class="jnpf-content-wrapper-center">
          <div class="jnpf-content-wrapper-content">
            <BasicTable @register="registerTable" :searchInfo="searchInfo" class="jnpf-sub-table" />
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { getFlowEngineForEntrust, getFlowEngineListByIds } from '/@/api/workFlow/flowEngine';
  import { Form, Modal as AModal } from 'ant-design-vue';
  import { reactive, ref, unref, watch, computed } from 'vue';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { BasicLeftTree, TreeActionType } from '/@/components/Tree';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useBaseStore } from '/@/store/modules/base';
  import { cloneDeep, pick } from 'lodash-es';

  defineOptions({ inheritAttrs: false });
  const props = defineProps({
    value: { default: [] },
    popupTitle: { type: String, default: '选择流程' },
    placeholder: { type: String, default: '请选择' },
    disabled: { type: Boolean, default: false },
    allowClear: { type: Boolean, default: true },
    multiple: { type: Boolean, default: true },
    size: { type: String, default: 'default' },
  });
  const emit = defineEmits(['update:value', 'change']);
  const formItemContext = Form.useInjectFormItemContext();
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const innerValue = ref<string | string[] | undefined>(undefined);
  const visible = ref(false);
  const options = ref<any[]>([]);
  const columns: BasicColumn[] = [
    { title: '流程名称', dataIndex: 'fullName' },
    { title: '流程编码', dataIndex: 'enCode' },
    { title: '流程类型', dataIndex: 'dataType', width: 120, customRender: ({ record }) => (record.type == 0 ? '发起流程' : '功能流程') },
  ];
  const searchInfo = reactive({
    category: '',
  });
  const leftTreeRef = ref<Nullable<TreeActionType>>(null);
  const treeLoading = ref(false);
  const treeData = ref<any[]>([]);
  const [registerTable, { getForm, getSelectRows, setSelectedRowKeys, getSelectRowKeys, clearSelectedRowKeys }] = useTable({
    api: getFlowEngineForEntrust,
    columns,
    immediate: false,
    useSearchForm: true,
    formConfig: {
      baseColProps: { span: 8 },
      schemas: [
        {
          field: 'keyword',
          label: t('common.keyword'),
          component: 'Input',
          componentProps: {
            placeholder: t('common.enterKeyword'),
            submitOnPressEnter: true,
          },
        },
      ],
    },
    tableSetting: { size: false, setting: false },
    isCanResizeParent: true,
    resizeHeightOffset: -74,
    rowSelection: { type: 'checkbox' },
  });

  const getSelectBindValue = computed(() => {
    return {
      ...pick(props, ['disabled', 'size', 'allowClear', 'placeholder']),
      fieldNames: { label: 'fullName', value: 'id' },
      open: false,
      mode: props.multiple ? 'multiple' : '',
      showSearch: false,
      showArrow: true,
    };
  });

  watch(
    () => props.value,
    () => {
      setValue();
    },
    { immediate: true },
  );

  function setValue() {
    if (!props.value || !props.value.length) {
      innerValue.value = props.multiple ? [] : undefined;
      options.value = [];
      return;
    }
    const ids = props.multiple ? (props.value as any[]) : [props.value];
    getFlowEngineListByIds(ids).then(res => {
      const selectedList: any[] = res.data;
      const innerIds = selectedList.map(o => o.id);
      innerValue.value = props.multiple ? innerIds : innerIds[0];
      options.value = cloneDeep(selectedList);
    });
  }
  function onChange(val, option) {
    if (!val || !val.length) {
      options.value = [];
      emit('update:value', props.multiple ? [] : '');
      emit('change', '', props.multiple ? [] : {});
    } else {
      options.value = option;
      emit('update:value', val);
      emit('change', '', props.multiple ? options.value : options.value[0]);
    }
    formItemContext.onFieldChange();
  }
  async function openSelectModal() {
    if (props.disabled) return;
    visible.value = true;
    treeLoading.value = true;
    const firstItem = { id: '', encode: 'all', fullName: '全部流程' };
    const res = (await baseStore.getDictionaryData('WorkFlowCategory')) as any[];
    treeData.value = [firstItem, ...res];
    searchInfo.category = treeData.value[0].id;
    const leftTree = unref(leftTreeRef);
    leftTree?.setSelectedKeys([searchInfo.category]);
    treeLoading.value = false;
    getForm().resetFields();
    clearSelectedRowKeys();
    if (innerValue.value) {
      if (props.multiple) {
        setSelectedRowKeys(innerValue.value as string[]);
      } else {
        setSelectedRowKeys([innerValue.value as string]);
      }
    }
  }
  function handleTreeSelect(id) {
    if (searchInfo.category === id) return;
    searchInfo.category = id;
    getForm().resetFields();
  }
  function handleCancel() {
    visible.value = false;
  }
  function handleSubmit() {
    if (!getSelectRowKeys().length && !getSelectRows().length) {
      emit('update:value', props.multiple ? [] : '');
      emit('change', props.multiple ? [] : '', props.multiple ? [] : {});
      formItemContext.onFieldChange();
      handleCancel();
      return;
    }
    if (!getSelectRows().length) {
      emit('update:value', innerValue.value);
      emit('change', innerValue.value, props.multiple ? options.value : options.value[0]);
      formItemContext.onFieldChange();
      handleCancel();
      return;
    }
    if (props.multiple) {
      const newSelectRow = getSelectRows();
      for (let i = 0; i < newSelectRow.length; i++) {
        const item = newSelectRow[i];
        if (!options.value.some(o => o.id === item.id)) {
          options.value.push(item);
        }
      }
      innerValue.value = unref(options).map(o => o.id);
    } else {
      options.value = getSelectRows();
      innerValue.value = unref(options)[0].id;
    }
    emit('update:value', unref(innerValue));
    emit('change', unref(innerValue), props.multiple ? unref(options) : unref(options)[0]);
    formItemContext.onFieldChange();
    handleCancel();
  }
</script>
