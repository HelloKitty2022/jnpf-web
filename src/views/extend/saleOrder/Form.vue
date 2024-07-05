<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="getTitle" showOkBtn @ok="handleSubmit">
    <a-form :colon="false" :labelCol="{ style: { width: '90px' } }" class="!mr-10px">
      <a-row>
        <a-col :span="18">
          <a-row>
            <a-col :span="8">
              <a-form-item label="订单编码" name="code">
                <a-input v-model:value="dataForm.code" placeholder="提交后系统自动生成" readonly> </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="16">
              <a-form-item label="客户名称" name="customerName">
                <a-auto-complete v-model:value="dataForm.customerName" placeholder="请输入客户名称" :options="customOptions" @search="handleSearch">
                  <template #option="item">
                    <div class="sale-order-popper-item" @click="handleSelect(item)">
                      <span>{{ item.code }}</span>
                      <span class="name">{{ item.name }}</span>
                      <span>{{ item.address }}</span>
                      <span>{{ item.customerName }}</span>
                      <span>{{ item.contactTel }}</span>
                    </div>
                  </template>
                </a-auto-complete>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="8">
              <a-form-item label="联系方式" name="contactTel">
                <a-input v-model:value="dataForm.contactTel" placeholder="联系方式" />
              </a-form-item>
            </a-col>
            <a-col :span="16">
              <a-form-item label="送货地址" name="address">
                <a-input v-model:value="dataForm.address" placeholder="送货地址" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="8">
              <a-form-item label="发货仓库" name="goodsWarehouse">
                <jnpf-select v-model:value="dataForm.goodsWarehouse" placeholder="发货仓库" :options="storeOptions" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="业务员" name="business">
                <a-input v-model:value="dataForm.business" placeholder="业务员" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="收款方式" name="gatheringType">
                <jnpf-select v-model:value="dataForm.gatheringType" placeholder="选择收款方式" :options="options" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="8">
              <a-form-item label="让利金额" name="partPrice">
                <a-input v-model:value="dataForm.partPrice" placeholder="让利金额" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="优惠金额" name="reducedPrice">
                <a-input v-model:value="dataForm.reducedPrice" placeholder="优惠金额" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="折后金额" name="discountPrice">
                <a-input v-model:value="dataForm.discountPrice" placeholder="折后金额" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-col :span="24">
            <a-form-item label="备注">
              <a-textarea type="textarea" v-model:value="dataForm.description" placeholder="备注" :rows="3" />
            </a-form-item>
          </a-col>
        </a-col>
        <a-col :span="6">
          <a-form-item label="审核人" :labelCol="{ style: { width: '120px' } }" name="auditName">
            <a-input v-model:value="dataForm.auditName" disabled />
          </a-form-item>
          <a-form-item label="审核时间" :labelCol="{ style: { width: '120px' } }" name="auditDate">
            <a-input v-model:value="dataForm.auditDate" disabled />
          </a-form-item>
          <a-form-item label="发货通知人" :labelCol="{ style: { width: '120px' } }" name="goodsName">
            <a-input v-model:value="dataForm.goodsName" disabled />
          </a-form-item>
          <a-form-item label="发货通知时间" :labelCol="{ style: { width: '120px' } }" name="goodsDate">
            <a-input v-model:value="dataForm.goodsDate" disabled />
          </a-form-item>
          <a-form-item label="收货仓库" :labelCol="{ style: { width: '120px' } }" name="harvestWarehouse">
            <a-input v-model:value="dataForm.harvestWarehouse" disabled />
          </a-form-item>
          <a-form-item label="代发客户" :labelCol="{ style: { width: '120px' } }" name="issuingName">
            <a-input v-model:value="dataForm.issuingName" disabled />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="add-btn">
        <a-col :span="18">
          <productModal @change="onProductChange" />
        </a-col>
        <a-col :span="6">
          <a-form :labelCol="{ style: { width: '120px' } }">
            <a-form-item label="订货类型">
              <jnpf-select v-model:value="orderType" placeholder="选择订货类型" :options="orderTypeOptions" />
            </a-form-item>
          </a-form>
        </a-col>
      </a-row>
    </a-form>
    <BasicTable :data-source="dataForm.productEntryList" @register="registerTable">
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'action'">
          <a-button type="link" preIcon="ym-custom ym-custom-plus" @click="handleAddItem(index)"></a-button>
          <a-button type="link" danger preIcon="ym-custom ym-custom-minus" @click="handleDelItem(record)"></a-button>
        </template>
        <template v-if="column.key === 'productCode'">
          <a-auto-complete v-model:value="record.productCode" placeholder="商品编码" :options="productOptions" @search="handleProductSearch">
            <template #option="item">
              <div class="sale-order-popper-item" @click="handleProductSelect(item, index)">
                <span>{{ item.code }}</span>
                <span>{{ item.fullName }}</span>
                <span>{{ item.productSpecification }}</span>
              </div>
            </template>
          </a-auto-complete>
        </template>
        <template v-if="column.key === 'qty'">
          <a-input-number v-model:value="record.qty" placeholder="请输入" />
        </template>
        <template v-if="column.key === 'money'">
          <a-input-number v-model:value="record.money" placeholder="请输入" />
        </template>
      </template>
    </BasicTable>
    <div class="order-footer">
      <span class="order-footer-item">订单总数：0</span>
      <span class="order-footer-item">下单总数：0</span>
      <span class="order-footer-item">总金额(元)：{{ total }}</span>
    </div>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { ref, reactive, unref, computed, toRefs, watch } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { getInfo, createOrder, updateOrder, getGoodsSelector, getCustomer } from '/@/api/extend/saleOrder';
  import { toDecimal } from '/@/utils/jnpf';
  import productModal from './components/productModal.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    dataForm: any;
    options: any[];
    storeOptions: any[];
    customOptions: any[];
    productOptions: any[];
    orderTypeOptions: any[];
    orderType: string;
    total: number;
  }

  const state = reactive<State>({
    dataForm: {
      id: '',
      address: '',
      auditDate: '',
      auditName: '',
      business: '',
      code: '',
      contactTel: '',
      customerId: '',
      customerName: '',
      description: '',
      discountPrice: '',
      gatheringType: '',
      goodsDate: '',
      goodsName: '',
      goodsWarehouse: '',
      harvestMsg: 0,
      harvestWarehouse: '',
      issuingName: '',
      partPrice: '',
      reducedPrice: '',
      productEntryList: [],
    },
    options: [
      { fullName: '现金', id: '现金' },
      { fullName: '转帐', id: '转帐' },
      { fullName: '汇票', id: '汇票' },
    ],
    storeOptions: [
      { fullName: '仓库1', id: '仓库1' },
      { fullName: '仓库2', id: '仓库2' },
      { fullName: '仓库3', id: '仓库3' },
    ],
    customOptions: [],
    productOptions: [],
    orderTypeOptions: [
      { fullName: '1', id: '1' },
      { fullName: '2', id: '2' },
      { fullName: '3', id: '3' },
    ],
    orderType: '',
    total: 0,
  });
  const { dataForm, options, storeOptions, customOptions, orderType, orderTypeOptions, total, productOptions } = toRefs(state);

  const getTitle = computed(() => (!state.dataForm.id ? t('common.addText') : t('common.editText')));

  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const dataFormRef = ref();
  const columns: BasicColumn[] = [
    { title: '操作', dataIndex: 'action', width: 80 },
    { title: '商品编码', dataIndex: 'productCode', width: 200 },
    { title: '商品名称', dataIndex: 'productName', width: 100 },
    { title: '规格型号', dataIndex: 'productSpecification', width: 100 },
    { title: '订货类型', dataIndex: 'type', width: 100 },
    { title: '数量', dataIndex: 'qty', width: 120 },
    { title: '单价', dataIndex: 'money', width: 120 },
    { title: '金额', dataIndex: 'amount', width: 120 },
    { title: '备注', dataIndex: 'description', width: 120 },
  ];
  const [registerTable] = useTable({
    columns,
    useSearchForm: false,
    resizeHeightOffset: 40,
    showTableSetting: false,
    pagination: false,
  });
  const [registerPopup, { closePopup, changeLoading, changeOkLoading }] = usePopupInner(init);

  watch(
    () => unref(state.dataForm.productEntryList),
    val => {
      let money = 0;
      for (let i = 0; i < val.length; i++) {
        money += parseFloat(val[i].amount);
      }
      state.total = money;
    },
    {
      deep: true,
    },
  );

  function init(data) {
    resetData();
    state.dataForm.id = data.id || '';
    state.dataForm.productEntryList = [];
    if (state.dataForm.id) {
      changeLoading(true);
      dataFormRef.value?.resetFields();
      getInfo(state.dataForm.id).then(res => {
        state.dataForm = res.data;
        handleSearch(state.dataForm.customerName);
        changeLoading(false);
      });
    } else {
      handleSearch('');
      handleAddItem();
    }
  }
  function handleAddItem(index?) {
    let item = {
      productId: '',
      productCode: '',
      productName: '',
      productSpecification: '',
      qty: 1,
      money: 0,
      amount: 0,
      description: '',
      type: '',
    };
    (state.dataForm.productEntryList as any[]).splice(index + 1, 0, item);
    handleProductSearch('');
  }
  function handleDelItem(index) {
    state.dataForm.productEntryList.splice(index, 1);
  }
  function handleSearch(value) {
    getCustomer({ keyword: value }).then(res => {
      state.customOptions = res.data.list || [];
    });
  }
  function handleSelect(item) {
    state.dataForm.customerName = item.name;
    state.dataForm.customerId = item.id;
    state.dataForm.contactTel = item.contactTel;
    state.dataForm.address = item.address;
  }
  function handleProductSearch(value) {
    getGoodsSelector({ keyword: value }).then(res => {
      state.productOptions = res.data.list || [];
    });
  }
  function handleProductSelect(item, index) {
    state.dataForm.productEntryList[index].productId = item.id;
    state.dataForm.productEntryList[index].productCode = item.code;
    state.dataForm.productEntryList[index].productName = item.fullName;
    state.dataForm.productEntryList[index].productSpecification = item.productSpecification;
    state.dataForm.productEntryList[index].money = item.money;
    state.dataForm.productEntryList[index].type = item.type;
    state.dataForm.productEntryList[index].amount = toDecimal(
      parseFloat(state.dataForm.productEntryList[index].money) * parseFloat(state.dataForm.productEntryList[index].qty),
    );
  }
  async function handleSubmit() {
    const formMethod = state.dataForm.id ? updateOrder : createOrder;
    if (!state.dataForm.id) delete state.dataForm.id;
    changeOkLoading(true);
    formMethod(state.dataForm)
      .then(res => {
        createMessage.success(res.msg);
        closePopup();
        emit('reload');
        changeOkLoading(false);
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
  function onProductChange(list) {
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      let item = {
        productId: e.id,
        productCode: e.code,
        productName: e.fullName,
        productSpecification: e.productSpecification,
        qty: 1,
        money: e.money,
        amount: e.money,
        description: '',
        type: e.type,
      };
      state.dataForm.productEntryList.push(item);
    }
  }
  function resetData() {
    state.dataForm = {
      id: '',
      address: '',
      auditDate: '',
      auditName: '',
      business: '',
      code: '',
      contactTel: '',
      customerId: '',
      customerName: '',
      description: '',
      discountPrice: '',
      gatheringType: '',
      goodsDate: '',
      goodsName: '',
      goodsWarehouse: '',
      harvestMsg: 0,
      harvestWarehouse: '',
      issuingName: '',
      partPrice: '',
      reducedPrice: '',
      productEntryList: [],
    };
  }
</script>
<style lang="less" scoped>
  .sale-order-popper-item {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
    span {
      margin-right: 10px;
    }
    .name {
      color: #1890ff;
    }
  }
  .add-btn {
    margin: 20px 0 -10px 10px;
  }
  .order-footer {
    margin-top: 10px;
    text-align: right;
    font-size: 12px;
    .order-footer-item {
      display: inline-block;
      min-width: 150px;
      color: #606266;
      text-align: left;
    }
  }
</style>
