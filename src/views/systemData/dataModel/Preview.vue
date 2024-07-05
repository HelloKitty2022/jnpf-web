<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="getTitle" class="full-popup">
    <BasicTable :columns="columns" @register="registerTable" class="jnpf-sub-table"></BasicTable>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { previewDataModel, getDataModelFieldList } from '/@/api/systemData/dataModel';
  import { ref, computed, reactive } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';

  defineEmits(['register']);
  const { t } = useI18n();

  const [registerPopup] = usePopupInner(init);
  const columns = ref([]);
  const searchInfo = reactive({
    linkId: '',
    table: '',
  });

  const getTitle = computed(() => searchInfo.table + '表的数据');
  const [registerTable, { getForm }] = useTable({
    api: previewDataModel,
    searchInfo: searchInfo,
    useSearchForm: true,
    formConfig: {
      baseColProps: { span: 8 },
      schemas: [
        {
          field: 'field',
          label: '字段',
          component: 'Select',
          defaultValue: '',
          componentProps: { placeholder: '请选择', allowClear: false, showSearch: true, fieldNames: { value: 'field', label: 'field' } },
        },
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
    immediate: false,
  });
  function init(data) {
    searchInfo.linkId = data.linkId;
    searchInfo.table = data.table;
    getOptions(data);
  }
  async function getOptions({ linkId, table }) {
    const res = await getDataModelFieldList(linkId, table);
    columns.value = res.data.list.map(o => ({
      ...o,
      title: o.field,
      dataIndex: o.field.toLowerCase(),
    }));
    getForm().updateSchema({ field: 'field', componentProps: { options: res.data.list }, defaultValue: res.data.list[0].field });
    getForm().setFieldsValue({ field: res.data.list[0].field });
    getForm().submit();
  }
</script>
