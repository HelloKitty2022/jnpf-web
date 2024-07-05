<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import {
    getDictionaryDataTypeSelector,
    getDictionaryDataInfo as getInfo,
    createDictionaryData as create,
    updateDictionaryData as update,
  } from '/@/api/systemData/dictionary';
  import { ref, unref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useBaseStore } from '/@/store/modules/base';
  import { useI18n } from '/@/hooks/web/useI18n';

  const emit = defineEmits(['register', 'reload']);
  const [registerForm, { setFieldsValue, resetFields, validate, updateSchema }] = useForm({
    schemas: [
      {
        field: 'parentId',
        label: '项目上级',
        defaultValue: '0',
        component: 'TreeSelect',
        componentProps: { placeholder: '请选择', showSearch: true },
        rules: [{ required: true, trigger: 'blur', message: '必填' }],
      },
      {
        field: 'fullName',
        label: '字典名称',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 50 },
        rules: [{ required: true, trigger: 'blur', message: '必填' }],
      },
      {
        field: 'enCode',
        label: '字典编码',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 50 },
        rules: [{ required: true, trigger: 'blur', message: '必填' }],
      },
      {
        field: 'sortCode',
        label: '排序',
        defaultValue: 0,
        component: 'InputNumber',
        componentProps: { min: 0, max: 999999 },
      },
      {
        field: 'enabledMark',
        label: '状态',
        defaultValue: 1,
        component: 'Switch',
      },
      {
        field: 'description',
        label: '说明',
        component: 'Textarea',
        componentProps: { placeholder: '请输入', rows: 3 },
      },
    ],
  });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);
  const id = ref('');
  const isTree = ref(0);
  const typeId = ref('');
  const treeData = ref([]);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const baseStore = useBaseStore();

  const getTitle = computed(() => (!unref(id) ? t('common.addText') : t('common.editText')));

  function init(data) {
    changeLoading(true);
    resetFields();
    id.value = data.id;
    isTree.value = data.isTree;
    typeId.value = data.typeId;
    updateSchema({ field: 'parentId', componentProps: { disabled: !unref(isTree) } });
    getDictionaryDataTypeSelector(data.typeId, data.isTree, data.id).then(res => {
      treeData.value = res.data.list;
      updateSchema([
        {
          field: 'parentId',
          componentProps: { options: treeData.value },
        },
      ]);
      if (id.value) {
        getInfo(id.value).then(res => {
          setFieldsValue(res.data);
          typeId.value = res.data.dictionaryTypeId;
          changeLoading(false);
        });
      } else {
        setFieldsValue({ parentId: res.data.list[0].id });
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
      dictionaryTypeId: typeId.value,
    };
    const formMethod = id.value ? update : create;
    formMethod(query)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        baseStore.setDictionaryList();
        closeModal();
        emit('reload');
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
</script>
