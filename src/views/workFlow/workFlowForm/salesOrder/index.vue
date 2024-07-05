<template>
  <div class="flow-form">
    <div class="flow-com-title">
      <h1>销售订单</h1>
      <span class="number">流程编码：{{ dataForm.billNo }}</span>
    </div>
    <a-form :colon="false" :labelCol="{ style: { width: '100px' } }" :model="dataForm" :rules="dataRule" ref="formRef" :disabled="config.disabled">
      <a-row>
        <a-col :span="12" v-if="judgeShow('flowTitle')">
          <a-form-item label="流程标题" name="flowTitle">
            <a-input v-model:value="dataForm.flowTitle" placeholder="流程标题" :disabled="judgeWrite('flowTitle')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('customerName')">
          <a-form-item label="客户名称" name="customerName">
            <a-input v-model:value="dataForm.customerName" placeholder="客户名称" :disabled="judgeWrite('customerName')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('salesDate')">
          <a-form-item label="开单日期" name="salesDate">
            <jnpf-date-picker v-model:value="dataForm.salesDate" format="YYYY-MM-DD HH:mm:ss" placeholder="选择日期" :disabled="judgeWrite('salesDate')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('contacts')">
          <a-form-item label="联系人员" name="contacts">
            <a-input v-model:value="dataForm.contacts" placeholder="联系人员" :disabled="judgeWrite('contacts')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('contactPhone')">
          <a-form-item label="联系电话" name="contactPhone">
            <a-input v-model:value="dataForm.contactPhone" placeholder="联系电话" :disabled="judgeWrite('contactPhone')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('customerAddres')">
          <a-form-item label="客户地址" name="customerAddres">
            <a-input v-model:value="dataForm.customerAddres" placeholder="客户地址" :disabled="judgeWrite('customerAddres')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('salesman')">
          <a-form-item label="业务人员" name="salesman">
            <a-input v-model:value="dataForm.salesman" placeholder="业务人员" :disabled="judgeWrite('salesman')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('ticketNum')">
          <a-form-item label="发票编码" name="ticketNum">
            <a-input v-model:value="dataForm.ticketNum" placeholder="发票编码" :disabled="judgeWrite('ticketNum')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('paymentMethod')">
          <a-form-item label="付款方式" name="paymentMethod">
            <a-input v-model:value="dataForm.paymentMethod" placeholder="付款方式" :disabled="judgeWrite('paymentMethod')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('invoiceType')">
          <a-form-item label="发票类型" name="invoiceType">
            <a-radio-group v-model:value="dataForm.invoiceType" :disabled="judgeWrite('invoiceType')">
              <a-radio :value="item" v-for="item in invoiceTypeOptions" :key="item">{{ item }}</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('paymentMoney')">
          <a-form-item label="付款金额" name="paymentMoney">
            <a-input-number v-model:value="dataForm.paymentMoney" :min="0" placeholder="付款金额" :disabled="judgeWrite('paymentMoney')" />
          </a-form-item>
        </a-col>
        <a-col :span="24" v-if="judgeShow('fileJson')">
          <a-form-item label="相关附件" name="fileJson">
            <jnpf-upload-file v-model:value="fileList" type="workFlow" :disabled="judgeWrite('fileJson')" />
          </a-form-item>
        </a-col>
        <a-col :span="24" v-if="judgeShow('description')">
          <a-form-item label="开单备注" name="description">
            <jnpf-textarea v-model:value="dataForm.description" placeholder="开单备注" :disabled="judgeWrite('description')" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <template v-if="judgeShow('entryList')">
      <JnpfGroupTitle content="销售明细" :bordered="false" />
      <a-table :data-source="dataForm.entryList" :columns="getColumns" size="small" :pagination="false">
        <template #headerCell="{ column }"><span class="required-sign" v-if="judgeRequired(`entryList-${column.key}`)">*</span>{{ column.title }}</template>
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'goodsName'">
            <a-input v-model:value="record.goodsName" :disabled="judgeWrite('entryList') || judgeWrite('entryList-goodsName')" />
          </template>
          <template v-if="column.key === 'specifications'">
            <a-input v-model:value="record.specifications" :disabled="judgeWrite('entryList') || judgeWrite('entryList-specifications')" />
          </template>
          <template v-if="column.key === 'unit'">
            <a-input v-model:value="record.unit" :disabled="judgeWrite('entryList') || judgeWrite('entryList-unit')" />
          </template>
          <template v-if="column.key === 'qty'">
            <a-input-number v-model:value="record.qty" :min="0" @change="count(record)" :disabled="judgeWrite('entryList') || judgeWrite('entryList-qty')" />
          </template>
          <template v-if="column.key === 'price'">
            <a-input-number v-model:value="record.price" @change="count(record)" :disabled="judgeWrite('entryList') || judgeWrite('entryList-price')" />
          </template>
          <template v-if="column.key === 'amount'">
            <a-input-number v-model:value="record.amount" readonly :disabled="judgeWrite('entryList') || judgeWrite('entryList-amount')" />
          </template>
          <template v-if="column.key === 'description'">
            <a-input v-model:value="record.description" :disabled="judgeWrite('entryList') || judgeWrite('entryList-description')" />
          </template>
          <template v-if="column.key === 'action'">
            <a-button class="action-btn" type="link" color="error" @click="handleDel(index)" size="small">删除</a-button>
          </template>
        </template>
      </a-table>
      <div class="table-add-action" @click="handleAdd()" v-if="!(config.disabled || judgeWrite('entryList'))">
        <a-button type="link" preIcon="icon-ym icon-ym-btn-add">新增</a-button>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, toRefs, onMounted, ref, unref, computed } from 'vue';
  import { useFlowForm } from '/@/views/workFlow/workFlowForm/hooks/useFlowForm';
  import type { FormInstance } from 'ant-design-vue';
  import { toDecimal } from '/@/utils/jnpf';

  interface State {
    dataForm: any;
    dataRule: any;
    billEnCode: string;
    fileList: any[];
  }

  defineOptions({ name: 'SalesOrder' });
  const props = defineProps(['config']);
  const emit = defineEmits(['setPageLoad', 'eventReceiver']);

  const invoiceTypeOptions = ['普通发票', '专业发票', '其他'];
  const defaultColumns = [
    { title: '商品名称', dataIndex: 'goodsName', key: 'goodsName' },
    { title: '规格型号', dataIndex: 'specifications', key: 'specifications' },
    { title: '单位', dataIndex: 'unit', key: 'unit' },
    { title: '数量', dataIndex: 'qty', key: 'qty' },
    { title: '单价', dataIndex: 'price', key: 'price' },
    { title: '金额', dataIndex: 'amount', key: 'amount' },
    { title: '备注', dataIndex: 'description', key: 'description' },
  ];
  const formRef = ref<FormInstance>();
  const state = reactive<State>({
    dataForm: {
      flowId: '',
      id: '',
      billNo: '',
      flowTitle: '',
      flowUrgent: 1,
      customerName: '',
      contactPhone: '',
      contacts: '',
      customerAddres: '',
      salesman: '',
      ticketNum: '',
      paymentMethod: '',
      paymentMoney: '',
      description: '',
      fileJson: '',
      salesDate: undefined,
      invoiceType: '普通发票',
      entryList: [],
    },
    dataRule: {
      flowTitle: [{ required: true, message: '流程标题不能为空', trigger: 'blur' }],
      customerName: [{ required: true, message: '客户名称不能为空', trigger: 'blur' }],
      salesDate: [{ required: true, message: '开单日期不能为空', trigger: 'change' }],
      contactPhone: [{ pattern: /^1[3456789]\d{9}$|^0\d{2,3}-?\d{7,8}$/, message: '请输入正确的联系电话', trigger: 'blur' }],
    },
    billEnCode: 'WF_SalesOrderNo',
    fileList: [],
  });
  const { dataForm, dataRule, fileList } = toRefs(state);
  const { init, getUserInfo, judgeShow, judgeWrite, judgeRequired, dataFormSubmit } = useFlowForm({
    config: props.config,
    selfState: state,
    emit,
    formRef,
    selfInit,
  });

  defineExpose({ dataFormSubmit });

  const getColumns = computed(() => {
    const noColumn = { width: 50, title: '序号', dataIndex: 'index', key: 'index', align: 'center', customRender: ({ index }) => index + 1 };
    const actionColumn = !props.config.disabled && !judgeWrite('entryList') ? { title: '操作', dataIndex: 'action', key: 'action', width: 50 } : null;
    const column = defaultColumns.filter(o => judgeShow(`entryList-${o.key}`));
    const list = [noColumn, ...column];
    if (actionColumn) list.push(actionColumn);
    return list;
  });

  function selfInit() {
    state.dataForm.flowTitle = unref(getUserInfo).userName + '的销售订单';
  }
  function handleDel(index) {
    state.dataForm.entryList.splice(index, 1);
  }
  function handleAdd() {
    const item = { goodsName: '', specifications: '', unit: '', qty: 0, price: 0, amount: 0, description: '' };
    state.dataForm.entryList.push(item);
  }
  function count(record) {
    //金额 = 数量*单价
    record.amount = toDecimal(parseFloat(record.price) * parseFloat(record.qty));
  }

  onMounted(() => {
    init();
  });
</script>
