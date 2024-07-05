<template>
  <div class="common-container">
    <a-input v-model:value="innerValue" v-bind="getSelectBindValue" @change="onChange">
      <template #addonAfter>
        <span @click="openSelectModal" class="cursor-pointer">选择</span>
      </template>
    </a-input>
    <a-modal
      v-model:visible="visible"
      :title="popupTitle"
      :width="1000"
      class="common-container-modal"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :maskClosable="false"
      destroy-on-close>
      <template #closeIcon>
        <ModalClose :canFullscreen="false" @cancel="handleCancel" />
      </template>
      <div class="jnpf-content-wrapper">
        <div class="jnpf-content-wrapper-left">
          <BasicLeftTree ref="leftTreeRef" :showSearch="false" :treeData="treeData" :loading="treeLoading" @select="handleTreeSelect" />
        </div>
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
  import { getTableInfoByTableName } from '/@/api/system/authorize';
  import { Form, Modal as AModal } from 'ant-design-vue';
  import { reactive, ref, unref, watch, computed, nextTick } from 'vue';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { BasicLeftTree, TreeActionType } from '/@/components/Tree';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { pick } from 'lodash-es';

  defineOptions({ inheritAttrs: false });
  const props = defineProps({
    value: { default: '' },
    title: { type: String, default: '' },
    popupTitle: { type: String, default: '字段名称' },
    disabled: { type: Boolean, default: false },
    allowClear: { type: Boolean, default: true },
    size: { type: String, default: 'default' },
    treeData: { type: Array, default: [] },
    menuType: { type: Number },
    dataType: { type: Number },
  });
  const emit = defineEmits(['update:value', 'change']);
  const formItemContext = Form.useInjectFormItemContext();
  const { t } = useI18n();
  const innerValue = ref(undefined);
  const visible = ref(false);

  const columns: BasicColumn[] = [
    { title: '名称', dataIndex: 'field' },
    { title: '说明', dataIndex: 'fieldName' },
  ];
  const searchInfo = reactive({
    linkId: '',
    tableName: '',
    menuType: 0,
    dataType: 0,
  });
  const { createMessage } = useMessage();
  const leftTreeRef = ref<Nullable<TreeActionType>>(null);
  const treeLoading = ref(false);
  const treeData = ref<any[]>([]);
  const [registerTable, { getForm, getSelectRows, getSelectRowKeys }] = useTable({
    api: getTableInfoByTableName,
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
    rowKey: 'field',
  });

  const getSelectBindValue = computed(() => {
    return {
      ...pick(props, ['disabled', 'size', 'allowClear']),
      placeholder: '请输入',
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
  }
  function onChange() {
    emit('change', innerValue.value);
  }
  async function openSelectModal() {
    if (props.disabled) return;
    if (!props.treeData.length) return createMessage.warning('请先进行数据连接！');
    visible.value = true;
    treeData.value = props.treeData ? props.treeData.map((o: any) => ({ fullName: o.tableName, id: o.tableName, dbLink: o.dbLink })) : [];
    searchInfo.tableName = treeData.value[0].fullName || '';
    searchInfo.linkId = treeData.value[0].dbLink || '';
    searchInfo.menuType = props.menuType || 0;
    searchInfo.dataType = props.dataType || 0;
    nextTick(() => {
      const leftTree = unref(leftTreeRef);
      leftTree?.setSelectedKeys([searchInfo.tableName]);
      getForm().resetFields();
    });
  }
  function handleTreeSelect(id) {
    if (!id || searchInfo.tableName === id) return;
    searchInfo.tableName = id;
    getForm().resetFields();
  }
  function handleCancel() {
    visible.value = false;
  }
  function handleSubmit() {
    if (!getSelectRowKeys().length && !getSelectRows().length) return;
    if (!getSelectRows().length) {
      emit('update:value', innerValue.value);
      emit('change', innerValue.value, searchInfo.tableName);
      formItemContext.onFieldChange();
      handleCancel();
      return;
    }
    const selectRow = getSelectRows()[0];
    innerValue.value = selectRow.field;
    emit('update:value', selectRow.field);
    emit('change', selectRow.field, searchInfo.tableName, selectRow.fieldName);
    formItemContext.onFieldChange();
    handleCancel();
  }
</script>
