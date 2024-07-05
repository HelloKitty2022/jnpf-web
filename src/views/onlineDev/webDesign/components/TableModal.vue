<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="数据选择" @ok="handleSubmit" :width="800" class="jnpf-list-modal">
    <BasicTable :searchInfo="searchInfo" @register="registerTable" class="jnpf-sub-table"></BasicTable>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { getDataModelList } from '/@/api/systemData/dataModel';
  import { reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';

  const emit = defineEmits(['register', 'select']);
  const { t } = useI18n();
  const [registerModal, { closeModal }] = useModalInner(init);
  const searchInfo = reactive<Recordable>({
    linkId: '0',
    pageSize: 1000000,
  });
  const [registerTable, { getForm, getSelectRows }] = useTable({
    api: getDataModelList,
    columns: [
      { title: '表名', dataIndex: 'table' },
      { title: '说明', dataIndex: 'tableName' },
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
  function init(data) {
    searchInfo.linkId = data.dbLinkId ?? '0';
    getForm().resetFields();
  }
  function handleSubmit() {
    const selectedData = getSelectRows();
    emit('select', selectedData);
    closeModal();
  }
</script>
