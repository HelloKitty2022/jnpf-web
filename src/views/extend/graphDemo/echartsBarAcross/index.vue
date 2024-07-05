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

  defineOptions({ name: 'extend-graphDemo-echartsBarAcross' });

  const options = reactive({
    title: {
      text: '世界人口总量',
      subtext: '网络数据',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['2017年', '2018年'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
    },
    yAxis: {
      type: 'category',
      data: ['巴西', '印尼', '美国', '印度', '中国', '世界人口(人)'],
    },
    series: [
      {
        name: '2017年',
        type: 'bar',
        data: [205290000, 257740000, 322760000, 1304200000, 1405372834, 7500000000],
      },
      {
        name: '2018年',
        type: 'bar',
        data: [210867954, 266794980, 326766748, 1354051854, 1394102196, 7577908055],
      },
    ],
  });
</script>
