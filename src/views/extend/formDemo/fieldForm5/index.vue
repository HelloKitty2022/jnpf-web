<template>
  <div class="jnpf-content-wrapper jnpf-content-wrapper-form">
    <div class="jnpf-content-wrapper-form-body px-10px">
      <ScrollContainer>
        <div class="my-10px">
          <a-alert message="查询选择、客户选择、商品选择器" type="warning" :show-icon="false" />
        </div>
        <a-form :colon="false" :labelCol="{ style: { width: '110px' } }">
          <a-form-item label="客户名称">
            <jnpf-select v-model:value="dataForm.CustomerCode" :options="options" showSearch />
          </a-form-item>
          <a-form-item label="客户编码">
            <a-input v-model:value="dataForm.CustomerCode" placeholder="客户编码" readonly />
          </a-form-item>
          <a-form-item label="选择商品">
            <a-input v-model:value="dataForm.Goods" placeholder="选择商品">
              <template #addonAfter>
                <span @click="handleSelectGoods" class="cursor-pointer">选择</span>
              </template>
            </a-input>
          </a-form-item>
          <a-form-item label="商品编码">
            <a-input v-model:value="dataForm.GoodsCode" placeholder="商品编码" readonly />
          </a-form-item>
          <a-form-item label="规格型号">
            <a-input v-model:value="dataForm.Specifications" placeholder="规格型号" readonly />
          </a-form-item>
          <a-form-item label="单位">
            <a-input v-model:value="dataForm.Unit" placeholder="单位" readonly />
          </a-form-item>
          <a-form-item label="单价">
            <a-input v-model:value="dataForm.Price" placeholder="单价" readonly />
          </a-form-item>
        </a-form>
      </ScrollContainer>
    </div>
    <GoodsModal @register="registerGoodsModal" @select="onGoodsSelect" />
  </div>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, onMounted } from 'vue';
  import { ScrollContainer } from '/@/components/Container';
  import { getCustomerList } from '/@/api/extend/order';
  import GoodsModal from '/@/views/workFlow/workFlowForm/crmOrder/GoodsModal.vue';
  import { useModal } from '/@/components/Modal';

  defineOptions({ name: 'extend-formDemo-verifyForm4' });

  const state = reactive({
    dataForm: {
      CustomerName: '',
      CustomerCode: '',
      Goods: '',
      GoodsCode: '',
      Specifications: '',
      Unit: '',
      Price: '',
    },
    options: [],
  });
  const { dataForm, options } = toRefs(state);
  const [registerGoodsModal, { openModal: openGoodsModal }] = useModal();

  function init() {
    getCustomerList().then(res => {
      state.options = res.data.list.map(o => ({ fullName: o.text, ...o, id: o.code }));
    });
  }
  function handleSelectGoods() {
    openGoodsModal(true, {});
  }
  function onGoodsSelect(list) {
    let GoodsList: any[] = [];
    let GoodsCodeList: any[] = [];
    let SpecificationsList: any[] = [];
    let UnitList: any[] = [];
    let Price: any[] = [];
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      GoodsList.push(e.text);
      GoodsCodeList.push(e.code);
      SpecificationsList.push(e.specifications);
      UnitList.push(e.unit);
      Price.push(e.price);
    }
    state.dataForm.Goods = GoodsList.join(',');
    state.dataForm.GoodsCode = GoodsCodeList.join(',');
    state.dataForm.Specifications = SpecificationsList.join(',');
    state.dataForm.Unit = UnitList.join(',');
    state.dataForm.Price = Price.join(',');
  }

  onMounted(() => {
    init();
  });
</script>
<style lang="less" scoped>
  .ant-input,
  .ant-select,
  .ant-input-group-wrapper {
    width: 300px !important;
  }
</style>
