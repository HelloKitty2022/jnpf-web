<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="t('common.detailText')" destroy-on-close>
    <a-form class="!mx-20px" :colon="false" :model="dataForm" :labelCol="{ style: { width: '100px' } }">
      <a-row :gutter="20">
        <a-col :span="12">
          <a-form-item label="名称" name="fullName">
            <p>{{ dataForm.fullName }}</p>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="编码" name="enCode">
            <p>{{ dataForm.enCode }}</p>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="模板类型">
            <p>{{ dataForm.templateType == '0' ? '自定义模板' : '系统模板' }}</p>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="消息来源" name="messageSource">
            <p>{{ dataForm.messageSourceName }}</p>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="排序" name="sortCode">
            <p>{{ dataForm.sortCode }}</p>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="状态" name="enabledMark">
            <jnpf-switch v-model:value="dataForm.enabledMark" disabled />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="说明" name="description">
            <p>{{ dataForm.description }}</p>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <div class="msg-pane">
            <div class="list">
              <BasicTable @register="registerTable" :data-source="dataForm.sendConfigTemplateList" size="small">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'enabledMark'">
                    <a-switch v-model:checked="record.enabledMark" :checkedValue="1" :unCheckedValue="0" disabled />
                  </template>
                  <template v-if="column.key === 'action'">
                    <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
                  </template>
                </template>
              </BasicTable>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-form>
  </BasicPopup>
  <Detail @register="registerDetail" />
</template>
<script lang="ts" setup>
  import { reactive, toRefs } from 'vue';
  import { BasicPopup, usePopup, usePopupInner } from '/@/components/Popup';
  import { getInfo } from '/@/api/msgCenter/sendConfig';
  import { BasicTable, useTable, BasicColumn, TableAction, ActionItem } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useBaseStore } from '/@/store/modules/base';
  import Detail from '../msgTemplate/Detail.vue';

  interface State {
    dataForm: any;
    messageTypeList: any[];
  }

  const state = reactive<State>({
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
    messageTypeList: [],
  });
  const { dataForm } = toRefs(state);
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const [registerPopup, { changeLoading }] = usePopupInner(init);
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
    initData();
    state.dataForm.id = data.id || '';
    if (state.dataForm.id) {
      changeLoading(true);
      getInfo(state.dataForm.id)
        .then(res => {
          changeLoading(false);
          state.dataForm = res.data;
          state.dataForm.enabledMark = Number(state.dataForm.enabledMark);
          state.dataForm.messageSourceName = data.messageSourceName;
        })
        .catch(() => {
          changeLoading(false);
        });
    }
  }
  async function initData() {
    state.messageTypeList = (await baseStore.getDictionaryData('msgSendType')) as any[];
    state.messageTypeList.map(o => (o.id = o.enCode));
  }
  function getTableActions(_record): ActionItem[] {
    return [
      {
        label: t('common.editText'),
        disabled: true,
      },
      {
        label: t('common.delText'),
        disabled: true,
        color: 'error',
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
  function handleDetail(id) {
    openDetailPopup(true, { id, msgTypeList: state.messageTypeList });
  }
</script>
