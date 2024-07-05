<template>
  <div :class="[$attrs.class, 'select-tag-list']" v-if="buttonType === 'button'">
    <a-button preIcon="icon-ym icon-ym-btn-add" @click="openSelectModal">{{ modalTitle }}</a-button>
    <div class="tags">
      <a-tag class="!mt-10px" :closable="!disabled" v-for="(item, i) in options" :key="item.id" @close="onTagClose(i)">{{ item.organize }}</a-tag>
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
      <div class="transfer-pane">
        <div class="transfer-pane__tool">
          <a-input-search :placeholder="t('common.enterKeyword')" allowClear v-model:value="keyword" @search="handleSearch" />
        </div>
        <div class="transfer-pane__body transfer-pane__body-tab">
          <a-tabs v-model:activeKey="activeKey" :tabBarGutter="10" size="small" class="pane-tabs" v-if="hasSys">
            <a-tab-pane key="1" tab="全部数据"></a-tab-pane>
            <a-tab-pane key="system" tab="动态参数"></a-tab-pane>
          </a-tabs>
          <BasicTree class="tree-main" :treeData="treeData" @select="handleSelect" ref="treeRef" defaultExpandAll :loading="loading" />
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
              <span :title="item.organize">{{ item.organize }}</span>
              <delete-outlined class="delete-btn" @click="removeData(i)" />
            </div>
            <jnpf-empty v-if="!selectedData.length" />
          </ScrollContainer>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { getOrganizeSelectorByAuth, getDepartmentSelectorByAuth, getOrgByOrganizeCondition } from '/@/api/permission/organize';
  import { Form, Modal as AModal } from 'ant-design-vue';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import { computed, ref, unref, watch, onMounted, nextTick } from 'vue';
  import { BasicTree, TreeActionType } from '/@/components/Tree';
  import { ScrollContainer } from '/@/components/Container';
  import { organizeSelectProps } from './props';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useOrganizeStore } from '/@/store/modules/organize';
  import { cloneDeep, pick } from 'lodash-es';
  import { useTree } from '/@/components/Tree/src/hooks/useTree';

  defineOptions({ name: 'JnpfOrganizeSelect', inheritAttrs: false });
  const props = defineProps(organizeSelectProps);
  const emit = defineEmits(['update:value', 'change']);
  const attrs: any = useAttrs({ excludeDefaultKeys: false });
  const { t } = useI18n();
  const organizeStore = useOrganizeStore();
  const visible = ref(false);
  const treeRef = ref<Nullable<TreeActionType>>(null);
  const innerValue = ref<string | any[] | undefined>([]);
  const keyword = ref('');
  const activeKey = ref('');
  const treeData = ref<any[]>([]);
  const allList = ref<any[]>([]);
  const orgTreeData = ref<any[]>([]);
  const options = ref<any[]>([]);
  const loading = ref(false);
  const selectedIds = ref<any[]>([]);
  const selectedData = ref<any[]>([]);
  const formItemContext = Form.useInjectFormItemContext();
  const systemFieldList = ref<any[]>([
    { id: '@currentOrg', fullName: '当前组织', organizeIds: ['@currentOrg'], organize: '当前组织' },
    { id: '@currentOrgAndSubOrg', fullName: '当前组织及子组织', organizeIds: ['@currentOrgAndSubOrg'], organize: '当前组织及子组织' },
    { id: '@currentGradeOrg', fullName: '当前分管组织', organizeIds: ['@currentGradeOrg'], organize: '当前分管组织' },
  ]);

  const getSelectBindValue = computed(() => ({
    ...pick(props, ['placeholder', 'disabled', 'size', 'allowClear']),
    fieldNames: { label: 'organize', value: 'id' },
    open: false,
    mode: props.multiple ? 'multiple' : '',
    showSearch: false,
    showArrow: true,
    class: unref(attrs).class ? 'w-full ' + unref(attrs).class : 'w-full',
  }));
  const getFieldNames = computed(() => ({ children: 'children', label: 'fullName', value: 'id', key: 'id' }));

  const { getSelectedNode } = useTree(allList, getFieldNames);

  watch(
    () => props.value,
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
  watch(
    () => activeKey.value,
    val => {
      if (!val) return;
      keyword.value = '';
      if (props.selectType === 'all') {
        loading.value = true;
        if (activeKey.value === 'system') {
          treeData.value = cloneDeep(systemFieldList.value);
        } else {
          treeData.value = cloneDeep(orgTreeData.value);
        }
        nextTick(() => {
          handleSearch('');
        });
        loading.value = false;
      }
    },
  );

  function setValue() {
    if (!props.value || !props.value.length) {
      innerValue.value = props.multiple ? [] : undefined;
      options.value = [];
      selectedIds.value = [];
      selectedData.value = [];
      return;
    }
    const ids = props.multiple ? (props.value as any[]) : [props.value];
    if (!Array.isArray(ids[0])) return;
    selectedIds.value = cloneDeep(ids);
    let selectedList: any[] = [];
    for (let i = 0; i < ids.length; i++) {
      inner: for (let j = 0; j < allList.value.length; j++) {
        const organizeIds = allList.value[j].organizeIds;
        if (ids[i].join() === organizeIds.join()) {
          selectedList.push(allList.value[j]);
          break inner;
        }
      }
    }
    const innerIds = selectedList.map(o => o.id);
    innerValue.value = props.multiple ? innerIds : innerIds[0];
    options.value = cloneDeep(selectedList);
    selectedData.value = cloneDeep(selectedList);
  }
  function onChange(_val, option) {
    if (!option) {
      selectedData.value = [];
      selectedIds.value = [];
    } else {
      selectedData.value = option;
      selectedIds.value = option.map(o => o.organizeIds);
    }
    handleSubmit();
  }
  function onTagClose(i) {
    selectedIds.value.splice(i, 1);
    selectedData.value.splice(i, 1);
    handleSubmit();
  }
  function openSelectModal() {
    if (props.disabled) return;
    visible.value = true;
    activeKey.value = '1';
    keyword.value = '';
    treeData.value = [];
    initData();
    setValue();
    nextTick(() => {
      handleSearch('');
    });
  }
  function handleCancel() {
    visible.value = false;
  }
  function handleSearch(value) {
    getTree().setSearchValue(value);
  }
  function handleSelect(keys) {
    if (!keys.length) return;
    const data = getTree().getSelectedNode(keys[0]);
    if (data?.disabled) return;
    const currId = data?.organizeIds;
    if (props.multiple) {
      const boo = selectedIds.value.some(o => o.join() === currId.join());
      if (boo) return;
      selectedIds.value.push(currId);
      selectedData.value.push(data);
    } else {
      selectedIds.value = [currId];
      selectedData.value = [data];
    }
  }
  function removeAll() {
    selectedIds.value = [];
    selectedData.value = [];
  }
  function removeData(index: number) {
    selectedIds.value.splice(index, 1);
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
    const nodePathData = unref(selectedIds).map(o => o.map(i => getSelectedNode(i)));
    if (props.multiple) {
      emit('update:value', unref(selectedIds));
      emit('change', unref(selectedIds), unref(nodePathData));
    } else {
      emit('update:value', unref(selectedIds)[0] || []);
      emit('change', unref(selectedIds)[0] || [], unref(nodePathData)[0]);
    }
    formItemContext.onFieldChange();
    handleCancel();
  }
  async function initData() {
    loading.value = true;
    orgTreeData.value = await organizeStore.getOrganizeTree();
    const topItem = {
      fullName: '顶级节点',
      hasChildren: true,
      id: '-1',
      icon: 'icon-ym icon-ym-tree-organization3',
      organize: '顶级节点',
      organizeIds: ['-1'],
    };
    const organizeList = await organizeStore.getOrganizeList();
    allList.value = [...organizeList, ...systemFieldList.value, topItem];
    if (props.selectType === 'all') {
      if (props.auth) {
        if (props.isOnlyOrg && props.parentId === '-1') {
          treeData.value = [topItem];
          loading.value = false;
          return;
        }
        const method = props.isOnlyOrg ? getOrganizeSelectorByAuth : getDepartmentSelectorByAuth;
        const res = await method(props.currOrgId);
        treeData.value = res.data.list;
      } else {
        treeData.value = orgTreeData.value;
      }
      loading.value = false;
    } else {
      if (!props.ableIds?.length) {
        treeData.value = [];
        loading.value = false;
        return;
      }
      const departIds = props.ableIds ? props.ableIds.map(o => o[o.length - 1]) : [];
      const query = { departIds };
      getOrgByOrganizeCondition(query).then(res => {
        treeData.value = res.data.list;
        loading.value = false;
      });
    }
  }

  onMounted(() => {
    initData();
  });
</script>
