<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" destroyOnClose>
    <BasicForm @register="registerForm">
      <template #send="{ model, field }">
        <msg-modal :value="model[field]" :title="state.dataForm.sendName" messageSource="4" @change="onMsgChange" />
      </template>
    </BasicForm>
    <template #insertFooter v-if="dataForm.id">
      <a-button type="primary" danger @click="handleDel">删除</a-button>
    </template>
  </BasicModal>
  <Modal v-model:visible="visible" width="380px" :title="isEdit ? '编辑确认' : '删除确认'" centered destroyOnClose>
    <div class="mx-50px my-20px">
      <p class="mb-20px">{{ isEdit ? '此为重复日程，将修改应用于' : '此为重复日程，将删除（含参与人）应用于' }}</p>
      <a-radio-group v-model:value="checked">
        <a-radio v-for="item in isEdit ? tableList : deleteList" :value="item.id" class="!flex !mb-10px">{{ item.fullName }} </a-radio>
      </a-radio-group>
    </div>
    <template #footer>
      <a-button @click="visible = false">{{ t('common.cancelText') }}</a-button>
      <a-button type="primary" :loading="btnLoading" @click="isEdit ? handleSubmit(1) : handleDelFun()">{{ t('common.okText') }}</a-button>
    </template>
  </Modal>
