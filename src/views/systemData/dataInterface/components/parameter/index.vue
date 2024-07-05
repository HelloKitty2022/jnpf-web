<template>
  <BasicTable @register="registerTable" :dataSource="list">
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'field'">
        <a-input v-model:value="record.field" placeholder="请输入" allowClear @change="onTableChange(record, index)" />
      </template>
      <template v-if="column.key === 'dataType'">
        <jnpf-select v-model:value="record.dataType" :options="typeList" placeholder="请选择" @change="onTableChange(record, index)" />
      </template>
      <template v-if="column.key === 'source'">
        <jnpf-select
          v-model:value="record.source"
          :options="getSourceList"
          placeholder="请选择"
          :disabled="sourceDisabled"
          @change="onTableChange(record, index, 'source')" />
      </template>
      <template v-if="column.key === 'defaultValue'">
        <jnpf-select
          v-if="record.source === 1 || record.source == 4 || record.source == 5"
          v-model:value="record.defaultValue"
          :options="record.source === 1 ? parameterJson : record.source === 4 ? pageParameters : echoParameters"
          :fieldNames="{ label: 'field', value: 'field' }"
          placeholder="请选择"
          allowClear
          @change="onTableChange(record, index)" />
        <jnpf-tree-select
          v-else-if="record.source === 2"
          v-model:value="record.defaultValue"
          :options="fieldTreeData"
          placeholder="请选择"
          lastLevel
          allowClear
          lastLevelKey="type"
          :lastLevelValue="1"
          @change="onTableChange(record, index)" />
        <a-input v-else-if="record.source === 3" v-model:value="record.defaultValue" placeholder="请输入" allowClear @change="onTableChange(record, index)" />
      </template>
      <template v-if="column.key === 'action'">
        <a-button class="action-btn" type="link" color="error" @click="remove(index)" size="small">删除</a-button>
      </template>
    </template>
  </BasicTable>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';

  const props = defineProps({
    list: { type: Array as any, default: () => [] },
    activeStep: { type: Number, default: 0 },
    hasPage: { type: Number, default: 0 },
    sourceDisabled: { type: Boolean, default: false },
    fieldTreeData: { type: Array, default: () => [] },
    parameterJson: { type: Array, default: () => [] },
  });
  const { t } = useI18n();
  const { createConfirm } = useMessage();
  const typeList = [
    { fullName: '字符串', id: 'varchar' },
    { fullName: '整型', id: 'int' },
    { fullName: '日期时间', id: 'datetime' },
    { fullName: '浮点', id: 'decimal' },
  ];
  const pageParameters = [{ field: 'currentPage' }, { field: 'pageSize' }, { field: 'keyword' }];
  const echoParameters = [{ field: 'showKey' }, { field: 'showValue' }];

  const columns: BasicColumn[] = [
    { title: '参数名', dataIndex: 'field' },
    { title: '类型', dataIndex: 'dataType' },
    { title: '来源', dataIndex: 'source' },
    { title: '参数值', dataIndex: 'defaultValue' },
    { title: '操作', dataIndex: 'action', width: 50 },
  ];
  const [registerTable] = useTable({
    columns,
    showIndexColumn: false,
    immediate: false,
    pagination: false,
    useSearchForm: false,
    showTableSetting: false,
    isCanResizeParent: true,
  });

  const getSourceList = computed(() => {
    const list = [
      { fullName: '变量', id: 2 },
      { fullName: '自定义', id: 3 },
    ];
    const parameter = { fullName: '接口参数', id: 1 };
    const page = { fullName: '分页参数', id: 4 };
    const echo = { fullName: '回显参数', id: 5 };
    return props.hasPage ? [parameter, props.activeStep == 1 ? page : echo, ...list] : [parameter, ...list];
  });

  function onTableChange(item, index, key?) {
    if (key === 'source') item.defaultValue = '';
    props.list[index] = item;
  }
  function remove(index) {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '此操作删除该数据, 是否继续?',
      onOk: () => {
        props.list.splice(index, 1);
      },
    });
  }
</script>
