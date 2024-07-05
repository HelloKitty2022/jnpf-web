<template>
  <div class="condition-main">
    <div class="mb-10px" v-if="conditionList.length">
      <span class="mr-10px">分组匹配逻辑</span>
      <jnpf-select v-model:value="matchLogic" placeholder="请选择" :options="logicOptions" class="!w-68px" />
    </div>
    <div class="condition-list" v-for="(item, index) in conditionList" :key="index">
      <a-row :gutter="8">
        <a-col :span="6" class="!flex align-middle flex-nowrap">
          <span class="leading-32px mr-10px">条件逻辑</span>
          <jnpf-select v-model:value="item.logic" placeholder="请选择" :options="logicOptions" class="!flex-1" />
        </a-col>
        <a-col :span="5">
          <a-button preIcon="icon-ym icon-ym-btn-add" @click="addItem(index)" class="!w-full">添加条件</a-button>
        </a-col>
        <a-col :span="5">
          <a-button preIcon="icon-ym icon-ym-nav-close" @click="delGroup(index)">删除分组</a-button>
        </a-col>
      </a-row>
      <a-row :gutter="8" v-for="(child, childIndex) in item.groups" :key="index + childIndex" class="mt-10px">
        <a-col :span="6">
          <jnpf-select
            v-model:value="child.field"
            :options="fieldOptions"
            placeholder="请选择"
            showSearch
            allowClear
            :fieldNames="{ options: 'options1' }"
            @change="(val, data) => onFieldChange(val, data, child, index, childIndex)" />
        </a-col>
        <a-col :span="5">
          <jnpf-select
            v-model:value="child.symbol"
            placeholder="运算符号"
            :options="getSymbolOptions(child.jnpfKey)"
            :dropdownMatchSelectWidth="false"
            @change="(val, data) => onSymbolChange(val, data, child)" />
        </a-col>
        <a-col :span="4" v-if="showFieldValueType">
          <jnpf-select
            v-model:value="child.fieldValueType"
            :options="sourceTypeOptions"
            placeholder="请选择"
            :disabled="child.disabled"
            @change="child.fieldValue = undefined" />
        </a-col>
        <a-col :span="8" v-if="child.fieldValueType === 1">
          <jnpf-select
            v-model:value="child.fieldValue"
            :options="valueFieldOptions"
            placeholder="请选择"
            showSearch
            allowClear
            :fieldNames="{ options: 'options1' }"
            :disabled="child.disabled" />
        </a-col>
        <a-col :span="showFieldValueType ? 8 : 12" v-if="child.fieldValueType !== 1">
          <template v-if="child.jnpfKey === 'inputNumber'">
            <jnpf-number-range v-model:value="child.fieldValue" :precision="child.precision" :disabled="child.disabled" v-if="child.symbol == 'between'" />
            <jnpf-input-number v-model:value="child.fieldValue" :precision="child.precision" :disabled="child.disabled" placeholder="请输入" v-else />
          </template>
          <template v-else-if="child.jnpfKey === 'calculate'">
            <jnpf-number-range v-model:value="child.fieldValue" :precision="child.precision || 0" :disabled="child.disabled" v-if="child.symbol == 'between'" />
            <jnpf-input-number v-model:value="child.fieldValue" :precision="child.precision || 0" :disabled="child.disabled" placeholder="请输入" v-else />
          </template>
          <template v-else-if="['rate', 'slider'].includes(child.jnpfKey)">
            <jnpf-number-range
              v-model:value="child.fieldValue"
              :precision="child.jnpfKey == 'rate' && child.allowHalf ? 1 : 0"
              :disabled="child.disabled"
              v-if="child.symbol == 'between'" />
            <jnpf-input-number
              v-model:value="child.fieldValue"
              :precision="child.jnpfKey == 'rate' && child.allowHalf ? 1 : 0"
              :disabled="child.disabled"
              placeholder="请输入"
              v-else />
          </template>
          <div class="pt-3px" v-else-if="child.jnpfKey === 'switch'">
            <jnpf-switch v-model:value="child.fieldValue" :disabled="child.disabled" />
          </div>
          <template v-else-if="child.jnpfKey === 'colorPicker'">
            <jnpf-color-picker v-model:value="child.fieldValue" size="small" :disabled="child.disabled" />
          </template>
          <template v-else-if="child.jnpfKey === 'timePicker'">
            <jnpf-time-range v-model:value="child.fieldValue" :format="child.format" allowClear :disabled="child.disabled" v-if="child.symbol == 'between'" />
            <jnpf-time-picker v-model:value="child.fieldValue" :format="child.format" allowClear :disabled="child.disabled" v-else />
          </template>
          <template v-else-if="['datePicker', 'createTime', 'modifyTime'].includes(child.jnpfKey)">
            <jnpf-date-range
              v-model:value="child.fieldValue"
              :format="child.format || 'YYYY-MM-DD HH:mm:ss'"
              allowClear
              :disabled="child.disabled"
              v-if="child.symbol == 'between'" />
            <jnpf-date-picker v-model:value="child.fieldValue" :format="child.format || 'YYYY-MM-DD HH:mm:ss'" allowClear :disabled="child.disabled" v-else />
          </template>
          <template v-else-if="['organizeSelect', 'currOrganize'].includes(child.jnpfKey)">
            <jnpf-organize-select
              v-model:value="child.fieldValue"
              allowClear
              :selectType="child.selectType"
              :ableIds="child.ableIds"
              :multiple="child.multiple"
              :disabled="child.disabled" />
          </template>
          <template v-else-if="['depSelect'].includes(child.jnpfKey)">
            <jnpf-dep-select
              v-model:value="child.fieldValue"
              allowClear
              :selectType="child.selectType"
              :ableIds="child.ableIds"
              :multiple="child.multiple"
              :disabled="child.disabled" />
          </template>
          <template v-else-if="child.jnpfKey === 'roleSelect'">
            <jnpf-role-select
              v-model:value="child.fieldValue"
              allowClear
              :selectType="child.selectType"
              :ableIds="child.ableIds"
              :multiple="child.multiple"
              :disabled="child.disabled" />
          </template>
          <template v-else-if="child.jnpfKey === 'groupSelect'">
            <jnpf-group-select
              v-model:value="child.fieldValue"
              allowClear
              :selectType="child.selectType"
              :ableIds="child.ableIds"
              :multiple="child.multiple"
              :disabled="child.disabled" />
          </template>
          <template v-else-if="child.jnpfKey === 'posSelect'">
            <jnpf-pos-select
              v-model:value="child.fieldValue"
              allowClear
              :selectType="child.selectType"
              :ableIds="child.ableIds"
              :multiple="child.multiple"
              :disabled="child.disabled" />
          </template>
          <template v-else-if="child.jnpfKey === 'currPosition'">
            <jnpf-pos-select v-model:value="child.fieldValue" allowClear :multiple="child.multiple" :disabled="child.disabled" />
          </template>
          <template v-else-if="['createUser', 'modifyUser'].includes(child.jnpfKey)">
            <jnpf-user-select v-model:value="child.fieldValue" allowClear :multiple="child.multiple" :disabled="child.disabled" />
          </template>
          <template v-else-if="['userSelect'].includes(child.jnpfKey)">
            <jnpf-user-select
              v-model:value="child.fieldValue"
              allowClear
              :selectType="child.selectType != 'all' && child.selectType != 'custom' ? 'all' : child.selectType"
              :ableIds="child.ableIds"
              :multiple="child.multiple"
              :disabled="child.disabled" />
          </template>
          <template v-else-if="['usersSelect'].includes(child.jnpfKey)">
            <jnpf-users-select
              v-model:value="child.fieldValue"
              allowClear
              :selectType="child.selectType"
              :ableIds="child.ableIds"
              :multiple="child.multiple"
              :disabled="child.disabled" />
          </template>
          <template v-else-if="child.jnpfKey === 'areaSelect'">
            <jnpf-area-select
              v-model:value="child.fieldValue"
              :level="child.level"
              allowClear
              :multiple="child.multiple"
              :disabled="child.disabled"
              :key="item.cellKey" />
          </template>
          <template v-else-if="['select', 'radio', 'checkbox'].includes(child.jnpfKey)">
            <jnpf-select
              v-model:value="child.fieldValue"
              placeholder="请选择"
              showSearch
              allowClear
              :options="child.options"
              :fieldNames="child.props"
              :multiple="child.multiple"
              :disabled="child.disabled" />
          </template>
          <template v-else-if="child.jnpfKey === 'cascader'">
            <jnpf-cascader
              v-model:value="child.fieldValue"
              :options="child.options"
              :fieldNames="child.props"
              :showAllLevels="child.showAllLevels"
              showSearch
              allowClear
              placeholder="请选择"
              :multiple="child.multiple"
              :disabled="child.disabled" />
          </template>
          <template v-else-if="child.jnpfKey === 'treeSelect'">
            <jnpf-tree-select
              v-model:value="child.fieldValue"
              :options="child.options"
              :fieldNames="child.props"
              showSearch
              allowClear
              placeholder="请选择"
              :multiple="child.multiple"
              :disabled="child.disabled" />
          </template>
          <template v-else-if="child.jnpfKey === 'relationForm'">
            <jnpf-relation-form
              v-model:value="child.fieldValue"
              placeholder="请选择"
              :modelId="child.modelId"
              allowClear
              :columnOptions="child.columnOptions"
              :relationField="child.relationField"
              :hasPage="child.hasPage"
              :pageSize="child.pageSize"
              :popupType="child.popupType"
              :popupTitle="child.popupTitle"
              :popupWidth="child.popupWidth"
              :disabled="child.disabled" />
          </template>
          <template v-else-if="child.jnpfKey === 'popupSelect' || child.jnpfKey === 'popupTableSelect'">
            <jnpf-popup-select
              v-model:value="child.fieldValue"
              placeholder="请选择"
              :interfaceId="child.interfaceId"
              allowClear
              :multiple="child.multiple"
              :columnOptions="child.columnOptions"
              :propsValue="child.propsValue"
              :templateJson="child.templateJson"
              :relationField="child.relationField"
              :hasPage="child.hasPage"
              :pageSize="child.pageSize"
              :popupType="child.popupType"
              :popupTitle="child.popupTitle"
              :popupWidth="child.popupWidth"
              :disabled="child.disabled" />
          </template>
          <template v-else-if="child.jnpfKey === 'autoComplete'">
            <jnpf-auto-complete
              v-model:value="child.fieldValue"
              placeholder="请输入"
              allowClear
              :interfaceId="child.interfaceId"
              :relationField="child.relationField"
              :templateJson="child.templateJson"
              :total="child.total"
              :disabled="child.disabled" />
          </template>
          <template v-else>
            <a-input v-model:value="child.fieldValue" placeholder="请输入" allowClear :disabled="child.disabled" />
          </template>
        </a-col>
        <a-col :span="1" class="text-center">
          <i class="icon-ym icon-ym-btn-clearn" @click="delItem(index, childIndex)" />
        </a-col>
      </a-row>
    </div>
    <div class="query-noData" v-show="!conditionList.length && isSuperQuery">
      <img src="../../../../assets/images/query-noData.png" class="noData-img" />
      <div class="noData-txt">
        <span>没有任何查询条件</span>
        <a-divider type="vertical"></a-divider>
        <span class="link-text" @click="addGroup">点击新增</span>
      </div>
    </div>
    <span class="link-text mt-10px inline-block" @click="addGroup()" v-show="conditionList.length || !isSuperQuery">
      <i class="icon-ym icon-ym-btn-add text-14px mr-4px"></i>添加分组
    </span>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, toRefs } from 'vue';
  import { getDictionaryDataSelector } from '/@/api/systemData/dictionary';
  import { getDataInterfaceRes } from '/@/api/systemData/dataInterface';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { cloneDeep } from 'lodash-es';
  import { dyOptionsList } from '/@/components/FormGenerator/src/helper/config';
  import { JnpfRelationForm } from '/@/components/Jnpf';
  import { isEmpty } from '/@/utils/is';
  import { getParamList } from '/@/utils/jnpf';

  interface State {
    conditionList: any[];
    fieldOptions: any[];
    matchLogic: string;
  }

  const props = defineProps({
    isSuperQuery: { type: Boolean, default: false },
    defaultAddEmpty: { type: Boolean, default: false },
    showFieldValueType: { type: Boolean, default: false },
    valueFieldOptions: { type: Array, default: () => [] },
  });
  defineExpose({
    init,
    confirm,
    updateConditionList,
  });

  const { createMessage } = useMessage();
  const notSupportList = [
    'relationFormAttr',
    'popupAttr',
    'uploadFile',
    'uploadImg',
    'colorPicker',
    'editor',
    'link',
    'button',
    'text',
    'alert',
    'table',
    'sign',
    'signature',
  ];
  const emptyChildItem = {
    field: '',
    symbol: '',
    jnpfKey: '',
    fieldValueType: props.showFieldValueType ? 1 : 2,
    fieldValue: undefined,
    fieldValueJnpfKey: '',
    cellKey: +new Date(),
  };
  const emptyItem = { logic: 'and', groups: [emptyChildItem] };
  const sourceTypeOptions = [
    { id: 1, fullName: '字段' },
    { id: 2, fullName: '自定义' },
  ];
  const logicOptions = [
    { id: 'and', fullName: 'and' },
    { id: 'or', fullName: 'or' },
  ];
  const baseSymbolOptions = [
    { id: '==', fullName: '等于' },
    { id: '<>', fullName: '不等于' },
    { id: 'like', fullName: '包含' },
    { id: 'notLike', fullName: '不包含' },
    { id: 'null', fullName: '为空' },
    { id: 'notNull', fullName: '不为空' },
  ];
  const rangeSymbolOptions = [
    { id: '>=', fullName: '大于等于' },
    { id: '>', fullName: '大于' },
    { id: '==', fullName: '等于' },
    { id: '<=', fullName: '小于等于' },
    { id: '<', fullName: '小于' },
    { id: '<>', fullName: '不等于' },
    { id: 'between', fullName: '介于' },
    { id: 'null', fullName: '为空' },
    { id: 'notNull', fullName: '不为空' },
  ];
  const selectSymbolOptions = [
    { id: '==', fullName: '等于' },
    { id: '<>', fullName: '不等于' },
    { id: 'in', fullName: '包含任意一个' },
    { id: 'notIn', fullName: '不包含任意一个' },
    { id: 'null', fullName: '为空' },
    { id: 'notNull', fullName: '不为空' },
  ];
  const switchSymbolOptions = [
    { id: '==', fullName: '等于' },
    { id: '<>', fullName: '不等于' },
  ];
  const locationSymbolOptions = [
    { id: 'like', fullName: '包含' },
    { id: 'notLike', fullName: '不包含' },
    { id: 'null', fullName: '为空' },
    { id: 'notNull', fullName: '不为空' },
  ];
  const relationFormSymbolOptions = [...switchSymbolOptions, { id: 'null', fullName: '为空' }, { id: 'notNull', fullName: '不为空' }];
  const useRangeSymbolList = ['calculate', 'inputNumber', 'rate', 'slider', 'datePicker', 'timePicker', 'createTime', 'modifyTime'];
  const useSelectSymbolList = [
    'radio',
    'checkbox',
    'select',
    'treeSelect',
    'cascader',
    'areaSelect',
    'organizeSelect',
    'depSelect',
    'posSelect',
    'userSelect',
    'usersSelect',
    'roleSelect',
    'groupSelect',
    'createUser',
    'modifyUser',
    'currOrganize',
    'currPosition',
    'popupTableSelect',
  ];
  const useSwitchSymbolList = ['switch'];
  const useRelationFormSymbolList = ['relationForm', 'popupSelect'];
  const state = reactive<State>({
    conditionList: [],
    fieldOptions: [],
    matchLogic: 'and',
  });
  const { conditionList, fieldOptions, matchLogic } = toRefs(state);

  function init(data) {
    updateConditionList(data);
    const fieldOptions = data.fieldOptions.filter(o => !notSupportList.includes(o.__config__.jnpfKey));
    state.fieldOptions = buildOptions(fieldOptions);
    if (!state.conditionList.length && props.defaultAddEmpty) addGroup();
  }
  function updateConditionList(data) {
    state.conditionList = cloneDeep(data.conditionList || []);
    state.matchLogic = data.matchLogic || 'and';
  }
  function buildOptions(componentList) {
    componentList.forEach(cur => {
      cur.disabled = false;
      const config = cur.__config__;
      if (dyOptionsList.includes(config.jnpfKey)) {
        if (config.dataType === 'dictionary' && config.dictionaryType) {
          cur.options = [];
          getDictionaryDataSelector(config.dictionaryType).then(res => {
            cur.options = res.data.list;
          });
        }
        if (config.dataType === 'dynamic' && config.propsUrl) {
          cur.options = [];
          const query = { paramList: getParamList(config.templateJson) };
          getDataInterfaceRes(config.propsUrl, query).then(res => {
            cur.options = Array.isArray(res.data) ? res.data : [];
          });
        }
      }
    });
    return componentList;
  }
  function onFieldChange(val, data, item, index, childIndex) {
    item.cellKey = +new Date();
    if (item.fieldValueType != 1) {
      item.fieldValue = undefined;
      item.fieldValueJnpfKey = '';
    }
    const newItem = cloneDeep(emptyChildItem);
    for (let key of Object.keys(newItem)) {
      newItem[key] = item[key];
    }
    if (!val) {
      item.jnpfKey = '';
      item.symbol = undefined;
      item.disabled = false;
      return;
    }
    item = { ...newItem, ...data };
    const config = data.__config__;
    if (item.jnpfKey != config.jnpfKey) item.symbol = undefined;
    item.jnpfKey = data.__config__?.jnpfKey || '';
    item.disabled = ['null', 'notNull'].includes(item.symbol);
    item.multiple = ['in', 'notIn'].includes(item.symbol);
    state.conditionList[index].groups[childIndex] = item;
  }
  function onSymbolChange(val, _data, item) {
    item.fieldValue = undefined;
    item.disabled = ['null', 'notNull'].includes(val);
    item.multiple = ['in', 'notIn'].includes(val);
    if (props.showFieldValueType && ['null', 'notNull'].includes(val)) {
      item.fieldValueType = 1;
      item.fieldValueJnpfKey = '';
    }
  }
  function addItem(index) {
    state.conditionList[index].groups.push(cloneDeep(emptyChildItem));
  }
  function delItem(index, childIndex) {
    state.conditionList[index].groups.splice(childIndex, 1);
  }
  function addGroup() {
    state.conditionList.push(cloneDeep(emptyItem));
  }
  function delGroup(index) {
    state.conditionList.splice(index, 1);
  }
  function getSymbolOptions(jnpfKey) {
    if (useSwitchSymbolList.includes(jnpfKey)) return switchSymbolOptions;
    if (useRelationFormSymbolList.includes(jnpfKey)) return relationFormSymbolOptions;
    if (useRangeSymbolList.includes(jnpfKey)) return rangeSymbolOptions;
    if (useSelectSymbolList.includes(jnpfKey)) return selectSymbolOptions;
    if (jnpfKey == 'location') return locationSymbolOptions;
    return baseSymbolOptions;
  }
  function exist() {
    let isOk = true;
    for (let i = 0; i < state.conditionList.length; i++) {
      const e = state.conditionList[i];
      for (let j = 0; j < e.groups.length; j++) {
        const child = e.groups[j];
        if (!child.field) {
          createMessage.warning('条件字段不能为空');
          isOk = false;
          return;
        }
        if (!child.symbol) {
          createMessage.warning('条件符号不能为空');
          isOk = false;
          return;
        }
        if (!['null', 'notNull'].includes(child.symbol) && ((!child.fieldValue && child.fieldValue !== 0) || isEmpty(child.fieldValue))) {
          createMessage.warning('数据值不能为空');
          isOk = false;
          return;
        }
      }
    }
    return isOk;
  }
  function confirm() {
    if (!exist()) return false;
    return {
      matchLogic: state.matchLogic,
      conditionList: cloneDeep(state.conditionList),
    };
  }
</script>
