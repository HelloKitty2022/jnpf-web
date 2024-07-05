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
          <a-tabs v-model:activeKey="activeKey" :tabBarGutter="10" size="small" class="pane-tabs">
            <a-tab-pane key="1" tab="全部数据"></a-tab-pane>
            <a-tab-pane key="2" tab="当前组织"></a-tab-pane>
            <a-tab-pane key="3" tab="我的下属"></a-tab-pane>
            <a-tab-pane key="4" tab="系统变量" v-if="hasSys"></a-tab-pane>
          </a-tabs>
          <template v-if="activeKey === '1'">
            <BasicTree
              class="tree-main"
              :treeData="treeData"
              :load-data="onLoadData"
              clickRowToExpand
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
          <ScrollContainer v-loading="loading" v-else>
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
  </a-modal>
</template>

<script lang="ts" setup>
  import { getImUserSelector, getUserInfoList, getSubordinates, getOrganization, getSelectedUserList } from '/@/api/permission/user';
  import { Form, Modal as AModal } from 'ant-design-vue';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import { computed, ref, unref, watch, reactive, nextTick } from 'vue';
  import { BasicTree, TreeActionType } from '/@/components/Tree';
  import { ScrollContainer, ScrollActionType } from '/@/components/Container';
  import { userSelectProps } from './props';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { cloneDeep, pick } from 'lodash-es';

  defineOptions({ name: 'JnpfUserSelect', inheritAttrs: false });
  const props = defineProps(userSelectProps);
  const emit = defineEmits(['update:value', 'change', 'labelChange']);
  const attrs: any = useAttrs({ excludeDefaultKeys: false });
  const { t } = useI18n();
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
  const ableQuery = reactive<Recordable>({ ids: [] });
  const sysUserList = ref<any[]>([
    {
      id: 'currentUser',
      fullName: '当前用户',
      headIcon: '/api/file/Image/userAvatar/001.png',
    },
  ]);
  const ableList = ref<any[]>([]);
  const options = ref<any[]>([]);
  const loading = ref(false);
  const selectedData = ref<any[]>([]);
  const formItemContext = Form.useInjectFormItemContext();

  const getSelectBindValue = computed(() => ({
    ...pick(props, ['placeholder', 'disabled', 'size', 'allowClear']),
    fieldNames: { label: 'fullName', value: 'id' },
    open: false,
    mode: props.multiple ? 'multiple' : '',
    showSearch: false,
    showArrow: true,
    class: unref(attrs).class ? 'w-full ' + unref(attrs).class : 'w-full',
  }));

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
    const hasSysItem = ids.some(o => o === 'currentUser');
    getUserInfoList(unref(ids)).then(res => {
      if (!props.value || !props.value.length) return setNullValue();
      const selectedList: any[] = res.data.list;
      if (hasSysItem) selectedList.push(...sysUserList.value);
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
    if (props.selectType === 'custom') {
      ableQuery.ids = props.ableIds;
    } else {
      const suffix = '--' + getAbleKey(props.selectType);
      let ableIds = !props.ableRelationIds ? [] : Array.isArray(props.ableRelationIds) ? props.ableRelationIds : [props.ableRelationIds];
      ableQuery.ids = ableIds.map(o => o + suffix);
    }
    ableList.value = [];
    finish.value = false;
    getAbleList();
    nextTick(() => {
      bindScroll();
      setValue();
    });
  }

  function getAbleKey(selectType) {
    if (selectType === 'dep') return 'department';
    if (selectType === 'pos') return 'position';
    return selectType;
  }
  function handleCancel() {
    visible.value = false;
  }
  function handleSearch() {
    treeKey.value = +new Date();
    nodeId.value = '0';
    treeData.value = [];
    ableList.value = [];
    pagination.currentPage = 1;
    isAsync.value = !!pagination.keyword;
    finish.value = false;
    if (isAsync.value && activeKey.value === '1') {
      nextTick(() => {
        bindScroll();
      });
    }
    if (props.selectType === 'all') {
      initData();
    } else {
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
    if (data?.disabled || data?.type !== 'user') return;
    handleNodeClick(data);
  }
  function handleNodeClick(data) {
    const boo = selectedData.value.some(o => o.id === data.id);
    if (boo) return;
    props.multiple ? selectedData.value.push(data) : (selectedData.value = [data]);
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
    const query = { pagination, ...ableQuery };
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
      if (activeKey.value === '2') {
        loading.value = true;
        getOrganization({ keyword: pagination.keyword, organizeId: '0' }).then(res => {
          ableList.value = res.data;
          loading.value = false;
        });
      }
      if (activeKey.value === '3') {
        loading.value = true;
        getSubordinates(pagination.keyword).then(res => {
          ableList.value = res.data;
          loading.value = false;
        });
      }
      if (activeKey.value === '4') {
        ableList.value = cloneDeep(sysUserList.value);
      }
    }
  }
</script>
