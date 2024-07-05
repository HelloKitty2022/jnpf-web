<template>
  <BasicPopup
    v-bind="$attrs"
    @register="registerPopup"
    :title="title"
    showOkBtn
    :okText="formConf.confirmButtonText || '确定'"
    :cancelText="formConf.cancelButtonText || '取消'"
    :showContinueBtn="showContinueBtn"
    :continueText="continueText"
    destroyOnClose
    @ok="handleSubmit(0)"
    @continue="handleSubmit(1)"
    :closeFunc="onClose">
    <template #insertToolbar>
      <a-space :size="10" v-if="showMoreBtn()">
        <a-button :loading="state.prevBtnLoading" :disabled="getPrevDisabled" @click="handlePrev">上一条</a-button>
        <a-button :loading="state.nextBtnLoading" :disabled="getNextDisabled" @click="handleNext">下一条</a-button>
      </a-space>
    </template>
    <div class="p-10px" :style="{ margin: '0 auto', width: formConf.fullScreenWidth || '100%' }">
      <Parser ref="parserRef" :formConf="formConf" @submit="submitForm" :key="key" v-if="!loading" />
    </div>
  </BasicPopup>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="title"
    :width="formConf.generalWidth"
    :minHeight="100"
    :okText="formConf.confirmButtonText || '确定'"
    :cancelText="formConf.cancelButtonText || '取消'"
    :showContinueBtn="showContinueBtn"
    :continueText="continueText"
    @ok="handleSubmit(0)"
    @continue="handleSubmit(1)"
    :closeFunc="onClose">
    <template #insertFooter>
      <a-space :size="10" v-if="showMoreBtn()" class="float-left">
        <a-button :loading="state.prevBtnLoading" :disabled="getPrevDisabled" @click="handlePrev">上一条</a-button>
        <a-button :loading="state.nextBtnLoading" :disabled="getNextDisabled" @click="handleNext">下一条</a-button>
      </a-space>
    </template>
    <Parser ref="parserRef" :formConf="formConf" @submit="submitForm" :key="key" v-if="!loading" />
  </BasicModal>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    :width="formConf.drawerWidth"
    showFooter
    :okText="formConf.confirmButtonText || '确定'"
    :cancelText="formConf.cancelButtonText || '取消'"
    :showContinueBtn="showContinueBtn"
    :continueText="continueText"
    @ok="handleSubmit(0)"
    @continue="handleSubmit(1)"
    :closeFunc="onClose">
    <template #insertFooter>
      <a-space :size="10" v-if="showMoreBtn()">
        <a-button :loading="state.prevBtnLoading" :disabled="getPrevDisabled" @click="handlePrev">上一条</a-button>
        <a-button :loading="state.nextBtnLoading" :disabled="getNextDisabled" @click="handleNext">下一条</a-button>
      </a-space>
    </template>
    <div class="p-10px">
      <Parser ref="parserRef" :formConf="formConf" @submit="submitForm" :key="key" v-if="!loading" />
    </div>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { createModel, updateModel, getModelInfo } from '/@/api/onlineDev/visualDev';
  import { reactive, toRefs, nextTick, ref, unref, computed, inject } from 'vue';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { BasicPopup, usePopup } from '/@/components/Popup';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { BasicDrawer, useDrawer } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { useGeneratorStore } from '/@/store/modules/generator';
  import { cloneDeep } from 'lodash-es';
  import dayjs from 'dayjs';
  import { getDateTimeUnit } from '/@/utils/jnpf';

  interface State {
    formConf: any;
    formData: any;
    config: any;
    loading: boolean;
    prevBtnLoading: boolean;
    nextBtnLoading: boolean;
    key: number;
    dataForm: any;
    formOperates: any[];
    title: string;
    continueText: string;
    allList: any[];
    currIndex: number;
    isContinue: boolean;
    submitType: number;
    showContinueBtn: boolean;
  }

  const emit = defineEmits(['reload']);
  const getLeftTreeActiveInfo: (() => any) | null = inject('getLeftTreeActiveInfo', null);
  const userStore = useUserStore();
  const generatorStore = useGeneratorStore();
  const { createMessage } = useMessage();
  const [registerPopup, { openPopup, setPopupProps }] = usePopup();
  const [registerModal, { openModal, setModalProps }] = useModal();
  const [registerDrawer, { openDrawer, setDrawerProps }] = useDrawer();
  const parserRef = ref<any>(null);
  const state = reactive<State>({
    formConf: {},
    formData: {},
    config: {},
    loading: false,
    prevBtnLoading: false,
    nextBtnLoading: false,
    key: +new Date(),
    dataForm: {
      id: '',
      data: '',
    },
    formOperates: [],
    title: '',
    continueText: '',
    allList: [],
    currIndex: 0,
    isContinue: false,
    submitType: 0,
    showContinueBtn: true,
  });
  const { title, formConf, key, loading, continueText, showContinueBtn } = toRefs(state);
  const Parser = createAsyncComponent(() => import('/@/components/FormGenerator/src/components/Parser.vue'));

  const getPrevDisabled = computed(() => state.currIndex === 0);
  const getNextDisabled = computed(() => state.currIndex === state.allList.length - 1);

  defineExpose({ init });

  function fillFormData(form, data, isAdd) {
    const userInfo = userStore.getUserInfo;
    const currDate = new Date();
    const loop = (list, parent?) => {
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        if (item.__vModel__) {
          let val = data.hasOwnProperty(item.__vModel__) ? data[item.__vModel__] : item.__config__.defaultValue;
          if (!item.__config__.isSubTable) item.__config__.defaultValue = val;
          if (isAdd || item.__config__.isSubTable) {
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
          }
          if (isAdd && !item.__config__.isSubTable && data.hasOwnProperty(item.__vModel__)) item.__config__.defaultValue = data[item.__vModel__];
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
    state.isContinue = false;
    state.prevBtnLoading = false;
    state.nextBtnLoading = false;
    state.title = !data.id || data.id === 'jnpfAdd' ? '新增' : '编辑';
    state.continueText = !data.id ? '确定并新增' : '确定并继续';
    setFormProps({ continueLoading: false });
    state.config = data;
    state.formConf = cloneDeep(data.formConf);
    state.showContinueBtn = !data.formData && state.formConf.hasConfirmAndAddBtn;
    state.dataForm.id = !data.id || data.id === 'jnpfAdd' ? '' : data.id;
    getFormOperates();
    openForm();
    state.allList = data.allList;
    state.currIndex = state.allList.length && data.id ? state.allList.findIndex(item => item.id === data.id) : 0;
    nextTick(() => {
      if (!data.formData) return setTimeout(initData, 0);
      // 行内编辑
      setTimeout(() => {
        state.formData = { ...data.formData, id: state.dataForm.id };
        setFormValue();
      }, 0);
    });
  }
  function initData() {
    changeLoading(true);
    state.loading = true;
    if (state.config.id) {
      const extra = { modelId: state.config.modelId, id: state.config.id, type: 2 };
      generatorStore.setDynamicModelExtra(extra);
      getInfo(state.config.id);
    } else {
      generatorStore.setDynamicModelExtra({});
      state.formData = {};
      setFormValue(true);
    }
  }
  function getInfo(id) {
    getModelInfo(state.config.modelId, id).then(res => {
      state.dataForm = res.data || {};
      if (!state.dataForm.data) return;
      state.formData = { ...JSON.parse(state.dataForm.data), id: state.dataForm.id };
      setFormValue();
    });
  }
  function setFormValue(isAdd = false) {
    if (isAdd && getLeftTreeActiveInfo) state.formData = { ...(getLeftTreeActiveInfo() || {}) };
    fillFormData(state.formConf, state.formData, isAdd);
    nextTick(() => {
      state.loading = false;
      state.prevBtnLoading = false;
      state.nextBtnLoading = false;
      state.key = +new Date();
      changeLoading(false);
    });
  }
  function getFormOperates() {
    if (state.config.isPreview || !state.config.useFormPermission) return;
    const permissionList = userStore.getPermissionList;
    const modelId = state.config.menuId;
    const list = permissionList.filter(o => o.modelId === modelId);
    state.formOperates = list[0] && list[0].form ? list[0].form : [];
  }
  function submitForm(data, callback) {
    if (!data) return;
    state.submitType === 1 ? setFormProps({ continueLoading: true }) : setFormProps({ confirmLoading: true });
    const formData = { ...state.formData, ...data };
    state.dataForm.data = JSON.stringify(formData);
    const formMethod = state.dataForm.id ? updateModel : createModel;
    formMethod(state.config.modelId, state.dataForm)
      .then(res => {
        createMessage.success(res.msg);
        if (callback && typeof callback === 'function') callback();
        state.submitType === 1 ? setFormProps({ continueLoading: false }) : setFormProps({ confirmLoading: false });
        if (state.submitType == 1) {
          initData();
          state.isContinue = true;
        } else {
          setFormProps({ visible: false });
          emit('reload');
        }
      })
      .catch(() => {
        state.submitType === 1 ? setFormProps({ continueLoading: false }) : setFormProps({ confirmLoading: false });
      });
  }
  function handleReset() {
    getParser().handleReset();
  }
  function handleSubmit(type) {
    if (state.config.isPreview) return createMessage.warning('功能预览不支持数据保存');
    state.submitType = type;
    getParser().handleSubmit();
  }
  function handlePrev() {
    state.currIndex--;
    // state.prevBtnLoading = true;
    handleGetNewInfo();
  }
  function handleNext() {
    state.currIndex++;
    // state.nextBtnLoading = true;
    handleGetNewInfo();
  }
  function handleGetNewInfo() {
    changeLoading(true);
    state.loading = true;
    handleReset();
    state.config.id = state.allList[state.currIndex].id;
    getInfo(state.config.id);
  }
  function getParser() {
    const parser = unref(parserRef);
    if (!parser) throw new Error('parser is null!');
    return parser;
  }
  function openForm() {
    if (state.formConf.popupType === 'fullScreen') return openPopup();
    if (state.formConf.popupType === 'drawer') return openDrawer();
    openModal();
  }
  function setFormProps(data) {
    if (state.formConf.popupType === 'fullScreen') return setPopupProps(data);
    if (state.formConf.popupType === 'drawer') return setDrawerProps(data);
    setModalProps(data);
  }
  function changeLoading(loading) {
    setFormProps({ loading });
  }
  async function onClose() {
    if (state.isContinue) emit('reload');
    return true;
  }
  function showMoreBtn() {
    if (state.config.id && state.config.showMoreBtn && state.formConf.hasConfirmAndAddBtn) return true;
    return false;
  }
</script>
