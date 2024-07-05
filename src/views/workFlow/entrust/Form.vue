<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm">
      <template #flowId>
        <flow-select v-model:value="state.flowId" popupTitle="委托流程" placeholder="全部流程" @change="onFlowIdChange" />
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { getInfo, create, update } from '/@/api/workFlow/flowDelegate';
  import { unref, computed, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import dayjs, { Dayjs } from 'dayjs';
  import FlowSelect from '../components/FlowSelect.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const emit = defineEmits(['register', 'reload']);
  const typeOptions = [
    { id: '0', fullName: '发起委托' },
    { id: '1', fullName: '审批委托' },
  ];
  const disabledDate = (current: Dayjs) => current && current < dayjs().endOf('day').subtract(1, 'day');
  const checkStartTime = async (_rule, value) => {
    if (!getFieldsValue().endTime) return Promise.resolve();
    if (getFieldsValue().endTime < value) return Promise.reject('开始时间应该小于结束时间');
    validate(['endTime']);
    return Promise.resolve();
  };
  const checkEndTime = async (_rule, value) => {
    if (!getFieldsValue().startTime) return Promise.resolve();
    if (getFieldsValue().startTime > value) return Promise.reject('结束时间应该大于开始时间');
    return Promise.resolve();
  };
  const [registerForm, { setFieldsValue, resetFields, getFieldsValue, validate }] = useForm({
    labelWidth: 90,
    schemas: [
      {
        field: 'toUserId',
        label: '受委托人',
        component: 'UserSelect',
        componentProps: { placeholder: '请选择', onChange: onToUserIdChange },
        rules: [{ required: true, trigger: 'blur', message: '必填' }],
      },
      {
        field: 'type',
        label: '委托类型',
        component: 'Select',
        componentProps: { options: typeOptions },
        rules: [{ required: true, trigger: 'change', message: '必填' }],
      },
      {
        field: 'flowId',
        label: '委托流程',
        helpMessage: '未选择委托流程默认全部流程进行委托',
        component: 'Input',
        slot: 'flowId',
      },
      {
        field: 'startTime',
        label: '开始时间',
        component: 'DatePicker',
        componentProps: { format: 'YYYY-MM-DD HH:mm:ss', disabledDate },
        rules: [
          { required: true, message: '必填', trigger: 'change' },
          { validator: checkStartTime, trigger: 'change' },
        ],
      },
      {
        field: 'endTime',
        label: '结束时间',
        component: 'DatePicker',
        componentProps: { format: 'YYYY-MM-DD HH:mm:ss', disabledDate },
        rules: [
          { required: true, message: '必填', trigger: 'change' },
          { validator: checkEndTime, trigger: 'change' },
        ],
      },
      {
        field: 'description',
        label: '委托说明',
        component: 'Textarea',
        componentProps: { placeholder: '请输入' },
      },
    ],
  });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);
  const state = reactive({
    dataForm: {
      id: '',
      toUserName: '',
      userId: '',
      userName: '',
      flowId: '',
      flowName: '全部流程',
    },
    flowId: [],
  });
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const userStore = useUserStore();

  const getTitle = computed(() => (!state.dataForm.id ? t('common.addText') : t('common.editText')));
  const getUserInfo = computed(() => userStore.getUserInfo || {});

  function init(data) {
    changeLoading(true);
    resetFields();
    state.flowId = [];
    state.dataForm = {
      id: '',
      toUserName: '',
      userId: '',
      userName: '',
      flowId: '',
      flowName: '全部流程',
    };
    state.dataForm.id = data.id;
    state.dataForm.userId = unref(getUserInfo).userId;
    state.dataForm.userName = unref(getUserInfo).userName + '/' + unref(getUserInfo).userAccount;
    if (state.dataForm.id) {
      getInfo(state.dataForm.id).then(res => {
        setFieldsValue(res.data);
        state.dataForm = res.data;
        (state.flowId as string[]) = state.dataForm.flowId ? state.dataForm.flowId.split(',') : [];
        changeLoading(false);
      });
    } else {
      changeLoading(false);
    }
  }
  function onToUserIdChange(id, data) {
    if (!id) return (state.dataForm.toUserName = '');
    state.dataForm.toUserName = data.fullName;
  }
  function onFlowIdChange(ids, data) {
    if (!ids || !ids.length) return (state.dataForm.flowName = '全部流程');
    state.dataForm.flowName = data.map(o => o.fullName + '/' + o.enCode).join();
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    const query = {
      ...values,
      flowId: state.flowId.join(),
      flowName: state.dataForm.flowName,
      userId: state.dataForm.userId,
      userName: state.dataForm.userName,
      toUserName: state.dataForm.toUserName,
    };
    const formMethod = state.dataForm.id ? update : create;
    formMethod(query)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        closeModal();
        emit('reload');
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
</script>
