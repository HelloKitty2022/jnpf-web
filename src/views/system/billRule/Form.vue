<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" showOkBtn @ok="handleSubmit" destroyOnClose>
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, unref, computed, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { getBillRuleInfo, createBillRule, updateBillRule } from '/@/api/system/billRule';
  import { useMessage } from '/@/hooks/web/useMessage';
  import dayjs from 'dayjs';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    dataForm: any;
  }

  const id = ref('');
  const state = reactive<State>({
    dataForm: {},
  });
  const validateZero = (_rule, value) => {
    if (value) {
      let str = value && value.replace(/0/g, '');
      if (!str) return Promise.reject(`起始值不能为${value}`);
    }
    return Promise.resolve();
  };
  const schemas: FormSchema[] = [
    {
      field: 'fullName',
      label: '名称',
      component: 'Input',
      componentProps: { placeholder: '请输入', maxlength: 50 },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'enCode',
      label: '编码',
      component: 'Input',
      componentProps: { placeholder: '请输入', maxlength: 50 },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'category',
      label: '分类',
      component: 'Select',
      componentProps: { placeholder: '请选择' },
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      field: 'prefix',
      label: '前辍',
      component: 'Input',
      componentProps: { placeholder: '请输入', onChange: handlePrefixChange },
    },
    {
      field: 'type',
      label: '方式',
      component: 'Select',
      defaultValue: 1,
      componentProps: {
        placeholder: '请选择',
        allowClear: false,
        options: [
          { fullName: '时间格式', id: 1 },
          { fullName: '随机数编号', id: 2 },
          { fullName: 'UUID', id: 3 },
        ],
      },
    },
    {
      ifShow: ({ values }) => values.type == 1,
      field: 'dateFormat',
      label: ' ',
      component: 'Select',
      defaultValue: 'YYYY',
      componentProps: {
        placeholder: '请选择',
        allowClear: false,
        options: [
          { fullName: 'YYYY', id: 'YYYY' },
          { fullName: 'YYYYMM', id: 'YYYYMM' },
          { fullName: 'YYYYMMDD', id: 'YYYYMMDD' },
          { fullName: 'YYYYMMDDHH', id: 'YYYYMMDDHH' },
          { fullName: 'YYYYMMDDHHmm', id: 'YYYYMMDDHHmm' },
          { fullName: 'YYYYMMDDHHmmss', id: 'YYYYMMDDHHmmss' },
          { fullName: 'YYYYMMDDHHmmssSSS', id: 'YYYYMMDDHHmmssSSS' },
          { fullName: 'no', id: 'no' },
        ],
        onChange: handleDateFormatChange,
      },
    },
    {
      ifShow: ({ values }) => values.type == 1,
      field: 'digit',
      label: '位数',
      component: 'InputNumber',
      componentProps: { placeholder: '请输入', min: 1, max: 9, precision: 0, onChange: handleDigitChange },
      rules: [{ required: true, trigger: 'blur', message: '必填', type: 'number' }],
    },
    {
      ifShow: ({ values }) => values.type == 2,
      field: 'randomDigit',
      label: '位数',
      defaultValue: 16,
      component: 'Select',
      componentProps: {
        allowClear: false,
        options: [
          { fullName: '16', id: 16 },
          { fullName: '32', id: 32 },
        ],
      },
      rules: [{ trigger: 'blur', message: '必填', type: 'number' }],
    },
    {
      ifShow: ({ values }) => values.type == 1,
      field: 'startNumber',
      label: '起始值',
      component: 'Input',
      componentProps: { placeholder: '不允许输入0或特殊字符', onChange: handleStartNumberChange },
      rules: [
        { required: true, trigger: 'blur', message: '必填' },
        { pattern: /^[0-9]*$/, message: '只能输入数字', trigger: 'blur' },
        { validator: validateZero },
      ],
    },
    {
      ifShow: ({ values }) => values.type == 2,
      field: 'randomType',
      label: '类型',
      component: 'Select',
      defaultValue: 1,
      componentProps: {
        allowClear: false,
        options: [
          { fullName: '纯数字', id: 1 },
          { fullName: '字母+数字', id: 2 },
        ],
      },
    },
    {
      field: 'suffix',
      label: '后辍',
      component: 'Input',
      componentProps: { placeholder: '请输入', onChange: handleSuffixChange },
    },
    {
      ifShow: ({ values }) => values.type == 1,
      field: 'example',
      label: '范例',
      component: 'Input',
      componentProps: { disabled: true },
    },
    {
      field: 'sortCode',
      label: '排序',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: { min: '0', max: '999999', placeholder: '请输入' },
    },
    {
      field: 'enabledMark',
      label: '状态',
      component: 'Switch',
      defaultValue: 1,
    },
    {
      field: 'description',
      label: '说明',
      component: 'Textarea',
      componentProps: { rows: 3, placeholder: '请输入' },
    },
  ];
  const getTitle = computed(() => (!unref(id) ? t('common.addText') : t('common.editText')));
  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerForm, { setFieldsValue, validate, resetFields, updateSchema }] = useForm({ labelWidth: 80, schemas: schemas });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);

  function init(data) {
    resetFields();
    state.dataForm.dateFormat = 'YYYY';
    state.dataForm.prefix = '';
    state.dataForm.suffix = '';
    state.dataForm.digit = '';
    id.value = data.id;
    if (data.categoryList) updateSchema([{ field: 'category', componentProps: { options: data.categoryList } }]);
    if (id.value) {
      changeLoading(true);
      getBillRuleInfo(id.value).then(res => {
        const data = res.data;
        state.dataForm = data;
        setFieldsValue(data);
        changeLoading(false);
      });
    } else {
      handleChange();
    }
  }
  function handlePrefixChange(e) {
    state.dataForm.prefix = e;
    handleChange();
  }
  function handleSuffixChange(e) {
    state.dataForm.suffix = e;
    handleChange();
  }
  function handleDateFormatChange(e) {
    state.dataForm.dateFormat = e;
    handleChange();
  }
  function handleDigitChange(e) {
    state.dataForm.digit = e;
    handleChange();
  }
  function handleStartNumberChange(e) {
    state.dataForm.startNumber = e;
    handleChange();
  }
  function handleChange() {
    // 流水前缀
    const prefix = state.dataForm.prefix || '';
    // 流水后缀
    const suffix = state.dataForm.suffix || '';
    // 流水日期格式
    const dateFormat = state.dataForm.dateFormat || '';
    let dateVal = '';
    if (dateFormat && dateFormat !== 'no') dateVal = dayjs().format(dateFormat);
    // 流水位数
    let digitVal = state.dataForm.digit || '';
    if (digitVal != '') digitVal = Array(digitVal > 0 ? digitVal - ('' + 0).length + 1 : 0).join('0') + 0;
    // 流水起始
    const startNumber = state.dataForm.startNumber || '';
    let startNumberVal = '';
    if (startNumber != '') {
      startNumberVal = digitVal + startNumber;
      digitVal = startNumberVal.substring(startNumberVal.length - digitVal.length, startNumberVal.length);
      state.dataForm.startNumber = digitVal;
      setFieldsValue({ startNumber: digitVal });
    }
    // 流水范例
    const example = prefix + dateVal + digitVal + suffix;
    setFieldsValue({ example: example });
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    const query = {
      ...values,
      id: id.value,
    };
    const formMethod = id.value ? updateBillRule : createBillRule;
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
