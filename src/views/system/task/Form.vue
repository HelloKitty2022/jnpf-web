<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="getTitle" showOkBtn @ok="handleSubmit">
    <a-row class="mt-20px">
      <a-col span="14" offset="5">
        <BasicForm @register="registerForm">
          <template #taskCron="{ model, field }">
            <JnpfCron v-model:value="model[field]" @change="onCronChange" />
          </template>
          <template #taskType="{ model, field }">
            <a-radio-group v-model:value="model[field]" @change="onExecuteTypeChange">
              <a-radio value="1">数据接口</a-radio>
              <a-radio value="3">本地任务<BasicHelp text="获取在程序中事先写好的本地方法" /></a-radio>
            </a-radio-group>
          </template>
          <template #interfaceId="{ model, field }">
            <interface-modal :value="model[field]" :title="interfaceName" :sourceType="3" @change="onInterfaceChange" />
          </template>
          <template #parameter="{ model, field }">
            <a-form-item-rest>
              <a-table :data-source="model[field]" :columns="columns" size="small" :pagination="false">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'field'">
                    <span class="required-sign">{{ record.required ? '*' : '' }}</span>
                    {{ record.field }}{{ record.fieldName ? '(' + record.fieldName + ')' : '' }}
                  </template>
                  <template v-if="column.key === 'sourceType'">
                    <jnpf-select
                      v-model:value="record.sourceType"
                      :options="getSourceTypeOptions(record.required)"
                      class="!w-100px"
                      :disabled="record.disabled" />
                  </template>
                  <template v-if="column.key === 'relationField'">
                    <template v-if="record.sourceType == 2">
                      <jnpf-input-number
                        v-model:value="record.relationField"
                        placeholder="请输入"
                        allowClear
                        v-if="record.dataType === 'int' || record.dataType === 'decimal'" />
                      <jnpf-date-picker
                        class="!w-full"
                        v-model:value="record.relationField"
                        placeholder="请选择"
                        format="yyyy-MM-dd HH:mm:ss"
                        allowClear
                        v-else-if="record.dataType === 'datetime'" />
                      <a-input v-model:value="record.relationField" placeholder="请输入" allowClear v-else />
                    </template>
                  </template>
                </template>
              </a-table>
            </a-form-item-rest>
          </template>
        </BasicForm>
      </a-col>
    </a-row>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { ref, unref, computed, reactive, toRefs } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { getInfo, create, update, getTaskMethodsList } from '/@/api/system/task';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { InterfaceModal } from '/@/components/CommonModal';
  import formValidate from '/@/utils/formValidate';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    taskOptions: any[];
    interfaceName: string;
  }

  defineOptions({ name: 'system-task' });
  const emit = defineEmits(['register', 'reload']);
  const id = ref('');
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const getTitle = computed(() => (!unref(id) ? t('common.addText') : t('common.editText')));
  const checkStartTime = (_rule, value) => {
    if (!getFieldsValue().executeContent?.endTime || !value) return Promise.resolve();
    if (getFieldsValue().executeContent?.endTime < value) return Promise.reject('任务结束时间不能早于任务开始时间');
    validate(['executeContent.endTime']);
    return Promise.resolve();
  };
  const checkEndTime = (_rule, value) => {
    if (!getFieldsValue().executeContent?.startTime || !value) return Promise.resolve();
    if (getFieldsValue().executeContent?.startTime > value) return Promise.reject('任务结束时间不能早于任务开始时间');
    return Promise.resolve();
  };
  const state = reactive<State>({
    taskOptions: [],
    interfaceName: '',
  });
  const { interfaceName } = toRefs(state);
  const schemas: FormSchema[] = [
    {
      field: 'fullName',
      label: '任务名称',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'enCode',
      label: '任务编码',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [
        { required: true, trigger: 'blur', message: '必填' },
        { validator: formValidate('enCode', '只能输入英文、数字和小数点且小数点不能放在首尾'), trigger: 'blur' },
      ],
    },
    {
      field: 'executeContent.cron',
      label: 'Cron表达式',
      component: 'Input',
      slot: 'taskCron',
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'executeContent.startTime',
      label: '任务开始时间',
      component: 'DatePicker',
      componentProps: { format: 'YYYY-MM-DD HH:mm:ss' },
      rules: [
        { required: true, trigger: 'change', message: '必填' },
        { validator: checkStartTime, trigger: 'change' },
      ],
    },
    {
      field: 'executeContent.endTime',
      label: '任务结束时间',
      component: 'DatePicker',
      componentProps: { format: 'YYYY-MM-DD HH:mm:ss' },
      helpMessage: '未选结束时间即为永久期限',
      rules: [{ validator: checkEndTime, trigger: 'change' }],
    },
    {
      field: 'executeType',
      label: '任务类型',
      slot: 'taskType',
      defaultValue: '1',
      component: 'Input',
    },
    {
      ifShow: ({ values }) => values.executeType == 1,
      field: 'executeContent.interfaceId',
      label: '数据接口',
      slot: 'interfaceId',
      component: 'Select',
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      ifShow: ({ values }) => values.executeType == 1 && !!values['executeContent.parameter']?.length,
      field: 'executeContent.parameter',
      label: ' ',
      slot: 'parameter',
      component: 'Select',
    },
    {
      ifShow: ({ values }) => values.executeType == 3,
      field: 'executeContent.localHostTaskId',
      label: '方法选择',
      component: 'Select',
      componentProps: { options: state.taskOptions },
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      field: 'enabledMark',
      label: '任务状态',
      defaultValue: 1,
      component: 'Switch',
    },
    {
      field: 'description',
      label: '任务说明',
      component: 'Textarea',
    },
  ];
  const columns = [
    { title: '序号', width: 50, align: 'center', customRender: ({ index }) => index + 1 },
    { title: '参数名称', dataIndex: 'field', key: 'field', width: 120 },
    { title: '参数来源', dataIndex: 'sourceType', key: 'sourceType', width: 120 },
    { title: '参数值', dataIndex: 'relationField', key: 'relationField' },
  ];
  const [registerForm, { setFieldsValue, validate, clearValidate, resetFields, updateSchema, getFieldsValue }] = useForm({ labelWidth: 120, schemas: schemas });
  const [registerPopup, { closePopup, changeLoading, changeOkLoading }] = usePopupInner(init);

  function init(data) {
    resetFields();
    id.value = data.id;
    changeLoading(true);
    getTaskMethodsList()
      .then(res => {
        state.taskOptions = res.data || [];
        updateSchema([{ field: 'executeContent.localHostTaskId', componentProps: { options: state.taskOptions } }]);
        if (id.value) {
          getInfo(id.value)
            .then(res => {
              const dataForm = res.data;
              dataForm.executeContent = JSON.parse(dataForm.executeContent);
              state.interfaceName = dataForm.executeContent.interfaceName;
              setFieldsValue(dataForm);
              changeLoading(false);
            })
            .catch(() => {
              changeLoading(false);
            });
        } else {
          changeLoading(false);
        }
      })
      .catch(() => {
        changeLoading(false);
      });
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    let executeContent = getFieldsValue().executeContent;
    executeContent.parameter = values['executeContent.parameter'];
    executeContent.interfaceName = state.interfaceName;
    executeContent = JSON.stringify(executeContent);
    let query = { ...getFieldsValue(), executeContent, id: id.value };
    const formMethod = id.value ? update : create;
    formMethod(query)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        closePopup();
        emit('reload');
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
  function onInterfaceChange(val, row) {
    if (getFieldsValue().executeContent?.interfaceId === val) return;
    state.interfaceName = row.fullName;
    setFieldsValue({
      'executeContent.interfaceId': val || '',
      'executeContent.interfaceName': row.fullName || '',
      'executeContent.parameter': row.templateJson.map(o => ({ ...o, sourceType: 2 })) || '',
    });
    clearValidate('executeContent.interfaceId');
  }
  function onExecuteTypeChange() {
    setFieldsValue({
      'executeContent.interfaceId': '',
      'executeContent.interfaceName': '',
      'executeContent.parameter': [],
      'executeContent.localHostTaskId': '',
    });
  }
  function onCronChange() {
    clearValidate('executeContent.cron');
  }
  function getSourceTypeOptions(isRequired) {
    const sourceTypeOptions = [
      { id: 2, fullName: '自定义' },
      { id: 3, fullName: '为空' },
    ];
    return isRequired ? sourceTypeOptions.filter(o => o.id != 3) : sourceTypeOptions;
  }
</script>
