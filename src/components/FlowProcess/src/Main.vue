<template>
  <div class="process-flow-container" :class="{ 'process-flow-container-preview': isPreview }">
    <div class="scale-slider">
      <minus-outlined class="btn" @click="changeScale(-step)" />
      <span class="num">{{ scaleVal }}%</span>
      <plus-outlined class="btn" @click="changeScale(step)" />
    </div>
    <FlowCard v-bind="getBindValue" @emits="eventReceiver" :key="key" :style="{ transform: `scale(${scaleVal / 100})` }" />
    <PropPanel :value="activeData" :processData="data" :formInfo="formInfo" @confirm="onPropEditConfirm" @cancel="onClosePanel" />
    <div class="tips" v-if="isPreview">
      <div class="tips-item"><span class="icon success">●</span>已完成</div>
      <div class="tips-item"><span class="icon current">●</span>进行中</div>
      <div class="tips-item"><span class="icon">●</span>无/未处理</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, onMounted, computed } from 'vue';
  import { NodeUtils, getMockData } from './helper/util';
  import FlowCard from './flowCard/index.vue';
  import PropPanel from './propPanel/index.vue';
  import { PlusOutlined, MinusOutlined } from '@ant-design/icons-vue';
  import { omit } from 'lodash-es';

  interface State {
    data: any;
    scaleVal: number;
    step: number;
    key: number;
    activeData: any;
  }

  const props = defineProps(['conf', 'formInfo', 'verifyMode', 'isPreview', 'isEnd']);
  const emit = defineEmits(['viewSubFlow']);
  const state = reactive<State>({
    data: {}, // 流程图数据
    scaleVal: 100, // 流程图缩放比例 100%
    step: 5, // 缩放步长
    key: +new Date(),
    activeData: null, // 被激活的流程卡片数据，用于属性面板编辑
  });
  const { data, scaleVal, step, key, activeData } = toRefs(state);
  const getBindValue = computed(() => ({ ...omit(props, 'conf'), data: props.conf }));

  /**
   * 接收所有FlowCard事件触发
   * @param { Object } data - 含有event(事件名称)/args(参数)两个属性
   */
  function eventReceiver({ event, args }) {
    // 查看子流程
    if (props.isPreview) {
      const activeData = args[0];
      if (activeData.type !== 'subFlow' || !activeData.state) return;
      emit('viewSubFlow', activeData.nodeId);
      return;
    }
    if (event === 'edit') {
      state.activeData = args[0]; // 打开属性面板
      return;
    }
    NodeUtils[event](...args);
    forceUpdate();
  }
  function forceUpdate() {
    state.key = +new Date();
  }
  /**
   * 控制流程图缩放
   * @param { Object } val - 缩放增量 是step的倍数
   */
  function changeScale(val) {
    // 缩放介于0%~200%
    if (state.scaleVal < 0 || state.scaleVal > 200) return;
    if (state.scaleVal === 200 && state.scaleVal + val > 200) return;
    if (state.scaleVal === 0 && state.scaleVal + val < 0) return;
    state.scaleVal += val;
  }
  /**
   * 属性面板提交事件
   * @param { Object } value - 被编辑的节点的properties属性对象
   */
  function onPropEditConfirm(value, content) {
    state.activeData.content = content || '请设置';
    let oldProp = state.activeData.properties;
    state.activeData.properties = value;
    // 修改优先级
    if (NodeUtils.isConditionNode(state.activeData)) {
      value.priority !== oldProp.priority && NodeUtils.resortPriorityByCNode(state.activeData, oldProp.priority, state.data);
      NodeUtils.setDefaultCondition(state.activeData, state.data);
    }
    onClosePanel();
    forceUpdate();
  }
  // 属性面板取消事件
  function onClosePanel() {
    state.activeData = null;
  }

  onMounted(() => {
    if (props.conf !== null && typeof props.conf === 'object' && JSON.stringify(props.conf) !== '{}') {
      state.data = props.conf;
    } else {
      state.data = getMockData();
    }
  });
</script>
<style lang="less">
  @import url('../style/index.less');
</style>
