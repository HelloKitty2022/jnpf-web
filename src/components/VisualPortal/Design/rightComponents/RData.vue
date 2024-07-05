<template>
  <a-collapse-panel>
    <template #header>数据设置</template>
    <a-form-item label="数据类型">
      <jnpf-radio v-model:value="activeData.dataType" :options="dataTypeOptions" optionType="button" buttonStyle="solid" @change="onDataTypeChange" />
    </a-form-item>
    <a-form-item label="数据设置" v-if="activeData.dataType === 'static'">
      <a-button @click="showData(activeData.option.defaultValue)">查看</a-button>
    </a-form-item>
    <a-form-item label="数据接口" v-if="activeData.dataType === 'dynamic'">
      <interface-modal :value="activeData.propsApi" :title="activeData.propsName" popupTitle="数据接口" @change="onPropsApiChange" />
    </a-form-item>
    <a-form-item label="参数设置" v-if="activeData.dataType === 'dynamic' && activeData.templateJson?.length">
      <select-interface-btn :templateJson="activeData.templateJson" :showSystemFormId="false" :type="2" />
    </a-form-item>
    <div v-if="activeData.option.styleType == 7 && activeData.jnpfKey == 'barChart'" class="my-20px">
      <a-table :data-source="activeData.option.barType" :columns="columns" size="small" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'"> {{ record[column.key] }} </template>
          <template v-if="column.key === 'type'">
            <jnpf-select v-model:value="record[column.key]" placeholder="请选择" :options="barTypeList" showSearch />
          </template>
        </template>
      </a-table>
    </div>
    <Refresh v-if="activeData.dataType === 'dynamic' && activeData.propsApi" :refresh="activeData.refresh" />
    <json-modal ref="JSONArea" @register="registerJson" @change="handleRefreshData" />
  </a-collapse-panel>
</template>
<script lang="ts" setup>
  import Refresh from './RRefresh.vue';
  import { InterfaceModal } from '/@/components/CommonModal';
  import { useModal } from '/@/components/Modal';
  import JsonModal from './RJsonModal.vue';
  import { SelectInterfaceBtn } from '/@/components/Interface';

  const props = defineProps(['activeData', 'showType']);
  const [registerJson, { openModal: openJsonModal }] = useModal();
  const barTypeList = [
    { fullName: '柱体', id: 'bar' },
    { fullName: '折线', id: 'line' },
  ];
  const dataTypeOptions = [
    { id: 'static', fullName: '静态数据' },
    { id: 'dynamic', fullName: '远端数据' },
  ];
  const columns = [
    { title: '系列', key: 'title', ellipsis: true },
    { title: '类型', key: 'type' },
  ];

  function onDataTypeChange() {
    props.activeData.propsApi = '';
    props.activeData.propsName = '';
  }
  function showData(val) {
    openJsonModal(true, { value: JSON.stringify(val) });
  }
  function onPropsApiChange(val, item) {
    if (val) {
      props.activeData.propsApi = val;
      props.activeData.propsName = item.fullName;
      props.activeData.refresh.autoRefresh = false;
      props.activeData.templateJson = item.parameterJson ? JSON.parse(item.parameterJson).map(o => ({ ...o, relationField: '', sourceType: 2 })) : [];
    } else {
      props.activeData.propsApi = '';
      props.activeData.propsName = '';
      props.activeData.templateJson = [];
    }
  }
  function handleRefreshData(data) {
    props.activeData.option.defaultValue = data ? JSON.parse(data) : [];
  }
</script>
