<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    @ok="handleSubmit(0)"
    :showContinueBtn="!id"
    @continue="handleSubmit(1)"
    @cancel="handleCancel">
    <BasicForm @register="registerForm"></BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { create, update, getInfo } from '/@/api/system/commonWords';
  import { ref, unref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';

  const emit = defineEmits(['register', 'reload']);

  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    schemas: [
      {
        field: 'commonWordsText',
        label: '常用语',
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
        ifShow: ({ values }) => values.commonWordsType === 0,
      },
      {
        field: 'commonWordsType',
        label: '类型',
        defaultValue: 0,
        component: 'InputNumber',
        ifShow: false,
      },
    ],
  });
  const [registerModal, { closeModal, changeLoading, changeOkLoading, changeContinueLoading }] = useModalInner(init);
  const { createMessage } = useMessage();
  const id = ref('');
  const systemNames = ref<string[]>([]);
  const commonWordsType = ref<number>(0);
  const isContinue = ref<boolean>(false);
  const { t } = useI18n();

  const getTitle = computed(() => (!unref(id) ? t('common.addText') : t('common.editText')));

  function init(data) {
    changeLoading(true);
    changeOkLoading(false);
    changeContinueLoading(false);
    systemNames.value = [];
    isContinue.value = false;
    resetFields();
    id.value = data.id;
    if (id.value) {
      getInfo(id.value).then(res => {
        setFieldsValue(res.data);
        systemNames.value = res.data.systemNames || [];
        commonWordsType.value = res.data.commonWordsType || 0;
        changeLoading(false);
      });
    } else {
      setFieldsValue({ commonWordsType: data.commonWordsType || 0 });
      commonWordsType.value = data.commonWordsType || 0;
      changeLoading(false);
    }
  }
  async function handleSubmit(type) {
    const changeLoadingMethod = type == 1 ? changeContinueLoading : changeOkLoading;
    const values = await validate();
    if (!values) return;
    changeLoadingMethod(true);
    const query = {
      ...values,
      id: id.value,
    };
    if (commonWordsType.value === 1) query.enabledMark = 1;
    const formMethod = id.value ? update : create;
    formMethod(query)
      .then(res => {
        createMessage.success(res.msg);
        changeLoadingMethod(false);
        if (type == 1) {
          resetFields();
          setFieldsValue({ commonWordsType: commonWordsType.value || 0 });
          isContinue.value = true;
        } else {
          closeModal();
          emit('reload');
        }
      })
      .catch(() => {
        changeLoadingMethod(false);
      });
  }
  function handleCancel() {
    if (isContinue.value == true) emit('reload');
  }
</script>
