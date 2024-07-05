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
  import { ref, onMounted } from 'vue';
  import { Chart } from 'highcharts-vue';
  import Highcharts from 'highcharts';

  defineOptions({ name: 'extend-graphDemo-highchartsPie' });

  const options = ref<any>({
    accessibility: { enabled: false },
  });

  function init() {
    let colors = Highcharts.getOptions().colors as any[],
      categories = ['Chrome', 'Firefox', 'Internet Explorer', 'Safari', 'Edge', 'Opera', 'Other'],
      data = [
        {
          y: 62.74,
          color: colors[4],
          drilldown: {
            name: 'Chrome',
            categories: [
              'Chrome v65.0',
              'Chrome v64.0',
              'Chrome v63.0',
              'Chrome v62.0',
              'Chrome v61.0',
              'Chrome v60.0',
              'Chrome v59.0',
              'Chrome v58.0',
              'Chrome v57.0',
              'Chrome v48.0',
              'Chrome v47.0',
              'Chrome v43.0',
              'Chrome v29.0',
            ],
            data: [0.1, 1.3, 53.02, 1.4, 0.88, 0.56, 0.45, 0.49, 0.32, 0.29, 0.79, 0.18, 0.13, 2.16, 0.13, 0.11, 0.17, 0.26],
          },
        },
        {
          y: 10.57,
          color: colors[5],
          drilldown: {
            name: 'Firefox',
            categories: [
              'Firefox v58.0',
              'Firefox v57.0',
              'Firefox v56.0',
              'Firefox v55.0',
              'Firefox v54.0',
              'Firefox v52.0',
              'Firefox v51.0',
              'Firefox v50.0',
              'Firefox v48.0',
              'Firefox v47.0',
            ],
            data: [1.02, 7.36, 0.35, 0.11, 0.1, 0.95, 0.15, 0.1, 0.31, 0.12],
          },
        },
        {
          y: 7.23,
          color: colors[2],
          drilldown: {
            name: 'Internet Explorer',
            categories: ['Internet Explorer v11.0', 'Internet Explorer v10.0', 'Internet Explorer v9.0', 'Internet Explorer v8.0'],
            data: [6.2, 0.29, 0.27, 0.47],
          },
        },
        {
          y: 5.58,
          color: colors[10],
          drilldown: {
            name: 'Safari',
            categories: ['Safari v11.0', 'Safari v10.1', 'Safari v10.0', 'Safari v9.1', 'Safari v9.0', 'Safari v5.1'],
            data: [3.39, 0.96, 0.36, 0.54, 0.13, 0.2],
          },
        },
        {
          y: 4.02,
          color: colors[9],
          drilldown: {
            name: 'Edge',
            categories: ['Edge v16', 'Edge v15', 'Edge v14', 'Edge v13'],
            data: [2.6, 0.92, 0.4, 0.1],
          },
        },
        {
          y: 1.92,
          color: colors[9],
          drilldown: {
            name: 'Opera',
            categories: ['Opera v50.0', 'Opera v49.0', 'Opera v12.1'],
            data: [0.96, 0.82, 0.14],
          },
        },
        {
          y: 7.62,
          color: colors[1],
          drilldown: {
            name: 'Other',
            categories: ['Other'],
            data: [7.62],
          },
        },
      ],
      browserData: any[] = [],
      versionsData: any[] = [],
      i,
      j,
      dataLen = data.length,
      drillDataLen,
      brightness;
    // Build the data arrays
    for (i = 0; i < dataLen; i += 1) {
      // add browser data
      browserData.push({
        name: categories[i],
        y: data[i].y,
        color: data[i].color,
      });
      // add version data
      drillDataLen = data[i].drilldown.data.length;
      for (j = 0; j < drillDataLen; j += 1) {
        brightness = 0.2 - j / drillDataLen / 5;
        versionsData.push({
          name: data[i].drilldown.categories[j],
          y: data[i].drilldown.data[j],
          // @ts-ignore
          color:new Highcharts.Color(data[i].color).brighten(brightness).get(),
        });
      }
    }
    options.value = {
      accessibility: { enabled: false },
      chart: {
        type: 'pie',
      },
      title: {
        text: '2018年1月浏览器市场份额',
      },
      subtitle: {
        text: '数据来源：<a href="http://statcounter.com" target="_blank">statcounter.com</a>',
      },
      yAxis: {
        title: {
          text: 'Total percent market share',
        },
      },
      plotOptions: {
        pie: {
          shadow: false,
          center: ['50%', '50%'],
        },
      },
      tooltip: {
        valueSuffix: '%',
      },
      credits: {
        enabled: false,
      },
      series: [
        {
          name: 'Browsers',
          data: browserData,
          size: '60%',
          dataLabels: {
            formatter: function () {
              return (this as any).y > 5 ? (this as any).point.name : null;
            },
            color: '#ffffff',
            distance: -30,
          },
        },
        {
          name: 'Versions',
          data: versionsData,
          size: '80%',
          innerSize: '60%',
          dataLabels: {
            formatter: function () {
              // display only if larger than 1
              return (this as any).y > 1 ? '<b>' + (this as any).point.name + ':</b> ' + (this as any).y + '%' : null;
            },
          },
          id: 'versions',
        },
      ],
      responsive: {
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 500,
              },
              chartOptions: {
                legend: {
                  layout: 'horizontal',
                  align: 'center',
                  verticalAlign: 'bottom',
                },
              },
            },
          ],
        },
      },
    };
  }

  onMounted(() => {
    init();
  });
</script>
