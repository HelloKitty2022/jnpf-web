<template>
  <div class="common-container">
    <a-select v-model:value="innerValue" v-bind="getSelectBindValue" :options="options" @change="onChange" @click="openSelectModal" />
    <a-modal
      v-model:visible="visible"
      title="选择流程"
      :width="800"
      class="common-container-modal"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :maskClosable="false">
      <template #closeIcon>
        <ModalClose :canFullscreen="false" @cancel="handleCancel" />
      </template>
      <div class="jnpf-content-wrapper">
        <div class="jnpf-content-wrapper-center">
          <div class="jnpf-content-wrapper-content">
            <BasicTable @register="registerTable" :searchInfo="searchInfo" class="jnpf-sub-table"></BasicTable>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { getFlowEnginePageChildList } from '/@/api/workFlow/flowEngine';
  import { Form, Modal as AModal } from 'ant-design-vue';
  import { reactive, ref, watch, computed, nextTick } from 'vue';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { pick } from 'lodash-es';

  defineOptions({ inheritAttrs: false });
  const props = defineProps({
    value: { default: '' },
    title: { type: String, default: '' },
    placeholder: { type: String, default: '请选择子流程' },
    disabled: { type: Boolean, default: false },
    allowClear: { type: Boolean, default: true },
    size: { type: String, default: 'default' },
    flowType: { type: Number, default: null },
  });
  const emit = defineEmits(['update:value', 'change']);
  const formItemContext = Form.useInjectFormItemContext();
  const { t } = useI18n();
  const innerValue = ref(undefined);
  const visible = ref(false);
  const options = ref<any[]>([]);
  const columns: BasicColumn[] = [
    { title: '流程名称', dataIndex: 'fullName' },
    { title: '所属流程', dataIndex: 'flowName' },
    {
      title: '流程类型',
      dataIndex: 'flowType',
      width: 100,
      customRender: ({ record }) => (record.flowType == 1 ? '功能流程' : '发起流程'),
    },
  ];
  const searchInfo = reactive({
    flowType: props.flowType,
  });
  const [registerTable, { getForm, getSelectRows, setSelectedRowKeys, getSelectRowKeys }] = useTable({
    api: getFlowEnginePageChildList,
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
    rowSelection: { type: 'radio' },
  });

  const getSelectBindValue = computed(() => {
    return {
      ...pick(props, ['disabled', 'size', 'allowClear', 'placeholder']),
      fieldNames: { label: 'fullName', value: 'id' },
      open: false,
      showSearch: false,
      showArrow: true,
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
    innerValue.value = value || undefined;
    options.value = [{ id: innerValue.value, fullName: props.title }];
  }
  function onChange() {
    options.value = [];
    emit('change', '', {});
  }
  async function openSelectModal() {
    if (props.disabled) return;
    visible.value = true;
    nextTick(() => {
      getForm().resetFields();
      setSelectedRowKeys(innerValue.value ? [innerValue.value] : []);
    });
  }
  function handleCancel() {
    visible.value = false;
  }
  function handleSubmit() {
    if (!getSelectRowKeys().length && !getSelectRows().length) return;
    if (!getSelectRows().length) {
      emit('update:value', innerValue.value);
      emit('change', innerValue.value, options.value[0]);
      formItemContext.onFieldChange();
      handleCancel();
      return;
    }
    const selectRow = getSelectRows()[0];
    options.value = getSelectRows();
    innerValue.value = selectRow.id;
    emit('update:value', selectRow.id);
    emit('change', selectRow.id, selectRow);
    formItemContext.onFieldChange();
    handleCancel();
  }
</script>
