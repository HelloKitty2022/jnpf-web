<template>
  <a-popover placement="bottom" trigger="manual" overlayClassName="commonWords-popover" v-model:visible="popoverVisible">
    <a-button type="link" preIcon="icon-ym icon-ym-btn-add" class="!px-0" @click="openPopover">常用语</a-button>
    <template #content>
      <a-table :data-source="list" :columns="columns" size="small" :pagination="false" :showHeader="false" :loading="loading" :scroll="{ y: 220 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'commonWordsText'">
            <span class="cursor-pointer" @click="handleSubmit(record.commonWordsText)">{{ record.commonWordsText }}</span>
          </template>
          <template v-if="column.key === 'action' && record.commonWordsType">
            <a-button class="action-btn !leading-10px" type="link" @click.stop="addOrUpdateHandle(record.id)" size="small"
              ><i class="icon-ym icon-ym-btn-edit"></i
            ></a-button>
            <a-button class="action-btn ml-10px" type="link" @click.stop="handleDelete(record.id)" size="small">
              <i class="icon-ym icon-ym-btn-clearn !text-17px"></i>
            </a-button>
          </template>
        </template>
      </a-table>
      <div class="commonWords-popover-footer">
        <a-button @click="state.popoverVisible = false">{{ t('common.cancelText') }}</a-button>
        <a-button type="primary" @click="addOrUpdateHandle()" class="ml-10px">新增</a-button>
      </div>
    </template>
  </a-popover>
  <Form @register="registerForm" @reload="initData" :zIndex="1002" />
</template>
<script lang="ts" setup>
  import { getCommonWordsSelector, delCommonWords } from '/@/api/system/commonWords';
  import { reactive, toRefs } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import Form from '/@/views/system/commonWords/Form.vue';

  interface State {
    popoverVisible: boolean;
    loading: boolean;
    list: any[];
  }

  const emit = defineEmits(['confirm']);
  const columns: any[] = [
    { title: '常用语', dataIndex: 'commonWordsText', key: 'commonWordsText', ellipsis: true },
    { title: '操作', dataIndex: 'action', key: 'action', width: 90, align: 'center' },
  ];
  const { createMessage, createConfirm } = useMessage();
  const { t } = useI18n();
  const state = reactive<State>({
    popoverVisible: false,
    loading: false,
    list: [],
  });
  const { popoverVisible, loading, list } = toRefs(state);
  const [registerForm, { openModal: openFormModal }] = useModal();

  defineExpose({ closePopover });

  function openPopover() {
    state.popoverVisible = true;
    initData();
  }
  function closePopover() {
    state.popoverVisible = false;
  }
  function initData() {
    state.list = [];
    getCommonWordsSelector()
      .then(res => {
        state.list = res.data.list || [];
        state.loading = false;
      })
      .catch(() => {
        state.loading = false;
      });
  }
  function handleDelete(id) {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: t('common.delTip'),
      zIndex: 10000,
      onOk: () => {
        delCommonWords(id).then(res => {
          createMessage.success(res.msg);
          initData();
        });
      },
    });
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id, commonWordsType: 1 });
  }
  async function handleSubmit(commonWordsText) {
    emit('confirm', commonWordsText || '');
    state.popoverVisible = false;
  }
</script>
<style lang="less">
  .commonWords-popover {
    z-index: 1001 !important;
    .ant-popover-inner-content {
      padding: 10px;
      width: 500px;
      .icon-ym-btn-clearn {
        color: @error-color;
        font-size: 17px !important;
      }
    }
  }
  .commonWords-popover-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 10px;
  }
</style>
