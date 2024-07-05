<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" showOkBtn @ok="handleSubmit" destroyOnClose>
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getTaskInfo, getTaskSelector, createTask, updateTask } from '/@/api/extend/projectGantt';
  import { getUserInfoList } from '/@/api/permission/user';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    dataForm: any;
  }

  const state = reactive<State>({
    dataForm: {},
  });
  const { t } = useI18n();
  const checkStartTime = async (_rule, value) => {
    if (!getFieldsValue().endTime) return Promise.resolve();
    if (getFieldsValue().endTime < value) return Promise.reject('开始时间应该小于结束时间');
    validate(['endTime']);
    return Promise.resolve();
  };
  const checkEndTime = (_rule, value) => {
    if (!getFieldsValue().startTime || !value) return Promise.resolve();
    if (getFieldsValue().startTime > value) return Promise.reject('结束日期应该大于开始日期');
    return Promise.resolve();
  };
  const schemas: FormSchema[] = [
    {
      field: 'parentId',
      label: '上级任务',
      component: 'TreeSelect',
      componentProps: { placeholder: '选择上级任务' },
      rules: [{ required: true, trigger: 'blur', message: '上级任务不能为空' }],
    },
    {
      field: 'fullName',
      label: '任务名称',
      component: 'Input',
      componentProps: { placeholder: '任务名称', maxlength: 50 },
      rules: [{ required: true, trigger: 'blur', message: '任务名称不能为空' }],
    },
    {
      field: 'timeLimit',
      label: '项目工期',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: { placeholder: '项目工期', step: 1, min: 0, 'addon-after': '天' },
      rules: [{ required: true, trigger: 'blur', message: '项目工期不能为空' }],
    },
    {
      field: 'startTime',
      label: '开始日期',
      component: 'DatePicker',
      componentProps: { placeholder: '选择日期' },
      rules: [
        { required: true, trigger: 'blur', message: '开始日期不能为空' },
        { validator: checkStartTime, trigger: 'change' },
      ],
    },
    {
      field: 'endTime',
      label: '结束日期',
      component: 'DatePicker',
      componentProps: { placeholder: '选择日期' },
      rules: [
        { required: true, trigger: 'blur', message: '必填' },
        { validator: checkEndTime, trigger: 'change' },
      ],
    },
    {
      field: 'managerIds',
      label: '参与人员',
      component: 'Select',
      componentProps: { placeholder: '请选择', multiple: true },
      rules: [{ required: true, trigger: 'blur', message: '必填', type: 'array' }],
    },
    {
      field: 'schedule',
      label: '完成进度',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: { placeholder: '请输入', step: 0.1, min: 0, max: 100, 'addon-after': '%' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'signColor',
      label: '标记颜色',
      component: 'ColorPicker',
      defaultValue: '#188ae2',
      componentProps: { predefine: ['#188ae2', '#35b8e0', '#26bf8c', '#f9c851', '#ff5b5b', '#5b69bc', '#ff8acc', '#3b3e47', '#282828'] },
    },
    {
      field: 'description',
      label: '项目描述',
      component: 'Textarea',
      componentProps: { placeholder: '请输入', rows: 3 },
    },
  ];
  const getTitle = computed(() => (!state.dataForm.id ? t('common.addText') : t('common.editText')));
  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const [registerForm, { setFieldsValue, getFieldsValue, validate, resetFields, updateSchema }] = useForm({ labelWidth: 80, schemas: schemas });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);

  async function init(data) {
    resetFields();
    state.dataForm.id = data.id;
    state.dataForm.projectId = data.projectId;
    let res = await getTaskSelector(data.projectId, data.id || 0);
    updateSchema({ field: 'parentId', componentProps: { options: res.data?.list || [] }, defaultValue: data.projectId });
    gerUsersInfo(data.managerIds);
    if (state.dataForm.id) {
      changeLoading(true);
      getTaskInfo(state.dataForm.id).then(res => {
        let data = res.data;
        data.schedule = data.schedule ? Number(data.schedule) : 0;
        data.timeLimit = data.timeLimit ? Number(data.timeLimit) : 0;
        data.managerIds = data.managerIds ? data.managerIds.split(',') : [];
        state.dataForm = data;
        setFieldsValue(data);
        changeLoading(false);
      });
    }
  }
  async function gerUsersInfo(value) {
    if (!value) return;
    let ids = value.split(',');
    let res = await getUserInfoList(ids);
    if (!res) return;
    updateSchema({ field: 'managerIds', componentProps: { options: res.data?.list || [] } });
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    const query = {
      ...values,
      managerIds: values.managerIds.join(','),
      projectId: state.dataForm.projectId,
      id: state.dataForm.id,
    };
    const formMethod = state.dataForm.id ? updateTask : createTask;
    formMethod(query)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        closeModal();
        setTimeout(() => emit('reload'), 200);
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
</script>
