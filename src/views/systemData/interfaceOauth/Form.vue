<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="title" :showOkBtn="!state.isDetail" @ok="handleSubmit" destroyOnClose>
    <a-row class="mt-20px overflow-auto h-full">
      <a-col :span="14" :offset="5">
        <BasicForm @register="registerForm" :disabled="state.isDetail">
          <template #appSecret="{ model, field }">
            <a-input-password v-model:value="model[field]" placeholder="请输入" readonly show-password :disabled="state.isDetail">
              <template #addonAfter v-if="!state.isDetail">
                <loading-outlined class="mr-5px" v-if="showLoading" />
                <span class="cursor-pointer" @click="handleAppSecret">获取秘钥</span>
              </template>
            </a-input-password>
          </template>
          <template #verifySignature="{ model, field }">
            <jnpf-switch v-model:value="model[field]" :disabled="state.isDetail" />
            <a class="float-right" @click="showVerifyTips">验证签名使用说明</a>
          </template>
          <template #table>
            <a-tabs v-model:activeKey="state.activeKey">
              <a-tab-pane key="1" tab="接口集合">
                <BasicTable @register="registerTable" :data-source="state.tableList">
                  <template #expandedRowRender="{ record }">
                    <BasicTable @register="registerSubTable" :data-source="record.paramList" />
                  </template>
                  <template #bodyCell="{ column }">
                    <template v-if="column.key === 'dataType'">
                      <a-tag color="blue">POST</a-tag>
                    </template>
                  </template>
                </BasicTable>
              </a-tab-pane>
              <a-tab-pane key="2" tab="用户集合">
                <BasicTable @register="registerUserTableTable" :data-source="state.userTableList" />
              </a-tab-pane>
            </a-tabs>
          </template>
        </BasicForm>
      </a-col>
    </a-row>
    <Info @register="registerInfo" />
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, computed } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { create, update, getAppSecret, getInfo } from '/@/api/systemData/interfaceOauth';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { LoadingOutlined } from '@ant-design/icons-vue';
  import { useModal } from '/@/components/Modal';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useGlobSetting } from '/@/hooks/setting';
  import Info from './components/Info.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    showLoading: boolean;
    id: string;
    isDetail: boolean;
    dataForm: any;
    tableList: any[];
    userTableList: any[];
    activeKey: string;
  }

  const state = reactive<State>({
    showLoading: false,
    id: '',
    isDetail: false,
    dataForm: {},
    tableList: [],
    userTableList: [],
    activeKey: '1',
  });
  const { showLoading, id } = toRefs(state);
  const schemas: FormSchema[] = [
    {
      field: 'appId',
      label: 'appId',
      component: 'Input',
      componentProps: { placeholder: '请输入', maxlength: 100 },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'appSecret',
      label: '获取秘钥',
      component: 'Input',
      slot: 'appSecret',
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      ifShow: () => !state.isDetail,
      field: 'appName',
      label: '应用名称',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'verifySignature',
      label: '验证签名',
      component: 'Switch',
      defaultValue: 0,
      slot: 'verifySignature',
      helpMessage: '开启后需要验证消息签名的真实性',
    },
    {
      field: 'usefulLife',
      label: '使用期限',
      component: 'DatePicker',
      helpMessage: '未选择日期默认永久有效',
      componentProps: { placeholder: '请选择' },
    },
    {
      field: 'whiteList',
      label: '白名单',
      component: 'Textarea',
      helpMessage: '多个IP设置，用英文符号隔开，如192.168.0.1,192.168.0.2',
      componentProps: { rows: 5, placeholder: '请输入' },
    },
    {
      field: 'sortCode',
      label: '排序',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: { min: '0', max: '999999', placeholder: '请输入' },
    },
    {
      field: 'enabledMark',
      label: '状态',
      defaultValue: 1,
      component: 'Switch',
    },
    {
      field: 'description',
      label: '说明',
      component: 'Textarea',
      componentProps: { rows: 5, placeholder: '请输入' },
    },
    {
      ifShow: () => !!state.isDetail,
      field: 'list',
      label: '',
      slot: 'table',
      component: 'Input',
    },
  ];

  const title = computed(() => (state.isDetail ? state.dataForm.appName : !state.id ? t('common.addText') : t('common.editText')));

  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const globSetting = useGlobSetting();
  const [registerInfo, { openModal: openInfoModal }] = useModal();
  const [registerForm, { setFieldsValue, validate, resetFields }] = useForm({ labelWidth: 90, schemas: schemas });
  const [registerPopup, { closePopup, changeLoading, changeOkLoading }] = usePopupInner(init);
  const [registerTable] = useTable({
    columns: [
      { title: '接口名称', dataIndex: 'fullName', width: 120 },
      { title: '接口编码', dataIndex: 'enCode', width: 80 },
      { title: '接口地址', dataIndex: 'url' },
      { title: '接口类型', dataIndex: 'dataType', width: 80 },
    ],
    expandRowByClick: true,
    showTableSetting: false,
    showIndexColumn: false,
    defaultExpandAllRows: false,
    pagination: false,
    canResize: false,
  });
  const [registerUserTableTable] = useTable({
    columns: [
      { title: '用户名', dataIndex: 'userName', width: 200 },
      { title: 'userKey', dataIndex: 'userKey', width: 200 },
    ],
    expandRowByClick: true,
    showTableSetting: false,
    showIndexColumn: false,
    defaultExpandAllRows: false,
    pagination: false,
    canResize: false,
  });
  const [registerSubTable] = useTable({
    columns: [
      { title: '参数名称', dataIndex: 'field' },
      { title: '参数类型', dataIndex: 'dataType', width: 100 },
      { title: '默认值', dataIndex: 'defaultValue', width: 80 },
    ],
    showTableSetting: false,
    showIndexColumn: false,
    pagination: false,
    canResize: false,
  });

  function init(data) {
    state.showLoading = false;
    resetFields();
    state.id = data.id;
    state.isDetail = !!data.isDetail || false;
    state.tableList = [];
    state.userTableList = [];
    if (state.id) {
      changeLoading(true);
      getInfo(state.id).then(res => {
        const data = res.data;
        state.dataForm = data;
        setFieldsValue(data);
        let tenantId = data.tenantId ? data.tenantId : '';
        if (data.list) {
          data.list.map(item => {
            item.url = `${globSetting.apiUrl}/api/system/DataInterface/${item.id}/Actions/Response` + (tenantId ? '?tenantId=' + tenantId : '');
            if (item.parameterJson) item.paramList = [...JSON.parse(item.parameterJson)];
            if (item.paramList?.length) {
              item.paramList.forEach(elem => {
                const options = [
                  { label: '字符串', value: 'varchar' },
                  { label: '整型', value: 'int' },
                  { label: '日期时间', value: 'datetime' },
                  { label: '浮点', value: 'decimal' },
                  { label: '长整型', value: 'bigint' },
                  { label: '文本', value: 'text' },
                ];
                options.map(elm2 => {
                  if (elm2.value == elem.dataType) elem.dataType = elm2.label;
                });
              });
            }
          });
          state.tableList = data.list || [];
        }
        state.userTableList = data.userList || [];
        changeLoading(false);
      });
    }
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    values.oracleExtend = !!values.oracleExtend;
    const query = {
      ...values,
      id: id.value,
    };
    const formMethod = id.value ? update : create;
    formMethod(query)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        closePopup();
        emit('reload');
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
  function handleAppSecret() {
    state.showLoading = true;
    getAppSecret()
      .then(res => {
        state.showLoading = false;
        setFieldsValue({
          appSecret: res.data,
        });
      })
      .then(() => {
        state.showLoading = false;
      });
  }
  function showVerifyTips() {
    openInfoModal(true);
  }
</script>
