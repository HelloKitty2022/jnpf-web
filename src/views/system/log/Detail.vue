<template>
  <BasicDrawer v-bind="$attrs" width="500px" @register="registerDrawer" :title="t('common.detailText')" class="jnpf-log-detail" destroyOnClose>
    <a-form class="!mx-20px !mt-20px" :colon="false" :model="dataForm" ref="formElRef" :labelCol="{ style: { width: '80px' } }">
      <a-form-item :label="activeKey == '2' ? '请求时间' : '操作时间'">
        <p>{{ formatToDateTime(dataForm.creatorTime, 'YYYY-MM-DD HH:mm:ss') }}</p>
      </a-form-item>
      <a-form-item label="用户">
        <p>{{ dataForm.userName }}</p>
      </a-form-item>
      <a-form-item label="IP地址">
        <p>{{ dataForm.ipAddress }}</p>
      </a-form-item>
      <a-form-item label="地点">
        <p>{{ dataForm.ipAddressName }}</p>
      </a-form-item>
      <a-form-item label="浏览器">
        <p>{{ dataForm.browser }}</p>
      </a-form-item>
      <a-form-item label="操作系统">
        <p>{{ dataForm.platForm }}</p>
      </a-form-item>
      <a-form-item label="操作模块" v-if="activeKey == '3'">
        <p>{{ dataForm.moduleName }}</p>
      </a-form-item>
      <a-form-item label="请求方式">
        <p>{{ dataForm.requestMethod }}</p>
      </a-form-item>
      <a-form-item label="耗时(毫秒)" v-if="activeKey != '4'">
        <p>{{ dataForm.requestDuration }}</p>
      </a-form-item>
      <a-collapse v-model:activeKey="activeName" ghost expandIconPosition="right">
        <a-collapse-panel key="2" header="请求地址">
          <div class="jnpf-code-box" v-if="dataForm.requestUrl">{{ dataForm.requestUrl }}</div>
        </a-collapse-panel>
        <a-collapse-panel key="3" header="请求方法" v-if="activeKey != '4'">
          <div class="jnpf-code-box" v-if="dataForm.requestTarget">{{ dataForm.requestTarget }}</div>
        </a-collapse-panel>
        <a-collapse-panel key="4" header="请求参数" v-if="activeKey != '4'">
          <div class="jnpf-code-box" v-if="dataForm.requestParam">{{ dataForm.requestParam }}</div>
        </a-collapse-panel>
        <a-collapse-panel key="5" :header="activeKey != '4' ? '返回结果' : '异常描述'">
          <div class="jnpf-code-box" v-if="dataForm.jsons">{{ dataForm.jsons }}</div>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { reactive, toRefs } from 'vue';
  import { getInfo } from '/@/api/system/log';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    activeKey: string;
    activeName: string;
    dataForm: any;
  }
  const state = reactive<State>({
    activeKey: '',
    activeName: '',
    dataForm: {},
  });
  const { dataForm, activeName, activeKey } = toRefs(state);
  const { t } = useI18n();
  const [registerDrawer] = useDrawerInner(init);

  function init(data) {
    state.activeKey = data.activeKey;
    getInfo(data.id).then(res => {
      state.dataForm = res.data;
    });
  }
</script>
<style lang="less" scoped>
  .jnpf-log-detail {
    .ant-collapse {
      border-top: 1px solid @border-color-base1;
      .ant-collapse-item {
        border-bottom: 1px solid @border-color-base1;
      }
    }
    .jnpf-code-box {
      background: #848484;
      padding: 15px;
      color: #fff;
      font-size: 12px;
      border-radius: 4px;
    }
  }
</style>
