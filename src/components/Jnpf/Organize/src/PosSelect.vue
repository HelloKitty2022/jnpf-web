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
      <div class="transfer-pane">
        <div class="transfer-pane__tool">
          <a-input-search :placeholder="t('common.enterKeyword')" allowClear v-model:value="keyword" @search="handleSearch" />
        </div>
        <div class="transfer-pane__body transfer-pane__body-tab">
          <a-tabs v-model:activeKey="activeKey" :tabBarGutter="10" size="small" @tabClick="onTabClick" class="pane-tabs" v-if="hasSys">
            <a-tab-pane key="1" tab="岗位"></a-tab-pane>
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
          <template v-if="hasSys">
            <div v-for="(item, index) in getSelectedTree" :key="index" class="selected-item-user-multiple">
              <template v-if="item.children.length">
                <p class="selected-item-title">
                  <i :class="item.icon"></i><span>{{ item.fullName }}</span>
                </p>
                <div v-for="(child, i) in item.children" :key="i" class="selected-item selected-item-user">
                  <div class="selected-item-main">
                    <div class="selected-item-icon">{{ child.fullName.substring(0, 1) }}</div>
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
          <ScrollContainer v-else>
            <div v-for="(item, i) in selectedData" :key="i" class="selected-item">
              <span :title="item.fullName">{{ item.fullName }}</span>
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
  import { getPositionByCondition } from '/@/api/permission/position';
  import { getSelectedList } from '/@/api/permission/user';
  import { Form, Modal as AModal } from 'ant-design-vue';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import { computed, ref, unref, watch, onMounted, nextTick } from 'vue';
  import { BasicTree, TreeActionType } from '/@/components/Tree';
  import { ScrollContainer } from '/@/components/Container';
  import { posSelectProps } from './props';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { useOrganizeStore } from '/@/store/modules/organize';
  import { cloneDeep, pick } from 'lodash-es';

  defineOptions({ name: 'JnpfPosSelect', inheritAttrs: false });
  const props = defineProps(posSelectProps);
  const emit = defineEmits(['update:value', 'change', 'labelChange']);
  const attrs: any = useAttrs({ excludeDefaultKeys: false });
  const { t } = useI18n();
  const organizeStore = useOrganizeStore();
  const visible = ref(false);
  const treeRef = ref<Nullable<TreeActionType>>(null);
  const innerValue = ref<string | any[] | undefined>([]);
  const keyword = ref('');
  const activeKey = ref('1');
  const positionTree = ref<any[]>([]);
  const treeData = ref<any[]>([]);
  const allList = ref<any[]>([]);
  const options = ref<any[]>([]);
  const loading = ref(false);
  const selectedData = ref<any[]>([]);
  const formItemContext = Form.useInjectFormItemContext();
  const defaultSelectedList = [
    { id: 'department', type: 'department', fullName: '部门', icon: 'icon-ym icon-ym-tree-department1', children: [] },
    { id: 'position', type: 'position', fullName: '岗位', icon: 'icon-ym icon-ym-tree-position1', children: [] },
    { id: 'system', type: 'system', fullName: '动态参数', icon: 'icon-ym icon-ym-tree-user2', children: [] },
  ];
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

  function setValue() {
    if (!props.value || !props.value.length) {
      innerValue.value = props.multiple ? [] : undefined;
      options.value = [];
      selectedData.value = [];
      emit('labelChange', '');
      return;
    }
    const ids = props.multiple ? (props.value as any[]) : [props.value];
    if (!Array.isArray(ids)) return;
    if (!props.hasSys) {
      let selectedList: any[] = [];
      for (let i = 0; i < ids.length; i++) {
        inner: for (let j = 0; j < allList.value.length; j++) {
          if (ids[i] === allList.value[j].id) {
            selectedList.push(allList.value[j]);
            break inner;
          }
        }
      }
      const innerIds = selectedList.map(o => o.id);
      innerValue.value = props.multiple ? innerIds : innerIds[0];
      options.value = cloneDeep(selectedList);
      selectedData.value = cloneDeep(selectedList);
      const labels = selectedData.value.map(o => o.fullName).join();
      emit('labelChange', labels);
    } else {
      // const selectSysData: any[] = getSelectSysData(ids);
      getSelectedList(unref(ids)).then(res => {
        let selectedList: any[] = res.data.list.map(o => ({ ...o, id: o.type ? o.id + '--' + o.type : o.id }));
        const innerIds = selectedList.map(o => o.id);
        innerValue.value = props.multiple ? innerIds : innerIds[0];
        options.value = cloneDeep(selectedList);
        selectedData.value = cloneDeep(selectedList);
        const labels = selectedData.value.map(o => o.fullName).join();
        emit('labelChange', labels);
      });
    }
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
  function onTabClick(val) {
    keyword.value = '';
    treeData.value = val == '1' ? positionTree.value : systemFieldList.value;
    nextTick(() => {
      handleSearch('');
    });
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
    const data: any = getTree().getSelectedNode(keys[0]);
    const usableList = props.hasSys ? ['company', 'department', 'position', 'system'] : ['position'];
    if (data?.disabled || !usableList.includes(data?.type)) return;
    const boo = props.hasSys ? selectedData.value.some(o => o.id === data.id + '--' + data.type) : selectedData.value.some(o => o.id === data.id);
    if (boo) return;
    const item = cloneDeep(data);
    if (props.hasSys) item.id += '--' + item.type;
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
  async function initData() {
    loading.value = true;
    const positionList = await organizeStore.getPositionList();
    allList.value = [...positionList, ...systemFieldList.value];
    if (props.selectType === 'all') {
      positionTree.value = await organizeStore.getPositionTree();
      treeData.value = activeKey.value == '1' ? positionTree.value : systemFieldList.value;
      loading.value = false;
    } else {
      if (!props.ableIds?.length) {
        treeData.value = [];
        loading.value = false;
        return;
      }
      const query = { ids: props.ableIds };
      getPositionByCondition(query).then(res => {
        treeData.value = res.data.list || [];
        loading.value = false;
      });
    }
  }

  onMounted(() => {
    initData();
  });
</script>
