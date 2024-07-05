import CardHeader from '../../Portal/CardHeader/index.vue';
import * as echarts from 'echarts';
import { getDataInterfaceRes } from '/@/api/systemData/dataInterface';
import { reactive, toRefs, watch, Ref, inject, nextTick } from 'vue';
import { chartData as defaultChartData } from '../helper/dataMap';
import { useECharts } from '/@/hooks/web/useECharts';
import { getParamList } from '/@/utils/jnpf';

export function useEChart(activeData, chartRef) {
  interface State {
    currOption: any;
    chartData: any[];
  }
  const state = reactive<State>({
    currOption: {},
    chartData: [],
  });
  const { chartData, currOption } = toRefs(state);
  const { setOptions, resize } = useECharts(chartRef as Ref<HTMLDivElement>);
  const emitter: any = inject('emitter');

  watch(
    () => activeData.option,
    () => {
      initChartData();
    },
    { deep: true },
  );
  watch(
    () => activeData.dataType,
    val => {
      activeData.option.defaultValue = [];
      state.chartData = [];
      if (val == 'static') initStaticData(activeData.option.styleType);
      initBarType();
    },
  );
  watch(
    () => activeData.option.styleType,
    val => {
      if (activeData.dataType == 'static') initStaticData(val);
      initBarType();
    },
  );
  watch(
    () => activeData.option.defaultValue,
    val => {
      if (activeData.dataType !== 'static') return;
      setTimeout(() => {
        state.chartData = val;
        initChartData();
        initBarType();
      }, 0);
    },
  );
  watch(
    () => activeData.propsApi,
    val => {
      if (activeData.dataType === 'static' || !val) return;
      const query = { paramList: getParamList(activeData.templateJson) };
      getDataInterfaceRes(val, query).then(res => {
        state.chartData = res.data;
        initChartData();
        initBarType();
      });
    },
  );

  function init() {
    if (activeData.dataType === 'dynamic') {
      if (!activeData.propsApi) return;
      const query = { paramList: getParamList(activeData.templateJson) };
      getDataInterfaceRes(activeData.propsApi, query).then(res => {
        state.chartData = res.data;
        initChartData();
      });
    } else {
      setTimeout(() => {
        state.chartData = activeData.option.defaultValue;
        initChartData();
      }, 0);
    }
    emitter.on('eChart' + activeData.i, () => {
      nextTick(() => resize());
    });
  }
  function initChartData() {
    const jnpfKey = activeData.jnpfKey;
    const styleType = activeData.option.styleType;
    const option = activeData.option;
    const optionData = JSON.parse(JSON.stringify(state.chartData)) || [];
    let typeArr = Array.from(new Set(optionData.map(item => item.type)));
    let axisData = Array.from(new Set(optionData.map(item => item.name)));
    let seriesData: any[] = [];
    typeArr.forEach((title, index) => {
      const type = getType(title);
      let obj = {
        name: title,
        type: type,
        stack: styleType == 5 || styleType == 6 || styleType == 7 || (styleType != 4 && jnpfKey == 'lineChart') ? title : 'total',
      };
      let chartArr = optionData.filter(item => title === item.type);
      if (jnpfKey == 'pieChart') {
        obj['data'] = chartArr.map(item => {
          return {
            value: item.value,
            name: item.name,
          };
        });
        if (option.sortable) getPieData(obj['data']);
        if (option.showZero) obj['data'] = obj['data'].filter(item => item.value != 0);
      } else if (jnpfKey == 'radarChart') {
        const typeList = chartArr.map(item => item.type);
        const element = {
          value: chartArr.map(item => item.value),
          name: typeList && typeList.length ? typeList[0] : '',
          areaStyle: {
            color: getColor(index),
            opacity: option.seriesAreaStyleOpacity,
          },
        };
        obj['data'] = [element];
        obj['colorBy'] = 'series';
      } else {
        obj['data'] = chartArr.map(item => item.value);
      }
      seriesData.push(obj);
    });
    let xAxis: any = {
      type: option.category == 'category' ? 'category' : 'value',
      show: option.xAxisShow,
      inverse: option.xAxisInverse,
      data: axisData,
      name: option.xAxisName,
      nameTextStyle: {
        color: option.xAxisNameTextStyleColor,
        fontSize: option.xAxisNameTextStyleFontSize,
        fontWeight: option.xAxisNameTextStyleFontWeight ? 'bolder' : '',
      },
      splitLine: {
        show: option.xAxisSplitLineShow,
        lineStyle: {
          color: option.xAxisSplitLineLineStyleColor,
        },
      },
      axisLabel: {
        rotate: option.xAxisAxisLabelRotate,
        color: option.AxisTextStyleColor ? option.AxisTextStyleColor : option.xAxisAxisLabelTextStyleColor,
        fontSize: option.xAxisAxisLabelTextStyleFontSize,
        fontWeight: option.xAxisAxisLabelTextFontWeight ? 'bolder' : '',
      },
      axisLine: {
        show: option.xAxisShow,
        lineStyle: {
          color: option.AxisLineStyleColor ? option.AxisLineStyleColor : option.xAxisAxisLineLineStyleColor,
        },
      },
    };
    let yAxis = [
      {
        type: option.category == 'category' ? 'value' : 'category',
        show: option.yAxisShow,
        inverse: option.yAxisInverse,
        data: axisData,
        name: option.yAxisName,
        nameTextStyle: {
          color: option.yAxisNameTextStyleColor,
          fontSize: option.yAxisNameTextStyleFontSize,
          fontWeight: option.yAxisNameTextStyleFontWeight ? 'bolder' : '',
        },
        splitLine: {
          show: option.yAxisSplitLineShow,
          lineStyle: {
            color: option.yAxisSplitLineLineStyleColor,
          },
        },
        axisLabel: {
          interval: option.yAxisAxisLabelInterval,
          rotate: option.yAxisAxisLabelRotate,
          color: option.AxisTextStyleColor ? option.AxisTextStyleColor : option.yAxisAxisLabelTextStyleColor,
          fontSize: option.yAxisAxisLabelTextStyleFontSize,
          fontWeight: option.yAxisAxisLabelTextFontWeight ? 'bolder' : '',
        },
        axisLine: {
          show: option.yAxisShow,
          lineStyle: {
            color: option.AxisLineStyleColor ? option.AxisLineStyleColor : option.yAxisAxisLineLineStyleColor,
          },
        },
      },
    ];
    let newOption: any = {
      //标题
      title: {
        show: option.titleText || option.titleSubtext,
        text: option.titleText,
        textStyle: {
          color: option.titleTextStyleColor,
          fontSize: option.titleTextStyleFontSize,
          fontWeight: option.titleTextStyleFontWeight ? 'bolder' : '',
        },
        subtext: option.titleSubtext,
        subtextStyle: {
          color: option.titleSubtextStyleColor,
          fontSize: option.titleSubtextStyleFontSize,
          fontWeight: option.titleSubtextStyleFontWeight ? 'bolder' : '',
        },
        left: option.titleLeft,
        backgroundColor: option.titleText || option.titleSubtext ? option.titleBgColor || '#fff' : '#fff',
      },
      //提示
      tooltip: {
        show: option.tooltipShow,
        backgroundColor: option.tooltipBgColor,
        textStyle: {
          color: option.tooltipTextStyleColor,
          fontSize: option.tooltipTextStyleFontSize,
          fontWeight: option.tooltipTextStyleFontWeight ? 'bolder' : '',
        },
      },
      //网格
      grid: {
        left: option.gridLeft,
        top: option.gridTop,
        right: option.gridRight,
        bottom: option.gridBottom,
        containLabel: true,
      },
      //图例
      legend: {
        show: option.legendShow,
        orient: option.legendOrient,
        textStyle: {
          fontSize: option.legendTextStyleFontSize || 12,
        },
        top: option.legendTop + '%',
        right: option.legendLeft + '%',
      },
      series: (() => {
        const list: any[] = (seriesData || []).map((ele: any, index) => {
          let label: any = {
            show: option.seriesLabelShow,
            position: jnpfKey == 'pieChart' ? option.seriesLabelPosition : 'top',
            fontSize: option.seriesLabelFontSize,
            fontWeight: option.seriesLabelFontWeight ? 'bolder' : 'normal',
            color: option.seriesLabelColor,
            backgroundColor: option.seriesLabelBgColor,
          };
          let itemStyle: any = {
            borderRadius: option.seriesItemStyleBarBorderRadius,
          };
          if (jnpfKey == 'barChart' || jnpfKey == 'lineChart' || jnpfKey == 'radarChart') itemStyle.color = getColor(index);
          if (jnpfKey == 'lineChart') {
            ele.smooth = styleType == 2;
            ele.step = styleType == 3;
            ele.lineStyle = {
              width: option.seriesLineStyleWidth,
            };
            ele.symbolSize = option.seriesSymbolRotate;
            if (option.areaStyle) ele.areaStyle = {};
          }
          if (jnpfKey == 'pieChart') {
            if (styleType == 1) ele.radius = '60%';
            if (styleType == 2) ele.radius = ['30%', '60%'];
            if (option.roseType) ele.roseType = 'area';
            if (option.seriesLabelShowInfo && option.seriesLabelShowInfo.length) {
              if (option.seriesLabelShowInfo.includes('count') && option.seriesLabelShowInfo.includes('percent')) {
                label.formatter = '{b}: {c} ({d}%)';
              } else if (option.seriesLabelShowInfo.includes('count')) {
                label.formatter = '{b}: {c} ';
              } else if (option.seriesLabelShowInfo.includes('percent')) {
                label.formatter = '{b}: ({d}%) ';
              }
            }
            if (option.colorList && option.colorList.length) {
              const colorList: any[] = [];
              option.colorList.map((_item, index) => {
                const color = getColor(index) || '#71B6F5';
                colorList.push(color);
              });
              ele.color = colorList;
            }
            ele.center = [option.seriesCenterLeft + '%', option.seriesCenterTop + '%'];
          }
          return Object.assign(ele, {
            name: ele.name,
            type: ele.type,
            data: ele.data,
            stack: ele.stack,
            showBackground: styleType == 4 ? true : false,
            barWidth: option.seriesBarWidth,
            itemStyle,
            label,
          });
        });
        return list;
      })(),
    };
    if (jnpfKey == 'barChart' || jnpfKey == 'lineChart') {
      if (jnpfKey == 'lineChart' && option.areaStyle) xAxis.boundaryGap = false;
      newOption.xAxis = xAxis;
      newOption.yAxis = yAxis;
    } else if (jnpfKey == 'radarChart') {
      newOption.radar = [];
      typeArr.map(item => {
        const indicator = axisData.map(items => {
          const maxObj = optionData.find(element => {
            return element.type == item && element.name == items;
          });
          return {
            name: items,
            max: maxObj ? maxObj.max : '',
          };
        });
        const radarObj = {
          indicator: indicator,
          shape: option.styleType == 1 ? 'polygon' : 'circle',
          axisName: {
            fontSize: option.radarAxisNameFontSize,
            fontWeight: option.radarAxisNameFontWeight ? 'bolder' : 'normal',
            color: option.radarAxisNameColor,
          },
          center: [option.radarCenterLeft + '%', option.radarCenterTop + '%'],
        };
        newOption.radar.push(radarObj);
      });
    } else if (jnpfKey == 'pieChart') {
      if (option.seriesLabelShowInfo.includes('count') && option.seriesLabelShowInfo.includes('percent')) {
        newOption.tooltip.formatter = '{b}: {c} ({d}%)';
      } else if (option.seriesLabelShowInfo.includes('count')) {
        newOption.tooltip.formatter = '{b}: {c}';
      } else if (option.seriesLabelShowInfo.includes('percent')) {
        newOption.tooltip.formatter = '{b}: {d}%';
      } else {
        newOption.tooltip.formatter = '{b}';
      }
    }
    state.currOption = newOption;
    setOptions(newOption, true);
  }
  function getType(title) {
    const jnpfKey = activeData.jnpfKey;
    const option = activeData.option;
    if (jnpfKey == 'barChart') {
      if (option.styleType == 7) {
        const arr = option.barType.find(ele => title == ele.title);
        if (arr && arr.type) return arr.type;
      }
      return 'bar';
    } else if (jnpfKey == 'lineChart') {
      return 'line';
    } else if (jnpfKey == 'pieChart') {
      return 'pie';
    } else if (jnpfKey == 'radarChart') {
      return 'radar';
    }
  }
  function getColor(index) {
    const option = activeData.option;
    const barColor = option.colorList || [];
    if (barColor[index]) {
      const color1 = barColor[index].color1;
      const color2 = barColor[index].color2;
      if (color2 && color1)
        return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: color1 },
          { offset: 1, color: color2 },
        ]);
      return color1;
    }
  }
  function getPieData(list) {
    for (let i = 0; i < list.length - 1; i++) {
      for (let j = 0; j < list.length - 1; j++) {
        if (list[j].value > list[j + 1].value) {
          let t = list[j];
          list[j] = list[j + 1];
          list[j + 1] = t;
        }
      }
    }
  }
  function initStaticData(val) {
    const jnpfKey = activeData.jnpfKey;
    activeData.option.defaultValue = [];
    if (jnpfKey == 'barChart') {
      if (val == 1 || val == 4) activeData.option.defaultValue = defaultChartData.baseBarData;
      if (val == 2 || val == 5) activeData.option.defaultValue = defaultChartData.mulBarData;
      if (val == 6) activeData.option.defaultValue = defaultChartData.plusMinusBarData;
      if (val == 7) {
        activeData.option.defaultValue = defaultChartData.brokenColumnBarData;
        initBarType();
      }
    } else if (jnpfKey == 'lineChart') {
      if (val == 1 || val == 2 || val == 3) activeData.option.defaultValue = defaultChartData.baseBarData;
      if (val == 4) activeData.option.defaultValue = defaultChartData.mulBarData;
    } else if (jnpfKey == 'pieChart') {
      activeData.option.defaultValue = defaultChartData.baseBarData;
    } else if (jnpfKey == 'radarChart') {
      activeData.option.defaultValue = defaultChartData.radarData;
    }
  }
  function initBarType() {
    const option = activeData.option;
    if (option.styleType !== 7) return;
    const optionData = state.chartData || [];
    if (!Array.isArray(optionData)) return;
    option.barType = [];
    let typeArr = Array.from(new Set(optionData.map(item => item.type)));
    typeArr.map((item, index) => {
      if (item) {
        option.barType.push({
          title: item,
          type: index == 1 ? 'line' : 'bar',
        });
      }
    });
  }

  return {
    CardHeader,
    chartData,
    currOption,
    init,
  };
}
