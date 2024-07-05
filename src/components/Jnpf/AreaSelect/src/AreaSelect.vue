<template>
  <a-select v-bind="getSelectBindValue" v-model:value="innerValue" :options="options" @change="onChange" @click="openSelectModal"></a-select>
  <a-modal v-model:visible="visible" title="省市区" :width="800" class="transfer-modal" @ok="handleSubmit" centered :maskClosable="false" :keyboard="false">
    <template #closeIcon>
      <ModalClose :canFullscreen="false" @cancel="handleCancel" />
    </template>
    <div class="transfer__body">
      <div class="transfer-pane">
        <div class="transfer-pane__tool">
          <span>全部数据</span>
        </div>
        <div class="transfer-pane__body">
          <BasicTree :treeData="treeData" :load-data="onLoadData" clickRowToExpand @select="handleSelect" ref="treeRef" :loading="loading" />
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
  </a-modal>
</template>

<script lang="ts" setup>
  import { getAreaSelector, getAreaByIds } from '/@/api/system/area';
  import { Form, Modal as AModal } from 'ant-design-vue';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import { computed, ref, unref, watch, onMounted } from 'vue';
  import { BasicTree, TreeActionType } from '/@/components/Tree';
  import { ScrollContainer } from '/@/components/Container';
  import { areaSelectProps } from './props';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { cloneDeep, pick } from 'lodash-es';
  import { useAttrs } from '/@/hooks/core/useAttrs';

  defineOptions({ name: 'JnpfAreaSelect', inheritAttrs: false });
  const props = defineProps(areaSelectProps);
  const emit = defineEmits(['update:value', 'change']);
  const attrs: any = useAttrs({ excludeDefaultKeys: false });
  const visible = ref(false);
  const treeRef = ref<Nullable<TreeActionType>>(null);
  const innerValue = ref<string | any[] | undefined>([]);
  const nodeId = ref('-1');
  const treeData = ref<any[]>([]);
  const options = ref<any[]>([]);
  const loading = ref(false);
  const selectedIds = ref<any[]>([]);
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

  function setValue() {
    if (!props.value || !props.value.length) return setNullValue();
    const ids = props.multiple ? (props.value as any[]) : [props.value];
    getAreaByIds(unref(ids)).then(res => {
      if (!props.value || !props.value.length) return setNullValue();
      selectedIds.value = cloneDeep(ids);
      const selectedList: any[] = res.data.map((o, i) => {
        const nodePath: any[] = [];
        for (let j = 0; j < o.length; j++) {
          const item = { id: ids[i][j], fullName: o[j] };
          nodePath.push(item);
        }
        return {
          id: ids[i].join(''),
          ids: ids[i],
          fullName: o.join('/'),
          nodePath,
        };
      });
      const innerIds = unref(selectedIds).map(o => o.join(''));
      innerValue.value = props.multiple ? innerIds : innerIds[0];
      options.value = cloneDeep(selectedList);
      selectedData.value = cloneDeep(selectedList);
    });
  }
  function setNullValue() {
    innerValue.value = props.multiple ? [] : undefined;
    options.value = [];
    selectedIds.value = [];
    selectedData.value = [];
  }
  function onChange(_val, option) {
    if (!option) {
      selectedData.value = [];
      selectedIds.value = [];
    } else {
      selectedData.value = option;
      selectedIds.value = option.map(o => o.ids);
    }
    handleSubmit();
  }
  function openSelectModal() {
    if (props.disabled) return;
    visible.value = true;
    setValue();
  }
  function handleCancel() {
    visible.value = false;
  }
  function getNodePath(node): any[] {
    let fullPath: any[] = [];
    const currNode = { ...node.dataRef };
    fullPath.push(currNode);
    if (node.parent) {
      const nodes = node.parent.nodes;
      fullPath = [...nodes, ...fullPath];
    }
    return fullPath;
  }
  function handleSelect(_keys, { node }) {
    if (!node.isLeaf || node.disabled) return;
    const nodePath: any[] = getNodePath(node).map(o => ({ id: o.id, fullName: o.fullName }));
    const currId = nodePath.map(o => o.id);
    if (currId.length !== props.level + 1) return;
    const data = {
      id: currId.join(''),
      ids: currId,
      fullName: nodePath.map(o => o.fullName).join('/'),
      nodePath,
    };
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
    const nodePathData = unref(selectedData).map(o => o.nodePath);
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
  function onLoadData(node) {
    const level = node.parent ? node.parent.level + 2 : 1;
    nodeId.value = node.id;
    return new Promise((resolve: (value?: unknown) => void) => {
      getAreaSelector(nodeId.value).then(res => {
        const list = res.data.list.map(value => ({
          ...value,
          isLeaf: level >= props.level ? true : value.isLeaf,
        }));
        getTree().updateNodeByKey(node.eventKey, { children: list, isLeaf: !list.length });
        resolve();
      });
    });
  }
  async function initData() {
    loading.value = true;
    getAreaSelector(nodeId.value).then(res => {
      const list = res.data.list.map(value => ({
        ...value,
        isLeaf: 0 >= props.level ? true : value.isLeaf,
      }));
      treeData.value = list;
      loading.value = false;
    });
  }

  onMounted(() => {
    initData();
  });
</script>
