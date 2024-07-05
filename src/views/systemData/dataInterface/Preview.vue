<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="title">
    <a-form :colon="false" ref="formElRef" layout="vertical" class="!mx-10px">
      <a-form-item label="Request URL">
        <a-input-search v-model:value="url" addon-before="GET" @search="test">
          <template #enterButton>
            <Button :loading="testLoading">测试接口</Button>
          </template>
        </a-input-search>
      </a-form-item>
      <a-form-item label="Request Param" v-if="paramList.length">
        <a-form-item-rest>
          <a-row v-for="item in paramList" :key="item.field" class="mt-10px" :gutter="20">
            <a-col :span="6">
              <a-input v-model:value="item.field" placeholder="key" clearable readonly />
            </a-col>
            <a-col :span="18">
              <a-input v-model:value="item.defaultValue" placeholder="value" clearable />
            </a-col>
          </a-row>
        </a-form-item-rest>
      </a-form-item>
      <a-form-item label="Response Body" class="value-item">
        <a-textarea :value="responseData" :autoSize="{ minRows: 20 }" />
      </a-form-item>
    </a-form>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { toRefs, reactive, nextTick } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { getDataInterfaceParam, getDataInterfaceRes } from '/@/api/systemData/dataInterface';
  import { useGlobSetting } from '/@/hooks/setting';
  import { Button } from 'ant-design-vue';

  interface State {
    id: string;
    title: string;
    url: string;
    tenantId: string;
    responseData: string;
    testLoading: boolean;
    paramList: any[];
  }

  const state = reactive<State>({
    id: '',
    title: '',
    url: '',
    tenantId: '',
    responseData: '',
    testLoading: false,
    paramList: [],
  });
  const { title, url, responseData, paramList, testLoading } = toRefs(state);
  const globSetting = useGlobSetting();
  const [registerPopup, { changeLoading }] = usePopupInner(init);

  function init(data) {
    changeLoading(true);
    state.id = data.id || '';
    state.tenantId = data.tenantId || '';
    state.title = '接口预览 - ' + data.fullName || '';
    state.paramList = [];
    state.responseData = '';
    nextTick(() => {
      const prefix = globSetting.apiUrl === '/dev' ? window.location.origin : '';
      state.url = `${prefix}${globSetting.apiUrl}/api/system/DataInterface/${state.id}/Actions/Preview` + (state.tenantId ? '?tenantId=' + state.tenantId : '');
      getDataInterfaceParam(state.id)
        .then(res => {
          state.paramList = res.data;
          changeLoading(false);
        })
        .catch(() => {
          changeLoading(false);
        });
    });
  }
  function test() {
    state.testLoading = true;
    let query = {
      paramList: state.paramList,
      tenantId: state.tenantId,
      origin: 'preview',
    };
    getDataInterfaceRes(state.id, query)
      .then(res => {
        state.testLoading = false;
        state.responseData = JSON.stringify(res, null, 4);
      })
      .catch(() => {
        state.testLoading = false;
      });
  }
</script>
