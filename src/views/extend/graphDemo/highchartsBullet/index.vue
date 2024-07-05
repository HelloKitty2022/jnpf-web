<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center bg-white p-10px">
      <a-alert
        message="免责声明：Highcharts组件不属于JNPF产品，只用于介绍第三方组件如何在《JNPF快速开发平台》中使用。如果对这些组件感兴趣，请使用正版。"
        type="warning"
        show-icon
        class="!mb-30px" />
      <Chart :options="options1" class="h-130px !mb-30px" />
      <Chart :options="options2" class="h-80px !mb-30px" />
      <Chart :options="options3" class="h-80px" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive } from 'vue';
  import { Chart } from 'highcharts-vue';
  import Highcharts from 'highcharts';
  import highchartsBullet from 'highcharts/modules/bullet';
  highchartsBullet(Highcharts);

  defineOptions({ name: 'extend-graphDemo-highchartsBullet' });
  const options = reactive({
    accessibility: { enabled: false },
    chart: {
      inverted: true,
      marginLeft: 135,
      type: 'bullet',
    },
    title: {
      text: null,
    },
    legend: {
      enabled: false,
    },
    yAxis: {
      gridLineWidth: 0,
    },
    plotOptions: {
      series: {
        pointPadding: 0.25,
        borderWidth: 0,
        color: '#000',
        targetOptions: {
          width: '200%',
        },
      },
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: false,
    },
  });
  const options1 = reactive({
    ...options,
    title: {
      text: '2017 年公司运营情况',
    },
    xAxis: {
      categories: ['<span class="hc-cat-title">营收</span><br/> 千美元'],
    },
    yAxis: {
      plotBands: [
        {
          from: 0,
          to: 150,
          color: '#666',
        },
        {
          from: 150,
          to: 225,
          color: '#999',
        },
        {
          from: 225,
          to: 9e9,
          color: '#bbb',
        },
      ],
      title: null,
    },
    series: [
      {
        data: [
          {
            y: 275,
            target: 250,
          },
        ],
      },
    ],
    tooltip: {
      pointFormat: '<b>{point.y}</b> （目标值 {point.target}）',
    },
  });
  const options2 = reactive({
    ...options,
    xAxis: {
      categories: ['<span class="hc-cat-title">利润率</span><br/>%'],
    },
    yAxis: {
      plotBands: [
        {
          from: 0,
          to: 20,
          color: '#666',
        },
        {
          from: 20,
          to: 25,
          color: '#999',
        },
        {
          from: 25,
          to: 100,
          color: '#bbb',
        },
      ],
      labels: {
        format: '{value}%',
      },
      title: null,
    },
    series: [
      {
        data: [
          {
            y: 22,
            target: 27,
          },
        ],
      },
    ],
    tooltip: {
      pointFormat: '<b>{point.y}</b> （目标值 {point.target}）',
    },
  });
  const options3 = reactive({
    ...options,
    xAxis: {
      categories: ['<span class="hc-cat-title">新客户</span><br/>数量'],
    },
    yAxis: {
      plotBands: [
        {
          from: 0,
          to: 1400,
          color: '#666',
        },
        {
          from: 1400,
          to: 2000,
          color: '#999',
        },
        {
          from: 2000,
          to: 9e9,
          color: '#bbb',
        },
      ],
      labels: {
        format: '{value}',
      },
      title: null,
    },
    series: [
      {
        data: [
          {
            y: 1650,
            target: 2100,
          },
        ],
      },
    ],
    tooltip: {
      pointFormat: '<b>{point.y}</b> （目标值 {point.target}）',
    },
    credits: {
      enabled: false,
    },
  });
</script>
