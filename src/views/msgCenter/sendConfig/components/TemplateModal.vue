<template>
  <div class="common-container">
    <a-select v-model:value="innerValue" v-bind="getSelectBindValue" :options="options" @change="onChange" @click="openSelectModal" />
    <a-modal
      v-model:visible="visible"
      :title="props.type == 1 ? '选择模板' : '选择账号'"
      :width="600"
      class="jnpf-list-modal"
      @ok="handleSubmit"
      @cancel="handleCancel">
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
  import { getMsgTemplateList } from '/@/api/msgCenter/msgTemplate';
  import { getConfigList } from '/@/api/msgCenter/accountConfig';
  import { Form, Modal as AModal } from 'ant-design-vue';
  import { reactive, ref, watch, computed, nextTick } from 'vue';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { pick } from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';

  defineOptions({ inheritAttrs: false });
  const props = defineProps({
    value: { default: '' },
    title: { type: String, default: '' },
    messageType: { type: [String, Number], default: 0 },
    type: { type: Number, default: 1 },
    placeholder: { type: String, default: '请选择' },
    messageSource: { type: [String, Number], default: '' },
  });
  const emit = defineEmits(['update:value', 'change']);
  const formItemContext = Form.useInjectFormItemContext();
  const { t } = useI18n();
  const innerValue = ref(undefined);
  const visible = ref(false);
  const options = ref<any[]>([]);
  const { createMessage } = useMessage();
  const columns: BasicColumn[] = [
    { title: '名称', dataIndex: 'fullName' },
    { title: '编码', dataIndex: 'enCode', width: 180 },
  ];
  const searchInfo = reactive({
    enabledMark: 1,
  });
  const [registerTable, { getSelectRows, setSelectedRowKeys, getSelectRowKeys, reload }] = useTable({
    api: props.type === 1 ? getMsgTemplateList : getConfigList,
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
    pagination: false,
  });

  const getSelectBindValue = computed(() => {
    return {
      ...pick(props, ['disabled', 'size', 'allowClear']),
      fieldNames: { label: 'fullName', value: 'id' },
      placeholder: props.placeholder,
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
    options.value = [{ id: value, fullName: props.title }];
    innerValue.value = value || undefined;
  }
  function onChange(_val, option) {
    options.value = option ?? [];
    const selectValue = options.value.length ? options.value[0] : {};
    emit('change', innerValue.value, selectValue);
  }
  async function openSelectModal() {
    if (!props.messageType) return createMessage.warning('请选择消息类型');
    if (props.type == 1) {
      searchInfo['messageType'] = props.messageType;
      searchInfo['messageSource'] = props.messageSource;
    }
    if (props.type == 2) searchInfo['type'] = props.messageType;
    visible.value = true;
    nextTick(() => {
      reload();
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
    const selectRow = getSelectRows();
    options.value = selectRow;
    innerValue.value = selectRow[0].id;
    emit('update:value', innerValue.value);
    emit('change', innerValue.value, options.value[0]);
    formItemContext.onFieldChange();
    handleCancel();
  }
</script>
