<template>
  <div class="record-summary-container">
    <a-tabs v-model:activeKey="category" tab-position="left" class="common-left-tabs" v-loading="loading" @change="init">
      <a-tab-pane key="1" tab="按部门汇总"></a-tab-pane>
      <a-tab-pane key="3" tab="按岗位汇总"></a-tab-pane>
    </a-tabs>
    <div class="record-summary-list">
      <template v-if="list.length">
        <a-card class="recordSummary-item" v-for="item in list" :key="item.id">
          <div class="recordSummary-item-main">
            <div class="cap">{{ item.fullName }}意见</div>
            <div class="content">
              <div class="child-item" v-for="(child, j) in item.list" :key="j">
                <a-avatar :src="apiUrl + child.headIcon" :size="40" />
                <div class="child-item-title">
                  <div class="child-item-line">
                    <div class="name">
                      {{ child.userName }}<span> 于 {{ child.handleTime }}</span>
                    </div>
                    <a-tag :color="child.tagType" class="tag">{{ child.statusText }}</a-tag>
                  </div>
                  <div class="child-item-opinion" v-if="child.handleOpinion && child.handleStatus != 2">
                    {{ child.handleOpinion }}
                  </div>
                  <div class="file-List" v-if="child.fileList.length && child.handleStatus != 2">
                    <jnpf-upload-file v-model:value="child.fileList" type="workFlow" detailed disabled simple />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </template>
      <jnpf-empty v-else />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, toRefs } from 'vue';
  import { getRecordList } from '/@/api/workFlow/flowBefore';
  import { useGlobSetting } from '/@/hooks/setting';
  import { formatToDateTime } from '/@/utils/dateUtil';

  interface State {
    category: string;
    loading: boolean;
    list: any[];
  }

  const props = defineProps({
    id: { type: String, default: '' },
    summaryType: { default: 0 },
  });
  const globSetting = useGlobSetting();
  const apiUrl = ref(globSetting.apiUrl);
  const state = reactive<State>({
    category: '1',
    loading: false,
    list: [],
  });
  const { category, loading, list } = toRefs(state);

  defineExpose({ init });

  function init() {
    if (!props.id) return;
    state.loading = true;
    const query = { category: state.category, type: props.summaryType };
    getRecordList(props.id, query)
      .then(res => {
        const list = res.data;
        list.forEach(o => {
          o.list = o.list.map(i => ({
            statusText: getStatusText(i.handleStatus),
            tagType: getTagType(i.handleStatus),
            ...i,
            fileList: i.fileList ? JSON.parse(i.fileList) : [],
            handleTime: formatToDateTime(i.handleTime, 'YYYY-MM-DD HH:mm:ss'),
          }));
        });
        state.list = list;
        state.loading = false;
      })
      .catch(() => {
        state.loading = false;
      });
  }
  function getStatusText(status) {
    if (status == 0) return '退回';
    if (status == 1) return '同意';
    if (status == 2) return '发起';
    if (status == 3) return '撤回';
    if (status == 4) return '终止';
    if (status == 5) return '指派';
    if (status == 6) return '后加签';
    if (status == 8) return '变更';
    if (status == 10) return '前加签';
    if (status == 11) return '挂起';
    if (status == 12) return '恢复';
    if (status == 13) return '转向';
    return '转审';
  }
  function getTagType(status) {
    if (status == 0) return 'error';
    if (status == 1) return 'success';
    if (status == 3 || status == 4 || status == 8 || status == 13) return 'warning';
    return 'processing';
  }
</script>
<style lang="less" scoped>
  .record-summary-container {
    height: 100%;
    width: 100%;
    display: flex;
    .record-summary-list {
      position: relative;
      flex: 1;
      overflow: hidden auto;
      padding: 50px 100px 0;
      .recordSummary-item {
        margin-bottom: 20px;
        box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
        :deep(.ant-card-body) {
          padding: 0;
        }
        .recordSummary-item-main {
          display: flex;
          align-items: center;
          .cap {
            width: 150px;
            flex-shrink: 0;
            text-align: center;
            font-size: 14px;
          }
          .content {
            flex: 1;
            padding: 0px 36px;
            border-left: 1px solid @border-color-base1;
          }
          .child-item {
            padding: 20px 0;
            font-size: 14px;
            line-height: 22px;
            display: flex;
            align-items: flex-start;
            border-bottom: 1px solid @border-color-base1;
            &:last-child {
              margin-bottom: 0;
              border-bottom: 0;
            }
            .ant-avatar {
              flex-shrink: 0;
            }
            .child-item-title {
              flex: 1;
              margin-bottom: 2px;
              display: flex;
              justify-content: space-between;
              flex-direction: column;
              margin-left: 5px;
              .child-item-line {
                display: flex;
                align-items: center;
                flex-direction: row;
                justify-content: space-between;
                padding-left: 4px;
                .name {
                  font-weight: 600;
                  font-size: 16px;
                  span {
                    font-weight: 400;
                    font-size: 12px;
                  }
                }
                .tag {
                  float: right;
                }
              }
              .child-item-opinion {
                color: @text-color-secondary;
                padding-left: 4px;
                margin-top: 5px;
              }
              .file-List {
                margin-top: 5px;
                :deep(.upload-file-list__item-name) {
                  color: @primary-color;
                }
              }
            }
          }
        }
      }
    }
  }
</style>
