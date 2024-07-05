<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center bg-white p-10px">
      <a-alert
        message="免责声明：Highcharts组件不属于JNPF产品，只用于介绍第三方组件如何在《JNPF快速开发平台》中使用。如果对这些组件感兴趣，请使用正版。"
        type="warning"
        show-icon
        class="!mb-30px" />
      <Chart :options="options" class="h-500px" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive } from 'vue';
  import { Chart } from 'highcharts-vue';
  import Highcharts from 'highcharts';
  import highchartsFunnel from 'highcharts/modules/funnel';
  highchartsFunnel(Highcharts);

  defineOptions({ name: 'extend-graphDemo-highchartsFunnel' });

  const options = reactive({
    accessibility: { enabled: false },
    chart: {
      type: 'funnel',
      marginRight: 100,
    },
    title: {
      text: '销售漏斗',
      x: -50,
    },
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          crop: false,
          overflow: 'none',
          format: '<b>{point.name}</b> ({point.y:,.0f})',
          softConnector: true,
        },
        neckWidth: '30%',
        neckHeight: '25%',
      },
    },
    legend: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        name: '用户',
        data: [
          ['访问网站', 9654],
          ['下载产品', 4064],
          ['询价', 2987],
          ['商定', 1976],
          ['发送合同', 987],
          ['成交', 846],
        ],
      },
    ],
  });
</script>
