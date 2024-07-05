<template>
  <BasicModal v-bind="$attrs" class="transfer-modal" @register="registerModal" :width="800" :title="modalTitle" @ok="handleSubmit" destroyOnClose>
    <div class="transfer__body">
      <div class="transfer-pane left-pane">
        <div class="transfer-pane__tool">
          <a-input-search :placeholder="t('common.enterKeyword')" allowClear v-model:value="pagination.keyword" @search="handleSearch" />
        </div>
        <div class="transfer-pane__body transfer-pane__body-tab">
          <a-tabs v-model:activeKey="activeKey" :tabBarGutter="10" size="small" class="pane-tabs">
            <a-tab-pane key="1" tab="部门"></a-tab-pane>
            <a-tab-pane key="2" tab="角色"></a-tab-pane>
            <a-tab-pane key="3" tab="岗位"></a-tab-pane>
            <a-tab-pane key="4" tab="分组"></a-tab-pane>
          </a-tabs>
          <template v-if="activeKey === '1'">
            <BasicTree
              v-if="!isAsync"
              class="tree-main"
              ref="treeRef"
              :treeData="treeData"
              :load-data="onLoadData"
              :loading="loading"
              :key="treeKey"
              @select="handleSelect" />
            <ScrollContainer v-loading="loading && pagination.currentPage === 1" v-else ref="infiniteBody">
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
          </template>
          <BasicTree
            class="tree-main"
            :treeData="ableList"
            @select="handleSelect"
            ref="treeRef"
            :fieldNames="getFieldNames"
            defaultExpandAll
            :loading="loading"
            v-if="['2', '3', '4', 'system'].includes(activeKey)" />
        </div>
      </div>
      <div class="transfer-pane right-pane">
        <div class="transfer-pane__tool">
          <span>已选</span>
          <span class="remove-all-btn" @click="removeAll">清空列表</span>
        </div>
        <div class="transfer-pane__body">
          <ScrollContainer>
            <template v-if="selectedData.length">
              <div v-for="(item, index) in getSelectedTree" :key="index" class="selected-item-user-multiple">
                <template v-if="item.children.length">
                  <p class="selected-item-title">
                    <i :class="item.icon"></i><span>{{ item.fullName }}</span>
                  </p>
                  <div v-for="(child, i) in item.children" :key="i" class="selected-item selected-item-user">
                    <div class="selected-item-main">
                      <a-avatar :size="36" :src="apiUrl + child.headIcon" class="selected-item-headIcon" v-if="child.type === 'user'"></a-avatar>
                      <div class="selected-item-icon" v-else>{{ child.fullName.substring(0, 1) }}</div>
                      <div class="selected-item-text">
                        <p class="name">{{ child.fullName }}</p>
                        <p class="organize" :title="child.organize">{{ child.organize }}</p>
                      </div>
                      <delete-outlined class="delete-btn" @click="removeMulData(child.id)" />
                    </div>
                  </div>
                </template>
              </div>
            </template>
            <jnpf-empty v-if="!selectedData.length" />
          </ScrollContainer>
        </div>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { getImUserSelector, getSelectedList } from '/@/api/permission/user';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import { computed, ref, unref, watch, reactive, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicTree, TreeActionType } from '/@/components/Tree';
  import { ScrollContainer, ScrollActionType } from '/@/components/Container';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useOrganizeStore } from '/@/store/modules/organize';
  import { cloneDeep } from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';

  const defaultSelectedList = [
    { id: 'department', type: 'department', fullName: '部门', icon: 'icon-ym icon-ym-tree-department1', children: [] },
    { id: 'position', type: 'position', fullName: '岗位', icon: 'icon-ym icon-ym-tree-position1', children: [] },
    { id: 'user', type: 'user', fullName: '用户', icon: 'icon-ym icon-ym-tree-user2', children: [] },
    { id: 'group', type: 'group', fullName: '分组', icon: 'icon-ym icon-ym-generator-group1', children: [] },
    { id: 'role', type: 'role', fullName: '角色', icon: 'icon-ym icon-ym-generator-role', children: [] },
  ];
  defineOptions({ name: 'JnpfUsersSelect', inheritAttrs: false });
  const props = defineProps({
    modalTitle: { type: String, default: '选择用户' },
    getDataApi: { type: Function },
    saveDataApi: { type: Function },
  });
  const emit = defineEmits(['register', 'initData']);
  const { t } = useI18n();
  const { createMessage } = useMessage();
  const organizeStore = useOrganizeStore();
  const globSetting = useGlobSetting();
  const apiUrl = ref(globSetting.apiUrl);
  const treeRef = ref<Nullable<TreeActionType>>(null);
  const selectedData = ref<any[]>([]);
  const nodeId = ref('0');
  const id = ref(String);
  const treeKey = ref(+new Date());
  const pagination = reactive({
    keyword: '',
    currentPage: 1,
    pageSize: 20,
  });
  const finish = ref<boolean>(false);
  const isAsync = ref<boolean>(false);
  const activeKey = ref('');
  const infiniteBody = ref<Nullable<ScrollActionType>>(null);
  const treeData = ref<any[]>([]);
  const ableList = ref<any[]>([]);
  const loading = ref(false);

  const [registerModal, { changeLoading, closeModal, changeOkLoading }] = useModalInner(init);

  const getSelectedTree = computed(() => {
    const selectedTree: any[] = cloneDeep(defaultSelectedList);
    for (let i = 0; i < selectedData.value.length; i++) {
      const item = selectedData.value[i];
      const type = item.type == 'company' ? 'department' : item.type;
      inner: for (let i = 0; i < selectedTree.length; i++) {
        if (selectedTree[i].type === type) {
          selectedTree[i].children.push({
            ...item,
            type: type,
          });
          break inner;
        }
      }
    }
    return selectedTree;
  });
  const getFieldNames = computed(() => (activeKey.value === '2' ? { key: 'onlyId' } : { key: 'id' }));

  watch(
    () => activeKey.value,
    val => {
      if (!val) return;
      pagination.keyword = '';
      nodeId.value = '0';
      isAsync.value = false;
      initData();
    },
  );

  function init(data) {
    pagination.keyword = '';
    pagination.currentPage = 1;
    isAsync.value = false;
    nodeId.value = '0';
    activeKey.value = '1';
    treeData.value = [];
    ableList.value = [];
    finish.value = false;
    selectedData.value = [];
    id.value = data.id || '';
    initData();
    if (!props.getDataApi) return;
    changeLoading(true);
    props
      .getDataApi(data.id)
      .then(res => {
        let list = res.data?.list.map(o => o.id + '--' + o.type);
        setValue(list);
      })
      .catch(() => {
        changeLoading(false);
      });
  }
  function setValue(list) {
    if (!Array.isArray(list)) return;
    getSelectedList(unref(list))
      .then(res => {
        let selectedList: any[] = res.data.list.map(o => ({ ...o, id: o.type ? o.id + '--' + o.type : o.id }));
        selectedData.value = cloneDeep(selectedList);
        changeLoading(false);
      })
      .catch(() => {
        changeLoading(false);
      });
  }
  function handleSearch(val) {
    treeKey.value = +new Date();
    nodeId.value = '0';
    treeData.value = [];
    pagination.currentPage = 1;
    isAsync.value = !!pagination.keyword;
    finish.value = false;
    if (isAsync.value && activeKey.value === '1') {
      nextTick(() => {
        bindScroll();
      });
    }
    if (activeKey.value === '1') return initData();
    nextTick(() => {
      getTree().setSearchValue(val);
    });
  }
  function bindScroll() {
    const bodyRef = infiniteBody.value;
    const vBody = bodyRef?.getScrollWrap();
    vBody?.addEventListener('scroll', () => {
      if (vBody.scrollHeight - vBody.clientHeight - vBody.scrollTop <= 200 && !loading.value && !finish.value) {
        pagination.currentPage += 1;
        getAllList();
      }
    });
  }
  function handleSelect(keys) {
    if (!keys.length) return;
    const data = getTree().getSelectedNode(keys[0]);
    if (data?.disabled) return;
    handleNodeClick(data);
  }
  function handleNodeClick(data) {
    const usableList = ['company', 'department', 'role', 'position', 'group', 'user', 'system'];
    if (!usableList.includes(data.type)) return;
    const boo = selectedData.value.some(o => o.id === data.id + '--' + data.type);
    if (boo) return;
    const item = cloneDeep(data);
    item.id += '--' + item.type;
    selectedData.value.push(item);
  }
  function removeAll() {
    selectedData.value = [];
  }
  function removeMulData(id) {
    const index = selectedData.value.findIndex(o => o.id == id);
    if (index != -1) selectedData.value.splice(index, 1);
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
    if (!props.saveDataApi) return;
    changeOkLoading(true);
    const query = { ids, id: id.value };
    props
      .saveDataApi(query)
      .then(res => {
        createMessage.success(res.msg);
        closeModal();
        changeOkLoading(false);
        emit('initData');
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
  function onLoadData(node) {
    nodeId.value = node.id;
    return new Promise((resolve: (value?: unknown) => void) => {
      getImUserSelector(nodeId.value).then(res => {
        const list = res.data.list;
        getTree().updateNodeByKey(node.eventKey, { children: list, isLeaf: !list.length });
        resolve();
      });
    });
  }
  function getAllList() {
    loading.value = true;
    if (pagination.keyword) nodeId.value = '0';
    getImUserSelector(nodeId.value, pagination).then(res => {
      if (pagination.keyword) {
        if (res.data.list.length < pagination.pageSize) finish.value = true;
        treeData.value = [...treeData.value, ...res.data.list];
      } else {
        treeData.value = res.data.list;
        if (treeData.value.length && nodeId.value == '0') {
          getTree().setExpandedKeys([treeData.value[0].id]);
        }
      }
      loading.value = false;
    });
  }
  async function initData() {
    ableList.value = [];
    if (activeKey.value === '1') return getAllList();
    loading.value = true;
    if (activeKey.value === '2') ableList.value = await organizeStore.getRoleTree();
    if (activeKey.value === '3') ableList.value = await organizeStore.getPositionTree();
    if (activeKey.value === '4') ableList.value = await organizeStore.getGroupTree();
    nextTick(() => {
      getTree().setSearchValue('');
    });
    loading.value = false;
  }
</script>
