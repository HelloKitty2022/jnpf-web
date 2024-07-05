<template>
  <TreeSelect class="jnpf-tree-select" v-bind="getBindValue" v-model:value="innerValue" @change="onChange">
    <template #title="data">
      <slot name="title" v-bind="data || {}">
        <div :key="data.id" class="custom-tree-node">
          <i :class="data.icon" v-if="data.icon && showIcon" class="custom-tree-node-icon"></i>
          <span class="custom-tree-node-icon-name">{{ data[getFieldNames.label] }}</span>
        </div>
      </slot>
    </template>
    <template #[item]="data" v-for="item in Object.keys($slots)">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
  </TreeSelect>
</template>

<script lang="ts" setup>
  import { TreeSelect } from 'ant-design-vue';
  import { computed, unref, watch, ref, watchEffect } from 'vue';
  import { treeSelectProps, FieldNames } from './props';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { cloneDeep } from 'lodash-es';
  import { isArray } from '/@/utils/is';
  import { TreeItem } from '/@/components/Tree';
  import { useTree } from '/@/components/Tree/src/hooks/useTree';
  import { isBoolean } from '/@/utils/is';

  defineOptions({ name: 'JnpfTreeSelect', inheritAttrs: false });
  const props = defineProps(treeSelectProps);
  const emit = defineEmits(['update:modelValue', 'update:value', 'change']);
  const attrs: any = useAttrs({ excludeDefaultKeys: false });
  const innerValue = ref('');
  const treeDataRef = ref<TreeItem[]>([]);

  const getTreeData = computed(() => {
    const treeData = cloneDeep(props.options);
    if (props.multiple) return treeData;
    const loop = list => {
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (
          props.lastLevel &&
          ((isBoolean(props.lastLevelValue) && !!item[props.lastLevelKey] != props.lastLevelValue) ||
            (!isBoolean(props.lastLevelValue) && item[props.lastLevelKey] != props.lastLevelValue))
        ) {
          item.disabled = true;
        }
        if (item[unref(getFieldNames).children] && isArray(item[unref(getFieldNames).children])) loop(item[unref(getFieldNames).children]);
      }
    };
    loop(treeData);
    return treeData;
  });

  const getFieldNames = computed((): Required<FieldNames> => {
    const { fieldNames } = props;
    return {
      children: 'children',
      label: 'fullName',
      value: 'id',
      ...fieldNames,
      key: fieldNames.value || 'id',
    };
  });
  const getBindValue = computed(() => ({
    ...unref(attrs),
    ...props,
    treeCheckable: props.multiple,
    treeData: unref(getTreeData) as TreeItem[],
    fieldNames: unref(getFieldNames),
    showArrow: Reflect.has(unref(attrs), 'showArrow') ? unref(attrs).showArrow : true,
    showCheckedStrategy: Reflect.has(unref(attrs), 'showCheckedStrategy') ? unref(attrs).showCheckedStrategy : TreeSelect.SHOW_ALL,
    treeNodeFilterProp: unref(getFieldNames).label,
  }));

  const { getSelectedNode } = useTree(treeDataRef, getFieldNames);

  watch(
    () => props.modelValue,
    val => {
      setValue(val);
    },
    { immediate: true },
  );

  watch(
    () => props.value,
    val => {
      setValue(val);
    },
    { immediate: true },
  );

  watchEffect(() => {
    treeDataRef.value = props.options as TreeItem[];
  });

  function setValue(value) {
    innerValue.value = !!value || value === 0 ? value : props.multiple ? [] : undefined;
  }
  function onChange(value, _label, extra) {
    if (!props.multiple && value && extra.preValue.some(o => o.value === value)) return;
    const keys = props.multiple ? value : [value];
    const nodeList: TreeItem[] = [];
    for (let i = 0; i < keys.length; i++) {
      const node = getSelectedNode(keys[i]);
      if (node) nodeList.push(node);
    }
    const data = props.multiple ? nodeList : nodeList.length ? nodeList[0] : {};
    emit('update:modelValue', value);
    emit('update:value', value);
    emit('change', value, data);
  }
</script>
<style lang="less" scoped>
  .jnpf-tree-select {
    :deep(.ant-select-selection-item) {
      .custom-tree-node-icon {
        font-size: 14px;
        margin-right: 6px;
        line-height: 30px;
        vertical-align: top;
        display: none;
      }
    }
  }
</style>
<style lang="less">
  .ant-select-tree-treenode {
    .custom-tree-node-icon {
      font-size: 14px;
      margin-right: 6px;
      line-height: 24px;
      vertical-align: top;
    }
  }
</style>
