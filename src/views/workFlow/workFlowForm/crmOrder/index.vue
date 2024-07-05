<template>
  <div class="flow-form">
    <a-form :colon="false" :labelCol="{ style: { width: '90px' } }" :model="dataForm" :rules="dataRule" ref="formRef" :disabled="config.disabled">
      <a-row>
        <a-col :span="6" v-if="judgeShow('customerName')">
          <a-form-item label="客户名称" name="customerName">
            <a-auto-complete
              v-model:value="dataForm.customerName"
              :options="customerOptions"
              placeholder="请输入"
              @select="onCustomerSelect"
              @search="onCustomerSearch"
              :disabled="judgeWrite('customerName')">
              <template #option="{ text }">{{ text }}</template>
            </a-auto-complete>
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="judgeShow('salesmanId')">
          <a-form-item label="业务人员" name="salesmanId">
            <jnpf-user-select v-model:value="dataForm.salesmanId" placeholder="选择人员" @change="onSalesmanIdChange" :disabled="judgeWrite('salesmanId')" />
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="judgeShow('orderDate')">
          <a-form-item label="订单日期" name="orderDate">
            <jnpf-date-picker v-model:value="dataForm.orderDate" format="YYYY-MM-DD HH:mm:ss" placeholder="选择日期" :disabled="judgeWrite('orderDate')" />
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="judgeShow('orderCode')">
          <a-form-item label="订单编码" name="orderCode">
            <a-input v-model:value="dataForm.orderCode" placeholder="订单编码" readonly :disabled="judgeWrite('orderCode')" />
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="judgeShow('paymentMode')">
          <a-form-item label="付款方式" name="paymentMode">
            <jnpf-select v-model:value="dataForm.paymentMode" :options="paymentOptions" placeholder="选择付款方式" :disabled="judgeWrite('paymentMode')" />
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="judgeShow('receivableMoney')">
          <a-form-item label="付款金额" name="receivableMoney">
            <a-input-number v-model:value="dataForm.receivableMoney" :min="0" placeholder="付款金额" :disabled="judgeWrite('receivableMoney')" />
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="judgeShow('earnestRate')">
          <a-form-item label="定金比率" name="earnestRate">
            <a-input-number v-model:value="dataForm.earnestRate" :min="0" placeholder="定金比率" :disabled="judgeWrite('earnestRate')" />
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="judgeShow('prepayEarnest')">
          <a-form-item label="预付定金" name="prepayEarnest">
            <a-input-number v-model:value="dataForm.prepayEarnest" :min="0" placeholder="预付定金" :disabled="judgeWrite('prepayEarnest')" />
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="judgeShow('transportMode')">
          <a-form-item label="运输方式" name="transportMode">
            <jnpf-select
              v-model:value="dataForm.transportMode"
              :options="transportOptions"
              placeholder="选择运输方式"
              :disabled="judgeWrite('transportMode')" />
          </a-form-item>
        </a-col>
        <a-col :span="6" v-if="judgeShow('deliveryDate')">
          <a-form-item label="发货日期" name="deliveryDate">
            <jnpf-date-picker v-model:value="dataForm.deliveryDate" placeholder="选择日期" :disabled="judgeWrite('deliveryDate')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('deliveryAddress')">
          <a-form-item label="发货地址" name="deliveryAddress">
            <a-input v-model:value="dataForm.deliveryAddress" placeholder="发货地址" :disabled="judgeWrite('deliveryAddress')" />
          </a-form-item>
        </a-col>
        <a-col :span="24" v-if="judgeShow('fileJson')">
          <a-form-item label="相关附件" name="fileJson">
            <jnpf-upload-file v-model:value="fileList" type="workFlow" :disabled="judgeWrite('fileJson')" />
          </a-form-item>
        </a-col>
        <a-col :span="24" v-if="judgeShow('description')">
          <a-form-item label="订单备注" name="description">
            <jnpf-textarea v-model:value="dataForm.description" placeholder="订单备注" :disabled="judgeWrite('description')" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <a-tabs v-model:activeKey="activeKey" size="small" v-if="config.formOperates">
      <a-tab-pane key="1" tab="订单商品">
        <a-table :data-source="dataForm.goodsList" :columns="getGoodsColumns" size="small" :pagination="false" v-if="judgeShow('goodsList')">
          <template #headerCell="{ column }"><span class="required-sign" v-if="judgeRequired(`goodsList-${column.key}`)">*</span>{{ column.title }}</template>
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'unit'">
              <a-input v-model:value="record.unit" :disabled="judgeWrite('goodsList') || judgeWrite('goodsList-unit')" />
            </template>
            <template v-if="column.key === 'qty'">
              <a-input-number v-model:value="record.qty" :min="0" @change="count(record)" :disabled="judgeWrite('goodsList') || judgeWrite('goodsList-qty')" />
            </template>
            <template v-if="column.key === 'price'">
              <a-input-number v-model:value="record.price" @change="count(record)" :disabled="judgeWrite('goodsList') || judgeWrite('goodsList-price')" />
            </template>
            <template v-if="column.key === 'amount'">
              <a-input-number v-model:value="record.amount" readonly :disabled="judgeWrite('goodsList') || judgeWrite('goodsList-amount')" />
            </template>
            <template v-if="column.key === 'discount'">
              <a-input-number
                v-model:value="record.discount"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="100"
                @change="count(record)"
                :disabled="judgeWrite('goodsList') || judgeWrite('goodsList-discount')" />
            </template>
            <template v-if="column.key === 'cess'">
              <a-input-number
                v-model:value="record.cess"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="100"
                @change="count(record)"
                :disabled="judgeWrite('goodsList') || judgeWrite('goodsList-cess')" />
            </template>
            <template v-if="column.key === 'actualPrice'">
              <a-input-number v-model:value="record.actualPrice" readonly :disabled="judgeWrite('goodsList') || judgeWrite('goodsList-actualPrice')" />
            </template>
            <template v-if="column.key === 'actualAmount'">
              <a-input-number v-model:value="record.actualAmount" readonly :disabled="judgeWrite('goodsList') || judgeWrite('goodsList-actualAmount')" />
            </template>
            <template v-if="column.key === 'description'">
              <a-input v-model:value="record.description" :disabled="judgeWrite('goodsList') || judgeWrite('goodsList-description')" />
            </template>
            <template v-if="column.key === 'action'">
              <a-button class="action-btn" type="link" color="error" @click="handleDel(index)" size="small">删除</a-button>
            </template>
          </template>
          <template #summary v-if="dataForm.goodsList.length">
            <a-table-summary fixed>
              <a-table-summary-row>
                <a-table-summary-cell v-for="(item, index) in getGoodsColumnSum" :key="index" :index="index">{{ item }}</a-table-summary-cell>
              </a-table-summary-row>
            </a-table-summary>
          </template>
        </a-table>
        <div class="table-add-action" @click="openGoodsModal(true, {})" v-if="!(config.disabled || judgeWrite('goodsList'))">
          <a-button type="link" preIcon="icon-ym icon-ym-btn-add">新增商品</a-button>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="收款计划">
        <a-table :data-source="dataForm.collectionPlanList" :columns="getPlanColumns" size="small" :pagination="false" v-if="judgeShow('collectionPlanList')">
          <template #headerCell="{ column }">
            <span class="required-sign" v-if="judgeRequired(`collectionPlanList-${column.key}`)">*</span>{{ column.title }}
          </template>
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'receivableDate'">
              <jnpf-date-picker
                v-model:value="record.receivableDate"
                :disabled="judgeWrite('collectionPlanList') || judgeWrite('collectionPlanList-receivableDate')" />
            </template>
            <template v-if="column.key === 'receivableRate'">
              <a-input-number
                v-model:value="record.receivableRate"
                :precision="2"
                :step="0.1"
                :min="0"
                :max="100"
                @change="count(record)"
                :disabled="judgeWrite('collectionPlanList') || judgeWrite('collectionPlanList-receivableRate')" />
            </template>
            <template v-if="column.key === 'receivableMoney'">
              <a-input-number
                v-model:value="record.receivableMoney"
                :disabled="judgeWrite('collectionPlanList') || judgeWrite('collectionPlanList-receivableMoney')" />
            </template>
            <template v-if="column.key === 'receivableMode'">
              <a-input v-model:value="record.receivableMode" :disabled="judgeWrite('collectionPlanList') || judgeWrite('collectionPlanList-receivableMode')" />
            </template>
            <template v-if="column.key === 'abstract'">
              <a-input v-model:value="record.abstract" :disabled="judgeWrite('collectionPlanList') || judgeWrite('collectionPlanList-abstract')" />
            </template>
            <template v-if="column.key === 'action'">
              <a-button class="action-btn" type="link" color="error" @click="handleDelPlan(index)" size="small">删除</a-button>
            </template>
          </template>
          <template #summary v-if="dataForm.collectionPlanList.length">
            <a-table-summary fixed>
              <a-table-summary-row>
                <a-table-summary-cell v-for="(item, index) in getPlanColumnSum" :key="index" :index="index">{{ item }}</a-table-summary-cell>
              </a-table-summary-row>
            </a-table-summary>
          </template>
        </a-table>
        <div class="table-add-action" @click="addPlan" v-if="!(config.disabled || judgeWrite('collectionPlanList'))">
          <a-button type="link" preIcon="icon-ym icon-ym-btn-add">新增计划</a-button>
        </div>
      </a-tab-pane>
    </a-tabs>
    <GoodsModal @register="registerGoodsModal" @select="onGoodsSelect" />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, toRefs, onMounted, ref, computed, watch, unref } from 'vue';
  import { getCustomerList } from '/@/api/extend/order';
  import { useFlowForm } from '/@/views/workFlow/workFlowForm/hooks/useFlowForm';
  import type { FormInstance } from 'ant-design-vue';
  import { toDecimal } from '/@/utils/jnpf';
  import { useModal } from '/@/components/Modal';
  import GoodsModal from './GoodsModal.vue';

  interface State {
    dataForm: any;
    dataRule: any;
    billEnCode: string;
    fileList: any[];
    activeKey: string;
  }

  defineOptions({ name: 'SalesOrder' });
  const props = defineProps(['config']);
  const emit = defineEmits(['setPageLoad', 'eventReceiver']);
  const [registerGoodsModal, { openModal: openGoodsModal }] = useModal();
  const paymentOptions = [
    { id: '现金', fullName: '现金' },
    { id: '转帐', fullName: '转帐' },
    { id: '汇票', fullName: '汇票' },
  ];
  const transportOptions = [
    { id: '快递', fullName: '快递' },
    { id: '物流', fullName: '物流' },
    { id: '配送', fullName: '配送' },
    { id: '自提', fullName: '自提' },
  ];
  const defaultGoodsColumns = [
    { title: '商品名称', dataIndex: 'goodsName', key: 'goodsName' },
    { title: '规格型号', dataIndex: 'specifications', key: 'specifications', width: 80 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
    { title: '数量', dataIndex: 'qty', key: 'qty', width: 80 },
    { title: '单价', dataIndex: 'price', key: 'price', width: 80 },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 80 },
    { title: '折扣%', dataIndex: 'discount', key: 'discount', width: 90 },
    { title: '税率%', dataIndex: 'cess', key: 'cess', width: 90 },
    { title: '实际单价', dataIndex: 'actualPrice', key: 'actualPrice', width: 80 },
    { title: '实际金额', dataIndex: 'actualAmount', key: 'actualAmount', width: 80 },
    { title: '备注', dataIndex: 'description', key: 'description', width: 80 },
  ];
  const defaultPlanColumns = [
    { title: '收款日期', dataIndex: 'receivableDate', key: 'receivableDate', width: 200 },
    { title: '收款比率%', dataIndex: 'receivableRate', key: 'receivableRate' },
    { title: '收款金额', dataIndex: 'receivableMoney', key: 'receivableMoney' },
    { title: '收款方式', dataIndex: 'receivableMode', key: 'receivableMode' },
    { title: '收款摘要', dataIndex: 'abstract', key: 'abstract' },
  ];
  const customerOptions = ref<any[]>([]);
  const formRef = ref<FormInstance>();
  const state = reactive<State>({
    dataForm: {
      id: '',
      customerName: '',
      salesmanId: '',
      orderDate: undefined,
      orderCode: '',
      paymentMode: '',
      receivableMoney: 0,
      earnestRate: 0,
      prepayEarnest: 0,
      transportMode: '',
      deliveryDate: undefined,
      deliveryAddress: '',
      description: '',
      customerId: '',
      salesmanName: '',
      goodsList: [],
      collectionPlanList: [],
      fileJson: '',
    },
    dataRule: {
      customerName: [{ required: true, message: '客户名称不能为空', trigger: 'click' }],
      salesmanId: [{ required: true, message: '业务人员不能为空', trigger: 'change' }],
      orderDate: [{ required: true, message: '订单日期不能为空', trigger: 'change' }],
      paymentMode: [{ required: true, message: '付款方式不能为空', trigger: 'change' }],
    },
    billEnCode: 'OrderNumber',
    fileList: [],
    activeKey: '1',
  });
  const { dataForm, dataRule, fileList, activeKey } = toRefs(state);
  const { init, judgeShow, judgeWrite, judgeRequired, dataFormSubmit } = useFlowForm({
    config: props.config,
    selfState: state,
    emit,
    formRef,
  });

  defineExpose({ dataFormSubmit });
  const noColumn = { width: 50, title: '序号', dataIndex: 'index', key: 'index', align: 'center', customRender: ({ index }) => index + 1 };

  const getGoodsColumns = computed(() => {
    const actionColumn = !props.config.disabled && !judgeWrite('goodsList') ? { title: '操作', dataIndex: 'action', key: 'action', width: 50 } : null;
    const column = defaultGoodsColumns.filter(o => judgeShow(`goodsList-${o.key}`));
    const list = [noColumn, ...column];
    if (actionColumn) list.push(actionColumn);
    return list;
  });
  const getGoodsColumnSum = computed(() => {
    const sums: any[] = [];
    unref(getGoodsColumns).forEach((column, index) => {
      if (index === 0) return (sums[index] = '合计');
      if (index === 1 || index === 2 || index === 11) return (sums[index] = '');
      let sumVal = state.dataForm.goodsList.reduce((sum, d) => sum + parseFloat(d[column.key]), 0);
      sumVal = Number.isNaN(sumVal) ? '' : sumVal;
      sums[index] = sumVal && !Number.isInteger(sumVal) ? sumVal.toFixed(2) : sumVal;
    });
    return sums;
  });
  const getPlanColumns = computed(() => {
    const actionColumn = !props.config.disabled && !judgeWrite('collectionPlanList') ? { title: '操作', dataIndex: 'action', key: 'action', width: 50 } : null;
    const column = defaultPlanColumns.filter(o => judgeShow(`collectionPlanList-${o.key}`));
    const list = [noColumn, ...column];
    if (actionColumn) list.push(actionColumn);
    return list;
  });
  const getPlanColumnSum = computed(() => {
    const sums: any[] = [];
    unref(getPlanColumns).forEach((column, index) => {
      if (index === 0) return (sums[index] = '合计');
      if (index === 1 || index === 4 || index === 5) return (sums[index] = '');
      let sumVal = state.dataForm.collectionPlanList.reduce((sum, d) => sum + parseFloat(d[column.key]), 0);
      sumVal = Number.isNaN(sumVal) ? '' : sumVal;
      sums[index] = sumVal && !Number.isInteger(sumVal) ? sumVal.toFixed(2) : sumVal;
    });
    return sums;
  });

  watch(
    () => state.dataForm.goodsList,
    val => {
      let money = 0;
      for (let i = 0; i < val.length; i++) {
        const e = val[i];
        money += parseFloat(e.actualAmount);
      }
      state.dataForm.receivableMoney = money.toFixed(2);
    },
    { deep: true },
  );

  function onCustomerSearch(searchText: string) {
    getCustomerList(searchText).then(res => {
      customerOptions.value = res.data.list.map(o => ({ value: o.text, label: o.text, ...o }));
    });
  }
  function onCustomerSelect(_value, option) {
    state.dataForm.customerId = option.id;
  }
  function onSalesmanIdChange(id, data) {
    if (!id) return (state.dataForm.salesmanName = '');
    state.dataForm.salesmanName = data.fullName;
  }
  function handleDel(index) {
    state.dataForm.goodsList.splice(index, 1);
  }
  function handleDelPlan(index) {
    state.dataForm.collectionPlanList.splice(index, 1);
  }
  function onGoodsSelect(list) {
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      let item = {
        goodsId: e.id,
        goodsCode: e.code,
        goodsName: e.text,
        specifications: e.specifications,
        unit: e.unit,
        qty: 1,
        price: e.price,
        amount: e.price,
        discount: 100,
        cess: 0,
        actualPrice: e.price,
        actualAmount: e.price,
        description: '',
      };
      state.dataForm.goodsList.push(item);
    }
  }
  function addPlan() {
    const item = { receivableDate: undefined, receivableRate: 0, receivableMoney: 0, receivableMode: '', abstract: '' };
    state.dataForm.collectionPlanList.push(item);
  }
  function count(record) {
    //金额 = 数量*单价
    record.amount = toDecimal(parseFloat(record.price) * parseFloat(record.qty));
    //折扣价 = (单价*折扣)
    const discountPrice = record.price * (record.discount ? record.discount / 100 : 1);
    //实际单价 = 折扣价 * (1 + (税率 / 100))
    record.actualPrice = toDecimal(discountPrice * (1 + (record.cess ? record.cess / 100 : 0)));
    //实际金额
    record.actualAmount = toDecimal(parseFloat(record.actualPrice) * parseFloat(record.qty));
  }

  onMounted(() => {
    init();
    onCustomerSearch('');
  });
</script>
<style lang="less" scoped>
  .ant-tabs {
    :deep(.ant-tabs-nav) {
      margin-bottom: 0;
    }
  }
</style>
