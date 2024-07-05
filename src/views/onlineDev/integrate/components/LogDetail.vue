<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="日志详情" width="800px" :footer="null" class="jnpf-log-detail-modal">
    <div class="log-detail-board">
      <div class="left-board">
        <div class="item-box" :class="{ active: activeItem.id == item.id }" v-for="(item, index) in list" @click="handleClick(item, index)">
          <div class="top">
            <span class="fullName">{{ item.nodeName }}</span>
            <i class="icon icon-ym icon-ym-success" v-if="item.resultType" />
            <i class="icon icon-ym icon-ym-fail" v-else />
          </div>
          <div class="bottom">
            <i class="icon-ym icon-ym-clock pr-4px" v-if="item.type == 1" />
            <i class="icon-ym icon-ym-btn-refresh pr-4px" v-else />
            {{ dayjs(item.endTime).format('YYYY-MM-DD HH:mm:ss') }}
          </div>
        </div>
      </div>
      <div class="center-board">
        <div class="top">
          <span>{{ activeItem.nodeName }}</span>
          <a-space v-if="!activeItem.resultType">
            <a-button @click="handleUpdateNodes">去修改节点</a-button>
            <a-button @click="handleRedoNodes" :disabled="!activeItem.isRetry" :loading="redoNodesLoading">
              {{ redoNodesLoading ? '正在修复中...' : '节点重试' }}
            </a-button>
          </a-space>
        </div>
        <div class="time-box">
          <span>开始时间：{{ dayjs(activeItem.startTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
          <span>结束时间：{{ dayjs(activeItem.endTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </div>
        <a-radio-group class="!mb-10px" v-model:value="activeKey" button-style="solid">
          <a-radio-button :value="1">输入</a-radio-button>
          <a-radio-button :value="2" v-if="!activeItem.resultType">错误</a-radio-button>
        </a-radio-group>
        <a-textarea v-model:value="getTextareaValue" :rows="17" readOnly />
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { getTaskInfo, nodeRetryTask } from '/@/api/onlineDev/integrate';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { reactive, toRefs, computed } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import dayjs from 'dayjs';

  interface State {
    list: any[];
    activeKey: number;
    activeIndex: number;
    activeItem: any;
    id: string;
    msgInfo: string;
    redoNodesLoading: boolean;
  }

  const emit = defineEmits(['register', 'updateNodes']);
  const { t } = useI18n();
  const { createMessage, createConfirm } = useMessage();
  const [registerModal, { closeModal, changeLoading }] = useModalInner(init);
  const state = reactive<State>({
    list: [],
    activeKey: 1,
    activeIndex: 0,
    activeItem: {},
    id: '',
    msgInfo: '',
    redoNodesLoading: false,
  });
  const { list, activeKey, activeItem, redoNodesLoading } = toRefs(state);

  const getTextareaValue = computed(() => (state.activeKey === 1 ? state.msgInfo : state.activeItem.errorMsg));

  function init(data) {
    state.activeKey = 1;
    state.list = [];
    state.activeItem = {};
    state.id = data.id;
    initData(true);
  }
  function initData(isInit?) {
    changeLoading(true);
    getTaskInfo(state.id).then(res => {
      changeLoading(false);
      state.list = res.data.list || [];
      state.msgInfo = res.data && res.data.data;
      if (state.list.length) state.activeItem = state.list[isInit ? 0 : state.activeIndex];
    });
  }
  function handleClick(item, index) {
    state.activeItem = item;
    state.activeIndex = index;
    state.activeKey = 1;
  }
  function handleUpdateNodes() {
    emit('updateNodes');
    closeModal();
  }
  function handleRedoNodes() {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '确定将本节点进行重试?',
      onOk: () => {
        const query = {
          id: state.id,
          nodeId: state.activeItem.id,
        };
        state.redoNodesLoading = true;
        nodeRetryTask(query)
          .then(res => {
            state.redoNodesLoading = false;
            createMessage.success(res.msg);
            initData();
          })
          .catch(() => {
            state.redoNodesLoading = false;
          });
      },
    });
  }
</script>
<style lang="less">
  .jnpf-log-detail-modal {
    .log-detail-board {
      display: flex;
      height: 550px;
      .left-board {
        width: 270px;
        height: 100%;
        overflow-y: auto;
        border-right: 1px solid @border-color-base;
        .active {
          background-color: @tree-node-selected-bg !important;
        }
        .item-box {
          padding: 8px 20px;
          cursor: pointer;

          &:hover {
            background-color: @selected-hover-bg;
          }
          .top {
            display: flex;
            align-items: center;
            .fullName {
              flex: 1;
              min-width: 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-size: 16px;
            }
            .icon {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              padding: 2px;
              text-align: center;
              color: #fff;
              transform: scale(0.65);
            }
            .icon-ym-fail {
              background-color: #ff4d4d;
            }
            .icon-ym-success {
              background-color: #55d187;
            }
          }
          .bottom {
            display: flex;
            align-items: center;
            .icon-ym-btn-refresh {
              color: @primary-color;
            }
          }
        }
      }
      .center-board {
        width: 100%;
        padding: 15px 20px;
        .top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .time-box {
          padding: 20px 0;
          display: flex;
          span {
            flex: 1;
          }
        }
      }
    }
  }
</style>
