<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="state.dataForm.id ? t('common.editText') : t('common.addText')" @ok="handleSubmit">
    <a-alert message="新建成功后，前往【系统管理】>【应用菜单】中添加应用门户并授权。" type="warning" show-icon v-if="!dataForm.id" class="!mb-20px" />
    <BasicForm @register="registerForm" />
    <template #appendFooter>
      <a-button type="primary" :loading="btnLoading" @click="handleSubmit(1)" v-if="dataForm.type === 0"> 确定并设计</a-button>
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { toRefs, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import formValidate from '/@/utils/formValidate';
  import { getInfo, updatePortal, createPortal } from '/@/api/onlineDev/portal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { isUrl } from '/@/utils/is';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const validateUrl = (_rule, value) => {
    if (value && getFieldsValue()?.linkType == 1 && !isUrl(value)) return Promise.reject('请输入正确的链接地址');
    return Promise.resolve();
  };

  interface State {
    dataForm: any;
    btnLoading: boolean;
  }

  const state = reactive<State>({
    dataForm: {
      type: 0,
    },
    btnLoading: false,
  });
  const { dataForm, btnLoading } = toRefs(state);
  const { createMessage } = useMessage();
  const emit = defineEmits(['register', 'reload', 'design']);
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);
  const [registerForm, { setFieldsValue, getFieldsValue, resetFields, validate, clearValidate, updateSchema }] = useForm({
    labelWidth: 100,
    schemas: [
      {
        field: 'fullName',
        label: '名称',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 100 },
        rules: [{ required: true, trigger: 'blur', message: '必填' }],
      },
      {
        field: 'enCode',
        label: '编码',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 50 },
        rules: [
          { required: true, trigger: 'blur', message: '必填' },
          { validator: formValidate('enCode'), trigger: 'blur' },
        ],
      },
      {
        field: 'category',
        label: '分类',
        component: 'Select',
        componentProps: { placeholder: '请选择', showSearch: true },
        rules: [{ required: true, trigger: 'change', message: '必填' }],
      },
      {
        field: 'type',
        label: '类型',
        defaultValue: 0,
        component: 'Radio',
        componentProps: {
          options: [
            { id: 0, fullName: '门户设计' },
            { id: 1, fullName: '配置路径' },
          ],
          optionType: 'button',
          buttonStyle: 'solid',
          onChange: onTypeChange,
        },
        rules: [{ required: true, trigger: 'change', message: '必填', type: 'number' }],
      },
      {
        ifShow: ({ values }) => values.type === 1,
        field: 'linkType',
        label: '链接类型',
        defaultValue: 0,
        component: 'Radio',
        componentProps: {
          options: [
            { id: 0, fullName: '页面' },
            { id: 1, fullName: '外链' },
          ],
          optionType: 'button',
          buttonStyle: 'solid',
          onChange: onLinkTypeChange,
        },
        rules: [{ required: true, trigger: 'change', message: '必填', type: 'number' }],
      },
      {
        ifShow: ({ values }) => values.type === 1,
        field: 'customUrl',
        label: '链接地址',
        component: 'Input',
        componentProps: { placeholder: '请输入' },
        helpMessage: '链接类型选择页面，只支持PC显示，不支持APP显示。',
        rules: [
          { required: true, trigger: 'blur', message: '必填' },
          { validator: validateUrl, trigger: 'blur' },
        ],
      },
      {
        ifShow: ({ values }) => values.type === 0,
        field: 'enabledLock',
        label: '锁定',
        component: 'Switch',
        defaultValue: 1,
        helpMessage: '启用：不允许拖拽移动控件；禁用：允许用户在PC门户上拖拽大小及移动控件。',
      },
      {
        field: 'sortCode',
        label: '排序',
        defaultValue: 0,
        component: 'InputNumber',
        componentProps: { min: 0, max: 999999 },
      },
      {
        field: 'description',
        label: '说明 ',
        component: 'Textarea',
        componentProps: { placeholder: '请输入' },
      },
    ],
  });

  function init(data) {
    resetFields();
    state.dataForm.id = data.id || '';
    updateSchema([{ field: 'category', componentProps: { options: data.categoryList || [] } }]);
    state.dataForm.type = 0;
    if (state.dataForm.id) {
      changeLoading(true);
      getInfo(state.dataForm.id)
        .then(res => {
          state.dataForm = res.data;
          onLinkTypeChange(state.dataForm.linkType);
          setFieldsValue(state.dataForm);
          changeLoading(false);
        })
        .catch(() => {
          changeLoading(false);
        });
    }
  }
  function onLinkTypeChange(val) {
    updateSchema([
      { field: 'customUrl', componentProps: { addonBefore: val === 0 ? '@/views/' : '' }, helpMessage: val === 1 ? '地址以http://或https://为开头' : '' },
    ]);
    setFieldsValue({ customUrl: '' });
    clearValidate('customUrl');
  }
  function onTypeChange(val) {
    state.dataForm.type = val;
    onLinkTypeChange(getFieldsValue()?.linkType);
  }
  async function handleSubmit(type?) {
    const values = await validate();
    if (!values) return;
    type === 1 ? (state.btnLoading = true) : changeOkLoading(true);
    const query = {
      ...values,
      id: state.dataForm.id,
    };
    const formMethod = state.dataForm.id ? updatePortal : createPortal;
    formMethod(query)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        state.btnLoading = false;
        closeModal();
        emit('reload');
        if (!state.dataForm.id) state.dataForm.id = res.data;
        if (type == 1) emit('design', { ...values, id: state.dataForm.id });
      })
      .catch(() => {
        changeOkLoading(false);
        state.btnLoading = false;
      });
  }
</script>
