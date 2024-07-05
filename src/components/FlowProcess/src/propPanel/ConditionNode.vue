<template>
  <section class="common-pane condition-pane">
    <ScrollContainer class="config-content condition-content">
      <div class="condition-main">
        <div class="mb-10px" v-if="formConf.conditions?.length">
          <span class="mr-10px">分组匹配逻辑</span>
          <jnpf-select v-model:value="formConf.matchLogic" placeholder="请选择" :options="logicOptions" class="!w-68px" />
        </div>
        <div class="condition-list" v-for="(item, index) in formConf.conditions" :key="index">
          <a-row :gutter="8">
            <a-col :span="5" class="!flex align-middle flex-nowrap">
              <span class="leading-32px mr-10px">条件逻辑</span>
              <jnpf-select
                v-model:value="item.logic"
                placeholder="请选择"
                class="!flex-1"
                :options="logicOptions"
                @change="(val, data) => onLogicChange(item, val, data)" />
            </a-col>
            <a-col :span="18">
              <a-button preIcon="icon-ym icon-ym-btn-add" @click="addItem(index)">添加条件</a-button>
              <a-button preIcon="icon-ym icon-ym-nav-close" class="ml-8px" @click="delGroup(index)">删除分组</a-button>
            </a-col>
          </a-row>
          <a-row :gutter="8" v-for="(child, childIndex) in item.groups" :key="index + childIndex" class="mt-10px">
            <a-col :span="9" class="!flex items-center">
              <jnpf-select v-model:value="child.fieldType" :options="conditionTypeOptions" @change="onFieldTypeChange(child)" class="!w-85px" />
              <jnpf-select
                v-model:value="child.field"
                :options="usedFormItems"
                placeholder="请选择字段"
                allowClear
                showSearch
                :fieldNames="{ options: 'options1' }"
                class="!flex-1"
                @change="(val, data) => onFieldChange(child, val, data, index, childIndex)"
                v-if="child.fieldType === 1" />
              <a-button @click="editFormula(child, index, childIndex)" class="!flex-1" v-if="child.fieldType === 3">公式编辑</a-button>
            </a-col>
            <a-col :span="5">
              <jnpf-select
                class="w-full"
                v-model:value="child.symbol"
                placeholder="运算符号"
                :options="symbolOptions"
                @change="(val, data) => onSymbolChange(child, val, data)" />
            </a-col>
            <a-col :span="9" class="!flex items-center">
              <jnpf-select v-model:value="child.fieldValueType" :options="conditionTypeOptions1" @change="onFieldValueTypeChange(child)" class="!w-85px" />
              <jnpf-select
                v-model:value="child.fieldValue"
                :options="usedFormItems"
                placeholder="请选择字段"
                allowClear
                showSearch
                :fieldNames="{ options: 'options1' }"
                class="flex-1"
                @change="(val, data) => onFieldValueChange(child, val, data)"
                v-if="child.fieldValueType === 1" />
              <div class="flex-1 w-150px" v-if="child.fieldValueType === 2">
                <template v-if="child.jnpfKey === 'inputNumber'">
                  <a-input-number v-model:value="child.fieldValue" placeholder="请输入" :precision="child.precision" />
                </template>
                <template v-else-if="child.jnpfKey === 'calculate'">
                  <a-input-number v-model:value="child.fieldValue" placeholder="请输入" :precision="2" />
                </template>
                <template v-else-if="['rate', 'slider'].includes(child.jnpfKey)">
                  <a-input-number v-model:value="child.fieldValue" placeholder="请输入" />
                </template>
                <template v-else-if="child.jnpfKey === 'switch'">
                  <jnpf-switch v-model:value="child.fieldValue" />
                </template>
                <template v-else-if="child.jnpfKey === 'timePicker'">
                  <jnpf-time-picker v-model:value="child.fieldValue" :format="child.format || 'HH:mm:ss'" allowClear />
                </template>
                <template v-else-if="['datePicker', 'createTime', 'modifyTime'].includes(child.jnpfKey)">
                  <jnpf-date-picker v-model:value="child.fieldValue" :format="child.format" allowClear @change="onConditionDateChange($event, child)" />
                </template>
                <template v-else-if="['organizeSelect', 'currOrganize'].includes(child.jnpfKey)">
                  <jnpf-organize-select v-model:value="child.fieldValue" allowClear @change="(val, data) => onConditionListChange(child, val, data)" />
                </template>
                <template v-else-if="['depSelect'].includes(child.jnpfKey)">
                  <jnpf-dep-select v-model:value="child.fieldValue" allowClear @change="(val, data) => onConditionObjChange(child, val, data)" />
                </template>
                <template v-else-if="child.jnpfKey === 'roleSelect'">
                  <jnpf-role-select v-model:value="child.fieldValue" allowClear @change="(val, data) => onConditionObjChange(child, val, data)" />
                </template>
                <template v-else-if="child.jnpfKey === 'groupSelect'">
                  <jnpf-group-select v-model:value="child.fieldValue" allowClear @change="(val, data) => onConditionObjChange(child, val, data)" />
                </template>
                <template v-else-if="['posSelect', 'currPosition'].includes(child.jnpfKey)">
                  <jnpf-pos-select v-model:value="child.fieldValue" allowClear @change="(val, data) => onConditionObjChange(child, val, data)" />
                </template>
                <template v-else-if="['userSelect', 'createUser', 'modifyUser'].includes(child.jnpfKey)">
                  <jnpf-user-select v-model:value="child.fieldValue" hasSys allowClear @change="(val, data) => onConditionObjChange(child, val, data)" />
                </template>
                <template v-else-if="['usersSelect'].includes(child.jnpfKey)">
                  <jnpf-users-select v-model:value="child.fieldValue" allowClear @change="(val, data) => onConditionObjChange(child, val, data)" />
                </template>
                <template v-else-if="child.jnpfKey === 'areaSelect'">
                  <jnpf-area-select
                    v-model:value="child.fieldValue"
                    :level="child.level"
                    allowClear
                    @change="(val, data) => onConditionListChange(child, val, data)" />
                </template>
                <template v-else>
                  <a-input v-model:value="child.fieldValue" placeholder="请输入" allowClear />
                </template>
              </div>
            </a-col>
            <a-col :span="1" class="text-center">
              <i class="icon-ym icon-ym-btn-clearn" @click="delItem(index, childIndex)" />
            </a-col>
          </a-row>
        </div>
        <span class="link-text mt-10px inline-block" @click="addGroup()"><i class="icon-ym icon-ym-btn-add text-14px mr-4px"></i>添加分组</span>
      </div>
      <a-form :colon="false" layout="vertical" :model="formConf" class="config-form !m-10px" v-if="formConf.conditionType === 1">
        <a-form-item label="转向节点">
          <jnpf-select v-model:value="formConf.swerveNode" placeholder="请选择" :options="beforeNodeOptions" showSearch @change="onSwerveNodeChange" />
        </a-form-item>
      </a-form>
    </ScrollContainer>
    <FormulaModal @register="registerFormulaModal" @confirm="updateFormula" />
  </section>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { ScrollContainer } from '/@/components/Container';
  import { useModal } from '/@/components/Modal';
  import FormulaModal from './FormulaModal.vue';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { cloneDeep } from 'lodash-es';

  const props = defineProps([
    'value' /* 当前节点数据 */,
    'processData' /* 整个节点数据 */,
    'formInfo',
    'formConf',
    'formFieldList',
    'printTplOptions',
    'flowType',
    'formFieldsOptions',
    'usedFormItems',
    'funcOptions',
    'funcRequiredOptions',
    'initFormOperates',
    'updateAllNodeFormOperates',
    'getFormFieldList',
    'beforeNodeOptions',
  ]);
  defineOptions({ name: 'conditionNode', inheritAttrs: false });
  defineExpose({ getContent });
  const [registerFormulaModal, { openModal: openFormulaModal }] = useModal();
  const conditionTypeOptions = [
    { id: 1, fullName: '字段' },
    { id: 3, fullName: '公式' },
  ];
  const conditionTypeOptions1 = [
    { id: 1, fullName: '字段' },
    { id: 2, fullName: '自定义' },
  ];
  const symbolOptions = [
    { id: '>=', fullName: '大于等于' },
    { id: '>', fullName: '大于' },
    { id: '==', fullName: '等于' },
    { id: '<=', fullName: '小于等于' },
    { id: '<', fullName: '小于' },
    { id: '<>', fullName: '不等于' },
    { id: 'like', fullName: '包含' },
    { id: 'notLike', fullName: '不包含' },
  ];
  const logicOptions = [
    { id: 'and', fullName: 'and' },
    { id: 'or', fullName: 'or' },
  ];
  const emptyChildItem = {
    fieldName: '',
    symbolName: '',
    fieldValue: undefined,
    fieldType: 1,
    fieldValueType: 2,
    fieldLabel: '',
    fieldValueJnpfKey: '',
    logicName: '并且',
    field: '',
    symbol: '',
    logic: '&&',
    jnpfKey: '',
    cellKey: +new Date(),
  };
  const emptyItem = { logic: 'and', groups: [emptyChildItem] };
  const activeIndex = ref(0);
  const activeChildIndex = ref(0);

  function addItem(index) {
    props.formConf.conditions[index].groups.push(cloneDeep(emptyChildItem));
  }
  function delItem(index, childIndex) {
    props.formConf.conditions[index].groups.splice(childIndex, 1);
  }
  function addGroup() {
    props.formConf.conditions.push(cloneDeep(emptyItem));
  }
  function delGroup(index) {
    props.formConf.conditions.splice(index, 1);
  }
  function editFormula(item, index, childIndex) {
    activeIndex.value = index;
    activeChildIndex.value = childIndex;
    openFormulaModal(true, { value: item.field, fieldsOptions: props.formFieldsOptions });
  }
  function updateFormula(formula) {
    props.formConf.conditions[activeIndex.value].groups[activeChildIndex.value].field = formula;
    props.formConf.conditions[activeIndex.value].groups[activeChildIndex.value].fieldName = formula;
  }
  function onFieldTypeChange(item) {
    item.field = '';
    handleNull(item);
  }
  function onFieldChange(item, val, data, index, childIndex) {
    if (!val) return handleNull(item);
    item.fieldName = data.__config__.label;
    item.jnpfKey = data.__config__.jnpfKey;
    const newItem = cloneDeep(emptyChildItem);
    for (let key of Object.keys(newItem)) {
      newItem[key] = item[key];
    }
    item = { ...newItem, ...data };
    if (item.fieldValueType == 2) {
      item.fieldValue = undefined;
      item.fieldLabel = '';
      item.fieldValueJnpfKey = '';
    }
    props.formConf.conditions[index].groups[childIndex] = item;
  }
  function handleNull(item) {
    item.fieldName = '';
    item.jnpfKey = '';
    if (item.fieldValueType == 2) {
      item.fieldValue = undefined;
      item.fieldLabel = '';
      item.fieldValueJnpfKey = '';
    }
  }
  function onSymbolChange(item, val, data) {
    item.symbolName = val ? data.fullName : '';
  }
  function onFieldValueChange(item, val, data) {
    item.fieldLabel = val ? data.fullName : '';
    item.fieldValueJnpfKey = val ? data.__config__.jnpfKey : '';
  }
  function onFieldValueTypeChange(item) {
    item.fieldValue = '';
    item.fieldLabel = '';
    item.fieldValueJnpfKey = '';
  }
  function onLogicChange(item, val, data) {
    item.logicName = val ? data.fullName : '';
  }
  function onConditionDateChange(val, item) {
    if (!val) return (item.fieldLabel = '');
    const format = item.format || 'YYYY-MM-DD HH:mm:ss';
    item.fieldLabel = formatToDateTime(val, format);
  }
  function onConditionListChange(item, val, data) {
    if (!val) return (item.fieldLabel = '');
    const labelList = data.map(o => o.fullName);
    item.fieldLabel = labelList.join('/');
  }
  function onConditionObjChange(item, val, data) {
    if (!val) return (item.fieldLabel = '');
    item.fieldLabel = data.fullName || '';
  }
  function onSwerveNodeChange(val, data) {
    if (!val) return (props.formConf.swerveLabel = '');
    props.formConf.swerveLabel = data.fullName || '';
  }
  function getContent() {
    let content = '';
    for (let i = 0; i < props.formConf.conditions.length; i++) {
      const e = props.formConf.conditions[i];
      content += props.formConf.conditions.length == 1 ? '' : (i == 0 ? '' : ` ${props.formConf.matchLogic} `) + '( ';
      for (let j = 0; j < e.groups.length; j++) {
        const groups = e.groups[j];
        const logic = j == 0 ? '' : ` ${e.logic} `;
        const text = `[ ${groups.fieldName} ${groups.symbolName}
        ${groups.fieldLabel ? groups.fieldLabel : groups.fieldValue || groups.fieldValue === 0 ? groups.fieldValue : ''} ]`;
        content += logic + text;
      }
      content += props.formConf.conditions.length == 1 ? '' : ' )';
    }
    if (props.formConf.conditionType == 1) content += ' 转向' + props.formConf.swerveLabel;
    return content;
  }
</script>
