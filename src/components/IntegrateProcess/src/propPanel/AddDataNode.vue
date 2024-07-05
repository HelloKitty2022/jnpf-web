<template>
  <section class="common-pane">
    <ScrollContainer class="config-content">
      <a-form :colon="false" layout="vertical" :model="formConf" class="config-form">
        <a-form-item label="目标表单">
          <FormListModal :value="formConf.formId" :title="formConf.formName" :allowClear="false" @change="onFormIdChange" placeholder="请选择" />
          <jnpf-select v-model:value="formConf.flowId" :options="flowOptions" placeholder="请选择流程" showSearch class="!mt-10px" v-if="formConf.enableFlow" />
        </a-form-item>
        <a-form-item label="字段设置" class="!flex-nowrap">
          <div class="condition-main">
            <a-row :gutter="8">
              <a-col :span="7">选择目标表单字段</a-col>
              <a-col :span="3"></a-col>
              <a-col :span="14">设置触发表单字段或自定义值 </a-col>
            </a-row>
            <a-row :gutter="8" v-for="(item, index) in formConf.transferList" :key="index" class="mt-10px">
              <a-col :span="7">
                <jnpf-select
                  v-model:value="item.targetField"
                  :options="getTargetOptions(index)"
                  placeholder="请选择"
                  showSearch
                  allowClear
                  :disabled="item.required"
                  :fieldNames="{ options: 'options1' }" />
              </a-col>
              <a-col :span="3" class="leading-32px">的值设为</a-col>
              <a-col :span="5">
                <jnpf-select v-model:value="item.sourceType" :options="sourceTypeOptions" @change="item.sourceValue = ''" />
              </a-col>
              <a-col :span="8">
                <jnpf-select
                  v-model:value="item.sourceValue"
                  :options="formFieldsOptions"
                  placeholder="请选择"
                  showSearch
                  allowClear
                  :fieldNames="{ options: 'options1' }"
                  v-if="item.sourceType === 1" />
                <a-input v-model:value="item.sourceValue" placeholder="请输入" allowClear v-if="item.sourceType === 2" />
              </a-col>
              <a-col :span="1" class="text-center" v-if="!item.required">
                <i class="icon-ym icon-ym-btn-clearn" @click="delTransferItem(index)" />
              </a-col>
            </a-row>
            <span class="link-text mt-10px inline-block" @click="addTransferItem()"><i class="icon-ym icon-ym-btn-add text-14px mr-4px"></i>添加字段</span>
          </div>
        </a-form-item>
        <a-form-item class="!flex-nowrap" v-if="integrateType != 1">
          <template #label>唯一性验证<BasicHelp text="判断目标表单与触发表单是否同一条数据" /></template>
          <div class="condition-main">
            <div class="mb-10px" v-if="formConf.ruleList?.length">
              <span class="mr-10px">分组匹配逻辑</span>
              <jnpf-select v-model:value="formConf.ruleMatchLogic" placeholder="请选择" :options="logicOptions" class="!w-68px" />
            </div>
            <div class="condition-list" v-for="(item, index) in formConf.ruleList" :key="index">
              <a-row :gutter="8">
                <a-col :span="8" class="!flex align-middle flex-nowrap">
                  <span class="leading-32px mr-10px">条件逻辑</span>
                  <jnpf-select v-model:value="item.logic" placeholder="请选择" :options="logicOptions" class="!flex-1" />
                </a-col>
                <a-col :span="5">
                  <a-button preIcon="icon-ym icon-ym-btn-add" @click="addItem(index)" class="w-full">添加条件</a-button>
                </a-col>
                <a-col :span="5">
                  <a-button preIcon="icon-ym icon-ym-nav-close" @click="delGroup(index)">删除分组</a-button>
                </a-col>
              </a-row>
              <a-row :gutter="8" v-for="(child, childIndex) in item.groups" :key="index + childIndex" class="mt-10px">
                <a-col :span="8">
                  <jnpf-select
                    v-model:value="child.field"
                    :options="getRuleOptions"
                    placeholder="请选择目标表单字段"
                    showSearch
                    allowClear
                    :fieldNames="{ options: 'options1' }"
                    @change="(val, data) => onFieldChange(child, val, data, index, childIndex)" />
                </a-col>
                <a-col :span="5">
                  <jnpf-select class="w-full" v-model:value="child.symbol" placeholder="运算符号" :options="symbolOptions" disabled />
                </a-col>
                <a-col :span="10">
                  <jnpf-select
                    v-model:value="child.fieldValue"
                    :options="usedFormItems"
                    placeholder="请选择触发表单字段"
                    showSearch
                    allowClear
                    :fieldNames="{ options: 'options1' }" />
                </a-col>
                <a-col :span="1" class="text-center">
                  <i class="icon-ym icon-ym-btn-clearn" @click="delItem(index, childIndex)" />
                </a-col>
              </a-row>
            </div>
            <span class="link-text mt-10px inline-block" @click="addGroup()"><i class="icon-ym icon-ym-btn-add text-14px mr-4px"></i>添加分组</span>
          </div>
        </a-form-item>
        <a-form-item label="数据存在时" v-if="integrateType != 1">
          <jnpf-radio v-model:value="formConf.addRule" :options="addRuleOptions" />
        </a-form-item>
      </a-form>
    </ScrollContainer>
  </section>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { ScrollContainer } from '/@/components/Container';
  import FormListModal from './modal/FormListModal.vue';
  import { sourceTypeOptions, logicOptions, symbolOptions, notSupportList } from '../helper/define';
  import { cloneDeep } from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';

  defineOptions({ name: 'addDataNode', inheritAttrs: false });
  const props = defineProps(['formConf', 'integrateType', 'formFieldsOptions', 'usedFormItems', 'getFormFieldList', 'flowOptions']);
  const { createMessage } = useMessage();
  const addRuleOptions = [
    { id: 0, fullName: '不新增数据' },
    { id: 1, fullName: '新增一条数据' },
  ];
  const emptyChildItem = { field: '', symbol: '==', fieldValueType: 1, fieldValue: undefined, jnpfKey: '', fieldValueJnpfKey: '', cellKey: +new Date() };
  const emptyItem = { logic: 'and', groups: [emptyChildItem] };

  const getRuleOptions = computed(() => props.formConf.formFieldList.filter(o => o.id.indexOf('-') < 0 && !notSupportList.includes(o.__config__.jnpfKey)));

  function onFormIdChange(id, item) {
    props.formConf.ruleList = [cloneDeep(emptyItem)];
    props.formConf.flowId = '';
    if (!id) return handleNull();
    props.formConf.formName = item.fullName;
    props.formConf.formId = id;
    props.formConf.enableFlow = item.enableFlow;
    props.formConf.transferList = [];
    props.getFormFieldList(id, 'addData');
  }
  function handleNull() {
    props.formConf.formName = '';
    props.formConf.formId = '';
    props.formConf.enableFlow = 0;
    props.formConf.formFieldList = [];
    props.formConf.transferList = [];
  }
  function addTransferItem() {
    props.formConf.transferList.push({ targetField: '', targetFieldLabel: '', sourceType: 1, sourceValue: '', required: false });
  }
  function delTransferItem(index) {
    props.formConf.transferList.splice(index, 1);
  }
  function addItem(index) {
    props.formConf.ruleList[index].groups.push(cloneDeep(emptyChildItem));
  }
  function delItem(index, childIndex) {
    if (props.formConf.ruleList.length <= 1 && props.formConf.ruleList[0].groups.length <= 1) return createMessage.error('必须保留一个条件');
    props.formConf.ruleList[index].groups.splice(childIndex, 1);
  }
  function addGroup() {
    props.formConf.ruleList.push(cloneDeep(emptyItem));
  }
  function delGroup(index) {
    if (props.formConf.ruleList.length <= 1) return createMessage.error('必须保留一个条件');
    props.formConf.ruleList.splice(index, 1);
  }
  function onFieldChange(item, val, data, index, childIndex) {
    if (!val) {
      item.jnpfKey = '';
      if (item.fieldValueType == 2) {
        item.fieldValue = undefined;
        item.fieldValueJnpfKey = '';
      }
      return;
    }
    item.jnpfKey = data.__config__.jnpfKey;
    const newItem = cloneDeep(emptyChildItem);
    for (let key of Object.keys(newItem)) {
      newItem[key] = item[key];
    }
    item = { ...newItem, ...data };
    if (item.fieldValueType == 2) {
      item.fieldValue = undefined;
      item.fieldValueJnpfKey = '';
    }
    props.formConf.ruleList[index].groups[childIndex] = item;
  }
  function getTargetOptions(index: number) {
    let ignoreOptions: any[] = [];
    for (let i = 0; i < props.formConf.transferList.length; i++) {
      const e = props.formConf.transferList[i];
      if (e.targetField && index !== i) ignoreOptions.push(e.targetField);
    }
    const list = props.formConf.formFieldList.filter(o => !ignoreOptions.includes(o.id));
    return list;
  }
</script>
