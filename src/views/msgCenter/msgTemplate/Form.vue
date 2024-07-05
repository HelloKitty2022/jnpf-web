<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" showOkBtn :title="title" @ok="handleSubmit" destroy-on-close>
    <a-form class="!mx-20px" :colon="false" :model="dataForm" :rules="dataRule" ref="formElRef" :labelCol="{ style: { width: '100px' } }">
      <a-row :gutter="20">
        <a-col :span="12">
          <a-form-item label="名称" name="fullName">
            <a-input v-model:value="dataForm.fullName" placeholder="请输入" allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="编码" name="enCode">
            <a-input v-model:value="dataForm.enCode" placeholder="请输入" allowClear :maxlength="50" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="模板类型">
            <a-input value="自定义模板" disabled allowClear />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="消息来源" name="messageSource">
            <jnpf-select
              v-model:value="dataForm.messageSource"
              placeholder="请选择"
              :disabled="!!dataForm.id"
              :options="messageSourceList"
              @change="onMessageSourceChange" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="消息类型" name="messageType">
            <jnpf-select
              v-model:value="dataForm.messageType"
              placeholder="请选择"
              :disabled="!!dataForm.id"
              :options="messageTypeList"
              @change="onMessageTypeChange" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="状态" name="enabledMark">
            <a-switch v-model:checked="dataForm.enabledMark" :checkedValue="1" :unCheckedValue="0" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="排序" name="sortCode">
            <a-input-number :min="0" :max="999999" v-model:value="dataForm.sortCode" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="说明" name="description">
            <a-textarea v-model:value="dataForm.description" placeholder="请输入" type="textarea" :rows="3" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <div class="parameter-box">
            <div class="left-pane">
              <div class="left-pane-list">
                <div class="list">
                  <div class="header">
                    <span>参数名称</span>
                    <span>参数说明</span>
                    <span class="operation">操作</span>
                  </div>
                  <div class="search-box">
                    <a-input-search class="search" v-model:value="keyword" placeholder="输入关键字" allowClear @input="handleSearch" />
                  </div>
                  <BasicTable @register="registerTable" :data-source="parameterList">
                    <template #bodyCell="{ column, record, index }">
                      <template v-if="column.key === 'field'">
                        <span @click="addContent(record)" class="cursor-pointer" :title="record.field">{{ record.field }}</span>
                      </template>
                      <template v-if="column.key === 'fieldName'">
                        <span @click="addContent(record)" class="cursor-pointer" :title="record.fieldName">
                          {{ record.fieldName }}
                        </span>
                      </template>
                      <template v-if="column.key === 'action' && !getIsSystem(record.field)">
                        <a-space :size="10">
                          <i class="icon-ym icon-ym-btn-edit" @click="addOrUpdateParameter(record)"></i>
                          <i class="icon-ym icon-ym-delete" @click="removeParameter(index)"></i>
                        </a-space>
                      </template>
                    </template>
                  </BasicTable>
                </div>
                <div class="table-add-action" @click="addOrUpdateParameter()" v-if="dataForm.messageSource === '2'">
                  <a-button type="link" preIcon="icon-ym icon-ym-btn-add">{{ t('common.addText') }}</a-button>
                </div>
              </div>
            </div>
            <div class="right-pane" v-if="dataForm.messageType != 3 && dataForm.messageType != 7">
              <a-form-item name="title">
                <template #label>消息标题<BasicHelp :text="getTipLabel()" /></template>
                <a-input v-model:value="dataForm.title" placeholder="请输入" allowClear />
              </a-form-item>
              <a-form-item name="content" v-if="dataForm.messageType == 2">
                <template #label>消息内容<BasicHelp :text="getTipLabel()" /></template>
                <JnpfEditor v-model:value="dataForm.content" />
              </a-form-item>
              <a-form-item name="content" v-else-if="dataForm.messageType != 1">
                <template #label>消息内容<BasicHelp :text="getTipLabel()" /></template>
                <a-textarea v-model:value="dataForm.content" placeholder="请输入" :rows="16" />
              </a-form-item>
            </div>
            <div class="right-pane" v-else>
              <a-row :gutter="20">
                <a-col :span="12">
                  <a-form-item name="templateCode">
                    <template #label>
                      模版编号
                      <BasicHelp
                        :text="
                          dataForm.messageType == 3
                            ? ['阿里云：请在【阿里云管理后台-模板管理】⻚⾯查看模板CODE', '腾讯云：请在【腾讯云管理后台-正⽂模板管理】⻚⾯查看模板ID']
                            : '在【微信公众号管理后台-广告与服务-模板消息】⻚⾯查看模板ID'
                        " />
                    </template>
                    <a-input v-model:value="dataForm.templateCode" placeholder="请输入" />
                  </a-form-item>
                </a-col>
                <a-col :span="12" offset="12"></a-col>
                <a-col :span="12" v-if="dataForm.messageType == 7">
                  <a-form-item label="跳转方式" name="wxSkip">
                    <jnpf-select v-model:value="dataForm.wxSkip" placeholder="请选择" :options="wxSkipList" />
                  </a-form-item>
                </a-col>
                <a-col :span="12" v-if="dataForm.messageType == 7 && dataForm.wxSkip == 1">
                  <a-form-item name="xcxAppId" :labelCol="{ style: { width: '120px' } }">
                    <template #label>关联小程序ID<BasicHelp text="请在【微信公众号管理后台-广告与服务-小程序管理】⻚⾯查看小程序ID" /></template>
                    <a-input v-model:value="dataForm.xcxAppId" placeholder="请输入" allowClear />
                  </a-form-item>
                </a-col>
              </a-row>
              <div class="msg-pane">
                <div class="list">
                  <a-table :data-source="smsList" :columns="getSmsParameterColumns" size="small" :pagination="false">
                    <template #headerCell="{ column }">
                      <template v-if="column.key === 'smsField'">
                        <span>{{ column.title }}</span>
                        <BasicHelp :text="column.helpMessage" />
                      </template>
                    </template>
                    <template #bodyCell="{ column, record, index }">
                      <template v-if="column.key === 'smsField'">
                        <a-input v-model:value="record.smsField" placeholder="请输入" allowClear />
                      </template>
                      <template v-if="column.key === 'field'">
                        <jnpf-select
                          v-model:value="record.field"
                          placeholder="请选择"
                          :options="parameterList"
                          :fieldNames="{ label: 'field', value: 'field' }"
                          allowClear />
                      </template>
                      <template v-if="column.key === 'isTitle'">
                        <a-checkbox v-model:checked="record.isTitle" @change="onTitleChange($event, index)" />
                      </template>
                      <template v-if="column.key === 'action'">
                        <i class="icon-ym icon-ym-delete" danger @click="removeSmsData(index)"></i>
                      </template>
                    </template>
                  </a-table>
                </div>
                <div class="table-add-action" @click="addSmsData">
                  <a-button type="link" preIcon="icon-ym icon-ym-btn-add">添加一行</a-button>
                </div>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-form>
    <BasicModal @register="registerModal" :title="isEdit ? t('common.editText') : t('common.addText')" showOkBtn @ok="handleFieldSubmit" destroyOnClose>
      <BasicForm @register="registerForm" />
    </BasicModal>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, ref, nextTick, computed } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import formValidate from '/@/utils/formValidate';
  import { getInfo, create, update } from '/@/api/msgCenter/msgTemplate';
  import { useBaseStore } from '/@/store/modules/base';
  import { buildBitUUID } from '/@/utils/uuid';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { useModal } from '/@/components/Modal';
  import { BasicModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicTable, useTable } from '/@/components/Table';

  const emit = defineEmits(['register', 'reload']);

  interface State {
    title: string;
    dataForm: any;
    dataRule: any;
    parameterList: any[];
    allParameterList: any[];
    smsList: any[];
    messageTypeList: any[];
    messageSourceList: any[];
    keyword: string;
    wxSkipList: any[];
    isEdit: boolean;
  }

  const state = reactive<State>({
    title: '',
    dataForm: {
      id: '',
      fullName: '',
      enCode: '',
      templateType: 0,
      messageType: '',
      messageSource: '',
      enabledMark: 1,
      sortCode: 0,
      description: '',
      title: '',
      content: '',
      templateCode: '',
      wxSkip: '1',
      xcxAppId: '',
    },
    dataRule: {
      fullName: [{ required: true, message: '必填', trigger: 'blur' }],
      enCode: [
        { required: true, message: '必填', trigger: 'blur' },
        { validator: formValidate('enCode'), trigger: 'blur' },
      ],
      messageSource: [{ required: true, message: '必填', trigger: 'change' }],
      messageType: [{ required: true, message: '必填', trigger: 'change' }],
      title: [{ required: true, message: '必填', trigger: 'blur' }],
      content: [{ required: true, message: '必填', trigger: 'blur' }],
      templateCode: [{ required: true, message: '必填', trigger: 'blur' }],
      wxSkip: [{ required: true, message: '必填', trigger: 'blur' }],
      xcxAppId: [{ required: true, message: '必填', trigger: 'blur' }],
    },
    parameterList: [],
    allParameterList: [],
    smsList: [],
    messageTypeList: [],
    messageSourceList: [],
    keyword: '',
    wxSkipList: [
      { id: 1, fullName: '小程序' },
      { id: 2, fullName: '页面' },
    ],
    isEdit: false,
  });
  const { dataForm, dataRule, messageTypeList, messageSourceList, title, keyword, parameterList, wxSkipList, smsList, isEdit } = toRefs(state);
  const defaultParameterList = [
    { field: '@Title', fieldName: '标题' },
    { field: '@CreatorUserName', fieldName: '创建人' },
  ];
  const noticeParameterList = [...defaultParameterList, { field: '@Content', fieldName: '内容' }, { field: '@Remark', fieldName: '摘要' }];
  const flowParameterList = [...defaultParameterList, { field: '@FlowLink', fieldName: '流程链接' }];
  const systemParameterList = defaultParameterList;
  const scheduleParameterList = [
    ...defaultParameterList,
    { field: '@Content', fieldName: '内容' },
    { field: '@StartDate', fieldName: '开始日期' },
    { field: '@StartTime', fieldName: '开始时间' },
    { field: '@EndDate', fieldName: '结束日期' },
    { field: '@EndTime', fieldName: '结束时间' },
  ];
  const formElRef = ref();
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const { createMessage, createConfirm } = useMessage();
  const [registerPopup, { changeLoading, changeOkLoading, closePopup }] = usePopupInner(init);
  const parameterColumns = [
    { title: '参数名称', dataIndex: 'field', key: 'field', width: 134 },
    { title: '参数说明', dataIndex: 'fieldName', key: 'fieldName', width: 134 },
    { title: '操作', dataIndex: 'action', key: 'action', width: 70 },
  ];
  const [registerTable] = useTable({
    columns: parameterColumns,
    useSearchForm: false,
    showTableSetting: false,
    pagination: false,
    showHeader: false,
    showIndexColumn: false,
    scroll: { y: 294 },
  });
  const schemas: FormSchema[] = [
    {
      field: 'field',
      label: '参数名称',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [
        { required: true, message: '必填', trigger: 'blur' },
        { validator: formValidate('field'), trigger: 'blur' },
      ],
    },
    {
      field: 'fieldName',
      label: '参数说明',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, message: '必填', trigger: 'blur' }],
    },
  ];
  const [registerModal, { openModal: openFormModal, closeModal }] = useModal();
  const [registerForm, { validate, setFieldsValue, updateSchema }] = useForm({ labelWidth: 100, schemas: schemas });

  const getSmsParameterColumns = computed(() => {
    const baseColumns: any[] = [
      { title: '序号', dataIndex: 'index', key: 'index', align: 'center', width: 50, customRender: ({ index }) => index + 1 },
      {
        title: '变量',
        dataIndex: 'smsField',
        key: 'smsField',
        helpMessage: ['阿里云：在【阿里云管理后台-模板管理】维护模板变量参数', '腾讯云：在【腾讯云管理后台-正⽂模板管理】维护模板变量参数'],
      },
      { title: '参数', dataIndex: 'field', key: 'field', width: 200 },
      { title: '标题', dataIndex: 'isTitle', key: 'isTitle', width: 70, align: 'center' },
      { title: '操作', dataIndex: 'action', key: 'action', width: 70 },
    ];
    let list: any[] = [];
    if (state.dataForm.messageType == 3) {
      list = baseColumns.filter(o => o.key != 'isTitle');
    } else {
      list = baseColumns;
      list[1].helpMessage = '在【微信公众号管理后台-广告与服务-模板消息】维护模板参数';
    }
    return list;
  });

  function init(data) {
    formElRef.value?.resetFields();
    resetForm();
    state.dataForm.id = data.id || '';
    state.title = state.dataForm.id ? t('common.editText') : t('common.addText');
    state.parameterList = [];
    state.allParameterList = state.parameterList;
    initData();
    if (state.dataForm.id) {
      changeLoading(true);
      getInfo(state.dataForm.id)
        .then(res => {
          changeLoading(false);
          res.data.smsFieldList.map(o => {
            o.isTitle = !!o.isTitle;
          });
          state.dataForm = res.data;
          state.dataForm.wxSkip = Number(state.dataForm.wxSkip);
          state.parameterList = res.data.templateParamList;
          state.allParameterList = state.parameterList;
          state.smsList = res.data.smsFieldList;
        })
        .catch(() => {
          changeLoading(false);
        });
    }
  }
  async function initData() {
    state.messageTypeList = (await baseStore.getDictionaryData('msgSendType')) as any[];
    state.messageTypeList.map(o => (o.id = o.enCode));
    state.dataForm.messageType = state.messageTypeList[0].id;
    state.messageSourceList = (await baseStore.getDictionaryData('msgSourceType')) as any[];
    state.messageSourceList.map(o => (o.id = o.enCode));
  }
  function handleSearch() {
    state.parameterList = state.allParameterList.filter(item => {
      if (item.field.toLowerCase().includes(state.keyword.toLowerCase()) || item.fieldName.toLowerCase().includes(state.keyword.toLowerCase())) {
        return item;
      }
    });
  }
  function addContent(item) {
    const content = '{' + item.field + '}';
    state.dataForm.content += content;
    state.dataForm.title += content;
    formElRef.value?.clearValidate(['title', 'content']);
  }
  function addOrUpdateParameter(item?: any) {
    openFormModal(true);
    if (item) {
      state.isEdit = true;
      nextTick(() => {
        updateSchema({ field: 'field', componentProps: { disabled: true } });
        setFieldsValue(item);
      });
    } else {
      state.isEdit = false;
      nextTick(() => updateSchema({ field: 'field', helpMessage: '可以使用大小写英文字母、数字、下划线组合，且不能数字、下划线开头。' }));
    }
  }
  async function handleFieldSubmit() {
    const values = await validate();
    if (!values) return;
    if (!state.isEdit) {
      let boo = state.parameterList.some(o => o.field === values.field);
      if (boo) return createMessage.error('参数名重复，请重新输入');
      state.parameterList.push(values);
    } else {
      for (let i = 0; i < state.parameterList.length; i++) {
        if (values.field === state.parameterList[i].field) {
          state.parameterList[i] = values;
          break;
        }
      }
    }
    state.allParameterList = state.parameterList;
    closeModal();
  }
  function removeParameter(index) {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '此操作删除该参数, 不能恢复，是否继续?',
      onOk: () => {
        state.parameterList.splice(index, 1);
        state.allParameterList = state.parameterList;
      },
    });
  }
  function addSmsData() {
    state.smsList.push({ smsField: '', field: '', fieldId: buildBitUUID() });
  }
  function removeSmsData(index) {
    state.smsList.splice(index, 1);
  }
  function onMessageTypeChange() {
    state.dataForm.content = '';
  }
  function onTitleChange(val, index) {
    if (!val) return;
    for (let i = 0; i < state.smsList.length; i++) {
      state.smsList[i].isTitle = false;
    }
    state.smsList[index].isTitle = true;
  }
  function resetForm() {
    state.dataForm = {
      id: '',
      fullName: '',
      enCode: '',
      templateType: 0,
      messageType: '',
      messageSource: '',
      enabledMark: 1,
      sortCode: 0,
      description: '',
      title: '',
      content: '',
      templateCode: '',
      wxSkip: 1,
      xcxAppId: '',
    };
    state.smsList = [];
  }
  async function handleSubmit() {
    try {
      const values = await formElRef.value?.validate();
      if (!values) return;
      state.dataForm.templateParamList = state.parameterList || [];
      state.dataForm.smsFieldList = JSON.parse(JSON.stringify(state.smsList)) || [];
      for (let i = 0; i < state.dataForm.smsFieldList.length; i++) {
        if (state.smsList[i].isTitle) {
          state.dataForm.smsFieldList[i].isTitle = 1;
        } else {
          state.dataForm.smsFieldList[i].isTitle = 0;
        }
      }
      changeOkLoading(true);
      const formMethod = state.dataForm.id ? update : create;
      let isOk = true;
      for (let i = 0; i < state.dataForm.smsFieldList.length; i++) {
        let list = state.dataForm.smsFieldList[i];
        let num = state.dataForm.smsFieldList.filter(o => o.smsField == list.smsField);
        if (num.length > 1) {
          createMessage.error(`第${i + 1}行短信变量'${list.smsField}'已重复`);
          changeOkLoading(false);
          isOk = false;
          break;
        }
      }
      if (isOk) {
        formMethod(state.dataForm)
          .then(res => {
            createMessage.success(res.msg);
            closePopup();
            changeOkLoading(false);
            emit('reload');
          })
          .catch(() => {
            changeOkLoading(false);
          });
      }
    } catch (_) {}
  }
  function getTipLabel() {
    return state.dataForm.messageSource == '2' ? '系统参数格式：{@系统参数名}；自定义参数格式：{自定义参数名}' : '系统参数格式：{@系统参数名}';
  }
  function onMessageSourceChange(val) {
    if (val == 1) state.parameterList = JSON.parse(JSON.stringify(noticeParameterList));
    if (val == 2) state.parameterList = JSON.parse(JSON.stringify(flowParameterList));
    if (val == 3) state.parameterList = JSON.parse(JSON.stringify(systemParameterList));
    if (val == 4) state.parameterList = JSON.parse(JSON.stringify(scheduleParameterList));
    state.allParameterList = state.parameterList;
  }
  function getIsSystem(val) {
    return val && val.startsWith('@') ? true : false;
  }
</script>
