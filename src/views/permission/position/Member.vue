<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" :width="800" @ok="handleSubmit" class="transfer-modal">
    <div class="transfer__body">
      <div class="transfer-pane left-pane">
        <div class="transfer-pane__tool">
          <a-input-search :placeholder="t('common.enterKeyword')" allowClear v-model:value="keyword" @search="handleSearch" />
        </div>
        <div class="transfer-pane__body transfer-pane__body-tab">
          <BasicTree class="tree-main" :treeData="treeData" @select="handleSelect" ref="treeRef" defaultExpandAll />
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
  import { getUserInfoList, getUsersByPositionId } from '/@/api/permission/user';
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
      objectType: 'Position',
      userIds: [],
    },
    keyword: '',
    title: '',
    selectedData: [],
  });
  const { treeData, title, selectedData, keyword } = toRefs(state);

  function init(data) {
    changeLoading(true);
    state.title = '岗位成员 - ' + data.fullName || '';
    state.dataForm.objectId = data.id;
    state.dataForm.userIds = [];
    state.treeData = [];
    state.selectedData = [];
    state.keyword = '';
    initData();
  }
  function initData() {
    getUsersByPositionId({ positionId: state.dataForm.objectId }).then(res => {
      state.treeData = res.data;
      handleSearch('');
      getUserRelationList(state.dataForm.objectId).then(res => {
        state.dataForm.userIds = res.data.ids;
        if (!state.dataForm.userIds.length) return changeLoading(false);
        getUserInfoList(state.dataForm.userIds).then(res => {
          state.selectedData = res.data.list;
          changeLoading(false);
        });
      });
    });
  }
  function handleSelect(keys) {
    if (!keys.length) return;
    const data = getTree().getSelectedNode(keys[0]);
    if (data?.type !== 'user') return;
    const boo = selectedData.value.some(o => o.id === data.id);
    if (boo) return;
    selectedData.value.push(data);
  }
  function handleSearch(value) {
    getTree().setSearchValue(value);
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
