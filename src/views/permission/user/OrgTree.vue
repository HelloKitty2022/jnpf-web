<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" title="组织架构图" class="full-popup">
    <Vue3TreeOrg :data="list" center :default-expand-level="10" :props="props" collapsable :node-draggable="false" :clone-node-drag="false" />
  </BasicPopup>
</template>

<script lang="ts" setup>
  import { getDepartmentSelector } from '/@/api/permission/organize';
  import { reactive, toRefs } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { Vue3TreeOrg } from 'vue3-tree-org';
  import 'vue3-tree-org/lib/vue3-tree-org.css';

  const [registerPopup, { changeLoading }] = usePopupInner(init);
  const state = reactive({
    list: {},
    props: {
      label: 'fullName',
      pid: 'parentId',
    },
  });
  const { list, props } = toRefs(state);

  function init() {
    changeLoading(true);
    getDepartmentSelector().then(res => {
      state.list = {
        id: '-1',
        fullName: '组织架构图',
        children: res.data.list,
      };
      changeLoading(false);
    });
  }
</script>
<style lang="less" scoped>
  :deep(.zoom-container) {
    padding-top: 5px;
  }
</style>
