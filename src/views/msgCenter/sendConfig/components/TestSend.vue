<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" show-ok-btn title="测试发送" destroy-on-close class="full-popup" @ok="handleSubmit">
    <a-alert message="注意：测试发送的消息通知链接不支持跳转" type="warning" showIcon />
    <BasicTable @register="registerTable" :data-source="testSendData">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'msgTemplateName'">
          <a @click="handleDetail(record.templateId)">{{ record.msgTemplateName }}</a>
        </template>
        <template v-if="column.key === 'toUser'">
          <JnpfUserSelect v-model:value="record.toUser" multiple placeholder="请选择" v-if="record.messageType != 'webhook'" />
        </template>
        <template v-if="column.key === 'parameter'">
          <div class="parameter-box" v-for="(item, index) in record.paramJson" :key="index"> {{ item.field }}({{ item.fieldName }}) </div>
        </template>
        <template v-if="column.key === 'parameterData'">
          <div class="variable-box" v-for="(item, index) in record.paramJson" :key="index">
            <a-input v-model:value="item.value" placeholder="请输入" allowClear />
          </div>
        </template>
      </template>
    </BasicTable>
  </BasicPopup>
  <MsgTemplateDetail @register="registerDetail" />
  <SendResults @register="registerSendResults" />
</template>
<script lang="ts" setup>
  import { reactive, toRefs } from 'vue';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { getTestSendConfig, testSendConfig } from '/@/api/msgCenter/sendConfig';
  import { useMessage } from '/@/hooks/web/useMessage';
  import MsgTemplateDetail from '/@/components/FlowProcess/src/propPanel/MsgTemplateDetail.vue';
  import SendResults from './SendResults.vue';
  import { useModal } from '/@/components/Modal';

  interface State {
    testSendData: any[];
  }

  const state = reactive<State>({
    testSendData: [],
  });
  const { testSendData } = toRefs(state);
  const { createMessage } = useMessage();
  const [registerPopup, { changeLoading, changeOkLoading }] = usePopupInner(init);
  const columns: BasicColumn[] = [
    { title: '模板名称', dataIndex: 'msgTemplateName', width: 150 },
    { title: '模板类型', dataIndex: 'messageType', width: 150 },
    { title: '接收人', dataIndex: 'toUser', width: 200 },
    { title: '参数名称', dataIndex: 'parameter', width: 200 },
    { title: '变量', dataIndex: 'parameterData', width: 200 },
  ];
  const searchInfo = reactive({
    id: '',
  });
  const [registerTable] = useTable({
    searchInfo,
    columns,
    useSearchForm: false,
    showTableSetting: false,
    pagination: false,
  });
  const [registerDetail, { openModal: openDetailModal }] = useModal();
  const [registerSendResults, { openModal: openSendResultsModal }] = useModal();

  function init(data) {
    searchInfo.id = data.id || '';
    initData();
  }
  function initData() {
    changeLoading(true);
    getTestSendConfig(searchInfo.id)
      .then(res => {
        state.testSendData = res.data;
        changeLoading(false);
      })
      .catch(() => {
        changeLoading(false);
      });
  }
  function handleDetail(id) {
    openDetailModal(true, { id });
  }
  function handleSubmit() {
    for (let i = 0; i < state.testSendData.length; i++) {
      const item = state.testSendData[i];
      if (!item.toUser?.length && item.messageType != 'webhook') return createMessage.error(`${item.msgTemplateName}的接收人为空！`);
      if (item.paramJson && item.paramJson.length) {
        for (let j = 0; j < item.paramJson.length; j++) {
          const cur = item.paramJson[j];
          if (!cur.value) return createMessage.error(`${item.msgTemplateName}参数对应的变量为空！`);
        }
      }
    }
    let data = JSON.parse(JSON.stringify(state.testSendData));
    changeOkLoading(true);
    testSendConfig(data)
      .then(res => {
        changeOkLoading(false);
        openSendResultsModal(true, res.data);
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
</script>
<style lang="less" scoped>
  .parameter-box {
    height: 30px;
    line-height: 30px;
    margin-bottom: 8px;
  }
  .variable-box {
    margin-bottom: 8px;
  }
</style>
