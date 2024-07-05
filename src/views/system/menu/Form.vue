<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" showOkBtn @ok="handleSubmit" destroy-on-close>
    <BasicForm @register="registerForm">
      <template #icon="{ model, field }">
        <a-row type="flex">
          <div style="flex: 1; margin-right: 10px">
            <jnpf-icon-picker v-model:value="model[field]" placeholder="请选择" />
          </div>
          <a-form-item-rest>
            <jnpf-color-picker v-model:value="propertyJson.iconBackgroundColor" size="small" :predefine="predefineList" name="iconBackground" />
          </a-form-item-rest>
        </a-row>
      </template>
      <template #selfUrl>
        <a-form-item-rest>
          <div class="flex">
            <div class="flex-1 mr-10px">
              <a-input v-model:value="selfUrl" placeholder="请输入" readonly />
            </div>
            <div>
              <a-input-group compact>
                <a-button @click="openUrl(selfUrl)">打开</a-button>
                <a-button type="primary" @click="handleCopy(selfUrl)">复制</a-button>
              </a-input-group>
            </div>
          </div>
        </a-form-item-rest>
      </template>
      <template #navigationIcon="{ model, field }">
        <a-form-item-rest>
          <div class="flex">
            <JnpfUploadImgSingle v-model:value="model[field]" tipText="文字图标" subTipText="210 × 60 px" />
            <div class="ml-15px">
              <JnpfUploadImgSingle v-model:value="dataForm.workLogoIcon" tipText="Logo图标" subTipText="60 × 60 px" />
            </div>
          </div>
        </a-form-item-rest>
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, toRefs, unref, computed, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { create, update, getInfo } from '/@/api/system/system';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { openWindow } from '/@/utils';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    propertyJson: any;
    dataForm: any;
    selfUrl: any;
  }

  const predefineList = ['#008cff', '#35b8e0', '#00cc88', '#ff9d00', '#ff4d4d', '#5b69bc', '#ff8acc', '#3b3e47', '#282828'];
  const id = ref('');
  const { t } = useI18n();
  const state = reactive<State>({
    propertyJson: {
      iconBackgroundColor: '',
    },
    dataForm: {},
    selfUrl: '',
  });
  const { propertyJson, dataForm, selfUrl } = toRefs(state);
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
      componentProps: { placeholder: '请输入', maxlength: 50, onChange: getSelfUrl },
      rules: [{ required: true, message: '必填', trigger: 'blur' }],
    },
    {
      field: 'icon',
      label: '图标',
      component: 'Input',
      slot: 'icon',
      componentProps: { placeholder: '请选择' },
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      field: 'selfUrl',
      label: '访问地址',
      component: 'Input',
      slot: 'selfUrl',
      helpMessage: '仅支持PC端访问，APP端不支持。',
    },
    {
      field: 'navigationIcon',
      label: '导航图标',
      component: 'UploadImgSingle',
      slot: 'navigationIcon',
    },
    {
      field: 'workflowEnabled',
      label: '协同办公',
      component: 'Switch',
      helpMessage: '关闭后该应用下不显示协同办公模块内容',
      defaultValue: 1,
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
      componentProps: { rows: 4, placeholder: '请输入' },
    },
  ];
  const getTitle = computed(() => (!unref(id) ? t('common.addText') : t('common.editText')));
  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const [registerForm, { setFieldsValue, validate, resetFields }] = useForm({ labelWidth: 80, schemas: schemas });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);

  function handleCopy(text) {
    if (!text) return;
    const { isSuccessRef } = useCopyToClipboard(text);
    unref(isSuccessRef) && createMessage.success('复制成功');
  }
  function getSelfUrl(enCode) {
    if (!enCode) return (state.selfUrl = '');
    state.selfUrl = `${window.location.origin}/JNPF_APP_${enCode}`;
  }
  function openUrl(url) {
    if (url) openWindow(url);
  }
  function init(data) {
    resetFields();
    id.value = data.id;
    state.dataForm.workLogoIcon = undefined;
    state.selfUrl = '';
    if (id.value) {
      changeLoading(true);
      getInfo(id.value).then(res => {
        const data = res.data;
        state.dataForm = res.data;
        const propertyJson = data.propertyJson ? JSON.parse(data.propertyJson) : null;
        state.propertyJson = propertyJson || { iconBackgroundColor: '' };
        setFieldsValue(data);
        getSelfUrl(res.data.enCode);
        changeLoading(false);
      });
    }
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    const query = {
      ...values,
      propertyJson: JSON.stringify(state.propertyJson),
      workLogoIcon: state.dataForm.workLogoIcon,
      id: id.value,
    };
    const formMethod = id.value ? update : create;
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
