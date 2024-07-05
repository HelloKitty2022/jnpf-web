<template>
  <div class="jnpf-content-wrapper bg-white">
    <div class="jnpf-content-wrapper-center email-wrapper">
      <a-tabs v-model:activeKey="activeKey" tab-position="left" class="common-left-tabs">
        <template #leftExtra>
          <div class="tab-tem" @click="openFormPopup(true, { id: '' })"><i class="icon-ym icon-ym-btn-edit"></i>写邮件</div>
        </template>
        <a-tab-pane key="inBox">
          <template #tab><i class="icon-ym icon-ym-extend-envelope"></i>收件箱</template>
        </a-tab-pane>
        <a-tab-pane key="star">
          <template #tab><i class="icon-ym icon-ym-extend-star"></i>星标件</template>
        </a-tab-pane>
        <a-tab-pane key="draft">
          <template #tab><i class="icon-ym icon-ym-extend-exclamation-triangle"></i>草稿箱</template>
        </a-tab-pane>
        <a-tab-pane key="sent">
          <template #tab><i class="icon-ym icon-ym-extend-paper-plane"></i>已发送</template>
        </a-tab-pane>
        <template #rightExtra>
          <div class="tab-tem mt-2px" @click="openConfigModal(true, {})"><i class="icon-ym icon-ym-extend-cog"></i>邮箱配置</div>
        </template>
      </a-tabs>
      <div class="container">
        <div class="jnpf-common-search-box">
          <BasicForm class="search-form" @register="registerSearchForm" @submit="handleSubmit" @reset="handleReset"></BasicForm>
          <div class="jnpf-common-search-box-right">
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-download" @click="receiveEmail" :loading="state.btnLoading">收邮件</a-button>
          </div>
        </div>
        <BasicTable @register="registerTable" :searchInfo="getSearchInfo" :columns="getColumns">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'isRead'">
              <span v-if="activeKey === 'inBox' || activeKey === 'star'">
                <span v-if="record.isRead">
                  <i class="icon-ym icon-ym-extend-envelope-open-o i-default" title="点击标记为未读" @click="handleSetUnread(record)"></i>
                </span>
                <span v-else><i class="icon-ym icon-ym-extend-envelope text-warning" title="点击标记为已读" @click="handleSetRead(record)"></i></span>
              </span>
              <span v-else><i class="icon-ym icon-ym-extend-envelope-open-o i-default"></i></span>
            </template>
            <template v-if="column.key === 'attachment'">
              <span v-if="record.attachment && JSON.parse(record.attachment).length"><i class="icon-ym icon-ym-extend-paperclip i-default"></i></span>
              <span v-else></span>
            </template>
            <template v-if="column.key === 'subject'">
              <p class="link-text" @click="updateEmail(record.id)" v-if="activeKey === 'draft'">{{ record.subject }}</p>
              <p class="link-text" @click="readInfo(record, activeKey === 'sent')" v-else>{{ record.subject }}</p>
            </template>
            <template v-if="column.key === 'starred'">
              <span v-if="record.starred">
                <i class="icon-ym icon-ym-extend-star text-warning img-star" title="点击取消星标" @click="handleSetUnStar(record)"></i>
              </span>
              <span v-else><i class="icon-ym icon-ym-extend-star-o i-default img-star" title="点击标记为星标邮件" @click="handleSetStar(record)"></i></span>
            </template>
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <Config @register="registerConfigModal" />
    <Form @register="registerForm" @reload="refresh" />
    <Detail @register="registerDetail" />
  </div>
</template>

