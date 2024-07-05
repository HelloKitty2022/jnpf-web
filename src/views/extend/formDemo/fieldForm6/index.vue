<template>
  <div class="jnpf-content-wrapper jnpf-content-wrapper-form">
    <div class="jnpf-content-wrapper-form-body px-10px">
      <ScrollContainer>
        <div class="my-10px">
          <a-alert message="查询选择、客户选择、商品选择器" type="warning" :show-icon="false" />
        </div>
        <a-form :colon="false" :labelCol="{ style: { width: '110px' } }">
          <a-form-item label="用户邮箱">
            <a-col v-for="(item, i) in emailList" :key="i" class="align-center" :class="{ 'mt-10px': i != 0 }">
              <jnpf-select v-model:value="item.email" :options="options" showSearch placeholder="选择邮箱" />
              <a-input v-model:value="item.emailText" placeholder="" />
              <a-button type="danger" @click="handleDelete(i)" v-if="i != 0"><i class="icon-ym icon-ym-nav-close" /></a-button>
              <a-button type="primary" @click="handleAdd" style="" v-if="i == 0"><i class="icon-ym icon-ym-btn-add" /></a-button>
            </a-col>
          </a-form-item>
          <a-form-item label="产品评价" class="align-center">
            <a-rate v-model:value="rate" :tooltips="desc" /><span class="ant-rate-text">{{ desc[rate ? rate - 1 : 0] }}</span>
          </a-form-item>
          <a-form-item label="产品评价">
            <jnpf-color-picker v-model:value="color" />
          </a-form-item>
          <a-form-item label="产品评价">
            <jnpf-slider v-model:value="range" />
          </a-form-item>
          <a-form-item label="选择商品">
            <a-input placeholder="选择商品">
              <template #addonAfter>
                <span @click="handleSelectGoods" class="cursor-pointer">选择</span>
              </template>
            </a-input>
          </a-form-item>
          <JnpfGroupTitle content="订单详细" :bordered="false" />
          <BasicTable @register="registerTable" :data-source="list" />
        </a-form>
      </ScrollContainer>
    </div>
    <GoodsModal @register="registerGoodsModal" @select="onGoodsSelect" />
  </div>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, onMounted } from 'vue';
  import { ScrollContainer } from '/@/components/Container';
  import GoodsModal from '/@/views/workFlow/workFlowForm/crmOrder/GoodsModal.vue';
  import { useModal } from '/@/components/Modal';
  import { useBaseStore } from '/@/store/modules/base';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';

  defineOptions({ name: 'extend-formDemo-verifyForm4' });

  const state = reactive({
    options: [],
    emailList: [{ email: '', emailText: '' }],
    desc: ['极差', '失望', '一般', '满意', '惊喜'],
    rate: null,
    color: '',
    range: 50,
    list: [],
  });
  const { options, emailList, rate, color, desc, range, list } = toRefs(state);
  const [registerGoodsModal, { openModal: openGoodsModal }] = useModal();
  const columns: BasicColumn[] = [
    { title: '商品名称', dataIndex: 'text', width: 200 },
    { title: '商品编码', dataIndex: 'code', width: 200 },
    { title: '规格型号', dataIndex: 'specifications', width: 150 },
    { title: '单位', dataIndex: 'unit', width: 150 },
    { title: '售价', dataIndex: 'price', width: 150 },
  ];
  const baseStore = useBaseStore();
  const [registerTable] = useTable({
    columns,
    useSearchForm: false,
    pagination: false,
    showTableSetting: false,
    isCanResizeParent: true,
  });

  function handleSelectGoods() {
    openGoodsModal(true, {});
  }
  function onGoodsSelect(list) {
    state.list = [...state.list, ...list] as any;
  }
  function handleDelete(i) {
    state.emailList.splice(i, 1);
  }
  function handleAdd() {
    let emailItem = { email: '', emailText: '' };
    state.emailList.push(emailItem);
  }
  async function init() {
    state.options = (await baseStore.getDictionaryData('Email')) as any;
  }

  onMounted(() => {
    init();
  });
</script>
<style lang="less" scoped>
  .ant-input,
  .ant-select,
  .ant-slider,
  .ant-input-group-wrapper {
    width: 300px !important;
  }
  .align-center {
    display: flex;
    align-items: center;
  }
</style>
