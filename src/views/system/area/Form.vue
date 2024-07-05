<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit" destroy-on-close>
    <BasicForm @register="registerForm">
      <template #parentId>
        <TreeSelect
          v-model:value="selectTreeData"
          showSearch
          placeholder="请选择"
          :treeDefaultExpandAll="false"
          :treeDataSimpleMode="true"
          :labelInValue="true"
          :treeData="treeData"
          :fieldNames="{ label: 'fullName', value: 'id' }"
          :loadData="onLoadData"
          @change="onParentIdChange" />
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed, ref, unref } from 'vue';
  import { TreeSelect } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import formValidate from '/@/utils/formValidate';
  import { getAreaInfo, getAreaSelector, createArea, updateArea } from '/@/api/system/area';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';

  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const id = ref('');
  const treeData = ref<any[]>([]);
  const selectTreeData = ref<any>({ label: '', value: '' });
  const getTitle = computed(() => (!unref(id) ? t('common.addText') : t('common.editText')));
  const schemas: FormSchema[] = [
    {
      field: 'parentId',
      label: '区域上级',
      component: 'TreeSelect',
      slot: 'parentId',
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'fullName',
      label: '区域名称',
      component: 'Input',
      componentProps: { placeholder: '请输入', maxlength: 50 },
      rules: [
        { required: true, trigger: 'blur', message: '必填' },
        { validator: formValidate('fullName', '不能含有特殊符号'), trigger: 'blur' },
      ],
    },
    {
      field: 'enCode',
      label: '区域编码',
      component: 'Input',
      componentProps: { placeholder: '请输入', maxlength: 50 },
      rules: [
        { required: true, trigger: 'blur', message: '必填' },
        { validator: formValidate('number'), trigger: 'blur' },
      ],
    },
    {
      field: 'sortCode',
      label: '排序',
      component: 'InputNumber',
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
  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({ labelWidth: 80, schemas: schemas });
  const [registerModal, { changeLoading, closeModal, changeOkLoading }] = useModalInner(init);

  function init(data) {
    resetFields();
    id.value = data.id || 0;
    selectTreeData.value = { label: undefined, value: undefined };
    changeLoading(true);
    getAreaSelector('-1', id.value).then(res => {
      let topItem = { fullName: '顶级节点', id: '-1', isLeaf: true };
      const list = res.data.list.map(o => ({ isLeaf: false, ...o }));
      treeData.value = [topItem, ...list];
      changeLoading(false);
      if (id.value) {
        changeLoading(true);
        getAreaInfo(id.value).then(res => {
          selectTreeData.value = { label: res.data.parentName || '顶级节点', value: res.data.parentId };
          setFieldsValue(res.data);
          changeLoading(false);
        });
      }
    });
  }
  function onLoadData(treeNode) {
    return new Promise(resolve => {
      const { id } = treeNode.dataRef;
      getAreaSelector(id).then(res => {
        const list = res.data.list.map(o => ({ ...o, pId: id, isLeaf: o.isLeaf }));
        treeData.value = [...treeData.value, ...list];
        resolve(true);
      });
    });
  }
  function onParentIdChange() {
    setFieldsValue({ parentId: selectTreeData.value.value });
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    const formMethod = id.value ? updateArea : createArea;
    formMethod(values)
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
