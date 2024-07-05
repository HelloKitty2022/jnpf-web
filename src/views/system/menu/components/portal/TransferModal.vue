<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :width="800" class="transfer-modal" title="选择权限组" showOkBtn @ok="handleSubmit" destroyOnClose>
    <div class="transfer__body">
      <div class="transfer-pane">
        <div class="transfer-pane__tool">
          <a-input-search :placeholder="t('common.enterKeyword')" allowClear v-model:value="keyword" @search="handleSearch" />
        </div>
        <div class="transfer-pane__body transfer-pane__body-tab">
          <BasicTree class="tree-main" :treeData="treeData" :fieldNames="fieldNames" @select="handleSelect" ref="treeRef" defaultExpandAll :loading="loading" />
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
              <span :title="item.fullName">{{ item.fullName }}</span>
              <delete-outlined class="delete-btn" @click="removeData(i)" />
            </div>
            <jnpf-empty v-if="!selectedData.length" />
          </ScrollContainer>
        </div>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getModelData, setModelData } from '/@/api/permission/authorize';
  import { getPermissionSelector } from '/@/api/permission/permissionGroup';
  import { Form } from 'ant-design-vue';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import { ref, unref, watch, nextTick, reactive } from 'vue';
  import { BasicTree, TreeActionType } from '/@/components/Tree';
  import { ScrollContainer } from '/@/components/Container';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { cloneDeep } from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';

  defineOptions({ name: 'JnpfOrganizeSelect', inheritAttrs: false });
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const treeRef = ref<Nullable<TreeActionType>>(null);
  const innerValue = ref<string | any[] | undefined>([]);
  const keyword = ref('');
  const id = ref('');
  const systemId = ref('');
  const treeData = ref<any[]>([]);
  const allList = ref<any[]>([]);
  const options = ref<any[]>([]);
  const loading = ref(false);
  const selectedData = ref<any[]>([]);
  const selectedIds = ref<any[]>([]);
  const fieldNames = reactive({ key: 'onlyId', title: 'fullName' });
  const formItemContext = Form.useInjectFormItemContext();
  const [registerModal, { closeModal }] = useModalInner(init);

  watch(
    () => selectedIds.value,
    () => {
      setValue();
    },
    { immediate: true },
  );
  watch(
    () => allList.value,
    () => {
      setValue();
    },
    { deep: true },
  );

  function init(data) {
    id.value = data.id;
    systemId.value = data.systemId;
    selectedData.value = [];
    keyword.value = '';
    if (id.value) {
      loading.value = true;
      getModelData(id.value, 'Role').then(res => {
        selectedIds.value = res.data.ids;
        nextTick(() => initData());
        loading.value = false;
      });
    }
  }
  function setValue() {
    if (!selectedIds.value || !selectedIds.value.length) {
      innerValue.value = [];
      options.value = [];
      selectedData.value = [];
      return;
    }
    const ids = selectedIds.value as any[];
    let selectedList: any[] = [];
    for (let i = 0; i < ids.length; i++) {
      inner: for (let j = 0; j < allList.value.length; j++) {
        if (ids[i] === allList.value[j].id) {
          selectedList.push(allList.value[j]);
          break inner;
        }
      }
    }
    innerValue.value = selectedList.map(o => o.id);
    options.value = cloneDeep(selectedList);
    selectedData.value = cloneDeep(selectedList);
  }
  function handleSearch(value) {
    getTree().setSearchValue(value);
  }
  function handleSelect(keys, { node }) {
    if (!keys.length) return;
    const boo = selectedData.value.some(o => o.id === node.id);
    if (boo) return;
    selectedData.value.push(node.dataRef);
  }
  function removeAll() {
    selectedData.value = [];
  }
  function removeData(index: number) {
    selectedData.value.splice(index, 1);
  }
  function getTree() {
    const tree = unref(treeRef);
    if (!tree) {
      throw new Error('tree is null!');
    }
    return tree;
  }
  function handleSubmit() {
    const ids = unref(selectedData).map(o => o.id);
    options.value = unref(selectedData);
    innerValue.value = ids;
    let query = { itemType: 'portalManage', objectType: 'Role', systemId: systemId.value, objectId: ids };
    setModelData(id.value, query).then(res => {
      createMessage.success(res.msg);
      formItemContext.onFieldChange();
      closeModal();
    });
  }
  async function initData() {
    loading.value = true;
    getPermissionSelector().then(res => {
      treeData.value = res.data.list || [];
      treeData.value.map(o => {
        if (selectedIds.value.includes(o.id)) selectedData.value.push(o);
      });
      loading.value = false;
    });
  }
</script>
