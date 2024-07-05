<template>
  <div class="table-box">
    <div class="title">
      <span> {{ type === 0 ? '接口参数' : '字段列表' }} <BasicHelp :text="type === 0 ? '接收方式:Body/json' : '设置接口返回字段'" /> </span>
    </div>
    <a-table
      size="small"
      rowKey="id"
      class="list"
      :class="type === 0 ? 'params-table' : 'field-table'"
      :data-source="list"
      :columns="getColumns"
      :scroll="{ x: undefined, y: scrollY }"
      :pagination="false">
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'drag'">
          <i class="drag-handler icon-ym icon-ym-darg" title="点击拖动" />
        </template>
        <template v-if="column.key === 'field'">
          <p @click="handleItemClick(record)" class="cursor-pointer">
            <span class="required-sign">{{ record.required ? '*' : '' }}</span>
            {{ record.field }}{{ record.fieldName && type === 0 ? '(' + record.fieldName + ')' : '' }}
          </p>
        </template>
        <template v-if="column.key === 'dataType'">
          <span>{{ getDataTypeText(record.dataType) }}</span>
        </template>
        <template v-if="column.key === 'action'">
          <a-space :size="10">
            <i class="icon-ym icon-ym-btn-edit" @click="addOrUpdateHandle(record)"></i>
            <i class="icon-ym icon-ym-delete" @click="remove(index)"></i>
          </a-space>
        </template>
      </template>
    </a-table>
    <div class="table-actions" @click="addOrUpdateHandle()">
      <a-button type="link" preIcon="icon-ym icon-ym-btn-add">{{ t('common.addText') }}</a-button>
    </div>
    <FieldForm @register="registerFiledForm" @reload="reload" :type="type" />
  </div>
</template>
<script lang="ts" setup>
  import { computed, onMounted } from 'vue';
  import { getDataTypeText } from '/@/utils/jnpf';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import FieldForm from './FieldForm.vue';
  import Sortablejs from 'sortablejs';

  const emit = defineEmits(['register', 'itemClick']);

  const props = defineProps({
    list: { type: Array, default: () => [] },
    type: { type: Number, default: 0 },
    scrollY: { type: String, default: 'calc(50vh - 218px)' },
  });

  const { t } = useI18n();
  const { createConfirm } = useMessage();
  const [registerFiledForm, { openModal: openFiledFormModal }] = useModal();

  const getColumns = computed(() => {
    const dragItem = { title: '拖动', dataIndex: 'drag', key: 'drag', align: 'center', width: 50 };
    const actionItem = { title: '操作', dataIndex: 'action', key: 'action', width: 70 };
    const columns = [
      { title: '参数名称', dataIndex: 'field', key: 'field' },
      { title: '参数类型', dataIndex: 'dataType', key: 'dataType', width: 80 },
    ];
    const columns_ = [
      { title: '字段名称', dataIndex: 'field', key: 'field', width: 110 },
      { title: '映射字段', dataIndex: 'defaultValue', key: 'defaultValue', width: 110 },
    ];
    const list = props.type === 0 ? columns : columns_;
    return [dragItem, ...list, actionItem];
  });

  function handleItemClick(record) {
    emit('itemClick', record);
  }
  function addOrUpdateHandle(item?) {
    openFiledFormModal(true, { item, list: props.list });
  }
  function remove(index) {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: `此操作删除该${props.type === 0 ? '参数' : '字段'}, 是否继续?`,
      onOk: () => {
        props.list.splice(index, 1);
      },
    });
  }
  function reload(type, item) {
    const data = JSON.parse(JSON.stringify(item));
    if (type == 'add') {
      props.list.push(data);
    } else {
      const index = props.list.findIndex((res: any) => res.id === data.id);
      if (index != -1) props.list[index] = data;
    }
  }
  function initSort(className) {
    const table: any = document.querySelector(`.${className} .ant-table-tbody`);
    Sortablejs.create(table, {
      handle: '.drag-handler',
      animation: 150,
      easing: 'cubic-bezier(1, 0, 0, 1)',
      onStart: () => {},
      onEnd: ({ newIndex, oldIndex }: any) => {
        setNodeSort(props.list, oldIndex - 1, newIndex - 1);
      },
    });
  }
  function setNodeSort(data: any, oldIndex: any, newIndex: any) {
    const currRow = data.splice(oldIndex, 1)[0];
    data.splice(newIndex, 0, currRow);
  }

  onMounted(() => {
    props.type === 0 ? initSort('params-table') : initSort('field-table');
  });
</script>
<style lang="less" scoped>
  .table-box {
    border: 1px solid @border-color-base;
    border-radius: 4px;
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    overflow: hidden;
    .title {
      height: 38px;
      line-height: 38px;
      display: flex;
      color: @text-color-label;
      font-size: 14px;
      padding: 0 10px;
      flex-shrink: 0;
      justify-content: space-between;
      align-items: center;
    }
    .table-actions {
      flex-shrink: 0;
      border-top: 1px dashed @border-color-base;
      text-align: center;
    }
    .list {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .icon-ym-btn-edit {
        color: @primary-color;
        cursor: pointer;
        font-size: 16px;
      }
      .icon-ym-delete {
        color: @error-color;
        cursor: pointer;
        font-size: 16px;
      }
    }
  }
</style>
