<template>
  <div class="comment-container">
    <ScrollContainer v-loading="loading && listQuery.currentPage === 1" ref="infiniteBody">
      <div class="comment-list" v-if="list.length">
        <div v-for="(item, i) in list" :key="i" class="item">
          <div class="head">
            <a-avatar :size="40" :src="apiUrl + item.creatorUserHeadIcon" class="avatar" />
            <p class="username">{{ item.creatorUser }}</p>
            <a-button type="link" @click="handleDel(item.id, i)" color="error" v-if="item.isDel">删除</a-button>
            <span class="time">{{ item.creatorTime }}</span>
          </div>
          <div class="content">
            <p class="text">{{ item.text }}</p>
            <div class="img-list" v-if="item.imageList.length">
              <img :src="apiUrl + cItem.url" class="img-item" v-for="(cItem, ci) in item.imageList" :key="ci" @click="handlePreview(item.imageList, ci)" />
            </div>
            <div class="file-List" v-if="item.fileList.length">
              <jnpf-upload-file v-model:value="item.fileList" type="workFlow" detailed disabled />
            </div>
          </div>
        </div>
      </div>
      <jnpf-empty v-if="!list.length" />
    </ScrollContainer>
    <CommentModal :id="id" @register="registerCommentModal" @reload="init" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, toRefs, nextTick } from 'vue';
  import { getCommentList, delComment } from '/@/api/workFlow/flowEngine';
  import { useGlobSetting } from '/@/hooks/setting';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { ScrollContainer, ScrollActionType } from '/@/components/Container';
  import { createImgPreview } from '/@/components/Preview/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import CommentModal from './modal/CommentModal.vue';

  interface State {
    list: any[];
    listQuery: any;
    loading: boolean;
    finish: boolean;
    total: number;
  }

  const props = defineProps({
    id: { type: String, default: '' },
  });
  const globSetting = useGlobSetting();
  const { createMessage, createConfirm } = useMessage();
  const { t } = useI18n();
  const apiUrl = ref(globSetting.apiUrl);
  const state = reactive<State>({
    list: [],
    listQuery: {
      currentPage: 1,
      pageSize: 20,
      sort: 'desc',
      sidx: '',
    },
    loading: false,
    finish: false,
    total: 0,
  });
  const { loading, list, listQuery } = toRefs(state);
  const infiniteBody = ref<Nullable<ScrollActionType>>(null);
  const [registerCommentModal, { openModal: openCommentModal }] = useModal();

  defineExpose({ init, addComment });

  function init() {
    state.list = [];
    state.listQuery = {
      currentPage: 1,
      pageSize: 20,
      sort: 'desc',
      sidx: '',
    };
    state.finish = false;
    initData();
    nextTick(() => {
      bindScroll();
    });
  }
  function initData() {
    if (!props.id) return;
    state.loading = true;
    const query = { ...state.listQuery, taskId: props.id };
    getCommentList(query)
      .then(res => {
        const list = res.data.list.map(o => ({
          ...o,
          fileList: o.file ? JSON.parse(o.file) : [],
          imageList: o.image ? JSON.parse(o.image) : [],
          creatorTime: formatToDateTime(o.creatorTime, 'YYYY-MM-DD HH:mm:ss'),
        }));
        if (list.length < state.listQuery.pageSize) {
          state.finish = true;
        }
        state.list = [...state.list, ...list];
        state.total = res.data.pagination.total;
        state.loading = false;
      })
      .catch(() => {
        state.loading = false;
      });
  }
  function bindScroll() {
    const bodyRef = infiniteBody.value;
    const vBody = bodyRef?.getScrollWrap();
    vBody?.addEventListener('scroll', () => {
      if (vBody.scrollHeight - vBody.clientHeight - vBody.scrollTop <= 200 && !state.loading && !state.finish) {
        state.listQuery.currentPage += 1;
        initData();
      }
    });
  }
  function handlePreview(list, index) {
    const imageList = list.map(o => apiUrl.value + o.url);
    createImgPreview({ imageList: imageList, index });
  }
  function addComment() {
    openCommentModal(true, {});
  }
  function handleDel(id, index) {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: t('common.delTip'),
      onOk: () => {
        delComment(id).then(res => {
          state.list.splice(index, 1);
          createMessage.success(res.msg);
        });
      },
    });
  }
</script>
<style lang="less" scoped>
  .comment-container {
    height: 100%;
    position: relative;
    .comment-list {
      .item {
        padding: 0 30px;
        margin-bottom: 20px;
        .head {
          display: flex;
          align-items: center;
          .avatar {
            flex-shrink: 0;
            margin-right: 20px;
          }
          .username {
            line-height: 40px;
            flex: 1;
            font-size: 16px;
          }
          .head-right {
            flex-shrink: 0;
          }
          .time {
            flex-shrink: 0;
            font-size: 14px;
            color: @text-color-label;
          }
        }
        .content {
          font-size: 14px;
          padding-left: 60px;
          .text {
            line-height: 30px;
            color: @text-color-label;
          }
          .img-list {
            margin-top: 6px;
            .img-item {
              display: inline-block;
              width: 80px;
              height: 80px;
              cursor: pointer;
              overflow: hidden;
              margin: 0 6px 6px 0;
              border-radius: 6px;
              object-fit: cover;
            }
          }
        }
      }
    }
  }
</style>
