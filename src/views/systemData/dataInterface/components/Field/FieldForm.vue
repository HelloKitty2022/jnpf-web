<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { computed, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { buildBitUUID } from '/@/utils/uuid';
  import { useI18n } from '/@/hooks/web/useI18n';

  const emit = defineEmits(['register', 'reload']);
  const { t } = useI18n();

  const props = defineProps({
    type: { type: Number, default: 0 },
  });

  interface State {
    list: any[];
    type: string;
    dataForm: any;
  }

  const state = reactive<State>({
    list: [],
    type: 'add',
    dataForm: {
      id: '',
      defaultValue: '',
      field: '',
      dataType: '',
      required: 0,
      fieldName: '',
    },
  });
  const checkName = (_rule, value) => {
    let boo = true;
    const regex = /@/g;
    if (regex.test(value)) return Promise.reject('参数名称不能包含@符号');
    for (let i = 0; i < state.list.length; i++) {
      if (value === state.list[i].field && state.dataForm.id !== state.list[i].id) {
        boo = false;
        break;
      }
    }
    if (boo) return Promise.resolve();
    return Promise.reject('参数名称重复');
  };
  const checkDefaultValue = (_rule, value) => {
    let boo = true;
    for (let i = 0; i < state.list.length; i++) {
      if (value === state.list[i].defaultValue && state.dataForm.id !== state.list[i].id) {
        boo = false;
        break;
      }
    }
    if (boo) return Promise.resolve();
    return Promise.reject('映射字段重复');
  };
  const checkField = (_rule, value) => {
    let boo = true;
    for (let i = 0; i < state.list.length; i++) {
      if (value === state.list[i].field && state.dataForm.id !== state.list[i].id) {
        boo = false;
        break;
      }
    }
    if (boo) return Promise.resolve();
    return Promise.reject('字段名称重复');
  };
  const schemas: any[] = [
    {
      field: 'field',
      label: '参数名称',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [
        { required: true, trigger: 'blur', message: '必填' },
        { validator: checkName, trigger: 'blur' },
      ],
    },
    {
      field: 'dataType',
      label: '参数类型',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { fullName: '字符串', id: 'varchar' },
          { fullName: '整型', id: 'int' },
          { fullName: '日期时间', id: 'datetime' },
          { fullName: '浮点', id: 'decimal' },
        ],
        onChange: onDataTypeChange,
      },
      defaultValue: 'varchar',
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      ifShow: ({ values }) => values.dataType == 'varchar',
      field: 'defaultValue',
      label: '默认值',
      defaultValue: '',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
    },
    {
      ifShow: ({ values }) => ['int', 'decimal'].includes(values.dataType),
      field: 'defaultValue',
      label: '默认值',
      defaultValue: '',
      component: 'InputNumber',
      componentProps: { placeholder: '请输入' },
    },
    {
      ifShow: ({ values }) => values.dataType == 'datetime',
      field: 'defaultValue',
      label: '默认值',
      defaultValue: '',
      component: 'DatePicker',
      componentProps: { placeholder: '请选择', format: 'YYYY-MM-DD HH:mm:ss' },
    },
    {
      field: 'required',
      label: '必填',
      defaultValue: 0,
      component: 'Switch',
    },
    {
      field: 'fieldName',
      label: '参数说明',
      defaultValue: '',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
    },
  ];
  const schemas_ = [
    {
      field: 'field',
      label: '字段名称',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [
        { required: true, trigger: 'blur', message: '必填' },
        { validator: checkField, trigger: 'blur' },
      ],
    },
    {
      field: 'defaultValue',
      label: '映射字段',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [
        { required: true, trigger: 'blur', message: '必填' },
        { validator: checkDefaultValue, trigger: 'blur' },
      ],
    },
  ];
  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({ labelWidth: 80, schemas: props.type === 0 ? schemas : schemas_ });
  const [registerModal, { closeModal }] = useModalInner(init);

  const getTitle = computed(() => (state.type === 'add' ? t('common.addText') : t('common.editText')));

  function init(data) {
    resetFields();
    state.list = data.list;
    if (data.item) {
      state.dataForm = data.item;
      state.type = 'edit';
      setFieldsValue(data.item);
    } else {
      state.dataForm.id = buildBitUUID();
      state.type = 'add';
    }
  }
  function onDataTypeChange() {
    setFieldsValue({ defaultValue: '' });
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    emit('reload', state.type, { id: state.dataForm.id, ...values });
    closeModal();
  }
</script>
