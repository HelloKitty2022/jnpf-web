<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'enabledMark'">
              <a-tag :color="record.enabledMark == 1 ? 'success' : 'error'">{{ record.enabledMark == 1 ? '启用' : '禁用' }}</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <Form @register="registerForm" @reload="reload" />
    <Detail @register="registerDetail" />
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, reactive } from 'vue';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { getMsgTemplateList, delMsgTemplate, copy } from '/@/api/msgCenter/msgTemplate';
  import { usePopup } from '/@/components/Popup';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useBaseStore } from '/@/store/modules/base';
  import Form from './Form.vue';
  import Detail from './Detail.vue';

  defineOptions({ name: 'msgCenter-msgTemplate' });
  interface State {
    messageTypeList: any[];
  }

  const state = reactive<State>({
    messageTypeList: [],
  });
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const { createMessage } = useMessage();
  const columns: BasicColumn[] = [
    { title: '名称', dataIndex: 'fullName', width: 200 },
    { title: '编码', dataIndex: 'enCode', width: 150 },
    { title: '消息来源', dataIndex: 'messageSource', width: 100 },
    { title: '消息类型', dataIndex: 'messageType', width: 100 },
    {
      title: '模板类型',
      dataIndex: 'category',
      width: 100,
      customRender: ({ record }) => (record.templateType == '1' ? '系统模板' : '自定义模板'),
    },
    { title: '创建人', dataIndex: 'creatorUser', width: 120 },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '最后修改时间', dataIndex: 'lastModifyTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
    { title: '状态', dataIndex: 'enabledMark', width: 70, align: 'center' },
  ];
  const [registerForm, { openPopup: openFormPopup }] = usePopup();
  const [registerDetail, { openPopup: openDetailPopup }] = usePopup();
  const [registerTable, { reload, getForm }] = useTable({
    api: getMsgTemplateList,
    columns,
    useSearchForm: true,
    formConfig: {
      schemas: [
        {
          field: 'keyword',
          label: t('common.keyword'),
          component: 'Input',
          componentProps: {
            placeholder: t('common.enterKeyword'),
            submitOnPressEnter: true,
          },
        },
        {
          field: 'messageSource',
          label: '消息来源',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
          },
        },
        {
          field: 'messageType',
          label: '消息类型',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
          },
        },
        {
          field: 'templateType',
          label: '模板类型',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            options: [
              { fullName: '系统模板', id: 1 },
              { fullName: '自定义模板', id: 0 },
            ],
          },
        },
        {
          field: 'enabledMark',
          label: '状态',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            options: [
              { fullName: '启用', id: 1 },
              { fullName: '禁用', id: 0 },
            ],
          },
        },
      ],
    },
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
    },
  });

  function getTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.editText'),
        disabled: record.templateType == 1,
        onClick: addOrUpdateHandle.bind(null, record.id),
      },
      {
        label: t('common.delText'),
        color: 'error',
        disabled: record.templateType == 1,
        modelConfirm: {
          onOk: handleDelete.bind(null, record.id),
        },
      },
    ];
  }
  function getDropDownActions(record): ActionItem[] {
    return [
      {
        label: '复制',
        modelConfirm: {
          content: '您确定要复制该功能模板, 是否继续?',
          onOk: handleCopy.bind(null, record.id),
        },
      },
      {
        label: t('common.detailText'),
        onClick: handleDetail.bind(null, record.id),
      },
    ];
  }
  function addOrUpdateHandle(id = '') {
    openFormPopup(true, { id });
  }
  function handleCopy(id) {
    copy(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  function handleDetail(id) {
    openDetailPopup(true, { id, msgTypeList: state.messageTypeList });
  }
  function handleDelete(id) {
    delMsgTemplate(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  async function init() {
    let messageTypeList: any[] = (await baseStore.getDictionaryData('msgSendType')) as any[];
    messageTypeList.map(o => (o.id = o.enCode));
    state.messageTypeList = messageTypeList;
    let messageSourceList = (await baseStore.getDictionaryData('msgSourceType')) as any[];
    messageSourceList.map(o => (o.id = o.enCode));
    getForm().updateSchema([
      { field: 'messageType', componentProps: { options: messageTypeList } },
      { field: 'messageSource', componentProps: { options: messageSourceList } },
    ]);
  }

  onMounted(() => {
    init();
  });
</script>
