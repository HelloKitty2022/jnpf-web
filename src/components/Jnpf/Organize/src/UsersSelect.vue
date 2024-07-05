<template>
  <div :class="[$attrs.class, 'select-tag-list']" v-if="buttonType === 'button'">
    <a-button preIcon="icon-ym icon-ym-btn-add" @click="openSelectModal">{{ modalTitle }}</a-button>
    <div class="tags">
      <a-tag class="!mt-10px" :closable="!disabled" v-for="(item, i) in options" :key="item.id" @close="onTagClose(i)">{{ item.fullName }}</a-tag>
    </div>
  </div>
  <a-select v-bind="getSelectBindValue" v-model:value="innerValue" :options="options" @change="onChange" @click="openSelectModal" v-else />
  <a-modal
    v-model:visible="visible"
    :title="modalTitle"
    :width="800"
    class="transfer-modal"
    @ok="handleSubmit"
    centered
    :maskClosable="false"
    :keyboard="false">
    <template #closeIcon>
      <ModalClose :canFullscreen="false" @cancel="handleCancel" />
    </template>
    <div class="transfer__body">
      <div class="transfer-pane left-pane">
        <div class="transfer-pane__tool">
          <a-input-search :placeholder="t('common.enterKeyword')" allowClear v-model:value="pagination.keyword" @search="handleSearch" />
        </div>
        <div class="transfer-pane__body transfer-pane__body-tab" v-if="selectType === 'all'">
          <a-tabs v-model:activeKey="activeKey" :tabBarGutter="10" size="small" class="pane-tabs" :class="{ 'pane-tabs-single': !multiple }">
            <a-tab-pane key="1" tab="部门"></a-tab-pane>
            <a-tab-pane key="2" tab="角色" v-if="multiple"></a-tab-pane>
            <a-tab-pane key="3" tab="岗位" v-if="multiple"></a-tab-pane>
            <a-tab-pane key="4" tab="分组" v-if="multiple"></a-tab-pane>
            <a-tab-pane key="system" tab="动态参数" v-if="hasSys"></a-tab-pane>
          </a-tabs>
          <template v-if="activeKey === '1'">
            <BasicTree
              class="tree-main"
              :treeData="treeData"
              :load-data="onLoadData"
              @select="handleSelect"
              ref="treeRef"
              :key="treeKey"
              :loading="loading"
              v-if="!isAsync" />
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
        <div class="transfer-pane__body transfer-pane__body-tab" v-else>
          <div class="custom-title">全部数据</div>
          <ScrollContainer v-loading="loading && pagination.currentPage === 1" ref="infiniteBody">
            <div v-for="item in ableList" :key="item.id" class="selected-item selected-item-user" @click="handleNodeClick(item)">
              <div class="selected-item-main">
                <a-avatar :size="36" :src="apiUrl + item.headIcon" class="selected-item-headIcon" />
                <div class="selected-item-text">
                  <p class="name">{{ item.fullName }}</p>
                  <p class="organize" :title="item.organize">{{ item.organize }}</p>
                </div>
              </div>
            </div>
            <jnpf-empty v-if="!ableList.length" />
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
            <template v-if="selectedData.length">
              <template v-if="!multiple || selectType === 'custom'">
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
              </template>
              <template v-else>
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
            </template>
            <jnpf-empty v-if="!selectedData.length" />
          </ScrollContainer>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { getImUserSelector, getSelectedList, getSelectedUserList } from '/@/api/permission/user';
  import { Form, Modal as AModal } from 'ant-design-vue';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import { computed, ref, unref, watch, reactive, nextTick } from 'vue';
  import { BasicTree, TreeActionType } from '/@/components/Tree';
  import { ScrollContainer, ScrollActionType } from '/@/components/Container';
  import { usersSelectProps } from './props';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useOrganizeStore } from '/@/store/modules/organize';
  import { cloneDeep, pick } from 'lodash-es';

  const defaultSelectedList = [
    { id: 'department', type: 'department', fullName: '部门', icon: 'icon-ym icon-ym-tree-department1', children: [] },
    { id: 'position', type: 'position', fullName: '岗位', icon: 'icon-ym icon-ym-tree-position1', children: [] },
    { id: 'user', type: 'user', fullName: '用户', icon: 'icon-ym icon-ym-tree-user2', children: [] },
    { id: 'group', type: 'group', fullName: '分组', icon: 'icon-ym icon-ym-generator-group1', children: [] },
    { id: 'role', type: 'role', fullName: '角色', icon: 'icon-ym icon-ym-generator-role', children: [] },
    { id: 'system', type: 'system', fullName: '动态参数', icon: 'icon-ym icon-ym-tree-user2', children: [] },
  ];
  defineOptions({ name: 'JnpfUsersSelect', inheritAttrs: false });
  const props = defineProps(usersSelectProps);
  const emit = defineEmits(['update:value', 'change', 'labelChange']);
  const attrs: any = useAttrs({ excludeDefaultKeys: false });
  const { t } = useI18n();
  const organizeStore = useOrganizeStore();
  const globSetting = useGlobSetting();
  const apiUrl = ref(globSetting.apiUrl);
  const visible = ref(false);
  const treeRef = ref<Nullable<TreeActionType>>(null);
  const innerValue = ref<string | any[] | undefined>([]);
  const nodeId = ref('0');
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
  const options = ref<any[]>([]);
  const loading = ref(false);
  const selectedData = ref<any[]>([]);
  const formItemContext = Form.useInjectFormItemContext();
  const systemFieldList = ref<any[]>([
    { id: '@currentOrg', fullName: '当前组织', type: 'system', headIcon: '/api/file/Image/userAvatar/001.png' },
    { id: '@currentOrgAndSubOrg', fullName: '当前组织及子组织', type: 'system', headIcon: '/api/file/Image/userAvatar/001.png' },
    { id: '@currentGradeOrg', fullName: '当前分管组织', type: 'system', headIcon: '/api/file/Image/userAvatar/001.png' },
  ]);

  const getSelectBindValue = computed(() => ({
    ...pick(props, ['placeholder', 'disabled', 'size', 'allowClear']),
    fieldNames: { label: 'fullName', value: 'id' },
    open: false,
    mode: props.multiple ? 'multiple' : '',
    showSearch: false,
    showArrow: true,
    class: unref(attrs).class ? 'w-full ' + unref(attrs).class : 'w-full',
  }));
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
    () => props.value,
    () => {
      setValue();
    },
    { immediate: true },
  );
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
  watch(
    () => visible.value,
    val => {
      if (!val) activeKey.value = '';
    },
  );

  function setValue() {
    if (!props.value || !props.value.length) return setNullValue();
    const ids = props.multiple ? (props.value as any[]) : [props.value];
    if (!Array.isArray(ids)) return;
    // const selectSysData: any[] = getSelectSysData(ids);
    getSelectedList(unref(ids)).then(res => {
      if (!props.value || !props.value.length) return setNullValue();
      let selectedList: any[] = res.data.list.map(o => ({ ...o, id: o.type ? o.id + '--' + o.type : o.id }));
      const innerIds = selectedList.map(o => o.id);
      innerValue.value = props.multiple ? innerIds : innerIds[0];
      options.value = cloneDeep(selectedList);
      selectedData.value = cloneDeep(selectedList);
      const labels = selectedData.value.map(o => o.fullName).join();
      emit('labelChange', labels);
    });
  }
  function setNullValue() {
    innerValue.value = props.multiple ? [] : undefined;
    options.value = [];
    selectedData.value = [];
    emit('labelChange', '');
  }
  // function getSelectSysData(ids) {
  //   let list: any[] = [];
  //   for (let i = 0; i < unref(systemFieldList).length; i++) {
  //     inner: for (let j = 0; j < ids.length; j++) {
  //       if (unref(systemFieldList)[i].id + '--system' === ids[j]) {
  //         list.push({ ...unref(systemFieldList)[i], id: unref(systemFieldList)[i].id + '--system' });
  //         break inner;
  //       }
  //     }
  //   }
  //   return list;
  // }
  function onChange(_val, option) {
    selectedData.value = option ?? [];
    handleSubmit();
  }
  function onTagClose(i) {
    selectedData.value.splice(i, 1);
    handleSubmit();
  }
  function openSelectModal() {
    if (props.disabled) return;
    visible.value = true;
    isAsync.value = false;
    pagination.keyword = '';
    pagination.currentPage = 1;
    nodeId.value = '0';
    activeKey.value = '1';
    treeData.value = [];
    if (props.selectType === 'all') return setValue();
    ableList.value = [];
    finish.value = false;
    getAbleList();
    nextTick(() => {
      bindScroll();
      setValue();
    });
  }
  function handleCancel() {
    visible.value = false;
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
    if (props.selectType === 'all') {
      if (activeKey.value === '1') return initData();
      nextTick(() => {
        getTree().setSearchValue(val);
      });
    } else {
      ableList.value = [];
      getAbleList();
    }
  }
  function bindScroll() {
    const bodyRef = infiniteBody.value;
    const vBody = bodyRef?.getScrollWrap();
    vBody?.addEventListener('scroll', () => {
      if (vBody.scrollHeight - vBody.clientHeight - vBody.scrollTop <= 200 && !loading.value && !finish.value) {
        pagination.currentPage += 1;
        props.selectType === 'all' ? getAllList() : getAbleList();
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
    const usableList = props.multiple ? ['company', 'department', 'role', 'position', 'group', 'user', 'system'] : ['user'];
    if (!usableList.includes(data.type)) return;
    const boo = selectedData.value.some(o => o.id === data.id + '--' + data.type);
    if (boo) return;
    const item = cloneDeep(data);
    item.id += '--' + item.type;
    props.multiple ? selectedData.value.push(item) : (selectedData.value = [item]);
  }
  function removeAll() {
    selectedData.value = [];
  }
  function removeData(index: number) {
    selectedData.value.splice(index, 1);
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
    options.value = unref(selectedData);
    innerValue.value = props.multiple ? ids : ids[0];
    if (props.multiple) {
      emit('update:value', ids);
      emit('change', ids, unref(options));
    } else {
      emit('update:value', ids[0] || '');
      emit('change', ids[0] || '', unref(options)[0]);
    }
    formItemContext.onFieldChange();
    handleCancel();
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
  function getAbleList() {
    loading.value = true;
    const query = { pagination, ids: props.ableIds };
    getSelectedUserList(query).then(res => {
      if (res.data.list.length < pagination.pageSize) finish.value = true;
      ableList.value = [...ableList.value, ...res.data.list];
      loading.value = false;
    });
  }
  async function initData() {
    ableList.value = [];
    if (props.selectType === 'all') {
      if (activeKey.value === '1') return getAllList();
      loading.value = true;
      if (activeKey.value === '2') ableList.value = await organizeStore.getRoleTree();
      if (activeKey.value === '3') ableList.value = await organizeStore.getPositionTree();
      if (activeKey.value === '4') ableList.value = await organizeStore.getGroupTree();
      if (activeKey.value === 'system') ableList.value = cloneDeep(systemFieldList.value);
      nextTick(() => {
        getTree().setSearchValue('');
      });
      loading.value = false;
    }
  }
</script>
