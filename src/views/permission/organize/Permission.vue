<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="title" class="full-popup">
    <template v-if="groupList.length">
      <a-tabs v-model:activeKey="activeKey" tab-position="left" class="common-left-tabs !p-10px permission-contain" destroyInactiveTabPane>
        <a-tab-pane class="permission" v-for="tab in groupList" :key="tab.id" :tab="tab.fullName">
          <a-tabs class="tabs-box" v-model:activeKey="subActiveKey" @change="initData">
            <a-tab-pane v-for="tab in permissionList" :key="tab.id" :tab="tab.fullName"> </a-tab-pane>
          </a-tabs>
          <div class="permission-tree">
            <BasicTree :treeData="treeData" :loading="loading" defaultExpandAll :key="key" />
          </div>
        </a-tab-pane>
      </a-tabs>
    </template>
    <div class="no-data" v-else>
      <jnpf-empty :description="description" />
    </div>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { getPermissionGroup, getPermissionInfo } from '/@/api/permission/permissionGroup';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { reactive, toRefs, watch } from 'vue';
  import { BasicTree } from '/@/components/Tree';

  interface State {
    title: string;
    activeKey: any;
    subActiveKey: any;
    id: string;
    groupList: any[];
    description: string;
    objectType: string;
    loading: boolean;
    treeData: any[];
    key: number;
  }

  const state = reactive<State>({
    title: '',
    activeKey: '',
    subActiveKey: '',
    id: '',
    groupList: [],
    description: '',
    objectType: '',
    loading: false,
    treeData: [],
    key: +new Date(),
  });
  const { title, activeKey, subActiveKey, groupList, description, loading, treeData, key } = toRefs(state);
  const [registerPopup, { changeLoading }] = usePopupInner(init);
  const permissionList = [
    { fullName: '应用权限', id: 'system' },
    { fullName: '菜单权限', id: 'module' },
    { fullName: '按钮权限', id: 'button' },
    { fullName: '列表权限', id: 'column' },
    { fullName: '表单权限', id: 'form' },
    { fullName: '数据权限', id: 'resource' },
    { fullName: '门户权限', id: 'portalManage' },
  ];

  watch(
    () => state.activeKey,
    () => {
      state.subActiveKey = 'system';
      initData();
    },
  );

  function init(data) {
    state.id = data.id || '';
    state.activeKey = '';
    state.subActiveKey = 'system';
    state.groupList = [];
    state.objectType = data.objectType || 'menu';
    state.title = getTitle(data.fullName);
    if (state.id) {
      changeLoading(true);
      const query = {
        id: state.id,
        objectType: state.objectType,
      };
      getPermissionGroup(query)
        .then(res => {
          changeLoading(false);
          state.description = res.data?.type == 0 ? '未开启权限' : '未分配权限';
          state.groupList = res?.data?.list || [];
          if (state.groupList.length) state.activeKey = state.groupList[0].id;
          initData();
        })
        .catch(() => {
          changeLoading(false);
        });
    }
  }
  function initData() {
    if (!state.activeKey || !state.id || !state.subActiveKey) return;
    state.treeData = [];
    const query = {
      id: state.id,
      permissionId: state.activeKey,
      itemType: state.subActiveKey,
      objectType: state.objectType,
    };
    state.loading = true;
    getPermissionInfo(query)
      .then(res => {
        state.loading = false;
        state.treeData = res.data || [];
        state.key = +new Date();
      })
      .catch(() => {
        state.loading = false;
      });
  }
  function getTitle(fullName) {
    return fullName + '的权限';
  }
</script>
<style lang="less" scoped>
  .permission-contain {
    :deep(.ant-tabs-content) {
      height: 100% !important;
    }
    .permission {
      height: 100%;
      padding-left: 10px !important;

      .permission-tree {
        height: calc(100% - 64px);
        overflow: auto;
      }
    }
  }

  .no-data {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
