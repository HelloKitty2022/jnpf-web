<template>
  <BasicModal class="add-rules-modal" v-bind="$attrs" @register="registerModal" title="规则配置" showOkBtn @ok="handleSubmit" destroy-on-close>
    <div class="my-20px"> 设置数据库之间的字段转换规则，规则设置错误会导致同步的功能数据转换失败 </div>
    <template v-for="(item, i) in configureList" :key="i">
      <a-row :gutter="10" class="mb-10px">
        <a-col :span="3" class="rule-cell">字段类型</a-col>
        <a-col :span="7" class="rule-cell">
          <jnpf-select
            class="w-full"
            v-model:value="item.beforeConversion"
            placeholder="请选择"
            :options="beforeConversionList"
            :fieldNames="{ label: 'val', value: 'val' }"
            @change="omConversionChange($event, i)" />
        </a-col>
        <a-col :span="2" class="rule-cell mid">转换</a-col>
        <a-col :span="3" class="rule-cell">字段类型</a-col>
        <a-col :span="7" class="rule-cell">
          <a-select class="w-full" v-model:value="item.afterConversion" placeholder="请选择">
            <a-select-option v-for="it in item.afterConversionList" :key="it" :label="it" :value="it" />
          </a-select>
        </a-col>
        <a-col :span="2" class="rule-cell">
          <a-button type="danger" preIcon="icon-ym icon-ym-nav-close" @click="handleDelRule(i)" />
        </a-col>
      </a-row>
    </template>
    <div class="table-add-action" @click="handleAddRule">
      <a-button type="link" preIcon="icon-ym icon-ym-btn-add">新增规则</a-button>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { toRefs, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';

  const emit = defineEmits(['register', 'refresh']);

  interface State {
    configureList: any[];
    beforeConversionList: any[];
    convertRuleMap: any;
  }

  const state = reactive<State>({
    configureList: [],
    beforeConversionList: [],
    convertRuleMap: {},
  });
  const { configureList, beforeConversionList } = toRefs(state);
  const [registerModal, { closeModal }] = useModalInner(init);

  function init(data) {
    state.configureList = data.configureList || [];
    state.beforeConversionList = data.beforeConversionList || [];
    state.convertRuleMap = data.convertRuleMap || [];
  }
  async function handleSubmit() {
    closeModal();
    emit('refresh', state.configureList);
  }
  function handleAddRule() {
    state.configureList.push({ beforeConversion: null, afterConversion: null });
  }
  function handleDelRule(i) {
    state.configureList.splice(i, 1);
  }
  function omConversionChange(val, i) {
    state.configureList[i].afterConversion = null;
    state.configureList[i].afterConversionList = state.convertRuleMap[val];
  }
</script>
<style lang="less" scoped>
  .rule-cell {
    line-height: 32px;
    &.mid {
      color: #1890ff;
      text-align: center;
    }
  }
</style>
