<template>
  <jnpf-group-title content="字段设置" :bordered="false" />
  <a-table :data-source="drawingList" :columns="columns" size="small" :pagination="false" rowKey="id" class="search-table">
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'filedName'">
        <a-input v-model:value="record.filedName" placeholder="输入名称" allowClear />
      </template>
      <template v-if="column.key === 'filedId'">
        <a-input v-model:value="record.filedId" placeholder="输入字段" allowClear />
      </template>
      <template v-if="column.key === 'jnpfKey'">
        <jnpf-select v-model:value="record.jnpfKey" :options="componentList" :fieldNames="{ options: 'children' }" showSearch allowClear />
      </template>
      <template v-if="column.key === 'required' || column.key === 'multiple'">
        <a-checkbox v-model:checked="record[column.key]" />
      </template>
      <template v-if="column.key === 'action'">
        <a-button class="action-btn" type="link" color="error" @click="handleDelItem(index)" size="small">删除</a-button>
      </template>
    </template>
  </a-table>
  <div class="table-add-action" @click="handleAdd">
    <a-button type="link" preIcon="icon-ym icon-ym-btn-add">新增一行</a-button>
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, onMounted } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { cloneDeep } from 'lodash-es';
  import { inputComponents, selectComponents, systemComponents } from '/@/components/FormGenerator/src/helper/componentMap';

  defineExpose({ getData });
  const props = defineProps(['conf']);
  const { createMessage } = useMessage();

  const ignoreList = ['divider', 'text', 'link', 'alert', 'button', 'table'];
  const columns = [
    { title: '序号', width: 50, align: 'center', customRender: ({ index }) => index + 1 },
    { title: '名称', dataIndex: 'filedName', key: 'filedName' },
    { title: '字段', dataIndex: 'filedId', key: 'filedId' },
    { title: '控件类型', dataIndex: 'jnpfKey', key: 'jnpfKey', width: 150 },
    { title: '必填', dataIndex: 'required', key: 'required', width: 50, align: 'center' },
    { title: '多选', dataIndex: 'multiple', key: 'multiple', width: 50, align: 'center' },
    { title: '操作', dataIndex: 'action', key: 'action', width: 50, align: 'center' },
  ];
  const componentList = ref<any[]>([]);
  const drawingList = ref<any[]>([]);

  function getData() {
    return new Promise((resolve, reject) => {
      if (!exist()) return;
      if (!unref(drawingList).length) {
        reject({ msg: '表单列表不允许为空', target: 1 });
        return;
      }
      resolve({ formData: unref(drawingList), target: 1 });
    });
  }
  function getComponentList() {
    const realInputComponents = inputComponents
      .filter(o => !ignoreList.includes(o.__config__.jnpfKey))
      .map(o => ({ id: o.__config__.jnpfKey, fullName: o.__config__.label }));
    const realSelectComponents = selectComponents
      .filter(o => !ignoreList.includes(o.__config__.jnpfKey))
      .map(o => ({ id: o.__config__.jnpfKey, fullName: o.__config__.label }));
    const realSystemComponents = systemComponents.map(o => ({ id: o.__config__.jnpfKey, fullName: o.__config__.label }));
    componentList.value = [
      {
        id: '1',
        fullName: '基础控件',
        children: realInputComponents,
      },
      {
        id: '2',
        fullName: '高级控件',
        children: realSelectComponents,
      },
      {
        id: '3',
        fullName: '系统控件',
        children: realSystemComponents,
      },
    ];
  }
  function exist() {
    let isOk = true;
    for (let i = 0; i < unref(drawingList).length; i++) {
      const e = unref(drawingList)[i];
      if (!e.filedName) {
        createMessage.error('名称不能为空');
        isOk = false;
        break;
      }
      let num = unref(drawingList).filter(o => o.filedName == e.filedName);
      if (num.length > 1) {
        createMessage.error(`名称'${e.filedName}'已重复`);
        isOk = false;
        break;
      }
      if (!e.filedId) {
        createMessage.error('字段不能为空');
        isOk = false;
        break;
      }
      let idNum = unref(drawingList).filter(o => o.filedId == e.filedId);
      if (idNum.length > 1) {
        createMessage.error(`字段'${e.filedId}'已重复`);
        isOk = false;
        break;
      }
    }
    return isOk;
  }
  function handleDelItem(index) {
    drawingList.value.splice(index, 1);
  }
  function handleAdd() {
    let item = { filedName: '', filedId: '', jnpfKey: '', required: false, multiple: false };
    drawingList.value.push(item);
  }
  onMounted(() => {
    getComponentList();
    if (typeof props.conf === 'object' && props.conf !== null) {
      drawingList.value = cloneDeep(props.conf);
    }
  });
</script>
