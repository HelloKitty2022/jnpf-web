<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="title" destroyOnClose :closeFunc="onClose">
    <div class="p-10px" :style="{ margin: '0 auto', width: formConf.fullScreenWidth || '100%' }">
      <Parser ref="parserRef" :formConf="formConf" :formData="formData" :relationData="relationData" :key="key" v-if="!loading" />
    </div>
  </BasicPopup>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" :width="formConf.generalWidth" :minHeight="100" :showOkBtn="false" :closeFunc="onClose">
    <Parser ref="parserRef" :formConf="formConf" :formData="formData" :relationData="relationData" :key="key" v-if="!loading" />
  </BasicModal>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" :title="title" :width="formConf.drawerWidth" showFooter :showOkBtn="false" :closeFunc="onClose">
    <div class="p-10px">
      <Parser ref="parserRef" :formConf="formConf" :formData="formData" :relationData="relationData" :key="key" v-if="!loading" />
    </div>
  </BasicDrawer>
  <Detail v-if="detailVisible" ref="detailRef" @close="state.detailVisible = false" />
</template>
<script lang="ts" setup>
  import { getDataChange } from '/@/api/onlineDev/shortLink';
  import { reactive, toRefs, nextTick, ref } from 'vue';
  import { BasicPopup, usePopup } from '/@/components/Popup';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { BasicDrawer, useDrawer } from '/@/components/Drawer';
  import Parser from '../../../dynamicModel/list/detail/Parser.vue';
  import { cloneDeep } from 'lodash-es';

  interface State {
    formConf: any;
    formData: any;
    config: any;
    loading: boolean;
    key: number;
    dataForm: any;
    formOperates: any[];
    title: string;
    relationData: any;
    detailVisible: boolean;
  }

  defineOptions({ name: 'Detail' });
  const emit = defineEmits(['close']);
  const [registerPopup, { openPopup, closePopup, setPopupProps }] = usePopup();
  const [registerModal, { openModal, closeModal, setModalProps }] = useModal();
  const [registerDrawer, { openDrawer, closeDrawer, setDrawerProps }] = useDrawer();
  const parserRef = ref<any>(null);
  const detailRef = ref<any>(null);
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
    title: '详情',
    relationData: {},
    detailVisible: false,
  });
  const { title, formConf, formData, relationData, key, loading, detailVisible } = toRefs(state);

  defineExpose({ init });

  function fillFormData(form, data) {
    let relationFormAttrList: any[] = [];
    const loop = (list, parent?) => {
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        if (item.__vModel__) {
          if (item.__config__.jnpfKey === 'relationForm' || item.__config__.jnpfKey === 'popupSelect') {
            item.__config__.defaultValue = data[item.__vModel__ + '_id'];
            item.name = data[item.__vModel__] || '';
          } else {
            const val = data.hasOwnProperty(item.__vModel__) ? data[item.__vModel__] : item.__config__.defaultValue;
            item.__config__.defaultValue = val;
          }
          if (state.config.useFormPermission) {
            let id = item.__config__.isSubTable ? parent.__vModel__ + '-' + item.__vModel__ : item.__vModel__;
            let noShow = true;
            if (state.formOperates && state.formOperates.length) {
              noShow = !state.formOperates.some(o => o.enCode === id);
            }
            noShow = item.__config__.noShow ? item.__config__.noShow : noShow;
            item.__config__.noShow = noShow;
          }
        }
        if (['relationFormAttr', 'popupAttr'].includes(item.__config__.jnpfKey)) relationFormAttrList.push(item);
        if (item.__config__ && item.__config__.children && Array.isArray(item.__config__.children)) {
          loop(item.__config__.children, item);
        }
      }
    };
    loop(form.fields);
  }
  function init(data) {
    state.config = data;
    state.formConf = cloneDeep(data.formConf);
    state.dataForm.id = data.id;
    openForm();
    nextTick(() => {
      setTimeout(initData, 0);
    });
  }
  function initData() {
    changeLoading(true);
    state.loading = true;
    if (state.config.id) {
      getInfo(state.config.id);
    } else {
      closeForm();
    }
  }
  function getInfo(id) {
    getDataChange(state.config.modelId, id, state.config.encryption).then(res => {
      state.dataForm = res.data || {};
      if (!state.dataForm.data) return;
      state.formData = JSON.parse(state.dataForm.data);
      fillFormData(state.formConf, state.formData);
      initRelationForm(state.formConf.fields);
      nextTick(() => {
        state.loading = false;
        state.key = +new Date();
        changeLoading(false);
      });
    });
  }
  function initRelationForm(componentList) {
    componentList.forEach(cur => {
      const config = cur.__config__;
      if (config.jnpfKey == 'relationFormAttr' || config.jnpfKey == 'popupAttr') {
        const relationKey = cur.relationField.split('_jnpfTable_')[0];
        componentList.forEach(item => {
          const noVisibility = Array.isArray(item.__config__.visibility) && !item.__config__.visibility.includes('pc');
          if (relationKey == item.__vModel__ && (noVisibility || !!item.__config__.noShow) && !cur.__vModel__) {
            cur.__config__.noShow = true;
          }
        });
      }
      if (cur.__config__.children && cur.__config__.children.length) initRelationForm(cur.__config__.children);
    });
  }
  function openForm() {
    if (state.formConf.popupType === 'fullScreen') return openPopup();
    if (state.formConf.popupType === 'drawer') return openDrawer();
    openModal();
  }
  function closeForm() {
    if (state.formConf.popupType === 'fullScreen') return closePopup();
    if (state.formConf.popupType === 'drawer') return closeDrawer();
    closeModal();
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
    emit('close');
    return true;
  }
</script>
