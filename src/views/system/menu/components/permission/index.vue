<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="title" class="full-popup">
    <template v-if="groupList.length">
      <a-tabs class="tabs-box" v-model:activeKey="activeKey">
        <a-tab-pane v-for="tab in groupList" :key="tab.id" :tab="tab.fullName"></a-tab-pane>
      </a-tabs>
      <ScrollContainer class="px-20px">
        <template v-for="item in authorizeList">
          <p class="title">{{ item.fullName }}</p>
          <p class="content">
            <template v-if="item.type == 1">
              <span v-for="(child, i) in item.list" :key="i">{{ child.fullName }}</span>
            </template>
            <template v-else-if="item.type == 2">未分配{{ item.fullName }}</template>
            <template v-else>未设置{{ item.fullName }}（无权限控制）</template>
          </p>
        </template>
      </ScrollContainer>
    </template>
    <div class="no-data" v-else>
      <jnpf-empty :description="description" />
    </div>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { getMenuPermissionGroup, getMenuPermissionInfo } from '/@/api/system/menu';
  import { getPermissionGroup, getPermissionInfo } from '/@/api/permission/permissionGroup';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { ScrollContainer } from '/@/components/Container';
  import { reactive, toRefs, watch } from 'vue';

  interface State {
    title: string;
    activeKey: any;
    id: string;
    groupList: any[];
    authorizeList: any[];
    description: string;
    objectType: string;
  }

  const state = reactive<State>({
    title: '',
    activeKey: '',
    id: '',
    groupList: [],
    authorizeList: [],
    description: '',
    objectType: '',
  });
  const { title, activeKey, groupList, authorizeList, description } = toRefs(state);
  const [registerPopup, { changeLoading }] = usePopupInner(init);

  watch(
    () => state.activeKey,
    () => initData(),
  );

  function init(data) {
    state.id = data.id || '';
    state.activeKey = '';
    state.authorizeList = [];
    state.groupList = [];
    state.objectType = data.objectType || 'menu';
    state.title = getTitle(data.fullName);
    if (state.id) {
      changeLoading(true);
      const method = state.objectType == 'menu' ? getMenuPermissionGroup : getPermissionGroup;
      const query = {
        id: state.id,
        objectType: state.objectType,
      };
      method(query)
        .then(res => {
          changeLoading(false);
          state.description = res.data?.type == 0 ? '未开启权限' : state.objectType == 'menu' ? '该菜单暂未分配权限' : '未分配权限';
          state.groupList = res?.data?.list || [];
          if (state.groupList.length) state.activeKey = state.groupList[0].id;
        })
        .catch(() => {
          changeLoading(false);
        });
    }
  }
  function initData() {
    if (!state.activeKey || !state.id) return;
    changeLoading(true);
    state.authorizeList = [];
    const method = state.objectType == 'menu' ? getMenuPermissionInfo : getPermissionInfo;
    const query = {
      id: state.id,
      permissionId: state.activeKey,
      objectType: state.objectType,
    };
    method(query)
      .then(res => {
        changeLoading(false);
        for (let [_key, value] of Object.entries(res.data)) {
          value && state.authorizeList.push(value);
        }
      })
      .catch(() => {
        changeLoading(false);
      });
  }
  function getTitle(fullName) {
    let typeName = '菜单';
    if (state.objectType == 'company') typeName = '组织';
    if (state.objectType == 'position') typeName = '岗位';
    if (state.objectType == 'user') typeName = '用户';
    if (state.objectType == 'role') typeName = '角色';
    if (state.objectType == 'group') typeName = '分组';
    return fullName + typeName + '的权限';
  }
</script>
<style lang="less" scoped>
  .tabs-box {
    :deep(.ant-tabs-tab:first-child) {
      margin-left: 20px;
    }
  }

  .title {
    font-weight: bold;
    line-height: 36px;
  }

  .content {
    min-height: 20px;
    margin-bottom: 10px;

    span {
      position: relative;
      padding-right: 20px;
    }

    span:not(:last-child) {
      &::after {
        content: '';
        position: absolute;
        top: 3px;
        right: 10px;
        width: 1px;
        height: 15px;
        background: @text-color-label;
        z-index: 1;
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
