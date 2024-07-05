<template>
  <div class="jnpf-content-wrapper jnpf-content-wrapper-form">
    <div class="jnpf-content-wrapper-form-body px-10px">
      <ScrollContainer>
        <div class="my-10px">
          <a-alert message="普通文本、普通数值、日期时间主键的使用" type="warning" :show-icon="false" />
        </div>
        <a-form ref="formRef" :colon="false" :model="dataForm" :labelCol="{ style: { width: '110px' } }">
          <a-divider orientation="left">普通文本框的使用</a-divider>
          <a-form-item label="普通文本框">
            <a-input v-model:value="dataForm.CommonText" placeholder="" />
          </a-form-item>
          <a-form-item label="座机号码">
            <a-input v-model:value="dataForm.TelePhone" placeholder="" />
          </a-form-item>
          <a-form-item label="当前登录人">
            <a-input v-model:value="dataForm.RealName" placeholder="" />
          </a-form-item>
          <a-divider orientation="left">普通数值框的使用</a-divider>
          <a-form-item label="自然数">
            <a-input-number v-model:value="dataForm.Natural" placeholder="" />
          </a-form-item>
          <a-form-item label="报销款">
            <a-input-number v-model:value="dataForm.Reimbursement" placeholder="" addon-after="元" />
          </a-form-item>
          <a-form-item label="产品价格">
            <a-input-number v-model:value="dataForm.ProductPrice" placeholder="">
              <template #addonAfter>
                <span class="cursor-pointer" @click="handleRandomValue">随机设定</span>
              </template>
            </a-input-number>
          </a-form-item>
          <a-divider orientation="left">日期时间组件的使用</a-divider>
          <a-form-item label="生产日期">
            <jnpf-date-picker v-model:value="dataForm.ProductionDate" format="YYYY-MM-DD" allowClear />
          </a-form-item>
          <a-form-item label="回款日期">
            <jnpf-date-picker v-model:value="dataForm.ReturnMoneyDate" format="YYYY-MM-DD HH:mm:ss" allowClear />
          </a-form-item>
          <a-form-item label="计划执行日期">
            <jnpf-date-picker v-model:value="dataForm.PlanExecutionDate" format="YYYY-MM-DD HH:mm:ss" allowClear />
          </a-form-item>
          <a-form-item label="统计月份">
            <jnpf-date-picker v-model:value="dataForm.StatisticalMonth" format="YYYY-MM" allowClear />
          </a-form-item>
          <a-form-item label="规划日期">
            <jnpf-date-picker v-model:value="dataForm.Programme" format="YYYY-MM-DD" allowClear />
          </a-form-item>
          <a-form-item label="规划日期">
            <jnpf-date-range v-model:value="dataForm.Dates" format="YYYY-MM-DD HH:mm:ss" allowClear />
          </a-form-item>
        </a-form>
      </ScrollContainer>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, ref } from 'vue';
  import { ScrollContainer } from '/@/components/Container';
  import type { FormInstance } from 'ant-design-vue';

  defineOptions({ name: 'extend-formDemo-verifyForm1' });

  const state = reactive({
    dataForm: {
      CommonText: '',
      TelePhone: '0000-00000000',
      RealName: '',
      Natural: '',
      Reimbursement: '',
      ProductPrice: '',
      ProductionDate: undefined,
      ReturnMoneyDate: undefined,
      PlanExecutionDate: undefined,
      StatisticalMonth: undefined,
      Programme: undefined,
      Dates: [],
    },
  });
  const { dataForm } = toRefs(state);
  const formRef = ref<FormInstance>();

  function handleRandomValue() {
    let num = GetRandomNum(1, 100);
    state.dataForm.ProductPrice = num;
  }
  function GetRandomNum(Min, Max) {
    let Range = Max - Min;
    let Rand = Math.random();
    return Min + Math.round(Rand * Range);
  }
</script>
<style lang="less" scoped>
  .ant-input,
  .ant-picker,
  .ant-input-number,
  .ant-input-number-group-wrapper {
    width: 300px !important;
  }
</style>
