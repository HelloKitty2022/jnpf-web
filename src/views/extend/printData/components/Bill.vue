<template>
  <div class="bill h-full" ref="printRef">
    <h1 class="bill-title">水电费用清单汇总</h1>
    <a-table class="bill-table" :data-source="tableData" :columns="columns" size="small" :pagination="false" bordered />
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';

  const printRef = ref();
  const columns = [
    { title: '月份', dataIndex: 'month', key: 'month', width: 80 },
    {
      title: '2015',
      width: 80,
      children: [
        { title: '电费', dataIndex: 'electric1', key: 'electric1', width: 40 },
        { title: '水费', dataIndex: 'waterFee1', key: 'waterFee1', width: 40 },
      ],
    },
    {
      title: '2016',
      width: 80,
      children: [
        { title: '电费', dataIndex: 'electric2', key: 'electric2', width: 40 },
        { title: '水费', dataIndex: 'waterFee2', key: 'waterFee2', width: 40 },
      ],
    },
    {
      title: '2017',
      width: 80,
      children: [
        { title: '电费', dataIndex: 'electric3', key: 'electric3', width: 40 },
        { title: '水费', dataIndex: 'waterFee3', key: 'waterFee3', width: 40 },
      ],
    },
    {
      title: '2018',
      width: 80,
      children: [
        { title: '电费', dataIndex: 'electric4', key: 'electric4', width: 40 },
        { title: '水费', dataIndex: 'waterFee4', key: 'waterFee4', width: 40 },
      ],
    },
  ];
  const tableData = [
    {
      month: '1月份',
      electric1: '968.00',
      electric2: '734.00',
      electric3: '737.00',
      electric4: '651.00',
      waterFee1: '144.00',
      waterFee2: '241.00',
      waterFee3: '234.00',
      waterFee4: '179.00',
    },
    {
      month: '2月份',
      electric1: '968.00',
      electric2: '734.00',
      electric3: '737.00',
      electric4: '651.00',
      waterFee1: '144.00',
      waterFee2: '241.00',
      waterFee3: '234.00',
      waterFee4: '179.00',
    },
    {
      month: '3月份',
      electric1: '968.00',
      electric2: '734.00',
      electric3: '737.00',
      electric4: '651.00',
      waterFee1: '144.00',
      waterFee2: '241.00',
      waterFee3: '234.00',
      waterFee4: '179.00',
    },
    {
      month: '4月份',
      electric1: '968.00',
      electric2: '734.00',
      electric3: '737.00',
      electric4: '651.00',
      waterFee1: '144.00',
      waterFee2: '241.00',
      waterFee3: '234.00',
      waterFee4: '179.00',
    },
    {
      month: '5月份',
      electric1: '968.00',
      electric2: '734.00',
      electric3: '737.00',
      electric4: '651.00',
      waterFee1: '144.00',
      waterFee2: '241.00',
      waterFee3: '234.00',
      waterFee4: '179.00',
    },
    {
      month: '6月份',
      electric1: '968.00',
      electric2: '734.00',
      electric3: '737.00',
      electric4: '651.00',
      waterFee1: '144.00',
      waterFee2: '241.00',
      waterFee3: '234.00',
      waterFee4: '179.00',
    },
    {
      month: '7月份',
      electric1: '837.00',
      electric2: '518.00',
      electric3: '737.00',
      electric4: '651.00',
      waterFee1: '144.00',
      waterFee2: '241.00',
      waterFee3: '234.00',
      waterFee4: '179.00',
    },
    {
      month: '8月份',
      electric1: '938.00',
      electric2: '976.00',
      electric3: '923.00',
      electric4: '856.00',
      waterFee1: '180.00',
      waterFee2: '103.00',
      waterFee3: '285.00',
      waterFee4: '215.00',
    },
    {
      month: '9月份',
      electric1: '938.00',
      electric2: '976.00',
      electric3: '923.00',
      electric4: '856.00',
      waterFee1: '180.00',
      waterFee2: '103.00',
      waterFee3: '285.00',
      waterFee4: '215.00',
    },
    {
      month: '10月份',
      electric1: '938.00',
      electric2: '976.00',
      electric3: '923.00',
      electric4: '856.00',
      waterFee1: '180.00',
      waterFee2: '103.00',
      waterFee3: '285.00',
      waterFee4: '215.00',
    },
    {
      month: '11月份',
      electric1: '938.00',
      electric2: '976.00',
      electric3: '923.00',
      electric4: '856.00',
      waterFee1: '180.00',
      waterFee2: '103.00',
      waterFee3: '285.00',
      waterFee4: '215.00',
    },
    {
      month: '12月份',
      electric1: '938.00',
      electric2: '976.00',
      electric3: '923.00',
      electric4: '856.00',
      waterFee1: '180.00',
      waterFee2: '103.00',
      waterFee3: '285.00',
      waterFee4: '215.00',
    },
  ];

  defineExpose({
    printRef,
  });
</script>
<style lang="less" scoped>
  .bill {
    width: 100%;
    margin: 0 auto;
    text-align: center;
    background: @component-background;
    .bill-title {
      color: @text-color-label;
      font-size: 32px;
      padding: 20px 0;
    }
    .bill-table {
      width: 800px;
      margin: 0 auto;
      :deep(thead) {
        tr > th {
          background: @component-background;
        }
      }
    }
  }
</style>
