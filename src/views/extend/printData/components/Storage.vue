<template>
  <div class="storage h-full" ref="printRef">
    <a-table class="storage-table first-table" :data-source="tableData" :columns="columns" size="small" :pagination="false" bordered />
    <a-table class="storage-table second-table" :data-source="tableData1" :columns="columns1" size="small" :pagination="false" bordered />
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';

  const printRef = ref();
  const columns = [
    {
      title: '配送信息',
      width: 800,
      children: [
        { title: '凭证日期', dataIndex: 'data1', key: 'data1', width: 200 },
        { title: '客户经理号', dataIndex: 'data2', key: 'data2', width: 200 },
        { title: '客户经理名', dataIndex: 'data3', key: 'data3', width: 200 },
      ],
    },
  ];
  const columns1 = [
    {
      title: '入账机构：黄河银行营业部',
      width: 800,
      children: [
        { title: '入库详情', width: 200, children: [{ title: '合同编码', dataIndex: 'data1', key: 'data1', width: 200 }] },
        {
          title: '电票测试二的电子银承汇票业务按要求办理以下物的抵（质）押，请你部按照本通知书要求，办理记账入库手续：',
          width: 600,
          children: [
            { title: '2147483647', dataIndex: 'data2', key: 'data2', width: 200 },
            { title: '客户编码', dataIndex: 'data3', key: 'data3', width: 200 },
            { title: '65000416', dataIndex: 'data4', key: 'data4', width: 200 },
          ],
        },
      ],
    },
  ];
  const tableData = [{ data1: '20151220', data2: '003503', data3: '马倩超' }];
  const tableData1 = [
    {
      data1: '贷款类型',
      data2: '承',
      data3: '客户名称',
      data4: '电票测试二',
    },
    {
      data1: '证件类型',
      data2: '组',
      data3: '证件号码',
      data4: '08265046-0',
    },
    {
      data1: '起始日期',
      data2: '20151220',
      data3: '到期日期',
      data4: '20210618',
    },
    {
      data1: '抵（质）押物编码',
      data2: '4000325119',
      data3: '抵（质）押物类型',
      data4: 'A0',
    },
    {
      data1: '抵（质）押物价值',
      data2: '80000.00',
      data3: '抵（质）押率(%)',
      data4: '75.000000',
    },
    {
      data1: '所有权人名称',
      data2: '电票测试二',
      data3: '所有权人证件类型',
      data4: '组织机构代码',
    },
    {
      data1: '所有权人证件号码',
      data2: '电票测试二',
      data3: '',
      data4: '接收人',
    },
    {
      data1: '交出人',
      data2: 'base.KONGGE',
      data3: '',
      data4: 'base.KONGGE',
    },
  ];

  defineExpose({
    printRef,
  });
</script>
<style lang="less" scoped>
  .storage {
    width: 100%;
    margin: 0 auto;
    text-align: center;
    background: @component-background;
    .first-table {
      padding-top: 20px;
    }
    .second-table {
      :deep(table) {
        border-top: none !important;
      }
    }
    .storage-table {
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
