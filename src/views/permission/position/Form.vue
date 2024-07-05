<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm">
      <template #organizeId>
        <jnpfOrganizeSelect v-model:value="organizeIdTree" placeholder="请选择" auth @change="onOrganizeChange" />
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { create, update, getInfo } from '/@/api/permission/position';
  import { ref, unref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useBaseStore } from '/@/store/modules/base';
  import { useOrganizeStore } from '/@/store/modules/organize';
  import formValidate from '/@/utils/formValidate';
  import { useI18n } from '/@/hooks/web/useI18n';

  const emit = defineEmits(['register', 'reload']);
  const [registerForm, { setFieldsValue, resetFields, validate, clearValidate, updateSchema }] = useForm({
    schemas: [
      {
        field: 'organizeId',
        label: '所属组织',
        component: 'TreeSelect',
        slot: 'organizeId',
        rules: [{ required: true, trigger: 'change', message: '必填' }],
      },
      {
        field: 'fullName',
        label: '岗位名称',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 50 },
        rules: [
          { required: true, trigger: 'blur', message: '必填' },
          { validator: formValidate('fullName', '不能含有特殊符号'), trigger: 'blur' },
        ],
      },
      {
        field: 'enCode',
        label: '岗位编码',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 50 },
        rules: [
          { required: true, trigger: 'blur', message: '必填' },
          { validator: formValidate('enCode', '只能输入英文、数字和小数点且小数点不能放在首尾'), trigger: 'blur' },
        ],
      },
      {
        field: 'type',
        label: '岗位类型',
        component: 'Select',
        componentProps: { placeholder: '请选择', fieldNames: { value: 'enCode' }, showSearch: true },
        rules: [{ required: true, trigger: 'change', message: '必填' }],
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
        component: 'Switch',
        defaultValue: 1,
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
  const organizeIdTree = ref([]);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const organizeStore = useOrganizeStore();

  const getTitle = computed(() => (!unref(id) ? t('common.addText') : t('common.editText')));

  function init(data) {
    changeLoading(true);
    resetFields();
    id.value = data.id;
    getOptions();
    if (id.value) {
      getInfo(id.value).then(res => {
        organizeIdTree.value = res.data.organizeIdTree || [];
        setFieldsValue(res.data);
        changeLoading(false);
      });
    } else {
      setFieldsValue({ organizeId: data.organizeId || '' });
      organizeIdTree.value = data.organizeIdTree || [];
      changeLoading(false);
    }
  }
  async function getOptions() {
    const typeRes = await baseStore.getDictionaryData('PositionType');
    updateSchema({ field: 'type', componentProps: { options: typeRes } });
  }
  function onOrganizeChange(val) {
    setFieldsValue({ organizeId: !val || !val.length ? '' : val[val.length - 1] });
    if (!val || !val.length) return;
    clearValidate('organizeId');
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    const query = {
      enabledMark: 1,
      ...values,
      id: id.value,
      organizeIdTree: organizeIdTree.value,
    };
    const formMethod = id.value ? update : create;
    formMethod(query)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        organizeStore.resetState();
        closeModal();
        emit('reload');
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
</script>
