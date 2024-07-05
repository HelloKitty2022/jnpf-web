<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="接口授权" :width="800" @ok="handleSubmit" class="transfer-modal">
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
            <div v-for="(item, i) in selectedData" :key="i" class="selected-item">
              <div class="selected-item-text">
                <p class="name">{{ item.fullName }}</p>
              </div>
              <delete-outlined class="delete-btn" @click="removeData(i)" />
            </div>
            <jnpf-empty v-if="!selectedData?.length" />
          </ScrollContainer>
        </div>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { toRefs, ref, reactive, unref } from 'vue';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ScrollContainer } from '/@/components/Container';
  import { BasicTree, TreeActionType } from '/@/components/Tree';
  import { getDataInterfaceSelector } from '/@/api/systemData/dataInterface';
  import { saveInterfaceList, getInfo } from '/@/api/systemData/interfaceOauth';

  interface State {
    treeData: any[];
    dataForm: any;
    keyword: string;
    selectedData: any[];
  }

  defineEmits(['register']);

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const treeRef = ref<Nullable<TreeActionType>>(null);
  const [registerModal, { changeLoading, changeOkLoading, closeModal }] = useModalInner(init);
  const state = reactive<State>({
    treeData: [],
    dataForm: {
      interfaceIdentId: '',
      dataInterfaceIds: [],
    },
    keyword: '',
    selectedData: [],
  });
  const { treeData, selectedData, keyword } = toRefs(state);

  function init(data) {
    changeLoading(true);
    state.dataForm.interfaceIdentId = data.id;
    state.dataForm.dataInterfaceIds = [];
    state.treeData = [];
    state.selectedData = [];
    state.keyword = '';
    initData();
  }
  function initData() {
    getDataInterfaceSelector().then(res => {
      state.treeData = res.data;
      handleSearch('');
      getInfo(state.dataForm.interfaceIdentId).then(res => {
        state.selectedData = res.data.list || [];
        changeLoading(false);
      });
    });
  }
  function handleSelect(keys) {
    if (!keys.length) return;
    const data = getTree().getSelectedNode(keys[0]);
    if (data?.hasChildren) return;
    const boo = selectedData.value.some(o => o.id === data?.id);
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
    const arr = state.selectedData.map(o => o.id);
    state.dataForm.dataInterfaceIds = arr.join(',');
    saveInterfaceList(state.dataForm)
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
