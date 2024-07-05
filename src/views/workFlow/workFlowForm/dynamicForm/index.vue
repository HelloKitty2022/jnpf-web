<template>
  <div class="flow-form" :style="{ margin: '0 auto', width: formConf.fullScreenWidth || '100%' }">
    <Parser ref="parserRef" :formConf="formConf" @submit="submitForm" :key="key" v-if="!loading" />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, toRefs, onMounted, ref, unref, nextTick, inject } from 'vue';
  import { useGeneratorStore } from '/@/store/modules/generator';
  import { useUserStore } from '/@/store/modules/user';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { useMessage } from '/@/hooks/web/useMessage';
  import dayjs from 'dayjs';
  import { getDateTimeUnit } from '/@/utils/jnpf';

  const props = defineProps(['config']);
  const emit = defineEmits(['setPageLoad', 'eventReceiver']);
  defineExpose({ dataFormSubmit });

  interface State {
    config: any;
    formConf: any;
    formData: any;
    key: number;
    loading: boolean;
    isCustomCopy: boolean;
    dataForm: any;
    eventType: string;
    flowUrgent: number;
  }

  const { createMessage } = useMessage();
  const getLeftTreeActiveInfo: (() => any) | null = inject('getLeftTreeActiveInfo', null);
  const Parser = createAsyncComponent(() => import('/@/components/FormGenerator/src/components/Parser.vue'));
  const parserRef = ref<any>(null);
  const state = reactive<State>({
    config: {},
    formConf: {},
    formData: {},
    key: +new Date(),
    loading: false,
    isCustomCopy: false,
    dataForm: {
      id: '',
      formData: {},
      flowId: '',
    },
    eventType: '',
    flowUrgent: 1,
  });
  const { formConf, key, loading } = toRefs(state);
  const generatorStore = useGeneratorStore();
  const userStore = useUserStore();

  function init(config) {
    state.config = config;
    state.formConf = config.formConf ? JSON.parse(config.formConf) : {};
    state.formData = {};
    state.dataForm.id = config.id || '';
    state.dataForm.flowId = config.flowId;
    state.isCustomCopy = config.flowTemplateJson && config.flowTemplateJson.properties && config.flowTemplateJson.properties.isCustomCopy;
    state.loading = true;
    let extra = {};
    if (config.id) {
      extra = {
        modelId: config.flowId,
        id: config.id,
        type: config.type,
        flowId: config.flowId,
        processId: config.id,
        taskId: config.taskId,
        opType: config.opType,
      };
      const formData = config.draftData || config.formData;
      state.formData = { id: config.id, ...formData, flowId: config.flowId };
    } else {
      if (getLeftTreeActiveInfo) state.formData = { ...(getLeftTreeActiveInfo() || {}) };
    }
    generatorStore.setDynamicModelExtra(extra);
    fillFormData(state.formConf, state.formData, !config.id);
    nextTick(() => {
      state.loading = false;
      state.key = +new Date();
      setTimeout(() => {
        emit('setPageLoad');
      }, 200);
    });
  }
  function fillFormData(form, data, isAdd) {
    const userInfo = userStore.getUserInfo;
    const currDate = new Date();
    form.disabled = state.config.disabled;
    const loop = (list, parent?) => {
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        if (item.__vModel__) {
          const val = data.hasOwnProperty(item.__vModel__) ? data[item.__vModel__] : item.__config__.defaultValue;
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
          let noShow = item.__config__.noShow || false,
            isDisabled = item.disabled || false,
            required = item.__config__.required || false;
          if (state.config.formOperates && state.config.formOperates.length) {
            let id = item.__config__.isSubTable ? parent.__vModel__ + '-' + item.__vModel__ : item.__vModel__;
            let arr = state.config.formOperates.filter(o => o.id === id) || [];
            if (arr.length) {
              let obj = arr[0];
              noShow = !obj.read;
              isDisabled = !obj.write;
              required = obj.required ? obj.required : item.__config__.required;
            }
          }
          if (state.config.readonly || state.config.disabled) isDisabled = true;
          item.disabled = isDisabled;
          item.__config__.noShow = noShow;
          item.__config__.required = required || false;
        }
        if (['relationFormAttr', 'popupAttr'].includes(item.__config__.jnpfKey) && !item.isStorage && state.config.disabled) {
          item.disabled = true;
        }
        if (item.__config__ && item.__config__.children && Array.isArray(item.__config__.children)) {
          loop(item.__config__.children, item);
        }
      }
    };
    loop(form.fields);
    form.formData = data;
  }
  function getParser() {
    const parser = unref(parserRef);
    if (!parser) {
      throw new Error('parser is null!');
    }
    return parser;
  }
  function dataFormSubmit(eventType, flowUrgent) {
    if (state.config.isPreview) return createMessage.warning('功能预览不支持数据保存');
    state.eventType = eventType;
    state.flowUrgent = flowUrgent;
    getParser().handleSubmit();
  }
  function submitForm(data, callback) {
    if (!data) return;
    const formData = { ...state.formData, ...data };
    state.dataForm.formData = formData;
    if (callback && typeof callback === 'function') callback();
    emit('eventReceiver', state.dataForm, state.eventType);
  }

  onMounted(() => {
    init(props.config);
  });
</script>
