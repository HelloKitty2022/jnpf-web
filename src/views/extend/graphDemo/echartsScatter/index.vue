<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center bg-white p-10px">
      <Chart :options="options" class="mt-30px" height="500px" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive } from 'vue';
  import { Chart } from '/@/components/Chart';
  import ecStat from 'echarts-stat';

  defineOptions({ name: 'extend-graphDemo-echartsScatter' });

  const data = [
    [20, 60],
    [5, 11],
    [4, 19],
    [20, 80],
    [45, 90],
    [22, 34],
    [56, 78],
    [34, 66],
    [45, 90],
    [60, 89],
    [65, 120],
    [43, 87],
    [34, 65],
    [34, 45],
    [53, 87],
    [21, 39],
    [32, 76],
    [12, 54],
    [28, 73],
    [38, 87],
    [23, 24],
    [34, 65],
    [45, 43],
    [78, 100],
    [68, 72],
    [38, 70],
    [43, 72],
    [60, 93],
    [28, 58],
    [28, 54],
    [65, 98],
    [45, 80],
    [12, 30],
    [60, 94],
    [43, 63],
    [68, 102],
    [44, 89],
    [20, 48.32],
    [12, 38.78],
    [45, 78.49],
    [46.34, 88.49],
    [36.34, 65.49],
    [23.34, 43.34],
    [54.34, 98.34],
    [68.34, 106.49],
    [56.32, 91.34],
    [5.34, 31.49],
    [43.34, 74.34],
    [43.34, 76.49],
    [60.34, 99.49],
    [32.34, 65.49],
    [23.34, 54.79],
    [17.34, 43.49],
    [19.34, 45.49],
    [56.34, 88.49],
    [26.34, 65.49],
    [27.34, 85.49],
    [64.34, 110.49],
    [22, 45],
  ];
  const myRegression = ecStat.regression('linear', data, 1);
  myRegression.points.sort(function (a, b) {
    return a[0] - b[0];
  });
  const options = reactive({
    title: {
      text: '汽车速度与刹车距离',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    xAxis: {
      type: 'value',
      name: '汽车速度',
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '刹车距离',
      min: 1.5,
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'scatter',
        type: 'scatter',
        emphasis: {
          label: {
            show: true,
            position: 'left',
            color: 'blue',
            fontSize: 16,
          },
        },
        data: data,
      },
      {
        name: 'line',
        type: 'line',
        showSymbol: false,
        data: myRegression.points,
        markPoint: {
          itemStyle: {
            color: 'transparent',
          },
          label: {
            show: true,
            position: 'left',
            formatter: myRegression.expression,
            color: '#333',
            fontSize: 14,
          },
          data: [
            {
              coord: myRegression.points[myRegression.points.length - 1],
            },
          ],
        },
      },
    ],
  });
</script>
