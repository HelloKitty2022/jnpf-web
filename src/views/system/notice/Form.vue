<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="getTitle" showOkBtn @ok="handleSubmit">
    <a-alert message="提醒方式设置在【消息中心】-【消息发送配置】维护；选择默认则站内信提醒，选择自定义则取自定义模板配置。" type="warning" show-icon />
    <BasicForm @register="registerForm" class="!px-10px !mt-10px">
      <template #sendConfigId="{ model, field }">
        <msg-modal :value="model[field]" :title="state.sendConfigName" placeholder="请选择" messageSource="1" @change="onMsgChange" />
      </template>
    </BasicForm>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { ref, unref, computed, reactive } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { getInfo, create, update } from '/@/api/system/message';
  import { getInfo as getSendMessageConfig } from '/@/api/msgCenter/sendConfig';
  import { useMessage } from '/@/hooks/web/useMessage';
  import MsgModal from '/@/components/FlowProcess/src/propPanel/MsgModal.vue';
  import { useBaseStore } from '/@/store/modules/base';
  import { useI18n } from '/@/hooks/web/useI18n';

  const id = ref('');
  const state = reactive({
    sendConfigId: '',
    sendConfigName: '',
  });
  const baseStore = useBaseStore();
  const schemas: FormSchema[] = [
    {
      field: 'title',
      label: '标题',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'toUserIds',
      label: '用户',
      component: 'UsersSelect',
      componentProps: { placeholder: '全部用户', multiple: true },
    },
    {
      field: 'category',
      label: '类型',
      component: 'Select',
      defaultValue: '1',
      componentProps: { placeholder: '请选择', showSearch: true, fieldNames: { value: 'enCode' } },
      rules: [{ required: true, trigger: 'change', message: '必填' }],
      colProps: { span: 12 },
    },
    {
      field: 'expirationTime',
      label: '失效时间',
      helpMessage: '当前时间超过失效时间，状态更新已过期',
      component: 'DatePicker',
      componentProps: { placeholder: '请选择', format: 'YYYY-MM-DD HH:mm:ss' },
      colProps: { span: 12 },
    },
    {
      field: 'files',
      label: '附件',
      component: 'UploadFile',
    },
    {
      field: 'coverImage',
      label: '封面图片',
      helpMessage: '门户公告通知缩略图展示，无设置则系统默认图片',
      component: 'UploadImgSingle',
    },
    {
      field: 'bodyText',
      label: '内容',
      component: 'Editor',
      defaultValue: '',
    },
    {
      field: 'excerpt',
      label: '摘要',
      component: 'Input',
      defaultValue: '',
      componentProps: { placeholder: '请输入' },
    },
    {
      field: 'remindCategory',
      label: '提醒方式',
      component: 'Select',
      defaultValue: 1,
      componentProps: {
        placeholder: '请选择',
        options: [
          { id: 1, fullName: '默认' },
          { id: 2, fullName: '自定义' },
          { id: 3, fullName: '不提醒' },
        ],
        allowClear: false,
      },
      rules: [{ required: true, trigger: 'change', message: '必填', type: 'number' }],
      colProps: { span: 12 },
    },
    {
      ifShow: ({ values }) => values.remindCategory === 2,
      field: 'sendConfigId',
      label: '发送配置',
      component: 'Select',
      slot: 'sendConfigId',
      rules: [{ required: true, trigger: 'change', message: '必填' }],
      colProps: { span: 12 },
    },
  ];
  const getTitle = computed(() => (!unref(id) ? t('common.addText') : t('common.editText')));
  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerForm, { setFieldsValue, validate, resetFields, updateSchema, clearValidate }] = useForm({ labelWidth: 100, schemas: schemas });
  const [registerPopup, { closePopup, changeLoading, changeOkLoading }] = usePopupInner(init);

  async function init(data) {
    resetFields();
    id.value = data.id;
    state.sendConfigId = '';
    state.sendConfigName = '';
    setFieldsValue({
      files: [],
      coverImage: undefined,
    });
    const noticeTypeOptions = (await baseStore.getDictionaryData('NoticeType')) as any[];
    updateSchema({ field: 'category', componentProps: { options: noticeTypeOptions } });
    if (id.value) {
      changeLoading(true);
      getInfo(id.value).then(res => {
        const data = {
          ...res.data,
          files: res.data.files ? JSON.parse(res.data.files) : [],
          toUserIds: res.data.toUserIds ? res.data.toUserIds.split(',') : [],
        };
        state.sendConfigId = data.sendConfigId || '';
        getSendConfigName();
        setFieldsValue(data);
        changeLoading(false);
      });
    }
  }
  function onMsgChange(val, row) {
    if (!val) {
      state.sendConfigId = '';
      state.sendConfigName = '';
      setFieldsValue({ sendConfigId: state.sendConfigId });
      return;
    }
    if (state.sendConfigId === val) return;
    state.sendConfigId = val;
    state.sendConfigName = row.fullName;
    setFieldsValue({ sendConfigId: state.sendConfigId });
    clearValidate('sendConfigId');
  }
  function getSendConfigName() {
    if (!state.sendConfigId) return;
    getSendMessageConfig(state.sendConfigId).then(res => {
      state.sendConfigName = res.data.fullName;
    });
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    const query = {
      ...values,
      id: id.value,
      files: JSON.stringify(values.files),
      toUserIds: values.toUserIds ? values.toUserIds.join(',') : '',
    };
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
</script>
