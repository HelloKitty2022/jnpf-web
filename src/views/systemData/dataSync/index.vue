<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content bg-white">
        <div class="p-20px">
          <JnpfAlert message="温馨提示：数据同步是由A数据库同步到B数据库。" type="warning" show-icon />
        </div>
        <a-form ref="fromRef" :model="dataForm" :rules="dataRule" :labelCol="{ style: { width: '140px' } }" class="">
          <a-form-item label="数据库连接 From" name="dbConnectionFrom">
            <jnpf-select
              v-model:value="dataForm.dbConnectionFrom"
              show-search
              placeholder="请选择"
              :options="dbOptions"
              :fieldNames="{ options: 'children' }" />
          </a-form-item>
          <a-form-item label="数据库连接 To" name="dbConnectionTo">
            <jnpf-select v-model:value="dataForm.dbConnectionTo" show-search placeholder="请选择" :options="dbOptions" :fieldNames="{ options: 'children' }" />
            <a-button type="primary" @click="handleConnect" class="ml-10px">验证连接</a-button>
            <a-button preIcon="icon-ym icon-ym-btn-add" @click="handleAddConfigure" class="ml-10px">规则配置</a-button>
          </a-form-item>
        </a-form>
        <div class="title-content">
          <h2>数据库表</h2>
          <span class="link-text" @click="handleBatchDataSync">批量同步</span>
        </div>
        <BasicTable @register="registerTable" :dataSource="list" :loading="tableLoading">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'enabledMark'">
              <a-tag :color="record.enabledMark == 1 ? 'success' : 'error'">{{ record.enabledMark == 1 ? '启用' : '禁用' }}</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" @click="handleDataSync(record)" :loading="record.btnLoading" size="small" style="padding: 0">数据同步</a-button>
            </template>
          </template>
        </BasicTable>
      </div>
      <Form @register="registerForm" @refresh="handleRefresh" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, toRefs, ref, unref } from 'vue';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { getDataSourceSelector, execute, dataSync, batchExecute, checkDbLink } from '/@/api/systemData/dataSource';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import Form from './Form.vue';

  defineOptions({ name: 'systemData-dataSync' });

  interface State {
    dataRule: any;
    dataForm: any;
    dbOptions: any[];
    configureList: any[];
    beforeConversionList: any[];
    defaultConfigureList: any[];
    convertRuleMap: any;
    verification: boolean;
    tableLoading: boolean;
    list: any[];
  }

  const state = reactive<State>({
    dataRule: {
      dbConnectionFrom: [{ required: true, message: '数据库连接 From不能为空', trigger: 'change' }],
      dbConnectionTo: [{ required: true, message: '数据库连接 To不能为空', trigger: 'change' }],
    },
    dataForm: {
      dbConnectionFrom: '',
      dbConnectionTo: '',
    },
    dbOptions: [],
    configureList: [],
    beforeConversionList: [],
    defaultConfigureList: [],
    convertRuleMap: {},
    verification: false,
    tableLoading: false,
    list: [],
  });
  const { dataRule, dataForm, dbOptions, list, tableLoading } = toRefs(state);
  const columns: BasicColumn[] = [
    { title: '表名', dataIndex: 'table' },
    { title: '总数', dataIndex: 'sum' },
    { title: '结果', dataIndex: 'result' },
    { title: '操作', dataIndex: 'action', width: 100 },
  ];
  const fromRef = ref();
  const { t } = useI18n();
  const { createMessage, createConfirm } = useMessage();
  const [registerTable, { getSelectRowKeys, clearSelectedRowKeys }] = useTable({
    columns,
    useSearchForm: false,
    showTableSetting: false,
    fetchSetting: {
      listField: '',
    },
    pagination: false,
    immediate: false,
    clickToRowSelect: false,
    rowSelection: { type: 'checkbox' },
    rowKey: 'table',
  });
  const [registerForm, { openModal: openFormModal }] = useModal();

  function handleDataSync(record) {
    var convertRuleMap = {};
    record.btnLoading = true;
    record.result = '';
    let data: any = {
      dbConnectionFrom: state.dataForm.dbConnectionFrom,
      dbConnectionTo: state.dataForm.dbConnectionTo,
      dbTable: record.table,
    };
    if (state.configureList.length) {
      for (var index in state.configureList) {
        convertRuleMap[state.configureList[index].beforeConversion] = state.configureList[index].afterConversion;
      }
      data = { ...data, convertRuleMap };
    }
    dataSync(data)
      .then(res => {
        if (res.data == 0) {
          handleExecute(record, res.data);
        } else if (res.data == 1) {
          createMessage.warning('初始库表中没有数据');
          record.btnLoading = false;
        } else if (res.data == 2 || res.data == 3) {
          const content = res.data == 2 ? '目标库中该表不存在，是否在目标库中创建该表，并同步数据?' : '目标表存在数据,是否自动清除并同步数据?';
          createConfirm({
            iconType: 'warning',
            title: t('common.tipTitle'),
            content: content,
            onOk: () => {
              handleExecute(record, res.data);
            },
            onCancel() {
              record.btnLoading = false;
            },
          });
        }
      })
      .catch(() => {
        record.btnLoading = false;
      });
  }
  function handleBatchDataSync() {
    const selectedData = getSelectRowKeys();
    if (!selectedData.length) return createMessage.error('请先选择数据');
    var map = {};
    let data: any = {
      dbConnectionFrom: state.dataForm.dbConnectionFrom,
      dbConnectionTo: state.dataForm.dbConnectionTo,
      dbTableList: selectedData,
    };
    if (state.configureList && state.configureList.length) {
      for (var index in state.configureList) {
        map[state.configureList[index].beforeConversion] = state.configureList[index].afterConversion;
      }
      data = { ...data, convertRuleMap: map };
    }
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '批量同步，将覆盖您原有表内的数据。请确认操作',
      onOk: () => {
        state.tableLoading = true;
        batchExecute(data)
          .then(res => {
            createMessage.success(res.msg);
            for (const key in res.data) {
              for (let index = 0; index < state.list.length; index++) {
                const element = state.list[index];
                if (element.table == key) element.result = res.data[key] == 1 ? '成功' : '失败';
              }
            }
            state.tableLoading = false;
            clearSelectedRowKeys();
          })
          .catch(() => {
            state.tableLoading = false;
          });
      },
    });
  }
  function handleExecute(record, type) {
    record.result = '';
    var map = {};
    let data: any = {
      type,
      dbConnectionFrom: state.dataForm.dbConnectionFrom,
      dbConnectionTo: state.dataForm.dbConnectionTo,
      dbTable: record.table,
    };
    if (state.configureList.length) {
      for (var index in state.configureList) {
        map[state.configureList[index].beforeConversion] = state.configureList[index].afterConversion;
      }
      data = { ...data, convertRuleMap: map };
    }
    execute(data)
      .then(res => {
        record.result = res.msg;
        record.btnLoading = false;
      })
      .catch(() => {
        record.btnLoading = false;
      });
  }
  function initDbOptions() {
    getDataSourceSelector().then(res => {
      let list = res.data.list || [];
      list = list.filter(o => o.children && o.children.length);
      if (list[0] && list[0].children && list[0].children.length) list[0] = list[0].children[0];
      delete list[0].children;
      state.dbOptions = list;
    });
  }
  function handleConnect() {
    unref(fromRef)
      .validate()
      .then(res => {
        if (res.dbConnectionFrom === res.dbConnectionTo) {
          createMessage.error('数据库连接不能相同');
          state.list = [];
          return;
        }
        initData();
      });
  }
  function initData() {
    state.tableLoading = true;
    checkDbLink(state.dataForm)
      .then(res => {
        state.tableLoading = false;
        state.beforeConversionList = [];
        state.convertRuleMap = res.data.convertRuleMap;
        for (var key in state.convertRuleMap) {
          state.beforeConversionList.push({ val: key, value: state.convertRuleMap[key] });
        }
        state.defaultConfigureList = [];
        for (let index = 0; index < state.beforeConversionList.length; index++) {
          const element = state.beforeConversionList[index];
          state.defaultConfigureList.push({
            beforeConversion: element.val,
            afterConversion: element.value[0],
          });
          state.defaultConfigureList[index].afterConversionList = element.value;
        }
        state.configureList = JSON.parse(JSON.stringify(state.defaultConfigureList));
        state.verification = res.data.checkDbFlag;
        state.list = res.data.tableList;
        for (let i = 0; i < state.list.length; i++) {
          state.list[i].result = '';
          state.list[i].btnLoading = false;
        }
      })
      .catch(() => {
        state.list = [];
        state.tableLoading = false;
      });
  }
  function handleAddConfigure() {
    if (!state.verification) return createMessage.error('请验证连接');
    state.configureList = JSON.parse(JSON.stringify(state.defaultConfigureList));
    openFormModal(true, {
      configureList: state.configureList,
      beforeConversionList: state.beforeConversionList,
      convertRuleMap: state.convertRuleMap,
    });
  }
  function handleRefresh(val) {
    state.defaultConfigureList = JSON.parse(JSON.stringify(val));
  }

  onMounted(() => {
    initDbOptions();
  });
</script>
<style lang="less" scoped>
  .ant-select {
    width: 250px;
  }
  .title-content {
    display: flex;
    align-items: center;
    h2 {
      margin: 0 10px;
      line-height: 50px;
      font-size: 16px;
    }
  }
</style>
