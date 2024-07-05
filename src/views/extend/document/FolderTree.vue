<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="移动到" :width="450" @ok="handleSubmit" class="jnpf-tree-modal">
    <div class="h-350px">
      <BasicTree class="tree-main" :treeData="treeData" defaultExpandAll @select="handleSelect" ref="treeRef" :loading="loading" />
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { getFolderTree, moveTo } from '/@/api/extend/document';
  import { toRefs, reactive, ref, unref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicTree, TreeActionType } from '/@/components/Tree';

  interface State {
    treeData: any[];
    loading: boolean;
    id: string;
    toId: string;
  }

  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const [registerModal, { changeOkLoading, closeModal }] = useModalInner(init);
  const treeRef = ref<Nullable<TreeActionType>>(null);
  const state = reactive<State>({
    treeData: [],
    loading: false,
    id: '',
    toId: '',
  });
  const { treeData, loading } = toRefs(state);

  function init(data) {
    state.id = data.id;
    state.toId = data.parentId != '0' ? data.parentId : '-1';
    state.loading = true;
    getFolderTree(state.id).then(res => {
      state.treeData = res.data.list;
      state.loading = false;
      nextTick(() => {
        getTree().setSelectedKeys([state.toId]);
      });
    });
  }
  function getTree() {
    const tree = unref(treeRef);
    if (!tree) throw new Error('tree is null!');
    return tree;
  }
  function handleSelect(keys) {
    if (!keys.length) return (state.toId = '');
    if (state.toId == keys[0]) return;
    state.toId = keys[0];
  }
  function handleSubmit() {
    const toId = state.toId == '-1' ? '0' : state.toId;
    if (!toId) return createMessage.warning('请选择移动目录');
    changeOkLoading(true);
    moveTo(state.id, toId)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        closeModal();
        emit('reload');
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
</script>
<style lang="less">
  .jnpf-tree-modal {
    .ant-modal-body {
      & > .scrollbar {
        padding: 20px 50px !important;
      }
    }
  }
</style>