<script setup lang="ts">
  import { getEmailList, delEmail, receive, setRead, setUnread, setStar, setUnStar } from '/@/api/extend/email';
  import { computed, reactive, toRefs, onMounted, nextTick, watch } from 'vue';
  import { useModal } from '/@/components/Modal';
  import { usePopup } from '/@/components/Popup';
  import { BasicForm, useForm } from '/@/components/Form';
  import { BasicTable, useTable, TableAction, ActionItem } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import Config from './Config.vue';
  import Form from './Form.vue';
  import Detail from './Detail.vue';
  import dayjs from 'dayjs';

  interface State {
    activeKey: string;
    keyword: string;
    startTime: number;
    endTime: number;
    btnLoading: boolean;
  }

  defineOptions({ name: 'extend-email' });
  const { t } = useI18n();
  const { createMessage } = useMessage();
  const state = reactive<State>({
    activeKey: 'inBox',
    keyword: '',
    startTime: 0,
    endTime: 0,
    btnLoading: false,
  });
  const getSearchInfo = computed(() => ({ keyword: state.keyword, type: state.activeKey, startTime: state.startTime || null, endTime: state.endTime || null }));
  const getColumns = computed<any[]>(() => {
    if (state.activeKey === 'inBox' || state.activeKey === 'star') {
      return [
        { title: '', dataIndex: 'isRead', width: 40, align: 'center' },
        { title: '', dataIndex: 'attachment', width: 40, align: 'center' },
        { title: '发件人', dataIndex: 'sender', width: 180 },
        { title: '主题', dataIndex: 'subject' },
        { title: '时间', dataIndex: 'fdate', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
        { title: '', dataIndex: 'starred', width: 40, align: 'center' },
      ];
    }
    return [
      { title: '', dataIndex: 'isRead', width: 40, align: 'center' },
      { title: '', dataIndex: 'attachment', width: 40, align: 'center' },
      { title: '收件人', dataIndex: 'recipient', width: 180 },
      { title: '主题', dataIndex: 'subject' },
      { title: '时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    ];
  });

  watch(
    () => state.activeKey,
    () => {
      nextTick(() => resetFields());
    },
  );

  const { activeKey } = toRefs(state);
  const [registerConfigModal, { openModal: openConfigModal }] = useModal();
  const [registerForm, { openPopup: openFormPopup }] = usePopup();
  const [registerDetail, { openPopup: openDetailPopup }] = usePopup();
  const [registerSearchForm, { resetFields }] = useForm({
    baseColProps: { span: 6 },
    showActionButtonGroup: true,
    showAdvancedButton: true,
    compact: true,
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
        field: 'pickerVal',
        label: '时间',
        component: 'DateRange',
        componentProps: {
          format: 'YYYY-MM-DD HH:mm:ss',
          showTime: { defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('23:59:59', 'HH:mm:ss')] },
          placeholder: ['开始时间', '结束时间'],
        },
      },
    ],
    fieldMapToTime: [['pickerVal', ['startTime', 'endTime']]],
  });
  const [registerTable, { reload, deleteTableDataRecord }] = useTable({
    api: getEmailList,
    showTableSetting: false,
    immediate: false,
    resizeHeightOffset: 10,
    actionColumn: {
      width: 50,
      title: '操作',
      dataIndex: 'action',
    },
  });

  function getTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.delText'),
        color: 'error',
        modelConfirm: {
          onOk: handleDelete.bind(null, record.id),
        },
      },
    ];
  }
  function handleDelete(id) {
    delEmail(id).then(res => {
      createMessage.success(res.msg).then(() => {
        reload();
      });
    });
  }
  function handleSubmit(values) {
    state.keyword = values?.keyword || '';
    state.startTime = values?.startTime || 0;
    state.endTime = values?.endTime || 0;
    handleSearch();
  }
  function handleReset() {
    state.keyword = '';
    state.startTime = 0;
    state.endTime = 0;
    handleSearch();
  }
  function handleSearch() {
    nextTick(() => {
      reload();
    });
  }
  function receiveEmail() {
    state.btnLoading = true;
    receive()
      .then(res => {
        state.btnLoading = false;
        createMessage.success(`收件成功${res.data}条`);
        if (state.activeKey == 'inBox') {
          resetFields();
        } else {
          state.activeKey = 'inBox';
        }
      })
      .catch(() => {
        state.btnLoading = false;
      });
  }
  function handleSetUnread(record) {
    setUnread(record.id).then(res => {
      record.isRead = 0;
      createMessage.success(res.msg);
    });
  }
  function handleSetRead(record) {
    setRead(record.id).then(res => {
      record.isRead = 1;
      createMessage.success(res.msg);
    });
  }
  function handleSetUnStar(record) {
    setUnStar(record.id).then(res => {
      if (state.activeKey === 'star') {
        deleteTableDataRecord(record.id);
      } else {
        record.starred = 0;
      }
      createMessage.success(res.msg);
    });
  }
  function handleSetStar(record) {
    setStar(record.id).then(res => {
      record.starred = 1;
      createMessage.success(res.msg);
    });
  }
  function updateEmail(id) {
    openFormPopup(true, { id });
  }
  function readInfo(record, isSend) {
    openDetailPopup(true, { id: record.id, isSend });
    if (!isSend) record.isRead = 1;
  }
  function refresh(isSend) {
    if (isSend) {
      if (state.activeKey === 'sent') {
        resetFields();
      } else {
        state.activeKey = 'sent';
      }
    } else {
      if (state.activeKey === 'draft') {
        resetFields();
      } else {
        state.activeKey = 'draft';
      }
    }
  }

  onMounted(() => {
    resetFields();
  });
</script>

<style lang="less" scoped>
  .email-wrapper {
    flex-direction: row;

    :deep(.ant-table-container) {
      .ant-table-cell::before {
        display: none !important;
      }
    }
    padding: 10px;
    :deep(.common-left-tabs) {
      .ant-tabs-nav-wrap {
        flex: unset;
      }
      .ant-tabs-tab {
        .icon-ym {
          font-size: 14px;
          margin-right: 8px;
        }
      }
    }
    .tab-tem {
      width: 160px;
      padding: 8px 24px;
      cursor: pointer;
      .icon-ym {
        font-size: 14px;
        margin-right: 8px;
      }
    }
    .jnpf-common-search-box {
      margin-bottom: 10px;
      .jnpf-common-search-box-right {
        right: 0;
        top: 10px;
      }
    }
    .container {
      height: 100%;
      overflow: hidden;
      .icon-ym {
        font-size: 14px;
        cursor: pointer;
      }
    }
  }
</style>
