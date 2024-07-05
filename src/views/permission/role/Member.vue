<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" :width="800" @ok="handleSubmit" destroyOnClose class="transfer-modal">
    <div class="transfer__body">
      <div class="transfer-pane left-pane">
        <div class="transfer-pane__tool">
          <a-input-search :placeholder="t('common.enterKeyword')" allowClear v-model:value="keyword" @search="handleSearch" />
        </div>
        <div class="transfer-pane__body transfer-pane__body-tab">
          <BasicTree
            class="tree-main"
            :treeData="treeData"
            :load-data="onLoadData"
            clickRowToExpand
            @select="handleSelect"
            ref="treeRef"
            :loading="loading"
            :key="treeKey"
            v-if="!isAsync" />
          <ScrollContainer v-loading="loading" v-else>
            <div v-for="item in treeData" :key="item.id" class="selected-item selected-item-user" @click="handleNodeClick(item)">
              <div class="selected-item-main">
                <a-avatar :size="36" :src="apiUrl + item.headIcon" class="selected-item-headIcon" />
                <div class="selected-item-text">
                  <p class="name">{{ item.fullName }}</p>
                  <p class="organize" :title="item.organize">{{ item.organize }}</p>
                </div>
              </div>
            </div>
            <jnpf-empty v-if="!treeData.length" />
          </ScrollContainer>
        </div>
      </div>
      <div class="transfer-pane right-pane">
        <div class="transfer-pane__tool">
          <span>已选</span>
          <span class="remove-all-btn" @click="removeAll">清空列表</span>
        </div>
        <div class="transfer-pane__body">
          <ScrollContainer>
            <div v-for="(item, i) in selectedData" :key="i" class="selected-item selected-item-user">
              <div class="selected-item-main">
                <a-avatar :size="36" :src="apiUrl + item.headIcon" class="selected-item-headIcon" />
                <div class="selected-item-text">
                  <p class="name">{{ item.fullName }}</p>
                  <p class="organize" :title="item.organize">{{ item.organize }}</p>
                </div>
                <delete-outlined class="delete-btn" @click="removeData(i)" />
              </div>
            </div>
            <jnpf-empty v-if="!selectedData.length" />
          </ScrollContainer>
        </div>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { getUserInfoList, getUsersByRoleOrgId } from '/@/api/permission/user';
  import { getUserRelationList, createUserRelation } from '/@/api/permission/userRelation';
  import { toRefs, ref, reactive, unref } from 'vue';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ScrollContainer } from '/@/components/Container';
  import { BasicTree, TreeActionType } from '/@/components/Tree';

  interface State {
    treeData: any[];
    dataForm: any;
    title: string;
    keyword: string;
    selectedData: any[];
    nodeId: string;
    loading: boolean;
    isAsync: boolean;
    treeKey: number;
  }

  defineEmits(['register']);

  const { t } = useI18n();
  const globSetting = useGlobSetting();
  const { createMessage } = useMessage();
  const apiUrl = ref(globSetting.apiUrl);
  const treeRef = ref<Nullable<TreeActionType>>(null);
  const [registerModal, { changeLoading, changeOkLoading, closeModal }] = useModalInner(init);
  const state = reactive<State>({
    treeData: [],
    dataForm: {
      objectId: '',
      objectType: 'Role',
      userIds: [],
    },
    keyword: '',
    title: '',
    selectedData: [],
    nodeId: '0',
    loading: false,
    isAsync: false,
    treeKey: +new Date(),
  });
  const { treeData, title, selectedData, keyword, loading, isAsync, treeKey } = toRefs(state);

  function init(data) {
    changeLoading(true);
    state.isAsync = false;
    state.title = '角色成员 - ' + data.fullName || '';
    state.dataForm.objectId = data.id;
    state.dataForm.userIds = [];
    state.treeData = [];
    state.selectedData = [];
    state.keyword = '';
    state.nodeId = '0';
    getUserRelationList(state.dataForm.objectId).then(res => {
      state.dataForm.userIds = res.data.ids;
      if (!state.dataForm.userIds.length) return changeLoading(false);
      getUserInfoList(state.dataForm.userIds).then(res => {
        state.selectedData = res.data.list;
        changeLoading(false);
      });
    });
    initData();
  }
  function initData() {
    state.loading = true;
    if (state.keyword) state.nodeId = '0';
    const query = {
      keyword: state.keyword,
      organizeId: state.nodeId,
      roleId: state.dataForm.objectId,
    };
    getUsersByRoleOrgId(query).then(res => {
      state.treeData = res.data;
      state.loading = false;
    });
  }
  function onLoadData(node) {
    state.nodeId = node.id;
    const query = {
      keyword: state.keyword,
      organizeId: state.nodeId,
      roleId: state.dataForm.objectId,
    };
    return new Promise((resolve: (value?: unknown) => void) => {
      getUsersByRoleOrgId(query).then(res => {
        const list = res.data;
        getTree().updateNodeByKey(node.eventKey, { children: list, isLeaf: !list.length });
        resolve();
      });
    });
  }
  function handleSelect(keys) {
    if (!keys.length) return;
    const data = getTree().getSelectedNode(keys[0]);
    if (data?.type !== 'user') return;
    handleNodeClick(data);
  }
  function handleNodeClick(data) {
    const boo = state.selectedData.some(o => o.id === data.id);
    if (boo) return;
    state.selectedData.push(data);
  }
  function handleSearch() {
    state.treeKey = +new Date();
    state.nodeId = '0';
    state.treeData = [];
    state.isAsync = !!state.keyword;
    initData();
  }
  function getTree() {
    const tree = unref(treeRef);
    if (!tree) throw new Error('tree is null!');
    return tree;
  }
  function removeAll() {
    state.selectedData = [];
  }
  function removeData(index: number) {
    state.selectedData.splice(index, 1);
  }
  function handleSubmit() {
    changeOkLoading(true);
    state.dataForm.userIds = state.selectedData.map(o => o.id);
    createUserRelation(state.dataForm)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        closeModal();
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
</script>
