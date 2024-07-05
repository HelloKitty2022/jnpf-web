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
            <a-input v-model:value="dataForm.enCode" placeholder="请输入" allowClear />
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
          <a-form-item label="排序" name="sortCode">
            <a-input-number :min="0" :max="999999" v-model:value="dataForm.sortCode" placeholder="请输入" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="状态" name="enabledMark">
            <a-switch v-model:checked="dataForm.enabledMark" :checkedValue="1" :unCheckedValue="0" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="说明" name="description">
            <a-textarea v-model:value="dataForm.description" placeholder="请输入" type="textarea" :rows="3" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <div class="msg-pane">
            <div class="list">
              <BasicTable @register="registerTable" :data-source="dataForm.sendConfigTemplateList" size="small">
                <template #bodyCell="{ column, record, index }">
                  <template v-if="column.key === 'enabledMark'">
                    <a-switch v-model:checked="record.enabledMark" :checkedValue="1" :unCheckedValue="0" />
                  </template>
                  <template v-if="column.key === 'action'">
                    <TableAction :actions="getTableActions(record, index)" :dropDownActions="getDropDownActions(record)" />
                  </template>
                </template>
              </BasicTable>
            </div>
            <div class="table-add-action" @click="addTemplateData">
              <a-button type="link" preIcon="icon-ym icon-ym-btn-add">{{ t('common.addText') }}</a-button>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-form>
    <TemplateForm @register="registerTemplateForm" @reload="addEditTemplate" />
  </BasicPopup>
  <Detail @register="registerDetail" />
</template>
<script lang="ts" setup>
  import { reactive, toRefs, ref } from 'vue';
  import { BasicPopup, usePopup, usePopupInner } from '/@/components/Popup';
  import formValidate from '/@/utils/formValidate';
  import { getInfo, update, create } from '/@/api/msgCenter/sendConfig';
  import { useBaseStore } from '/@/store/modules/base';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicTable, useTable, BasicColumn, TableAction, ActionItem } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import TemplateForm from './components/TemplateForm.vue';
  import Detail from '../msgTemplate/Detail.vue';

  const emit = defineEmits(['register', 'reload']);

  interface State {
    title: string;
    dataForm: any;
    dataRule: any;
    messageTypeList: any[];
    messageSourceList: any[];
  }

  const state = reactive<State>({
    title: '',
    dataForm: {
      id: '',
      fullName: '',
      enCode: '',
      description: '',
      enabledMark: 1,
      sortCode: 0,
      messageSource: '',
      templateType: 0,
      sendConfigTemplateList: [],
    },
    dataRule: {
      fullName: [{ required: true, message: '必填', trigger: 'blur' }],
      enCode: [
        { required: true, message: '必填', trigger: 'blur' },
        { validator: formValidate('enCode'), trigger: 'blur' },
      ],
      messageSource: [{ required: true, message: '必填', trigger: 'change' }],
      messageType: [{ required: true, message: '必填', trigger: 'change' }],
    },
    messageTypeList: [],
    messageSourceList: [],
  });
  const { dataForm, dataRule, title, messageSourceList } = toRefs(state);
  const formElRef = ref();
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const { createMessage, createConfirm } = useMessage();
  const [registerPopup, { changeLoading, changeOkLoading, closePopup }] = usePopupInner(init);
  const [registerTemplateForm, { openModal: openTemplateFormModal }] = useModal();
  const [registerDetail, { openPopup: openDetailPopup }] = usePopup();
  const columns: BasicColumn[] = [
    {
      title: '消息类型',
      dataIndex: 'messageType',
      key: 'messageType',
      width: 150,
      customRender: ({ record }) => {
        const item = state.messageTypeList.find(res => {
          return record.messageType == res.enCode;
        });
        return item.fullName;
      },
    },
    { title: '模板编码', dataIndex: 'templateCode', width: 150 },
    { title: '模板名称', dataIndex: 'templateName', width: 150 },
    { title: '账号编码', dataIndex: 'accountCode', width: 150 },
    { title: '账号名称', dataIndex: 'accountName', width: 150 },
    { title: '状态', dataIndex: 'enabledMark', width: 70, align: 'center' },
  ];
  const [registerTable] = useTable({
    columns,
    useSearchForm: false,
    pagination: false,
    canResize: false,
    showTableSetting: false,
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
    },
  });

  function init(data) {
    formElRef.value?.resetFields();
    resetForm();
    state.dataForm.id = data.id || '';
    state.title = !state.dataForm.id ? t('common.addText') : t('common.editText');
    initData();
    if (state.dataForm.id) {
      changeLoading(true);
      getInfo(state.dataForm.id)
        .then(res => {
          changeLoading(false);
          res.data.enabledMark = Number(res.data.enabledMark);
          state.dataForm = res.data;
        })
        .catch(() => {
          changeLoading(false);
        });
    }
  }
  async function initData() {
    state.messageTypeList = (await baseStore.getDictionaryData('msgSendType')) as any[];
    state.messageTypeList.map(o => (o.id = o.enCode));
    state.messageSourceList = (await baseStore.getDictionaryData('msgSourceType')) as any[];
    state.messageSourceList.map(o => (o.id = o.enCode));
  }
  function getTableActions(record, index): ActionItem[] {
    return [
      {
        label: t('common.editText'),
        onClick: addTemplateData.bind(null, record, index),
      },
      {
        label: t('common.delText'),
        color: 'error',
        onClick: handleDelete.bind(null, index),
      },
    ];
  }
  function getDropDownActions(record): ActionItem[] {
    return [
      {
        label: t('common.detailText'),
        onClick: handleDetail.bind(null, record.templateId),
      },
    ];
  }
  function addTemplateData(record?: any, index?: any) {
    if (!state.dataForm.messageSource) return createMessage.warning('请选择消息来源');
    openTemplateFormModal(true, { row: record, index: index, messageSource: state.dataForm.messageSource });
  }
  function addEditTemplate(e, index) {
    if (!index && index != 0) {
      state.dataForm.sendConfigTemplateList.push(e);
    } else {
      state.dataForm.sendConfigTemplateList[index] = e;
    }
  }
  function handleDelete(index) {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '删除记录，不可恢复?',
      onOk: () => {
        state.dataForm.sendConfigTemplateList.splice(index, 1);
      },
    });
  }
  function handleDetail(id) {
    openDetailPopup(true, { id, msgTypeList: state.messageTypeList });
  }
  function resetForm() {
    state.dataForm = {
      id: '',
      fullName: '',
      enCode: '',
      description: '',
      enabledMark: 1,
      sortCode: 0,
      messageSource: '',
      templateType: 0,
      sendConfigTemplateList: [],
    };
  }
  async function handleSubmit() {
    try {
      const values = await formElRef.value?.validate();
      if (!values) return;
      changeOkLoading(true);
      const formMethod = state.dataForm.id ? update : create;
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
    } catch (_) {}
  }
  function onMessageSourceChange() {
    state.dataForm.sendConfigTemplateList = [];
  }
</script>
