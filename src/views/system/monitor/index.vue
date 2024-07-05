<template>
  <div class="monitor-container" v-loading="loading">
    <a-row :gutter="10">
      <a-col :span="24">
        <a-card shadow="never">
          <template #title>
            <div class="title">
              服务器信息
              <span>系统：{{ data.system.os }}</span>
              <span>IP：{{ data.system.ip }}</span>
              <span>项目已不间断运行：{{ data.system.day }}</span>
            </div>
          </template>
          <div class="info">
            <a-row>
              <a-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <h3>CPU使用率</h3>
                <a-tooltip placement="top">
                  <template #title>
                    <p>{{ data.cpu.name }}</p>
                    <p>{{ data.cpu.packageName }}</p>
                    <p>{{ data.cpu.core }}</p>
                    <p>{{ data.cpu.logic }}</p>
                  </template>
                  <a-progress class="content" type="circle" :percent="cpuPercentage" :strokeColor="customColors(cpuPercentage)" />
                </a-tooltip>
                <div class="footer">{{ data.cpu.coreNumber }} 核心</div>
              </a-col>
              <a-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <h3>内存使用率</h3>
                <a-tooltip placement="top">
                  <template #title>
                    <p>总量：{{ data.memory.total }}</p>
                    <p>已使用：{{ data.memory.used }}</p>
                    <p>空闲：{{ data.memory.available }}</p>
                  </template>
                  <a-progress class="content" type="circle" :percent="memoryPercentage" :strokeColor="customColors(memoryPercentage)" />
                </a-tooltip>
                <div class="footer">{{ data.memory.used }} / {{ data.memory.total }}</div>
              </a-col>
              <a-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <h3>磁盘使用率</h3>
                <a-tooltip placement="top">
                  <template #title>
                    <p>总量：{{ data.disk.total }}</p>
                    <p>空闲：{{ data.disk.available }}</p>
                  </template>
                  <a-progress class="content" type="circle" :percent="diskPercentage" :strokeColor="customColors(diskPercentage)" />
                </a-tooltip>
                <div class="footer">{{ data.disk.used }} / {{ data.disk.total }}</div>
              </a-col>
            </a-row>
          </div>
        </a-card>
      </a-col>
    </a-row>
    <a-row :gutter="10">
      <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" style="margin-top: 10px">
        <a-card shadow="never" title="CPU">
          <Chart :options="cpuInfo" :loading="loading" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" style="margin-top: 10px">
        <a-card shadow="never" title="内存">
          <Chart :options="memoryInfo" :loading="loading" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, onMounted, onUnmounted } from 'vue';
  import { getSysMonitor } from '/@/api/system/monitor';
  import { Chart } from '/@/components/Chart';
  import { formatToDateTime } from '/@/utils/dateUtil';

  defineOptions({ name: 'system-monitor' });

  interface State {
    loading: boolean;
    monitor: any;
    data: any;
    cpuPercentage: number;
    memoryPercentage: number;
    diskPercentage: number;
    cpuInfo: any;
    memoryInfo: any;
  }

  const state = reactive<State>({
    loading: true,
    monitor: null,
    data: {
      system: {
        os: '',
        day: '',
        ip: '',
      },
      cpu: {
        name: '',
        package: '',
        core: '',
        coreNumber: '',
        logic: '',
        used: '',
        idle: '',
      },
      memory: {
        total: '',
        available: '',
        used: '',
        usageRate: '',
      },
      disk: {
        total: '',
        available: '',
        used: '',
        usageRate: '',
      },
    },
    cpuPercentage: 0,
    memoryPercentage: 0,
    diskPercentage: 0,
    cpuInfo: {
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        top: '10%',
        left: '2%',
        right: '10%',
        bottom: '2%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        name: '时间',
        boundaryGap: false,
        axisLine: {
          symbol: ['none', 'arrow'],
        },
        data: [],
      },
      yAxis: {
        type: 'value',
        name: '使用率(%)',
        min: 0,
        max: 100,
        axisLine: {
          symbol: ['none', 'arrow'],
        },
        interval: 20,
      },
      series: [
        {
          data: [],
          type: 'line',
          areaStyle: {
            color: 'rgb(32, 160, 255)', // 改变区域颜色
          },
          itemStyle: {
            color: '#6fbae1',
            lineStyle: {
              color: '#6fbae1', // 改变折线颜色
            },
          },
        },
      ],
    },
    memoryInfo: {
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        top: '10%',
        left: '2%',
        right: '10%',
        bottom: '2%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        name: '时间',
        axisLine: {
          symbol: ['none', 'arrow'],
        },
        data: [],
      },
      yAxis: {
        type: 'value',
        name: '使用率(%)',
        min: 0,
        max: 100,
        interval: 20,
        axisLine: {
          symbol: ['none', 'arrow'],
        },
      },
      series: [
        {
          data: [],
          type: 'line',
          areaStyle: {
            color: 'rgb(32, 160, 255)', // 改变区域颜色
          },
          itemStyle: {
            color: '#6fbae1',
            lineStyle: {
              color: '#6fbae1', // 改变折线颜色
            },
          },
        },
      ],
    },
  });
  const { loading, data, cpuPercentage, memoryPercentage, diskPercentage, cpuInfo, memoryInfo } = toRefs(state);

  function initData() {
    getSysMonitor()
      .then(res => {
        state.data = res.data;
        state.cpuPercentage = state.data.cpu.used == '0.00' ? 0 : Number(state.data.cpu.used);
        state.memoryPercentage = state.data.memory.usageRate == '0.00' ? 0 : Number(state.data.memory.usageRate);
        state.diskPercentage = state.data.disk.usageRate == '0.00' ? 0 : Number(state.data.disk.usageRate);
        if (state.cpuInfo.xAxis.data.length >= 8) {
          state.cpuInfo.xAxis.data.shift();
          state.memoryInfo.xAxis.data.shift();
          state.cpuInfo.series[0].data.shift();
          state.memoryInfo.series[0].data.shift();
        }
        state.cpuInfo.xAxis.data.push(formatToDateTime(state.data.time, 'HH:mm:ss'));
        state.memoryInfo.xAxis.data.push(formatToDateTime(state.data.time, 'HH:mm:ss'));
        state.cpuInfo.series[0].data.push(parseFloat(state.data.memory.used));
        state.memoryInfo.series[0].data.push(parseFloat(state.data.memory.usageRate));
        state.loading = false;
      })
      .catch(() => {
        state.loading = false;
      });
  }

  function customColors(percentage) {
    if (percentage < 70) return '#5cb87a';
    if (percentage < 90) return '#e6a23c';
    return '#f56c6c';
  }

  onMounted(() => {
    initData();
    state.monitor = setInterval(initData, 5000);
  });
  onUnmounted(() => {
    if (state.monitor) clearInterval(state.monitor);
  });
</script>
<style lang="less" scoped>
  .monitor-container {
    background-color: @app-main-background;
    height: 100%;
    :deep(.title) {
      display: inline-block;
      line-height: 32px;
      span {
        display: inline-block;
        font-size: 14px;
        padding: 0 8px;
      }
    }
    .info {
      padding: 20px 0;
      text-align: center;
      overflow: hidden;
      h3 {
        font-size: 16px;
        font-weight: normal;
      }
      .content {
        padding: 5px 0;
      }
    }
  }
</style>
