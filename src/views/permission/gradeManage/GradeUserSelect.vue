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
    destroyOnClose
    :maskClosable="false"
    :keyboard="false">
    <template #closeIcon>
      <ModalClose :canFullscreen="false" @cancel="handleCancel" />
    </template>
    <div class="transfer__body">
      <div class="transfer-pane left-pane">
        <div class="transfer-pane__tool">
          <a-input-search :placeholder="t('common.enterKeyword')" allowClear v-model:value="keyword" @search="handleSearch" />
        </div>
        <div class="transfer-pane__body transfer-pane__body-tab">
          <BasicTree
            class="tree-main"
            :treeData="treeData"
            :load-data="onLoadData"
            clickRowToExpand
            @select="handleSelect"
            ref="treeRef"
            :loading="loading"
            :key="treeKey"
            v-if="!isAsync" />
          <ScrollContainer v-loading="loading" v-else>
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
  import { getUserInfoList, getListByAuthorize } from '/@/api/permission/user';
  import { Form, Modal as AModal } from 'ant-design-vue';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import { computed, ref, unref, watch, nextTick } from 'vue';
  import { BasicTree, TreeActionType } from '/@/components/Tree';
  import { ScrollContainer } from '/@/components/Container';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { cloneDeep, pick } from 'lodash-es';

  defineOptions({ name: 'GradeUserSelect', inheritAttrs: false });
  const props = defineProps({
    value: { type: [String, Array] as PropType<String | string[]> },
    multiple: { type: Boolean, default: false },
    placeholder: { type: String, default: '请选择' },
    disabled: { type: Boolean, default: false },
    allowClear: { type: Boolean, default: true },
    size: String,
    buttonType: { type: String as PropType<'' | 'select' | 'button' | undefined>, default: 'select' },
    modalTitle: { type: String, default: '选择用户' },
  });
  const emit = defineEmits(['update:value', 'change', 'labelChange']);
  const attrs: any = useAttrs({ excludeDefaultKeys: false });
  const { t } = useI18n();
  const globSetting = useGlobSetting();
  const apiUrl = ref(globSetting.apiUrl);
  const visible = ref(false);
  const treeRef = ref<Nullable<TreeActionType>>(null);
  const innerValue = ref<string | any[] | undefined>([]);
  const keyword = ref('');
  const treeData = ref<any[]>([]);
  const options = ref<any[]>([]);
  const loading = ref(false);
  const isAsync = ref<boolean>(false);
  const selectedData = ref<any[]>([]);
  const nodeId = ref('0');
  const treeKey = ref(+new Date());
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
    if (!props.value || !props.value.length) {
      innerValue.value = props.multiple ? [] : undefined;
      options.value = [];
      selectedData.value = [];
      emit('labelChange', '');
      return;
    }
    const ids = props.multiple ? (props.value as any[]) : [props.value];
    getUserInfoList(unref(ids)).then(res => {
      const selectedList: any[] = res.data.list;
      const innerIds = selectedList.map(o => o.id);
      innerValue.value = props.multiple ? innerIds : innerIds[0];
      options.value = cloneDeep(selectedList);
      selectedData.value = cloneDeep(selectedList);
      const labels = selectedData.value.map(o => o.fullName).join();
      emit('labelChange', labels);
    });
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
    keyword.value = '';
    nextTick(() => {
      handleSearch();
      setValue();
    });
  }
  function handleCancel() {
    visible.value = false;
  }
  function handleSearch() {
    treeKey.value = +new Date();
    nodeId.value = '0';
    treeData.value = [];
    isAsync.value = !!keyword.value;
    getAbleList();
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
      emit('update:value', ids[0]);
      emit('change', ids[0], unref(options)[0]);
    }
    formItemContext.onFieldChange();
    handleCancel();
  }
  function onLoadData(node) {
    nodeId.value = node.id;
    return new Promise((resolve: (value?: unknown) => void) => {
      getListByAuthorize(nodeId.value, keyword.value).then(res => {
        const list = res.data.list;
        getTree().updateNodeByKey(node.eventKey, { children: list, isLeaf: !list.length });
        resolve();
      });
    });
  }
  function getAbleList() {
    loading.value = true;
    if (keyword.value) nodeId.value = '0';
    getListByAuthorize(nodeId.value, keyword.value).then(res => {
      treeData.value = res.data.list;
      loading.value = false;
    });
  }
</script>
