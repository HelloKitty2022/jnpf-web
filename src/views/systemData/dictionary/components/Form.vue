<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import {
    getDictionaryTypeSelector,
    getDictionaryTypeInfo as getInfo,
    createDictionaryType as create,
    updateDictionaryType as update,
  } from '/@/api/systemData/dictionary';
  import { ref, unref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useBaseStore } from '/@/store/modules/base';
  import formValidate from '/@/utils/formValidate';
  import { useI18n } from '/@/hooks/web/useI18n';

  const emit = defineEmits(['register', 'reload']);
  const [registerForm, { setFieldsValue, resetFields, validate, updateSchema }] = useForm({
    labelWidth: 80,
    schemas: [
      {
        field: 'parentId',
        label: '上级',
        component: 'TreeSelect',
        componentProps: { placeholder: '请输入', showSearch: true },
        rules: [{ required: true, trigger: 'blur', message: '必填' }],
      },
      {
        field: 'fullName',
        label: '名称',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 50 },
        rules: [
          { required: true, trigger: 'blur', message: '必填' },
          { validator: formValidate('fullName', '不能含有特殊符号'), trigger: 'blur' },
        ],
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
        field: 'isTree',
        label: '树形',
        defaultValue: 0,
        component: 'Switch',
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
        label: '说明',
        component: 'Textarea',
        componentProps: { placeholder: '请输入' },
      },
    ],
  });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);
  const id = ref('');
  const treeData = ref([]);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const baseStore = useBaseStore();

  const getTitle = computed(() => (!unref(id) ? t('common.addText') : t('common.editText')));

  function init(data) {
    changeLoading(true);
    resetFields();
    id.value = data.id;
    updateSchema({ field: 'isTree', componentProps: { disabled: !!unref(id) } });
    getDictionaryTypeSelector(data.id).then(res => {
      treeData.value = res.data.list || [];
      updateSchema([
        {
          field: 'parentId',
          componentProps: { options: treeData.value },
        },
      ]);
      if (id.value) {
        getInfo(id.value).then(res => {
          setFieldsValue(res.data);
          changeLoading(false);
        });
      } else {
        changeLoading(false);
      }
    });
  }

  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    const query = {
      ...values,
      id: id.value,
    };
    const formMethod = id.value ? update : create;
    formMethod(query)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        baseStore.setDictionaryList();
        closeModal();
        setTimeout(() => {
          emit('reload');
        }, 200);
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
</script>
