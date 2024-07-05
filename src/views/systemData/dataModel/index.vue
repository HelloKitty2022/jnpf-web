<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
            <jnpf-upload-btn :url="getUploadUrl" accept=".bdb" @on-success="reload"></jnpf-upload-btn>
            <a-button type="link" preIcon="icon-ym icon-ym-btn-common" @click="handleFieldManage()">常用字段</a-button>
          </template>
          <template #expandedRowRender="{ record }">
            <BasicTable @register="registerSubTable" v-loading="record.childTableLoading" :data-source="record.childTable">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'allowNull'">
                  <a-checkbox :checked="record.allowNull === 1" />
                </template>
              </template>
            </BasicTable>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <TableAction stopButtonPropagation :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <Form @register="registerForm" @reload="reload" />
    <FieldList @register="registerDrawer" />
    <Preview @register="registerPopup" />
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, onMounted, computed } from 'vue';
  import { getDataModelList, delDataModel, getDataModelFieldList, exportTable } from '/@/api/systemData/dataModel';
  import { getDataSourceSelector } from '/@/api/systemData/dataSource';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDrawer } from '/@/components/Drawer';
  import { usePopup } from '/@/components/Popup';
  import Form from './Form.vue';
  import FieldList from './components/index.vue';
  import Preview from './Preview.vue';
  import { downloadByUrl } from '/@/utils/file/download';

  defineOptions({ name: 'systemData-dataModel' });

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerForm, { openPopup: openFormPopup }] = usePopup();
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerPopup, { openPopup: openPreviewPopup }] = usePopup();
  const linkId = ref('0');
  const dbType = ref('MySQL');

  const columns: BasicColumn[] = [
    { title: '表名', dataIndex: 'table', width: 300 },
    { title: '说明', dataIndex: 'tableName' },
  ];
  const [registerTable, { reload, getForm }] = useTable({
    api: getDataModelList,
    columns,
    useSearchForm: true,
    expandRowByClick: true,
    formConfig: {
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
        {
          field: 'linkId',
          label: '数据连接',
          component: 'Select',
          defaultValue: unref(linkId),
          componentProps: { placeholder: '请选择', allowClear: false, showSearch: true, fieldNames: { options: 'children' }, onChange: onLinkIdChange },
        },
      ],
    },
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
    },
    afterFetch: data => {
      const list = data.map(o => ({
        ...o,
        id: o.table + Math.random(),
      }));
      return list;
    },
    onExpand: handleExpand,
  });
  const [registerSubTable] = useTable({
    columns: [
      { title: '字段', dataIndex: 'field' },
      { title: '说明', dataIndex: 'fieldName' },
      { title: '类型', dataIndex: 'dataType' },
      { title: '长度', dataIndex: 'dataLength' },
      { title: '允许空', dataIndex: 'allowNull', width: 60, align: 'center' },
      { title: '默认值', dataIndex: 'defaults' },
    ],
    pagination: false,
    showTableSetting: false,
    canResize: false,
    scroll: { x: undefined },
  });

  const getUploadUrl = computed(() => `/api/system/DataModel/${unref(linkId)}/Actions/Import`);

  function getTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.editText'),
        onClick: addOrUpdateHandle.bind(null, record.table),
      },
      {
        label: t('common.delText'),
        color: 'error',
        modelConfirm: {
          onOk: handleDelete.bind(null, record.table),
        },
      },
    ];
  }
  function getDropDownActions(record): ActionItem[] {
    return [
      {
        label: '打开数据',
        onClick: handlePreview.bind(null, record.table),
      },
      {
        label: '导出',
        modelConfirm: {
          content: '您确定要导出该表, 是否继续?',
          onOk: handleExport.bind(null, record.table),
        },
      },
    ];
  }
  function onLinkIdChange(val, item) {
    linkId.value = val;
    dbType.value = item.dbType;
    setTimeout(() => {
      reload({ page: 1 });
    }, 0);
  }
  function addOrUpdateHandle(table = '') {
    openFormPopup(true, {
      table,
      linkId: unref(linkId),
      dbType: unref(dbType),
    });
  }
  function handleDelete(table) {
    delDataModel(unref(linkId), table).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handlePreview(table) {
    openPreviewPopup(true, { table, linkId: unref(linkId) });
  }
  function handleExport(table) {
    exportTable(unref(linkId), table).then(res => {
      downloadByUrl({ url: res.data.url });
    });
  }
  function handleFieldManage() {
    openDrawer(true);
  }
  async function getOptions() {
    const res = await getDataSourceSelector();
    const list = res.data.list.filter(o => o.children && o.children.length);
    if (list[0] && list[0].children && list[0].children.length) list[0] = list[0].children[0];
    delete list[0].children;
    dbType.value = list[0].dbType || 'MySQL';
    getForm().updateSchema({ field: 'linkId', componentProps: { options: list } });
  }
  function handleExpand(expanded, record) {
    if (!expanded || record.childTable?.length) return;
    record.childTableLoading = true;
    getDataModelFieldList(unref(linkId), record.table)
      .then(res => {
        record.childTableLoading = false;
        record.childTable = res.data.list;
      })
      .catch(() => {
        record.childTableLoading = false;
      });
  }

  onMounted(() => {
    getOptions();
  });
</script>
