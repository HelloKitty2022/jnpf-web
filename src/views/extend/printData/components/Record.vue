<template>
  <div class="record h-full" ref="printRef">
    <a-table class="record-table first-table" :data-source="tableData" :columns="columns" size="small" :pagination="false" bordered />
    <a-table class="record-table second-table" :data-source="tableData1" :columns="columns1" size="small" :pagination="false" bordered />
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';

  const printRef = ref();
  const columns = [
    {
      title: '基本信息',
      width: 800,
      children: [
        { title: '工号', dataIndex: 'data1', key: 'data1', width: 200 },
        { title: '100001', dataIndex: 'data2', key: 'data2', width: 200 },
        { title: '姓名', dataIndex: 'data3', key: 'data3', width: 200 },
        { title: '红幻波', dataIndex: 'data4', key: 'data4', width: 200 },
      ],
    },
  ];
  const columns1 = [
    {
      title: '受教育情况',
      width: 800,
      children: [
        { title: '时间范围', dataIndex: 'date', key: 'date', width: 200 },
        { title: '教育名称', dataIndex: 'education', key: 'education', width: 200 },
        { title: '获得奖励', dataIndex: 'reward', key: 'reward', width: 200 },
        { title: '证明人', dataIndex: 'prove', key: 'prove', width: 200 },
      ],
    },
  ];
  const tableData = [
    {
      data1: '性别',
      data2: '男',
      data3: '部门',
      data4: '技术部',
    },
    {
      data1: '用工性质',
      data2: '合同制',
      data3: '职位',
      data4: '通讯工程师',
    },
    {
      data1: '身份证号',
      data2: '35020419601122205X',
      data3: '联系电话',
      data4: '17708718904',
    },
    {
      data1: '出生年月',
      data2: '1988-11-22',
      data3: '参加工作',
      data4: '2007-12-06',
    },
    {
      data1: '最高学历',
      data2: '大学',
      data3: '学历期间',
      data4: '1992-1996',
    },
  ];
  const tableData1 = [
    {
      date: '1980-1986',
      education: '小学',
      reward: '优秀学生',
      prove: '小米',
    },
    {
      date: '1986-1989',
      education: '初中',
      reward: '三好学生',
      prove: '小明',
    },
    {
      date: '1989-1992',
      education: '高中',
      reward: '三好学生',
      prove: '李四',
    },
    {
      date: '1992-1996',
      education: '大学',
      reward: '',
      prove: '',
    },
  ];

  defineExpose({
    printRef,
  });
</script>
<style lang="less" scoped>
  .record {
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
    .record-table {
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
