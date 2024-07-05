<template>
  <div class="flow-form">
    <div class="flow-com-title">
      <h1>请假申请</h1>
      <span class="number">流程编码：{{ dataForm.billNo }}</span>
    </div>
    <a-form :colon="false" :labelCol="{ style: { width: '100px' } }" :model="dataForm" :rules="dataRule" ref="formRef" :disabled="config.disabled">
      <a-row>
        <a-col :span="12" v-if="judgeShow('flowTitle')">
          <a-form-item label="流程标题" name="flowTitle">
            <a-input v-model:value="dataForm.flowTitle" placeholder="流程标题" :disabled="judgeWrite('flowTitle')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('applyUser')">
          <a-form-item label="申请人员" name="applyUser">
            <a-input v-model:value="dataForm.applyUser" placeholder="申请人员" readonly :disabled="judgeWrite('applyUser')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('applyDate')">
          <a-form-item label="申请日期" name="applyDate">
            <jnpf-date-picker v-model:value="dataForm.applyDate" placeholder="申请日期" disabled />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('applyDept')">
          <a-form-item label="申请部门" name="applyDept">
            <a-input v-model:value="dataForm.applyDept" placeholder="申请部门" readonly :disabled="judgeWrite('applyDept')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('applyPost')">
          <a-form-item label="申请职位" name="applyPost">
            <a-input v-model:value="dataForm.applyPost" placeholder="申请职位" readonly :disabled="judgeWrite('applyPost')" />
          </a-form-item>
        </a-col>
        <a-col :span="24" v-if="judgeShow('leaveType')">
          <a-form-item label="请假类别" name="leaveType">
            <a-radio-group v-model:value="dataForm.leaveType" :disabled="judgeWrite('leaveType')">
              <a-radio :value="item" v-for="item in leaveTypeOptions" :key="item">{{ item }}</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="24" v-if="judgeShow('leaveReason')">
          <a-form-item label="请假原因" name="leaveReason">
            <jnpf-textarea v-model:value="dataForm.leaveReason" placeholder="请假原因" :disabled="judgeWrite('leaveReason')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('leaveStartTime')">
          <a-form-item label="起始时间" name="leaveStartTime">
            <jnpf-date-picker
              v-model:value="dataForm.leaveStartTime"
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择日期"
              :disabled="judgeWrite('leaveStartTime')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('leaveEndTime')">
          <a-form-item label="结束时间" name="leaveEndTime">
            <jnpf-date-picker v-model:value="dataForm.leaveEndTime" format="YYYY-MM-DD HH:mm:ss" placeholder="选择日期" :disabled="judgeWrite('leaveEndTime')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('leaveDayCount')">
          <a-form-item label="请假天数" name="leaveDayCount">
            <a-input-number v-model:value="dataForm.leaveDayCount" :min="0" placeholder="请假天数" addonAfter="天" :disabled="judgeWrite('leaveDayCount')" />
          </a-form-item>
        </a-col>
        <a-col :span="12" v-if="judgeShow('leaveHour')">
          <a-form-item label="请假小时" name="leaveHour">
            <a-input-number v-model:value="dataForm.leaveHour" :min="0" placeholder="请假小时" addonAfter="小时" :disabled="judgeWrite('leaveHour')" />
          </a-form-item>
        </a-col>
        <a-col :span="24" v-if="judgeShow('fileJson')">
          <a-form-item label="相关附件" name="fileJson">
            <jnpf-upload-file v-model:value="fileList" type="workFlow" :disabled="judgeWrite('fileJson')" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, toRefs, onMounted, ref, unref } from 'vue';
  import { useFlowForm } from '/@/views/workFlow/workFlowForm/hooks/useFlowForm';
  import formValidate from '/@/utils/formValidate';
  import type { FormInstance } from 'ant-design-vue';

  interface State {
    dataForm: any;
    dataRule: any;
    billEnCode: string;
    fileList: any[];
  }

  defineOptions({ name: 'LeaveApply' });
  const props = defineProps(['config']);
  const emit = defineEmits(['setPageLoad', 'eventReceiver']);

  const leaveTypeOptions = ['事假', '病假', '婚假', '产假', '丧假', '年假', '调休', '其他'];
  const formRef = ref<FormInstance>();
  const checkStartTime = async (_rule, value) => {
    if (!state.dataForm.leaveEndTime) return Promise.resolve();
    if (state.dataForm.leaveEndTime < value) return Promise.reject('起始日期应该小于结束日期');
    formRef.value?.validateFields('leaveEndTime');
    return Promise.resolve();
  };
  const checkEndTime = async (_rule, value) => {
    if (!state.dataForm.leaveStartTime) return Promise.resolve();
    if (state.dataForm.leaveStartTime > value) return Promise.reject('结束日期应该大于起始日期');
    return Promise.resolve();
  };
  const state = reactive<State>({
    dataForm: {
      flowId: '',
      id: '',
      billNo: '',
      flowTitle: '',
      flowUrgent: 1,
      applyUser: '',
      applyDate: 0,
      applyDept: '',
      applyPost: '',
      leaveType: '事假',
      leaveReason: '',
      leaveStartTime: undefined,
      leaveEndTime: undefined,
      leaveDayCount: '',
      leaveHour: '',
      fileJson: '',
    },
    dataRule: {
      flowTitle: [{ required: true, message: '流程标题不能为空', trigger: 'blur' }],
      leaveType: [{ required: true, message: '请假类别不能为空', trigger: 'change' }],
      leaveReason: [{ required: true, message: '请假原因不能为空', trigger: 'blur' }],
      leaveStartTime: [
        { required: true, message: '起始时间不能为空', trigger: 'change' },
        { validator: checkStartTime, trigger: 'change' },
      ],
      leaveEndTime: [
        { required: true, message: '结束时间不能为空', trigger: 'change' },
        { validator: checkEndTime, trigger: 'change' },
      ],
      leaveDayCount: [
        { required: true, message: '请假天数不能为空', trigger: 'blur' },
        { validator: formValidate('allDate', '请假时间必须是整数和0.5的倍数'), trigger: 'blur' },
      ],
      leaveHour: [
        { required: true, message: '请假小时不能为空', trigger: 'blur' },
        { validator: formValidate('allDate', '请假小时必须是整数和0.5的倍数'), trigger: 'blur' },
      ],
    },
    billEnCode: 'WF_LeaveApplyNo',
    fileList: [],
  });
  const { dataForm, dataRule, fileList } = toRefs(state);
  const { init, getUserInfo, judgeShow, judgeWrite, dataFormSubmit } = useFlowForm({
    config: props.config,
    selfState: state,
    emit,
    formRef,
    selfInit,
  });

  defineExpose({ dataFormSubmit });

  function selfInit() {
    state.dataForm.applyDate = +new Date();
    state.dataForm.flowTitle = unref(getUserInfo).userName + '的请假申请';
    state.dataForm.applyUser = unref(getUserInfo).userName + '/' + unref(getUserInfo).userAccount;
    state.dataForm.applyDept = unref(getUserInfo).organizeName;
    if (unref(getUserInfo).positionIds && unref(getUserInfo).positionIds.length) {
      let list = unref(getUserInfo).positionIds.map(o => o.name);
      state.dataForm.applyPost = list.join(',');
    }
  }

  onMounted(() => {
    init();
  });
</script>
