<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" class="full-popup" :title="title">
    <template #insertToolbar>
      <a-space :size="10">
        <a-button type="text" :disabled="loading" @click="handleExpandAll(true)">展开全部</a-button>
        <a-button type="text" :disabled="loading" @click="handleExpandAll(false)">折叠全部</a-button>
        <a-button type="text" :disabled="loading" @click="handleCheckAll(true)">全部勾选</a-button>
        <a-button type="text" :disabled="loading" @click="handleCheckAll(false)">取消全选</a-button>
        <a-divider type="vertical" class="!h-7"></a-divider>
        <a-button type="primary" @click="handleSubmit()" :disabled="loading" :loading="btnLoading">{{ t('common.saveText') }}</a-button>
      </a-space>
    </template>
    <div class="auth-container">
      <a-alert
        message="请在对应权限组【权限授权】中授权应用权限，且该应用需添加门户（【系统管理】-【应用菜单】）"
        type="warning"
        showIcon
        class="!mx-20px !mt-20px" />
      <div class="main" v-loading="loading">
        <BasicTree
          v-show="portalAuthorizeTree.length"
          :treeData="portalAuthorizeTree"
          ref="treeRef"
          checkable
          blockNode
          clickRowToExpand
          defaultExpandAll
          @check="onCheck"
          class="overflow-auto" />
        <div class="no-data" v-show="!portalAuthorizeTree.length && !loading">
          <jnpf-empty />
        </div>
      </div>
    </div>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { getPortalAuthorizeValues, updatePortalAuthorizeList } from '/@/api/permission/authorize';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { BasicTree, TreeActionType } from '/@/components/Tree';
  import { reactive, toRefs, ref, unref, nextTick } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    title: string;
    loading: boolean;
    objectId: string;
    portalAuthorizeTree: any[];
    portalIds: any[];
    btnLoading: boolean;
  }

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const [registerPopup, { closePopup }] = usePopupInner(init);
  const treeRef = ref<Nullable<TreeActionType>>(null);
  const state = reactive<State>({
    title: '',
    loading: false,
    objectId: '',
    portalIds: [],
    portalAuthorizeTree: [],
    btnLoading: false,
  });
  const { title, portalAuthorizeTree, loading, btnLoading } = toRefs(state);

  function init(data) {
    state.objectId = data.id;
    state.btnLoading = false;
    state.title = data.fullName;
    getAuthorizeList();
  }
  function getAuthorizeList() {
    state.loading = true;
    state.portalAuthorizeTree = [];
    state.portalIds = [];
    getTree().setCheckedKeys([]);
    getPortalAuthorizeValues(state.objectId).then(res => {
      state.portalAuthorizeTree = res.data.list || [];
      const parentKeys = getTree().getParentKeys(state.portalAuthorizeTree, true);
      const dataIds = [...new Set([...state.portalIds, ...res.data.ids])];
      state.portalIds = dataIds;
      const checkedKeys = dataIds.filter(o => !parentKeys.includes(o));
      nextTick(() => {
        getTree().setCheckedKeys(checkedKeys);
        state.loading = false;
      });
    });
  }
  function onCheck(checkedKeys, e) {
    let dataIds = [...checkedKeys, ...e.halfCheckedKeys];
    state.portalIds = dataIds;
  }
  function handleCheckAll(boo) {
    getTree().checkAll(boo);
    nextTick(() => {
      let checkedKeys: any[] = getTree().getCheckedKeys() as any[];
      state.portalIds = checkedKeys;
    });
  }
  function handleExpandAll(boo) {
    getTree().expandAll(boo);
  }
  function getTree() {
    const tree = unref(treeRef);
    if (!tree) throw new Error('tree is null!');
    return tree;
  }
  function handleSubmit() {
    state.btnLoading = true;
    updatePortalAuthorizeList(state.objectId, { ids: state.portalIds })
      .then(res => {
        createMessage.success(res.msg);
        state.btnLoading = false;
        closePopup();
      })
      .catch(() => {
        state.btnLoading = false;
      });
  }
</script>
<style lang="less" scoped>
  .auth-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    .main {
      flex: 1;
      padding: 20px;
      overflow: hidden;
      .no-data {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
</style>
