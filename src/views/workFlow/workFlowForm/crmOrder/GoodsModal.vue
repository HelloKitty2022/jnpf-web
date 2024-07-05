<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="选择商品" @ok="handleSubmit" :width="800" class="jnpf-list-modal">
    <BasicTable @register="registerTable" class="jnpf-sub-table"></BasicTable>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { nextTick } from 'vue';
  import { getGoodsList } from '/@/api/extend/order';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';

  const emit = defineEmits(['register', 'select']);
  const { t } = useI18n();
  const [registerModal, { closeModal }] = useModalInner(init);

  const [registerTable, { getForm, getSelectRows, clearSelectedRowKeys }] = useTable({
    api: getGoodsList,
    columns: [
      { title: '商品名称', dataIndex: 'text' },
      { title: '商品编码', dataIndex: 'code', width: 100 },
      { title: '规格型号', dataIndex: 'specifications', width: 80 },
      { title: '单位', dataIndex: 'unit', width: 80 },
      { title: '售价', dataIndex: 'price', width: 80 },
    ],
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
    resizeHeightOffset: -63,
    pagination: false,
    immediate: false,
    rowSelection: { type: 'checkbox' },
  });
  function init() {
    getForm().resetFields();
    nextTick(() => {
      clearSelectedRowKeys();
    });
  }
  function handleSubmit() {
    const selectedData = getSelectRows();
    emit('select', selectedData);
    closeModal();
  }
</script>
