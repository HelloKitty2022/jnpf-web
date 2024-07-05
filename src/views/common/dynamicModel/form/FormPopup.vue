<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :show-back-icon="false" :show-cancel-btn="false" :title="config.fullName">
    <template #insertToolbar>
      <a-button type="primary" @click="handleSubmit" :loading="btnLoading">{{ formConf.confirmButtonText || '确定' }}</a-button>
      <a-button type="warning" class="ml-10px" @click="handleReset">重置</a-button>
    </template>
    <div class="p-10px" :style="{ margin: '0 auto', width: formConf.fullScreenWidth || '100%' }">
      <Parser ref="parserRef" :formConf="formConf" @submit="submitForm" :key="key" v-if="!loading" />
    </div>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { createModel } from '/@/api/onlineDev/visualDev';
  import { reactive, toRefs, nextTick, ref, unref } from 'vue';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import dayjs from 'dayjs';
  import { getDateTimeUnit } from '/@/utils/jnpf';

  interface State {
    formConf: any;
    config: any;
    loading: boolean;
    btnLoading: boolean;
    key: number;
  }

  defineEmits(['register']);
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const [registerPopup, { changeLoading }] = usePopupInner(init);
  const parserRef = ref<any>(null);
  const state = reactive<State>({
    formConf: {},
    config: {},
    loading: false,
    btnLoading: false,
    key: +new Date(),
  });
  const { formConf, key, loading, config, btnLoading } = toRefs(state);
  const Parser = createAsyncComponent(() => import('/@/components/FormGenerator/src/components/Parser.vue'));

  function fillFormData(form, data) {
    const userInfo = userStore.getUserInfo;
    const currDate = new Date();
    const loop = list => {
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
        }
        if (item.__config__ && item.__config__.children && Array.isArray(item.__config__.children)) {
          loop(item.__config__.children);
        }
      }
    };
    loop(form.fields);
    form.formData = data;
  }
  function init(data) {
    changeLoading(true);
    state.loading = true;
    state.config = data;
    state.formConf = data.formData ? JSON.parse(data.formData) : {};
    fillFormData(state.formConf, {});
    nextTick(() => {
      changeLoading(false);
      state.loading = false;
      state.key = +new Date();
    });
  }
  function submitForm(data, callback) {
    if (!data) return;
    state.btnLoading = true;
    const dataForm = { data: JSON.stringify(data) };
    createModel(state.config.modelId, dataForm)
      .then(res => {
        createMessage.success(res.msg);
        if (callback && typeof callback === 'function') callback();
        state.btnLoading = false;
        handleReset();
      })
      .catch(() => {
        state.btnLoading = false;
      });
  }
  function handleReset() {
    getParser().handleReset();
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
</script>
