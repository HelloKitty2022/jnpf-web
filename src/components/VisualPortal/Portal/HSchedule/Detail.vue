<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="t('common.detailText')">
    <a-form class="!mx-20px" :colon="false" :model="dataForm" ref="formElRef" :labelCol="{ style: { width: '80px' } }">
      <a-form-item label="类型">
        <p>{{ dataForm.category }}</p>
      </a-form-item>
      <a-form-item label="紧急程度">
        <p>{{ dataForm.urgent }}</p>
      </a-form-item>
      <a-form-item label="标题">
        <p>{{ dataForm.title }}</p>
      </a-form-item>
      <a-form-item label="内容">
        <p>{{ dataForm.content }}</p>
      </a-form-item>
      <a-form-item label="附件">
        <JnpfUploadFile v-model:value="dataForm.files" disabled detailed />
      </a-form-item>
      <a-form-item label="开始时间">
        <p>{{ dayjs(dataForm.startDay).format('YYYY-MM-DD HH:mm:ss') }} </p>
      </a-form-item>
      <a-form-item label="结束时间">
        <p>{{ dayjs(dataForm.endDay).format('YYYY-MM-DD HH:mm:ss') }} </p>
      </a-form-item>
      <a-form-item label="创建人">
        <p>{{ dataForm.creatorUserId }}</p>
      </a-form-item>
      <a-form-item label="参与人">
        <p>{{ dataForm.toUserIds }}</p>
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button type="primary" danger @click="handleDel" v-if="type == 1">删除</a-button>
      <a-button @click="closeModal">{{ t('common.cancelText') }}</a-button>
    </template>
  </BasicModal>
  <Modal v-model:visible="visible" width="380px" title="删除确认" centered>
    <div class="mx-50px my-20px">
      <p class="mb-20px">此为重复日程，将删除应用于</p>
      <a-radio-group v-model:value="checked">
        <a-radio v-for="item in deleteList" :value="item.id" class="!flex !mb-10px">{{ item.fullName }} </a-radio>
      </a-radio-group>
    </div>
    <template #footer>
      <a-button @click="visible = false">{{ t('common.cancelText') }}</a-button>
      <a-button type="primary" :loading="btnLoading" @click="handleDelFun()">{{ t('common.okText') }}</a-button>
    </template>
  </Modal>
</template>
<script lang="ts" setup>
  import { toRefs, reactive, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getScheduleDetail, delSchedule } from '/@/api/onlineDev/portal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Modal } from 'ant-design-vue';
  import dayjs from 'dayjs';
  import { useMessage } from '/@/hooks/web/useMessage';

  interface State {
    dataForm: any;
    type: number;
    groupId: number;
    visible: boolean;
    checked: number;
    btnLoading: boolean;
  }

  const state = reactive<State>({
    dataForm: {},
    type: 0,
    groupId: 0,
    visible: false,
    checked: 1,
    btnLoading: false,
  });
  const { dataForm, visible, checked, btnLoading, type } = toRefs(state);
  const deleteList = [
    { id: 1, fullName: '此日程' },
    { id: 2, fullName: '此日程及后续' },
    { id: 3, fullName: '所有日程' },
  ];
  const { t } = useI18n();
  const { createMessage, createConfirm } = useMessage();
  const emit = defineEmits(['register', 'reload']);
  const [registerModal, { closeModal, changeLoading }] = useModalInner(init);

  function init(data) {
    state.dataForm.id = data.id || '';
    state.type = data.type || 0;
    state.groupId = data.groupId || 0;
    nextTick(() => {
      changeLoading(true);
      getScheduleDetail(state.groupId, state.dataForm.id)
        .then(res => {
          let data = res.data || {};
          data.files = data.files ? JSON.parse(data.files) : [];
          state.dataForm = data;
          changeLoading(false);
        })
        .catch(() => {
          changeLoading(false);
        });
    });
  }
  function handleDel() {
    state.checked = 1;
    if (state.dataForm.repetition != 1) {
      state.btnLoading = false;
      state.visible = true;
      return;
    }
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '此操作将永久删除此日程，同时删除所有参与人的日程，是否继续？',
      onOk: () => {
        handleDelFun();
      },
    });
  }
  function handleDelFun() {
    state.btnLoading = true;
    if (!state.checked && state.dataForm.repetition != 1) return createMessage.warning('请选择日程');
    delSchedule(state.dataForm.id, state.dataForm.repetition != 1 ? state.checked : 3).then(res => {
      createMessage.success(res.msg);
      state.visible = false;
      closeModal();
      emit('reload');
    });
  }
</script>
