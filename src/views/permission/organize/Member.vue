<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" :footer="null" class="transfer-modal member-modal">
    <div class="transfer__body">
      <div class="transfer-pane left-pane">
        <div class="transfer-pane__tool">
          <a-input-search :placeholder="t('common.enterKeyword')" allowClear v-model:value="listQuery.keyword" @search="handleSearch" />
        </div>
        <div class="transfer-pane__body transfer-pane__body-tab">
          <ScrollContainer v-loading="loading && listQuery.currentPage === 1" ref="infiniteBody">
            <div v-for="item in list" :key="item.id" class="selected-item selected-item-user">
              <div class="selected-item-main">
                <a-avatar :size="36" :src="apiUrl + item.headIcon" class="selected-item-headIcon" />
                <div class="selected-item-text">
                  <p class="name">{{ item.realName }}/{{ item.account }}</p>
                  <p class="organize" :title="item.organize">{{ item.organize }}</p>
                </div>
              </div>
            </div>
            <jnpf-empty v-if="!list.length" />
          </ScrollContainer>
        </div>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { getUserList } from '/@/api/permission/user';
  import { toRefs, ref, reactive, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ScrollContainer, ScrollActionType } from '/@/components/Container';

  interface State {
    list: any[];
    listQuery: any;
    loading: boolean;
    finish: boolean;
    total: number;
    title: string;
  }

  defineEmits(['register']);

  const { t } = useI18n();
  const globSetting = useGlobSetting();
  const apiUrl = ref(globSetting.apiUrl);
  const [registerModal] = useModalInner(init);
  const infiniteBody = ref<Nullable<ScrollActionType>>(null);
  const state = reactive<State>({
    list: [],
    listQuery: {
      organizeId: '',
      currentPage: 1,
      pageSize: 50,
      sort: 'desc',
      sidx: '',
      keyword: '',
      enabledMark: 1,
    },
    loading: false,
    finish: false,
    total: 0,
    title: '',
  });
  const { list, listQuery, loading, title } = toRefs(state);

  function init(data) {
    state.title = '查看成员 - ' + data.fullName || '';
    state.listQuery.organizeId = data.id;
    state.listQuery.keyword = '';
    state.list = [];
    initData();
    nextTick(() => {
      bindScroll();
    });
  }
  function initData() {
    state.loading = true;
    getUserList(state.listQuery).then(res => {
      if (res.data.list.length < state.listQuery.pageSize) {
        state.finish = true;
      }
      state.list = [...state.list, ...res.data.list];
      state.total = res.data.pagination.total;
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
  function handleSearch() {
    state.list = [];
    state.finish = false;
    state.listQuery.currentPage = 1;
    state.listQuery.pageSize = 20;
    initData();
  }
</script>
