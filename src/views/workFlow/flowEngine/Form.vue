<template>
  <BasicModal v-bind="$attrs" @register="registerModal" defaultFullscreen :footer="null" :closable="false" :keyboard="false" class="jnpf-full-modal full-modal">
    <template #title>
      <div class="jnpf-full-modal-header">
        <div class="header-title">
          <img src="../../../assets/images/jnpf.png" class="header-logo" />
          <p class="header-txt"> · 流程设计</p>
        </div>
        <a-steps v-model:current="activeStep" type="navigation" size="small">
          <a-step title="基础设置" />
          <a-step title="流程设计" disabled />
        </a-steps>
        <a-space class="options" :size="10">
          <a-button @click="handlePrev" :disabled="activeStep <= 0 || btnLoading">{{ t('common.prev') }}</a-button>
          <a-button @click="handleNext" :disabled="activeStep >= 1 || loading || btnLoading">{{ t('common.next') }} </a-button>
          <a-button type="primary" @click="handleSubmit()" :disabled="loading" :loading="btnLoading">{{ t('common.saveText') }}</a-button>
          <a-button @click="closeModal()">{{ t('common.cancelText') }}</a-button>
        </a-space>
      </div>
    </template>
    <a-row type="flex" justify="center" align="middle" class="basic-content" v-show="!activeStep">
      <a-col :span="12" :xxl="10" class="basic-form">
        <BasicForm @register="registerForm">
          <template #icon="{ model, field }">
            <a-row type="flex">
              <div style="flex: 1; margin-right: 10px">
                <jnpf-icon-picker v-model:value="model[field]" placeholder="请选择" />
              </div>
              <a-form-item-rest>
                <jnpf-color-picker v-model:value="iconBackground" size="small" :predefine="predefineList" name="iconBackground" />
              </a-form-item-rest>
            </a-row>
          </template>
        </BasicForm>
      </a-col>
    </a-row>
    <FlowProcess ref="processRef" :conf="flowTemplateJson" :formInfo="dataForm" v-if="activeStep == 1" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { getInfo, create, update, setMainVersion } from '/@/api/workFlow/flowEngine';
  import { ref, reactive, toRefs, unref, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import formValidate from '/@/utils/formValidate';
  import { FlowProcess } from '/@/components/FlowProcess';
  import { cloneDeep } from 'lodash-es';

  interface State {
    activeStep: number;
    loading: boolean;
    btnLoading: boolean;
    dataForm: Recordable;
    [prop: string]: any;
  }
  interface ComType {
    getData: () => any;
  }

  const emit = defineEmits(['register', 'reload']);
  const predefineList = ['#008cff', '#35b8e0', '#00cc88', '#ff9d00', '#ff4d4d', '#5b69bc', '#ff8acc', '#3b3e47', '#282828'];
  const [registerForm, { setFieldsValue, resetFields, validate, updateSchema }] = useForm({
    schemas: [
      {
        field: 'fullName',
        label: '流程名称',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 50 },
        rules: [{ required: true, trigger: 'blur', message: '必填' }],
      },
      {
        field: 'enCode',
        label: '流程编码',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 50 },
        rules: [
          { required: true, trigger: 'blur', message: '必填' },
          { validator: formValidate('enCode'), trigger: 'blur' },
        ],
      },
      {
        field: 'category',
        label: '流程分类',
        component: 'Select',
        componentProps: { placeholder: '请选择', showSearch: true },
        rules: [{ required: true, trigger: 'change', message: '必填' }],
      },
      {
        field: 'type',
        label: '流程类型',
        component: 'Select',
        componentProps: {
          options: [
            { id: 0, fullName: '发起流程' },
            { id: 1, fullName: '功能流程' },
          ],
          disabled: true,
          showArrow: false,
        },
        rules: [{ required: true, trigger: 'change', message: '必填', type: 'number' }],
      },
      {
        field: 'icon',
        label: '流程图标',
        slot: 'icon',
        component: 'IconPicker',
        rules: [{ required: true, trigger: 'change', message: '必填' }],
        ifShow: ({ values }) => values.type == 0,
      },
      {
        field: 'sortCode',
        label: '流程排序',
        defaultValue: 0,
        component: 'InputNumber',
        componentProps: { min: 0, max: 999999 },
      },
      {
        field: 'description',
        label: '流程说明',
        component: 'Textarea',
        componentProps: { placeholder: '请输入' },
      },
    ],
  });
  const [registerModal, { closeModal, changeLoading }] = useModalInner(init);
  const { createMessage, createConfirm } = useMessage();
  const { t } = useI18n();
  const defaultDataForm = {
    id: '',
    category: '',
    fullName: '',
    enCode: '',
    description: '',
    type: 0,
    sortCode: 0,
    icon: '',
    iconBackground: '#008cff',
    flowTemplateJson: null,
  };
  const state = reactive<State>({
    activeStep: 0,
    loading: false,
    btnLoading: false,
    dataForm: cloneDeep(defaultDataForm),
    flowTemplateJson: [],
    iconBackground: '#008cff',
  });
  const processRef = ref<Nullable<ComType>>(null);
  const { activeStep, loading, btnLoading, dataForm, flowTemplateJson, iconBackground } = toRefs(state);

  function init(data) {
    state.activeStep = 0;
    state.loading = true;
    state.flowTemplateJson = null;
    state.dataForm = cloneDeep(defaultDataForm);
    updateSchema([{ field: 'category', componentProps: { options: data.categoryList } }]);
    changeLoading(true);
    state.dataForm.icon = '';
    state.iconBackground = '#008cff';
    resetFields();
    state.dataForm.id = data.id;
    if (state.dataForm.id) {
      getInfo(state.dataForm.id).then(res => {
        state.dataForm = res.data;
        state.iconBackground = state.dataForm.iconBackground || '#008cff';
        setFieldsValue(state.dataForm);
        state.flowTemplateJson = state.dataForm.flowTemplateJson ? JSON.parse(state.dataForm.flowTemplateJson) : [];
        state.loading = false;
        changeLoading(false);
        nextTick(() => handleNext());
      });
    } else {
      state.dataForm.type = data.type;
      setFieldsValue({ type: data.type });
      state.loading = false;
      changeLoading(false);
    }
  }
  function handlePrev() {
    state.activeStep -= 1;
  }
  async function handleNext() {
    if (state.activeStep < 1) {
      const values = await validate();
      if (!values) return;
      state.dataForm = { ...state.dataForm, ...values, iconBackground: state.iconBackground };
      state.activeStep += 1;
    }
  }
  async function handleSubmit() {
    if (state.activeStep < 1) {
      const values = await validate();
      if (!values) return;
      state.dataForm = { ...state.dataForm, ...values, iconBackground: state.iconBackground };
      handleRequest();
    } else {
      (unref(processRef) as ComType)
        .getData()
        .then(res => {
          state.flowTemplateJson = res.data;
          handleRequest();
        })
        .catch(err => {
          err.msg && createMessage.warning(err.msg);
        });
    }
  }
  function handleRequest() {
    state.btnLoading = true;
    const query = { ...state.dataForm, flowTemplateJson: state.flowTemplateJson ? JSON.stringify(state.flowTemplateJson) : null };
    const formMethod = state.dataForm.id ? update : create;
    formMethod(query)
      .then(res => {
        if (state.activeStep == 1 && res.data && res.data.isMainVersion) {
          handleSetMain(res.data.id, res.msg);
        } else {
          createMessage.success(res.msg);
          state.btnLoading = false;
          setTimeout(() => {
            closeModal();
            emit('reload');
          }, 200);
        }
      })
      .catch(() => {
        state.btnLoading = false;
      });
  }
  function handleSetMain(id, msg) {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '流程已被使用，此版本是否覆盖线上流程。覆盖后，新发起的流程按此版本流转?',
      okText: '覆盖',
      cancelText: '存为新版本',
      onOk: () => {
        setMainVersion(id).then(_ => {
          createMessage.success(msg);
          state.btnLoading = false;
          setTimeout(() => {
            closeModal();
            emit('reload');
          }, 200);
        });
      },
      onCancel: () => {
        state.btnLoading = false;
        setTimeout(() => {
          closeModal();
          emit('reload');
        }, 200);
      },
    });
  }
</script>
