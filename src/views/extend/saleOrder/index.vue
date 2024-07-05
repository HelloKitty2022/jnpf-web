<template>
  <div class="jnpf-content-wrapper h-full">
    <div class="jnpf-content-wrapper-center">
      <div class="sale-order-content">
        <BasicTable @register="registerTable" @row-click="handleRowClick">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="handleAdd()">{{ t('common.addText') }}</a-button>
            <a-button type="link" preIcon="icon-ym icon-ym-btn-edit" @click="handleUpdate()">{{ t('common.editText') }}</a-button>
            <a-button type="link" preIcon="icon-ym icon-ym-delete" @click="handleDel()">{{ t('common.delText') }}</a-button>
            <a-button type="link"><DownOutlined class="icon-more" style="margin-right: -8px" />{{ t('common.moreText') }} </a-button>
          </template>
          <template #bodyCell="{ column }">
            <template v-if="column.key === 'auditState'">
              <a-tag color="error">未审核</a-tag>
            </template>
            <template v-if="column.key === 'goodsState'">
              <a-tag color="error">未通知</a-tag>
            </template>
            <template v-if="column.key === 'closeState'">
              <a-tag color="error">未关闭</a-tag>
            </template>
          </template>
        </BasicTable>
      </div>
      <div class="sale-order-footer bg-white">
        <BasicTable @register="registerProductTable" :data-source="productList" @row-click="handleProductRowClick" />
        <BasicTable class="ml-10px" @register="registerProductDetailTable" :data-source="productDetailList" />
      </div>
    </div>
    <Form @register="registerForm" @reload="reload" />
  </div>
</template>
<script lang="ts" setup>
  import { reactive, toRefs } from 'vue';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { getOrderList, getProductEntry, delOrder } from '/@/api/extend/saleOrder';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { usePopup } from '/@/components/Popup';
  import { DownOutlined } from '@ant-design/icons-vue';
  import Form from './Form.vue';
  import { useMessage } from '/@/hooks/web/useMessage';

  defineOptions({ name: 'extend-saleOrder' });

  interface State {
    activeId: string;
    productList: any[];
    productDetailList: any[];
  }

  const state = reactive<State>({
    activeId: '',
    productList: [],
    productDetailList: [],
  });
  const { productList, productDetailList } = toRefs(state);
  const { t } = useI18n();
  const { createMessage, createConfirm } = useMessage();
  const columns: BasicColumn[] = [
    { title: '订单编号', dataIndex: 'code', width: 150 },
    { title: '客户名称', dataIndex: 'customerName', width: 150 },
    { title: '审核状态', dataIndex: 'auditState', width: 80 },
    { title: '发货通知状态', dataIndex: 'goodsState', width: 80 },
    { title: '关闭状态', dataIndex: 'closeState', width: 80 },
    { title: '关闭日期', dataIndex: 'closeDate', width: 120, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '业务员', dataIndex: 'business', width: 120 },
    { title: '送货地址', dataIndex: 'address', width: 120 },
    { title: '联系方式', dataIndex: 'contactTel', width: 120 },
  ];
  const productColumns: BasicColumn[] = [
    { title: '产品编号', dataIndex: 'productCode', width: 100 },
    { title: '产品名称', dataIndex: 'productName', width: 100 },
    { title: '发货通知数', dataIndex: 'qty', width: 100 },
    { title: '订货类型', dataIndex: 'type', width: 100 },
    { title: '活动', dataIndex: 'activity', width: 100 },
  ];
  const productColumns_: BasicColumn[] = [
    { title: '产品规格', dataIndex: 'productSpecification', width: 100 },
    { title: '数量', dataIndex: 'qty', width: 100 },
    { title: '单价', dataIndex: 'price', width: 100 },
    { title: '折后单价', dataIndex: 'money', width: 100 },
    { title: '控制方式', dataIndex: 'commandType', width: 100 },
    { title: '单位', dataIndex: 'util', width: 100 },
  ];
  const [registerTable, { reload, getSelectRows, clearSelectedRowKeys }] = useTable({
    api: getOrderList,
    columns,
    useSearchForm: true,
    formConfig: {
      schemas: [
        {
          field: 'code',
          label: '订单编号',
          component: 'Input',
          componentProps: { placeholder: '请输入' },
        },
        {
          field: 'customerName',
          label: '客户名称',
          component: 'Input',
          componentProps: { placeholder: '请输入' },
        },
        {
          field: 'auditState',
          label: '审核状态',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            options: [
              { id: 0, fullName: '全部' },
              { id: 1, fullName: '未审核' },
              { id: 2, fullName: '已审核' },
            ],
          },
        },
        {
          field: 'closeState',
          label: '关闭状态',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            options: [
              { id: 0, fullName: '全部' },
              { id: 1, fullName: '未审核' },
              { id: 2, fullName: '已审核' },
            ],
          },
        },
        {
          field: 'creatorUser',
          label: '制单人',
          component: 'Input',
          componentProps: { placeholder: '请输入' },
        },
      ],
    },
    rowSelection: { type: 'checkbox' },
    isCanResizeParent: true,
    clickToRowSelect: false,
  });
  const [registerProductTable] = useTable({
    columns: productColumns,
    useSearchForm: false,
    immediate: false,
    showTableSetting: false,
    pagination: false,
  });
  const [registerProductDetailTable] = useTable({
    columns: productColumns_,
    useSearchForm: false,
    immediate: false,
    showTableSetting: false,
    pagination: false,
  });
  const [registerForm, { openPopup: openFormPopup }] = usePopup();

  function handleRowClick(item) {
    if (state.activeId === item.id) return;
    state.activeId = item.id;
    getProductEntry(state.activeId).then(res => {
      state.productList = res.data.list;
    });
  }
  function handleProductRowClick(item) {
    state.productDetailList = item.dataList || [];
  }
  function handleAdd() {
    openFormPopup(true, {});
  }
  function handleUpdate() {
    const selectedList = getSelectRows();
    if (selectedList.length != 1) return createMessage.error('请只选择一条数据');
    openFormPopup(true, { id: selectedList[0].id });
  }
  function handleDel() {
    const selectedList = getSelectRows();
    if (selectedList.length != 1) return createMessage.error('请只选择一条数据');
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '此操作将永久删除该数据, 是否继续？',
      onOk: () => {
        delOrder(selectedList[0].id).then(res => {
          reload();
          state.productList = [];
          state.productDetailList = [];
          clearSelectedRowKeys();
          createMessage.success(res.msg);
        });
      },
    });
  }
</script>
<style lang="less" scoped>
  .sale-order-content {
    height: calc(100% - 300px);
  }

  .sale-order-footer {
    margin-top: 10px;
    height: 300px;
    flex-shrink: 0;
    display: flex;

    .jnpf-basic-table {
      width: 50%;
    }
  }
</style>
