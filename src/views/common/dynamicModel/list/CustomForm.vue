<template>
  <BasicPopup
    v-bind="$attrs"
    @register="registerPopup"
    :title="config.popupTitle"
    showOkBtn
    :okText="formConf.confirmButtonText || '确定'"
    destroyOnClose
    @ok="handleSubmit()">
    <div class="p-10px" :style="{ margin: '0 auto', width: config.popupWidth || '100%' }">
      <Parser ref="parserRef" :formConf="formConf" @submit="submitForm" :key="key" v-if="!loading" />
    </div>
  </BasicPopup>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="config.popupTitle"
    :width="config.popupWidth"
    :minHeight="100"
    :okText="formConf.confirmButtonText || '确定'"
    @ok="handleSubmit()">
    <Parser ref="parserRef" :formConf="formConf" @submit="submitForm" :key="key" v-if="!loading" />
  </BasicModal>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="config.popupTitle"
    :width="config.popupWidth"
    showFooter
    :okText="formConf.confirmButtonText || '确定'"
    @ok="handleSubmit()">
    <div class="p-10px">
      <Parser ref="parserRef" :formConf="formConf" @submit="submitForm" :key="key" v-if="!loading" />
    </div>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { createModel, getModelInfo, getConfigData } from '/@/api/onlineDev/visualDev';
  import { getDataInterfaceRes } from '/@/api/systemData/dataInterface';
  import { reactive, toRefs, nextTick, ref, unref } from 'vue';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { BasicPopup, usePopup } from '/@/components/Popup';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { BasicDrawer, useDrawer } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import dayjs from 'dayjs';
  import { getDateTimeUnit, getParamList } from '/@/utils/jnpf';

  interface State {
    formConf: any;
    formData: any;
    config: any;
    loading: boolean;
    key: number;
    dataForm: any;
    formOperates: any[];
  }

  const emit = defineEmits(['reload']);
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const [registerPopup, { openPopup, setPopupProps }] = usePopup();
  const [registerModal, { openModal, setModalProps }] = useModal();
  const [registerDrawer, { openDrawer, setDrawerProps }] = useDrawer();
  const parserRef = ref<any>(null);
  const state = reactive<State>({
    formConf: {},
    formData: {},
    config: {},
    loading: false,
    key: +new Date(),
    dataForm: {
      id: '',
      data: '',
    },
    formOperates: [],
  });
  const { config, formConf, key, loading } = toRefs(state);
  const Parser = createAsyncComponent(() => import('/@/components/FormGenerator/src/components/Parser.vue'));

  defineExpose({ init });

  function fillFormData(form, data) {
    const userInfo = userStore.getUserInfo;
    const currDate = new Date();
    const loop = (list, parent?) => {
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        if (item.__vModel__) {
          if (item.__config__.defaultCurrent) {
            if (item.__config__.jnpfKey === 'datePicker') {
              item.__config__.defaultValue = dayjs(currDate).startOf(getDateTimeUnit(item.format)).valueOf();
            }
            if (item.__config__.jnpfKey === 'timePicker') {
              item.__config__.defaultValue = dayjs(currDate).format(item.format || 'HH:mm:ss');
            }
            if (item.__config__.jnpfKey === 'organizeSelect' && userInfo.organizeIdList?.length) {
              item.__config__.defaultValue = item.multiple ? [userInfo.organizeIdList] : userInfo.organizeIdList;
            }
            if (item.__config__.jnpfKey === 'depSelect' && userInfo.departmentId) {
              item.__config__.defaultValue = item.multiple ? [userInfo.departmentId] : userInfo.departmentId;
            }
            if (item.__config__.jnpfKey === 'userSelect' && userInfo.userId) {
              item.__config__.defaultValue = item.multiple ? [userInfo.userId] : userInfo.userId;
            }
            if (item.__config__.jnpfKey === 'usersSelect' && userInfo.userId) {
              item.__config__.defaultValue = item.multiple ? [userInfo.userId + '--user'] : userInfo.userId + '--user';
            }
            if (item.__config__.jnpfKey === 'posSelect' && userInfo.positionIds?.length) {
              item.__config__.defaultValue = item.multiple ? userInfo.positionIds.map(o => o.id) : userInfo.positionIds[0].id;
            }
            if (item.__config__.jnpfKey === 'roleSelect' && userInfo.roleIds?.length) {
              item.__config__.defaultValue = item.multiple ? userInfo.roleIds : userInfo.roleIds[0];
            }
            if (item.__config__.jnpfKey === 'groupSelect' && userInfo.groupIds?.length) {
              item.__config__.defaultValue = item.multiple ? userInfo.groupIds : userInfo.groupIds[0];
            }
            if (item.__config__.jnpfKey === 'sign' && userInfo.signImg) {
              item.__config__.defaultValue = userInfo.signImg;
            }
          }
          let val = data.hasOwnProperty(item.__vModel__) ? data[item.__vModel__] : item.__config__.defaultValue;
          item.__config__.defaultValue = val;
          if (!state.config.isPreview && state.config.useFormPermission) {
            let id = item.__config__.isSubTable ? parent.__vModel__ + '-' + item.__vModel__ : item.__vModel__;
            let noShow = true;
            if (state.formOperates && state.formOperates.length) {
              noShow = !state.formOperates.some(o => o.enCode === id);
            }
            noShow = item.__config__.noShow ? item.__config__.noShow : noShow;
            item.__config__.noShow = noShow;
          }
        }
        if (item.__config__ && item.__config__.children && Array.isArray(item.__config__.children)) {
          loop(item.__config__.children, item);
        }
      }
    };
    loop(form.fields);
    form.formData = data;
  }
  function init(data) {
    state.config = data;
    state.formData = {};
    openForm();
    nextTick(() => {
      setTimeout(() => {
        if (state.config.modelId) initData();
      }, 0);
    });
  }
  function initData() {
    changeLoading(true);
    state.loading = true;
    getConfigData(state.config.modelId).then(res => {
      if (res.code !== 200 || !res.data) return createMessage.error(res.msg || '请求出错，请重试');
      if (!res.data.formData) return;
      state.formConf = JSON.parse(res.data.formData);
      if (state.config.webType == '4' || !state.config.record.id) return setFormValue(state.config.record);
      getInfo();
    });
  }
  function getInfo() {
    getModelInfo(state.config.recordModelId, state.config.record.id).then(res => {
      if (!res.data || !res.data.data) return;
      const formData = JSON.parse(res.data.data);
      setFormValue({ ...formData, id: state.config.record.id });
    });
  }
  function setFormValue(formData) {
    if (state.config.formOptions.length) {
      for (let [key, value] of Object.entries(formData)) {
        for (let i = 0; i < state.config.formOptions.length; i++) {
          const e = state.config.formOptions[i];
          if (e.currentField == '@formId') state.formData[e.field] = formData.id;
          if (e.currentField == key) state.formData[e.field] = value;
        }
      }
    }
    fillFormData(state.formConf, state.formData);
    nextTick(() => {
      state.loading = false;
      state.key = +new Date();
      changeLoading(false);
    });
  }
  function submitForm(data, callback) {
    if (!data) return;
    setFormProps({ confirmLoading: true });
    if (state.config.customBtn) {
      const query = { paramList: getParamList(state.config.templateJson, { ...data, id: state.config.record.id }) || [] };
      getDataInterfaceRes(state.config.interfaceId, query)
        .then(res => {
          createMessage.success(res.msg);
          if (callback && typeof callback === 'function') callback();
          setFormProps({ confirmLoading: false });
          setFormProps({ visible: false });
          if (state.config?.isRefresh) emit('reload');
        })
        .catch(() => {
          setFormProps({ confirmLoading: false });
        });
    } else {
      const formData = { ...state.formData, ...data };
      state.dataForm.data = JSON.stringify(formData);
      createModel(state.config.modelId, state.dataForm)
        .then(res => {
          createMessage.success(res.msg);
          if (callback && typeof callback === 'function') callback();
          setFormProps({ confirmLoading: false });
          setFormProps({ visible: false });
          if (state.config?.isRefresh) emit('reload');
        })
        .catch(() => {
          setFormProps({ confirmLoading: false });
        });
    }
  }
  function handleSubmit() {
    if (state.config.isPreview) return createMessage.warning('功能预览不支持数据保存');
    getParser().handleSubmit();
  }
  function getParser() {
    const parser = unref(parserRef);
    if (!parser) throw new Error('parser is null!');
    return parser;
  }
  function openForm() {
    if (state.config.popupType === 'fullScreen') return openPopup();
    if (state.config.popupType === 'drawer') return openDrawer();
    openModal();
  }
  function setFormProps(data) {
    if (state.config.popupType === 'fullScreen') return setPopupProps(data);
    if (state.config.popupType === 'drawer') return setDrawerProps(data);
    setModalProps(data);
  }
  function changeLoading(loading) {
    setFormProps({ loading });
  }
</script>