</template>
<script lang="ts" setup>
  import { toRefs, reactive, computed, nextTick, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { getScheduleInfo, delSchedule, createSchedule, updateSchedule } from '/@/api/onlineDev/portal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { useBaseStore } from '/@/store/modules/base';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Modal } from 'ant-design-vue';
  import MsgModal from '/@/components/FlowProcess/src/propPanel/MsgModal.vue';
  import dayjs from 'dayjs';
  import { durationOptions } from '/@/components/VisualPortal/Design/helper/dataMap';

  interface State {
    dataForm: any;
    btnLoading: boolean;
    visible: boolean;
    isEdit: boolean;
    checked: number;
    repetitionState: boolean;
  }

  const state = reactive<State>({
    dataForm: {
      category: 0,
    },
    btnLoading: false,
    visible: false,
    isEdit: false,
    checked: 1,
    repetitionState: false,
  });
  const { btnLoading, visible, isEdit, checked, dataForm } = toRefs(state);
  const userStore = useUserStore();
  const baseStore = useBaseStore();
  const { t } = useI18n();
  const { createMessage, createConfirm } = useMessage();
  const emit = defineEmits(['register', 'reload']);
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);
  const validateEndDay = (_rule, value) => {
    const data = getFieldsValue();
    if (value === '') {
      return Promise.reject('结束时间不能为空');
    } else {
      if (data.startDay == value && data.startTime > data.endTime) return Promise.reject('结束时间必须晚于开始时间');
      if (data.startDay > value) return Promise.reject('结束时间必须晚于开始时间');
      return Promise.resolve();
    }
  };
  const durationList = [...durationOptions, { id: -1, fullName: '自定义' }];
  const urgentList = [
    { id: '1', fullName: '普通' },
    { id: '2', fullName: '重要' },
    { id: '3', fullName: '紧急' },
  ];
  const tableList = [
    { id: 1, fullName: '此日程' },
    { id: 2, fullName: '此日程及后续' },
  ];
  const deleteList = [
    { id: 1, fullName: '此日程' },
    { id: 2, fullName: '此日程及后续' },
    { id: 3, fullName: '所有日程' },
  ];
  const reminderTimeList = [
    { id: -2, fullName: '不提醒' },
    { id: -1, fullName: '开始时' },
    { id: 5, fullName: '提前5分钟' },
    { id: 10, fullName: '提前10分钟' },
    { id: 15, fullName: '提前15分钟' },
    { id: 30, fullName: '提前30分钟' },
    { id: 60, fullName: '提前1小时' },
    { id: 120, fullName: '提前2小时' },
    { id: 1440, fullName: '1天前' },
    { id: 2880, fullName: '2天前' },
    { id: 10080, fullName: '1周前' },
  ];
  const reminderTimeList_ = [
    { id: -2, fullName: '不提醒' },
    { id: 1, fullName: '当天8:00' },
    { id: 2, fullName: '当天9:00' },
    { id: 3, fullName: '当天10:00' },
    { id: 4, fullName: '1天前8:00' },
    { id: 5, fullName: '1天前9:00' },
    { id: 6, fullName: '1天前10:00' },
    { id: 7, fullName: '2天前8:00' },
    { id: 8, fullName: '2天前9:00' },
    { id: 9, fullName: '2天前10:00' },
    { id: 10, fullName: '1周前8:00' },
    { id: 11, fullName: '1周前9:00' },
    { id: 12, fullName: '1周前10:00' },
  ];
  const remindList = [
    { id: 1, fullName: '默认' },
    { id: 2, fullName: '自定义' },
  ];
  const repeatReminderList = [
    { id: 1, fullName: '不重复' },
    { id: 2, fullName: '每天重复' },
    { id: 3, fullName: '每周重复' },
    { id: 4, fullName: '每月重复' },
    { id: 5, fullName: '每年重复' },
  ];
  const [registerForm, { setFieldsValue, getFieldsValue, clearValidate, resetFields, validate, updateSchema }] = useForm({
    labelWidth: 100,
    schemas: [
      {
        field: 'category',
        label: '类型',
        component: 'Select',
        componentProps: { placeholder: '请选择', allowClear: false },
        rules: [{ required: true, trigger: 'change', message: '必填' }],
      },
      {
        field: 'urgent',
        label: '紧急程度',
        component: 'Select',
        defaultValue: '1',
        componentProps: { placeholder: '请选择', options: urgentList, allowClear: false },
      },
      {
        field: 'title',
        label: '标题',
        component: 'Input',
        componentProps: { placeholder: '请输入' },
        rules: [{ required: true, trigger: 'blur', message: '必填' }],
      },
      {
        field: 'content',
        label: '内容',
        component: 'Textarea',
        componentProps: { placeholder: '请输入', rows: 3 },
      },
      {
        field: 'files',
        label: '附件',
        component: 'UploadFile',
      },
      {
        field: 'allDay',
        label: '全天',
        component: 'Switch',
        defaultValue: 0,
        componentProps: { onChange: onAllDayChange },
      },
      {
        field: 'startDay',
        label: '开始时间',
        component: 'DatePicker',
        componentProps: { placeholder: '请选择', format: 'YYYY-MM-DD' },
        colProps: { span: 16 },
        rules: [{ required: true, trigger: 'change', message: '必填' }],
      },
      {
        ifShow: ({ values }) => !values.allDay,
        field: 'startTime',
        label: '',
        component: 'TimePicker',
        componentProps: { placeholder: '请选择', format: 'HH:mm', minuteStep: 5 },
        colProps: { span: 8 },
      },
      {
        ifShow: ({ values }) => values.duration !== -1 && !values.allDay,
        field: 'duration',
        label: '时长',
        component: 'Select',
        componentProps: { placeholder: '请选择', options: durationList, allowClear: false, onChange: onDurationChange },
        rules: [{ required: true, trigger: 'change', message: '必填', type: 'number' }],
      },
      {
        ifShow: ({ values }) => values.duration === -1 || !!values.allDay,
        field: 'endDay',
        label: '结束时间',
        component: 'DatePicker',
        componentProps: { placeholder: '请选择', format: 'YYYY-MM-DD' },
        colProps: { span: 16 },
        rules: [{ required: true, trigger: 'change', validator: validateEndDay }],
      },
      {
        ifShow: ({ values }) => values.duration == -1 && !values.allDay,
        field: 'endTime',
        label: '',
        component: 'TimePicker',
        componentProps: { placeholder: '请选择', format: 'HH:mm', minuteStep: 5 },
        colProps: { span: 8 },
      },
      {
        field: 'creatorUserId',
        label: '创建人',
        component: 'UserSelect',
        componentProps: { placeholder: '请选择', disabled: true },
      },
      {
        field: 'toUserIds',
        label: '参与人',
        component: 'UserSelect',
        componentProps: { placeholder: '请选择', multiple: true },
      },
      {
        field: 'color',
        label: '标签颜色',
        component: 'ColorPicker',
        defaultValue: '#FFFFFF',
        componentProps: { predefine: ['#188ae2', '#35b8e0', '#26bf8c', '#f9c851', '#ff5b5b', '#5b69bc', '#ff8acc', '#3b3e47', '#282828'] },
      },
      {
        field: 'reminderTime',
        label: '提醒时间',
        component: 'Select',
        defaultValue: -2,
        componentProps: { placeholder: '请选择', options: reminderTimeList, allowClear: false },
      },
      {
        ifShow: ({ values }) => values.reminderTime !== -2,
        field: 'reminderType',
        label: '提醒方式',
        component: 'Select',
        defaultValue: 1,
        componentProps: { placeholder: '请选择', options: remindList, allowClear: false },
        rules: [{ required: true, trigger: 'change', message: '必填', type: 'number' }],
      },
      {
        ifShow: ({ values }) => values.reminderTime !== -2 && values.reminderType == 2,
        field: 'send',
        label: '发送配置',
        component: 'Input',
        slot: 'send',
        rules: [{ required: true, trigger: 'blur', message: '必填' }],
      },
      {
        field: 'repetition',
        label: '重复提醒',
        component: 'Select',
        defaultValue: 1,
        componentProps: { placeholder: '请选择', allowClear: false, options: repeatReminderList, onChange: onRepetitionChange },
      },
      {
        ifShow: ({ values }) => values.repetition !== 1,
        field: 'repeatTime',
        label: '结束重复',
        component: 'DatePicker',
        componentProps: { placeholder: '请选择', format: 'YYYY-MM-DD' },
        rules: [{ required: true, trigger: 'change', message: '必填' }],
      },
    ],
  });

  const getTitle = computed(() => (!state.dataForm.id ? t('common.addText') : t('common.editText')));
  const getUserInfo = computed(() => userStore.getUserInfo || {});

  function init(data) {
    resetFields();
    state.repetitionState = false;
    state.dataForm.id = data.id || '';
    state.dataForm.send = '';
    state.dataForm.sendName = '';
    initData();
    if (state.dataForm.id) {
      changeLoading(true);
      getScheduleInfo(state.dataForm.id)
        .then(res => {
          state.dataForm = res.data;
          state.dataForm.files = res.data.files ? JSON.parse(res.data.files) : [];
          const options = state.dataForm.allDay ? reminderTimeList_ : reminderTimeList;
          updateSchema([{ field: 'reminderTime', componentProps: { options } }]);
          setFieldsValue(state.dataForm);
          if (state.dataForm.repetition !== 1) state.repetitionState = true;
          changeLoading(false);
        })
        .catch(() => {
          changeLoading(false);
        });
    } else {
      let time = dayjs().format('HH');
      setFieldsValue({
        duration: data.duration || 60,
        creatorUserId: unref(getUserInfo).userId,
        toUserIds: [],
        startDay: data.startTime,
        endDay: data.startTime,
        startTime: Number(time) + 1 < 10 ? '0' + (Number(time) + 1) + ':00' : Number(time) + 1 + ':00',
        endTime: Number(time) + 2 < 10 ? '0' + (Number(time) + 2) + ':00' : Number(time) + 2 + ':00',
      });
    }
  }
  async function initData() {
    const list = (await baseStore.getDictionaryData('scheduleType')) as any[];
    updateSchema([{ field: 'category', componentProps: { options: list || [] } }]);
    if (list?.length && !state.dataForm.id) setFieldsValue({ category: list[0].id });
  }
  function onDurationChange() {
    state.dataForm = { ...state.dataForm, ...getFieldsValue() };
    let arr = state.dataForm.startTime.split(':');
    let time = Number(arr[0]) + 1;
    if (Number(time) == 24) time = 0;
    state.dataForm.endDay = state.dataForm.startDay;
    state.dataForm.endTime = time < 10 ? '0' + time + ':' + arr[1] : time + ':' + arr[1];
    setFieldsValue({
      endDay: state.dataForm.endDay,
      endTime: state.dataForm.endTime,
    });
  }
  function onAllDayChange(val) {
    if (val) {
      const values = getFieldsValue();
      setFieldsValue({ endDay: values.startDay });
    }
    setFieldsValue({ reminderTime: '' });
    const options = val ? reminderTimeList_ : reminderTimeList;
    updateSchema([{ field: 'reminderTime', componentProps: { options } }]);
    nextTick(() => clearValidate('duration'));
  }
  function onMsgChange(id, item) {
    if (!id) {
      state.dataForm.send = '';
      state.dataForm.sendName = '';
    } else {
      if (state.dataForm.send === id) return;
      state.dataForm.send = id;
      state.dataForm.sendName = item.fullName;
    }
    setFieldsValue({
      send: state.dataForm.send,
      sendName: state.dataForm.sendName,
    });
  }
  function handleDel() {
    state.checked = 1;
    if (state.repetitionState) {
      state.btnLoading = false;
      state.isEdit = false;
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
    const values = getFieldsValue();
    if (!state.checked && values.repetition != 1) return createMessage.warning('请选择日程');
    delSchedule(state.dataForm.id, values.repetition != 1 ? state.checked : 3).then(res => {
      createMessage.success(res.msg);
      state.visible = false;
      closeModal();
      emit('reload');
    });
  }
  async function handleSubmit(type?) {
    if (type == 1 && !state.checked) return createMessage.warning('请选择日程');
    const values = await validate();
    if (!values) return;
    if (values.allDay == 0) {
      if (!values.startTime) return createMessage.warning('开始时间不能为空');
      if (!values.endTime && values.duration == -1) return createMessage.warning('结束时间不能为空');
    }
    if (values.duration != -1 && values.allDay == 0 && values.startDay == values.endDay) {
      if (values.endTime && values.duration == -1) return createMessage.warning('结束时间不能为空');
    }
    if (values.repetition != 1 && values.startDay > values.repeatTime) return createMessage.warning('结束重复必须晚于开始时间');
    const formMethod = state.dataForm.id ? updateSchedule : createSchedule;
    values.files = JSON.stringify(values.files);
    const query = { ...values, id: state.dataForm.id };
    if (state.dataForm.id && state.repetitionState) {
      if (!state.visible) {
        state.checked = 1;
        state.btnLoading = false;
        state.isEdit = true;
        state.visible = true;
      } else {
        state.btnLoading = true;
        formMethod(query, state.checked)
          .then(res => {
            createMessage.success(res.msg);
            state.visible = false;
            state.btnLoading = false;
            closeModal();
            emit('reload');
          })
          .catch(() => {
            state.btnLoading = false;
          });
      }
    } else {
      state.btnLoading = true;
      changeOkLoading(true);
      formMethod(values, 3)
        .then(res => {
          createMessage.success(res.msg);
          state.visible = false;
          state.btnLoading = false;
          changeOkLoading(false);
          closeModal();
          emit('reload');
        })
        .catch(() => {
          state.btnLoading = false;
          changeOkLoading(false);
        });
    }
  }
  function onRepetitionChange(val) {
    if (val === 1) return;
    let time = new Date();
    time.setFullYear(time.getFullYear() + 1);
    setFieldsValue({ repeatTime: time.getTime() });
  }
</script>
