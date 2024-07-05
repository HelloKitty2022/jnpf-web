<template>
  <BasicPopup v-bind="$attrs" @register="registerModal" :title="getTitle" showOkBtn @ok="handleSubmit">
    <div class="m-10px mb-0">
      <BasicForm @register="registerForm" />
    </div>
    <div class="caption">
      <p class="title">字段设置</p>
      <a-dropdown :disabled="!commonFieldList.length">
        <template #overlay>
          <a-menu>
            <a-menu-item :key="item.field" v-for="item in commonFieldList" @click="handleAdd(item)">{{ item.field }}</a-menu-item>
          </a-menu>
        </template>
        <a-button>常用字段<DownOutlined /></a-button>
      </a-dropdown>
    </div>
    <a-table :data-source="fieldList" :columns="getColumns" size="small" :pagination="false" rowKey="index" class="drag-table">
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'drag'">
          <i class="drag-handler icon-ym icon-ym-darg" title="点击拖动" />
        </template>
        <template v-if="record.disabled">
          <a-checkbox :checked="record[column.key]" v-if="['primaryKey', 'allowNull'].includes(column.key)" />
          <template v-if="column.key === 'dataType'">{{ getDataTypeText(record[column.key]) }}</template>
        </template>
        <template v-else>
          <template v-if="column.key === 'field'">
            <a-input v-model:value="record.field" placeholder="请输入" :maxlength="50" />
          </template>
          <template v-if="column.key === 'dataLength'">
            <a-input-number v-model:value="record.dataLength" placeholder="请输入" :disabled="record.dataType !== 'varchar' && record.dataType !== 'decimal'" />
          </template>
          <template v-if="column.key === 'dataType'">
            <jnpf-select v-model:value="record.dataType" placeholder="请选择" :options="options" />
          </template>
          <template v-if="column.key === 'primaryKey'">
            <a-checkbox v-model:checked="record.primaryKey" @change="onKeyChange($event, record)" />
          </template>
          <template v-if="column.key === 'identity'">
            <a-checkbox v-model:checked="record.identity" v-if="record.primaryKey" />
            <span v-else></span>
          </template>
          <template v-if="column.key === 'allowNull'">
            <a-checkbox v-model:checked="record.allowNull" />
          </template>
          <template v-if="column.key === 'fieldName'">
            <a-input v-model:value="record.fieldName" placeholder="请输入" :maxlength="50" />
          </template>
        </template>
        <template v-if="column.key === 'action'">
          <a-button class="action-btn" type="link" color="error" @click="handleDelItem(index)" size="small" v-if="!record.disabled">删除</a-button>
        </template>
      </template>
    </a-table>
    <div class="table-add-action" @click="handleAdd()">
      <a-button type="link" preIcon="icon-ym icon-ym-btn-add">新增一行</a-button>
    </div>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { getDataModelInfo as getInfo, createDataModel as create, updateDataModel as update, addTableFields } from '/@/api/systemData/dataModel';
  import { getCommonFieldsList } from '/@/api/systemData/commonFields';
  import { ref, unref, computed, reactive } from 'vue';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import Sortablejs from 'sortablejs';
  import { getDataTypeText } from '/@/utils/jnpf';
  import { buildBitUUID } from '/@/utils/uuid';
  import { useI18n } from '/@/hooks/web/useI18n';

  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const { t } = useI18n();

  const options = [
    { fullName: '字符串', id: 'varchar' },
    { fullName: '整型', id: 'int' },
    { fullName: '日期时间', id: 'datetime' },
    { fullName: '浮点', id: 'decimal' },
    { fullName: '长整型', id: 'bigint' },
    { fullName: '文本', id: 'text' },
  ];
  const dataForm = reactive({
    value: {
      table: '',
      tableName: '',
      newTable: '',
    },
  });
  const linkId = ref('');
  const dbType = ref('');
  const hasTableData = ref(false);
  const fieldList = ref<any[]>([]);
  const commonFieldList = ref<any[]>([]);
  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    baseColProps: { span: 8 },
    labelWidth: 100,
    schemas: [
      {
        field: 'newTable',
        label: '表名称',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 50 },
        rules: [
          { required: true, trigger: 'blur', message: '必填' },
          { pattern: /(^_([A-Za-z0-9]_?)*$)|(^[A-Za-z](_?[A-Za-z0-9])*_?$)/, message: '请输入正确的表名称', trigger: 'blur' },
        ],
      },
      {
        field: 'tableName',
        label: '表说明',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 50 },
        rules: [{ required: true, trigger: 'blur', message: '必填' }],
      },
    ],
  });
  const getColumns = computed(() => {
    let list: any[] = [
      { title: '拖动', dataIndex: 'drag', key: 'drag', align: 'center', width: 50 },
      {
        width: 50,
        title: '序号',
        align: 'center',
        customRender: ({ index }) => index + 1,
      },
      { title: '列名', dataIndex: 'field', key: 'field' },
      { title: '类型', dataIndex: 'dataType', key: 'dataType', width: 200 },
      { title: '长度', dataIndex: 'dataLength', key: 'dataLength' },
      { title: '是否主键', dataIndex: 'primaryKey', key: 'primaryKey', align: 'center', width: 80 },
      { title: '自增长ID', dataIndex: 'identity', key: 'identity', align: 'center', width: 80 },
      { title: '允许空', dataIndex: 'allowNull', key: 'allowNull', align: 'center', width: 80 },
      { title: '说明', dataIndex: 'fieldName', key: 'fieldName' },
      { title: '操作', dataIndex: 'action', key: 'action', width: 50 },
    ];
    if (['Oracle', 'PostgreSQL', 'KingbaseES'].includes(dbType.value)) list = list.filter(o => o.key != 'identity');
    return list;
  });
  const [registerModal, { closePopup, changeLoading, changeOkLoading }] = usePopupInner(init);

  const getTitle = computed(() => (!unref(dataForm.value.table) ? t('common.addText') : t('common.editText')));

  function init(data) {
    dataForm.value.table = data.table;
    linkId.value = data.linkId;
    dbType.value = data.dbType;
    fieldList.value = [];
    getFieldList();
    changeLoading(true);
    resetFields();
    if (dataForm.value.table) {
      getInfo(unref(linkId), dataForm.value.table).then(res => {
        dataForm.value = res.data.tableInfo;
        dataForm.value.newTable = dataForm.value.table;
        setFieldsValue(dataForm.value);
        let tableFieldList = res.data.tableFieldList.map(o => ({
          ...o,
          index: buildBitUUID(),
          primaryKey: !!o.primaryKey,
          allowNull: !!o.allowNull,
          identity: !!o.identity,
        }));
        hasTableData.value = res.data.hasTableData || false;
        if (hasTableData.value) {
          tableFieldList = tableFieldList.map(o => ({ ...o, disabled: true }));
        }
        fieldList.value = tableFieldList;
        changeLoading(false);
      });
    } else {
      hasTableData.value = false;
      dataForm.value.newTable = data.table || '';
      changeLoading(false);
    }
    initSort();
  }
  function initSort() {
    const table: any = document.querySelector(`.drag-table .ant-table-tbody`);
    Sortablejs.create(table, {
      handle: '.drag-handler',
      animation: 150,
      easing: 'cubic-bezier(1, 0, 0, 1)',
      onStart: () => {},
      // 结束拖动事件
      onEnd: ({ newIndex, oldIndex }: any) => {
        setNodeSort(fieldList.value, oldIndex, newIndex);
      },
    });
  }
  const setNodeSort = (data: any, oldIndex: any, newIndex: any) => {
    const currRow = data.splice(oldIndex, 1)[0];
    data.splice(newIndex, 0, currRow);
  };
  function handleDelItem(index) {
    fieldList.value.splice(index, 1);
  }
  function handleAdd(row: undefined | Recordable = undefined) {
    const index = buildBitUUID();
    let item = {};
    if (!row) {
      item = {
        field: '',
        dataType: 'varchar',
        dataLength: 50,
        allowNull: true,
        primaryKey: false,
        fieldName: '',
        index,
      };
    } else {
      item = {
        field: row.field,
        dataType: row.dataType,
        dataLength: row.dataLength,
        allowNull: !!row.allowNull,
        fieldName: row.fieldName,
        primaryKey: false,
        index,
      };
    }
    fieldList.value.push(item);
  }
  function onKeyChange(e, row) {
    row.identity = false;
    if (!e.target.checked) return;
    row.allowNull = false;
    for (let i = 0; i < fieldList.value.length; i++) {
      if (row.field != fieldList.value[i].field) {
        fieldList.value[i].primaryKey = false;
      }
    }
  }
  function getFieldList() {
    getCommonFieldsList().then(res => {
      commonFieldList.value = res.data.list;
    });
  }
  function exist() {
    let isOk = true;
    for (let i = 0; i < fieldList.value.length; i++) {
      const e = fieldList.value[i];
      if (!e.field) {
        createMessage.error(`第${i + 1}行列名不能为空`);
        isOk = false;
        break;
      }
      let reg = /(^_([a-zA-Z0-9]_?)*$)|(^[a-zA-Z](_?[a-zA-Z0-9])*_?$)/;
      if (!reg.test(e.field)) {
        createMessage.error(`第${i + 1}行列名格式错误，请重新输入`);
        isOk = false;
        break;
      }
      let num = fieldList.value.filter(o => o.field == e.field);
      if (num.length > 1) {
        createMessage.error(`第${i + 1}行列名'${e.field}'已重复`);
        isOk = false;
        break;
      }
      if (!e.fieldName) {
        createMessage.error(`第${i + 1}行说明不能为空`);
        isOk = false;
        break;
      }
    }
    return isOk;
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    if (!fieldList.value.length) return createMessage.error('请至少添加一个字段');
    if (!exist()) return;
    let boo = fieldList.value.some(o => o.primaryKey);
    if (!boo) return createMessage.error('请选择一个字段作为主键');
    changeOkLoading(true);
    const tableInfo = { ...dataForm.value, ...values };
    const tableFieldList = hasTableData.value ? fieldList.value.filter(o => !o.disabled) : fieldList.value;
    const query = {
      tableFieldList: tableFieldList.map(o => ({
        ...o,
        primaryKey: o.primaryKey ? 1 : 0,
        allowNull: o.allowNull ? 1 : 0,
        identity: o.identity && o.primaryKey ? 1 : 0,
      })),
      tableInfo,
    };
    const formMethod = hasTableData.value ? addTableFields : dataForm.value.table ? update : create;
    formMethod(unref(linkId), query)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        closePopup();
        setTimeout(() => {
          emit('reload');
        }, 200);
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
</script>
<style lang="less" scoped>
  .caption {
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;

    .title {
      line-height: 24px;
      font-size: 16px;
    }
  }
</style>
