<template>
  <div class="common-container">
    <a-select v-model:value="innerValue" v-bind="getSelectBindValue" :options="options" @change="onChange" @click="openSelectModal" />
    <a-modal v-model:visible="visible" title="数据选择" :width="800" class="jnpf-list-modal" @ok="handleSubmit" @cancel="handleCancel">
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
  import { getDataModelList } from '/@/api/systemData/dataModel';
  import { Form, Modal as AModal } from 'ant-design-vue';
  import { ref, watch, computed, nextTick } from 'vue';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { pick } from 'lodash-es';

  defineOptions({ inheritAttrs: false });
  const props = defineProps({
    value: { default: [] },
    disabled: { type: Boolean, default: false },
    allowClear: { type: Boolean, default: true },
    size: { type: String, default: 'default' },
    dbLinkId: { type: String, default: '0' },
  });
  const emit = defineEmits(['update:value', 'change']);
  const formItemContext = Form.useInjectFormItemContext();
  const { t } = useI18n();
  const innerValue = ref([]);
  const visible = ref(false);
  const options = ref<any[]>([]);

  const columns: BasicColumn[] = [
    { title: '表名', dataIndex: 'table' },
    { title: '说明', dataIndex: 'tableName' },
  ];
  const searchInfo = computed(() => {
    return { linkId: props.dbLinkId, pageSize: 1000000 };
  });
  const [registerTable, { getForm, getSelectRows, setSelectedRowKeys, getSelectRowKeys, reload }] = useTable({
    api: getDataModelList,
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
    pagination: false,
    rowKey: 'table',
  });

  const getSelectBindValue = computed(() => {
    return {
      ...pick(props, ['disabled', 'size', 'allowClear']),
      fieldNames: { label: 'table', value: 'table' },
      placeholder: '请选择',
      open: false,
      showSearch: false,
      showArrow: true,
      mode: 'multiple',
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
    options.value = value ? value.map(o => ({ table: o })) : [];
    innerValue.value = value || [];
  }
  function onChange(_val, option) {
    options.value = option ?? [];
    const selectValue = options.value.map(o => o.table);
    emit('change', selectValue);
  }
  async function openSelectModal() {
    if (props.disabled) return;
    visible.value = true;
    nextTick(() => {
      getForm()?.resetFields();
      setSelectedRowKeys(innerValue.value ? innerValue.value : []);
    });
  }
  function handleCancel() {
    visible.value = false;
  }
  function handleSubmit() {
    if (!getSelectRowKeys().length && !getSelectRows().length) return;
    if (!getSelectRows().length) {
      emit('update:value', innerValue.value);
      emit('change', innerValue.value, options.value);
      formItemContext.onFieldChange();
      handleCancel();
      return;
    }
    const selectRow = getSelectRows();
    options.value = selectRow;
    innerValue.value = selectRow.map(o => o.table) as any;
    emit('update:value', innerValue.value);
    emit('change', innerValue.value);
    formItemContext.onFieldChange();
    handleCancel();
  }
</script>
