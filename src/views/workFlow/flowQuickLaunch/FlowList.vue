<template>
  <div class="flow-list-container">
    <a-tabs v-model:activeKey="category" tab-position="left" class="common-left-tabs flow-left-tabs">
      <a-tab-pane key="" tab="全部流程"></a-tab-pane>
      <a-tab-pane :key="item.id" :tab="item.fullName" v-for="item in categoryList"></a-tab-pane>
    </a-tabs>
    <div class="flow-list">
      <div class="jnpf-common-search-box">
        <BasicForm class="search-form" @register="registerForm" @submit="handleSubmit" @reset="handleReset"></BasicForm>
      </div>
      <div class="list">
        <ScrollContainer v-loading="loading && listQuery.currentPage === 1" ref="infiniteBody">
          <div class="px-10px pt-10px" v-if="list.length">
            <a-row :gutter="20">
              <a-col :span="6" v-for="(item, i) in list" :key="i" class="item" @click="handleClick(item)">
                <a-card hoverable>
                  <div class="item-icon" :style="{ backgroundColor: item.iconBackground || '#008cff' }">
                    <i :class="item.icon || 'icon-ym icon-ym-funcFlow'"></i>
                  </div>
                  <span class="item-title">{{ item.fullName }}</span>
                </a-card>
              </a-col>
            </a-row>
          </div>
          <jnpf-empty v-if="!list.length" />
        </ScrollContainer>
      </div>
    </div>
    <SelectFlowModal @register="registerSelectFlowModal" @change="selectFlow" />
    <BasicModal
      v-bind="$attrs"
      @register="registerUserListModal"
      title="发起人员"
      :width="600"
      @ok="selectUser"
      destroyOnClose
      class="jnpf-flow-user-list-modal">
      <div class="flow-user-list">
        <ScrollContainer>
          <div
            class="user-item-main"
            :class="{ active: activeUser.includes(item.id) }"
            v-for="item in userList"
            :key="item.id"
            @click="changeActiveUser(item.id)">
            <a-avatar class="user-avatar" :size="40" :src="apiUrl + item.headIcon" />
            <div class="user-text">
              <p class="user-name">{{ item.fullName }}</p>
              <p class="user-organize" :title="item.organize">{{ item.organize }}</p>
            </div>
            <div class="icon-checked">
              <check-outlined />
            </div>
          </div>
        </ScrollContainer>
      </div>
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, toRefs, onMounted, watch, ref, nextTick } from 'vue';
  import { getFlowEnginePageList, getFlowList } from '/@/api/workFlow/flowEngine';
  import { getDelegateFlow, getDelegateUserByFlowId } from '/@/api/workFlow/flowDelegate';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useBaseStore } from '/@/store/modules/base';
  import { ScrollContainer, ScrollActionType } from '/@/components/Container';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { CheckOutlined } from '@ant-design/icons-vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { SelectFlowModal } from '/@/components/CommonModal';

  interface State {
    [prop: string]: any;
  }

  const props = defineProps({
    isEntrust: { type: Boolean, default: false },
    flowType: { type: Number, default: 0 },
  });
  const emit = defineEmits(['select']);
  const state = reactive<State>({
    category: '',
    categoryList: [],
    list: [],
    listQuery: {
      currentPage: 1,
      pageSize: 50,
      sort: 'desc',
      sidx: '',
    },
    keyword: '',
    loading: false,
    finish: false,
    total: 0,
    flowList: [],
    userList: [],
    activeFlow: {},
    activeUser: [],
  });
  const { category, categoryList, list, listQuery, loading, userList, activeUser } = toRefs(state);
  const globSetting = useGlobSetting();
  const apiUrl = ref(globSetting.apiUrl);
  const baseStore = useBaseStore();
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerSelectFlowModal, { openModal: openSelectFlowModal }] = useModal();
  const [registerUserListModal, { openModal: openUserListModal, closeModal: closeUserListModal }] = useModal();
  const [registerForm, { resetFields }] = useForm({
    baseColProps: { span: 6 },
    showActionButtonGroup: true,
    showAdvancedButton: true,
    compact: true,
    schemas: [
      {
        field: 'keyword',
        label: t('common.keyword'),
        component: 'Input',
        componentProps: {
          placeholder: t('common.enterKeyword'),
          submitOnPressEnter: true,
        },
      },
    ],
  });
  const infiniteBody = ref<Nullable<ScrollActionType>>(null);

  watch(
    () => state.category,
    () => {
      resetFields();
    },
  );

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
  function initData() {
    state.loading = true;
    let query = {
      ...state.listQuery,
      keyword: state.keyword,
      category: state.category,
      flowType: props.flowType || 0,
    };
    const method = props.isEntrust ? getDelegateFlow : getFlowEnginePageList;
    method(query).then(res => {
      if (res.data.list.length < state.listQuery.pageSize) {
        state.finish = true;
      }
      state.list = [...state.list, ...res.data.list];
      state.total = res.data.pagination.total;
      state.loading = false;
    });
  }
  async function getDictionaryData() {
    const res = await baseStore.getDictionaryData('WorkFlowCategory');
    state.categoryList = res as any[];
    initData();
    nextTick(() => {
      bindScroll();
    });
  }
  function handleSubmit(values) {
    state.keyword = values?.keyword || '';
    search();
  }
  function handleReset() {
    state.keyword = '';
    search();
  }
  function search() {
    state.list = [];
    state.finish = false;
    state.listQuery = {
      currentPage: 1,
      pageSize: 50,
      sort: 'desc',
      sidx: '',
    };
    initData();
  }
  function handleClick(item) {
    if (!item.id) return createMessage.error('流程不存在');
    state.flowList = [];
    getFlowList(item.id, props.isEntrust ? '' : '1').then(res => {
      const flowList = res.data;
      state.flowList = flowList;
      if (!flowList.length) return createMessage.error('流程不存在');
      if (flowList.length === 1) return selectFlow(flowList[0]);
      openSelectFlowModal(true, { flowList: state.flowList });
    });
  }
  function selectFlow(item) {
    if (props.isEntrust) {
      state.userList = [];
      state.activeFlow = item;
      getDelegateUserByFlowId({ flowId: item.id }).then(res => {
        const userList = res.data.list;
        state.userList = res.data.list;
        if (userList.length > 1) return openUserListModal(true);
        state.activeUser = userList.map(o => o.id);
        selectUser();
      });
    } else {
      emit('select', item);
    }
  }
  function selectUser() {
    const item = { ...state.activeFlow, delegateUserList: state.activeUser };
    emit('select', item);
    closeUserListModal();
  }
  function changeActiveUser(id) {
    const index = state.activeUser.findIndex(o => o == id);
    index > -1 ? state.activeUser.splice(index, 1) : state.activeUser.push(id);
  }

  onMounted(() => {
    getDictionaryData();
  });
</script>

<style lang="less" scoped>
  .flow-list-container {
    padding: 10px 0;
    height: 100%;
    width: 100%;
    display: flex;
    .flow-list {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .list {
        flex: 1;
        min-height: 0;
        .item {
          margin-bottom: 20px;
          cursor: pointer;
          &:nth-last-child(1),
          &:nth-last-child(2),
          &:nth-last-child(3),
          &:nth-last-child(4) {
            margin-bottom: 0;
          }
          :deep(.ant-card) {
            .ant-card-body {
              display: flex;
              align-items: center;
              padding: 15px;
            }
          }
          .item-icon {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            text-align: center;
            background-color: #ccc;
            display: inline-block;
            margin-right: 15px;
            i {
              text-align: center;
              font-size: 36px;
              color: #fff;
              line-height: 48px;
            }
          }
          .item-title {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            word-break: break-all;
            font-size: 14px;
          }
        }
      }
      .ant-empty {
        margin-top: 60px;
      }
    }
  }
</style>
