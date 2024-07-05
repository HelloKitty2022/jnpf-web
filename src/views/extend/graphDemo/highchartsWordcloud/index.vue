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
  import highchartsWordcloud from 'highcharts/modules/wordcloud';
  highchartsWordcloud(Highcharts);

  defineOptions({ name: 'extend-graphDemo-highchartsWordcloud' });
  const text =
    'Mountain no ling, river water is exhausted, winter thunder bursts, summer rain and snow, heaven and earth together, is dare and you must.At the same time, it is better to forget the leighton river than to help each other at the same time.';
  const data = text.split(/[,\. ]+/g).reduce(function (arr: any, word) {
    let obj: any = arr.find(function (obj: any) {
      return obj.name === word;
    });
    if (obj) {
      obj.weight += 1;
    } else {
      obj = {
        name: word,
        weight: 1,
      };
      arr.push(obj);
    }
    return arr;
  }, []);

  const options = reactive({
    accessibility: { enabled: false },
    series: [
      {
        type: 'wordcloud',
        data: data,
      },
    ],
    title: {
      text: '词云图',
    },
    credits: {
      enabled: false,
    },
  });
</script>
