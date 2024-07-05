<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="getTitle" class="full-popup" :closeFunc="onClose">
    <BasicTable :columns="columns" @register="registerTable" class="jnpf-sub-table jnpf-sub-table-full" v-show="!showFlow">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'version'">
          <a-tag color="processing">V:{{ record.version }}</a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
        </template>
      </template>
    </BasicTable>
    <div class="process-preview" v-if="showFlow">
      <FlowProcessMain :conf="flowConf" :isPreview="true" />
    </div>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { getFlowJsonList, setMainVersion, delVersion, getFlowList } from '/@/api/workFlow/flowEngine';
  import { getFlowByFormId } from '/@/api/workFlow/formDesign';
  import { ref, unref, computed, reactive } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { BasicTable, useTable, TableAction, BasicColumn, ActionItem } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import FlowProcessMain from '/@/components/FlowProcess/src/Main.vue';
  import dayjs from 'dayjs';

  defineEmits(['register']);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerPopup, { closePopup }] = usePopupInner(init);
  const title = ref('');
  const flowId = ref('');
  const showFlow = ref(false);
  const flowConf = ref<any>({});
  const columns: BasicColumn[] = [
    { title: '版本号', dataIndex: 'version', align: 'center' },
    {
      title: '主版本',
      dataIndex: 'enabledMark',
      align: 'center',
      customRender: ({ record }) => {
        return record.enabledMark == 1 ? '是' : '否';
      },
    },
    { title: '创建人', dataIndex: 'creatorUser', width: 120 },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '最后修改时间', dataIndex: 'lastModifyTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
  ];
  const searchInfo = reactive({
    templateId: '',
    flowId: '',
  });

  const getTitle = computed(() => (unref(showFlow) ? '流程图' : unref(title)));

  const [registerTable, { getForm }] = useTable({
    api: getFlowJsonList,
    searchInfo: searchInfo,
    useSearchForm: true,
    formConfig: {
      baseColProps: { span: 6 },
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
          field: 'flowId',
          label: '所属流程',
          component: 'Select',
          componentProps: { placeholder: '请选择', showSearch: true, allowClear: false },
        },
        {
          field: 'pickerVal',
          label: '创建时间',
          component: 'DateRange',
          componentProps: {
            format: 'YYYY-MM-DD HH:mm:ss',
            showTime: { defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('23:59:59', 'HH:mm:ss')] },
            placeholder: ['开始时间', '结束时间'],
          },
        },
      ],
      fieldMapToTime: [['pickerVal', ['startTime', 'endTime']]],
    },
    immediate: false,
    tableSetting: { setting: false, redo: false },
    actionColumn: {
      width: 200,
      title: '操作',
      dataIndex: 'action',
    },
  });

  function getTableActions(record): ActionItem[] {
    return [
      {
        label: '设为主版本',
        disabled: record.enabledMark === 1,
        modelConfirm: {
          content: '启用后，新发起的流程将按此版本流转。未审批完的流程，按原来的版本流转。',
          onOk: handleSetMain.bind(null, record.id),
        },
      },
      {
        label: t('common.delText'),
        color: 'error',
        disabled: record.enabledMark === 1,
        modelConfirm: {
          onOk: handleDelete.bind(null, record.id),
        },
      },
    ];
  }
  function getDropDownActions(record): ActionItem[] {
    return [
      {
        label: '流程图',
        onClick: handleInfo.bind(null, record.flowTemplateJson),
      },
    ];
  }
  function init(data) {
    title.value = data.fullName + '的版本管理';
    showFlow.value = false;
    if (data.type) {
      getFlowByFormId(data.id).then(res => {
        flowId.value = res.data.id;
        const id = res.data.id;
        getOptions(id);
      });
    } else {
      flowId.value = data.id;
      getOptions(data.id);
    }
  }
  async function getOptions(id) {
    searchInfo.templateId = id;
    const res = await getFlowList(id);
    if (!res.data || !res.data.length) {
      createMessage.error('流程未设计，请先设计流程');
      closePopup();
      return;
    }
    getForm().updateSchema({ field: 'flowId', componentProps: { options: res.data }, defaultValue: res.data[0].id });
    getForm().setFieldsValue({ flowId: res.data[0].id });
    getForm().submit();
  }
  function handleSetMain(id) {
    setMainVersion(id).then(res => {
      createMessage.success(res.msg);
      getForm().submit();
    });
  }
  function handleDelete(id) {
    delVersion(id).then(res => {
      createMessage.success(res.msg);
      getOptions(flowId.value);
    });
  }
  function handleInfo(flowTemplateJson) {
    if (!flowTemplateJson) return;
    flowConf.value = JSON.parse(flowTemplateJson);
    showFlow.value = true;
  }
  function onClose() {
    if (showFlow.value) {
      showFlow.value = false;
      return false;
    }
    return true;
  }
</script>
<style lang="less" scoped>
  .process-preview {
    height: 100%;
    padding: 10px 0;

    :deep(.process-flow-container) {
      .tips {
        display: none;
      }

      .scale-slider {
        right: 10px;
      }
    }
  }
</style>
