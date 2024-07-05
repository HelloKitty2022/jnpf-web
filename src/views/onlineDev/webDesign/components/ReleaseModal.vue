<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="发布" @ok="handleSubmit" class="jnpf-release-modal">
    <a-alert message="将该功能的按钮、列表、表单及数据权限发布至应用菜单" type="warning" show-icon />
    <a-form class="release-main" :colon="false" :model="dataForm" :rules="rules" layout="vertical" ref="formElRef">
      <div class="release-item">
        <a-form-item>
          <div class="top-item" :class="{ active: dataForm.pc === 1 }" @click="selectToggle('pc')">
            <i class="item-icon icon-ym icon-ym-pc"></i>
            <p class="item-title">桌面端</p>
            <div class="icon-checked">
              <check-outlined />
            </div>
          </div>
        </a-form-item>
        <a-form-item label="上级" name="pcModuleParentId" v-if="dataForm.pc">
          <JnpfTreeSelect
            v-model:value="pcModuleParentId"
            :options="treeData"
            treeCheckStrictly
            multiple
            :dropdownMatchSelectWidth="false"
            @change="onPcChange" />
        </a-form-item>
        <a-form-item label="已发布菜单路径" v-if="record.pcIsRelease">
          <div class="released">{{ record.pcReleaseName }}</div>
        </a-form-item>
      </div>
      <div class="release-item">
        <a-form-item>
          <div class="top-item" :class="{ active: dataForm.app === 1 }" @click="selectToggle('app')">
            <i class="item-icon icon-ym icon-ym-mobile"></i>
            <p class="item-title">移动端</p>
            <div class="icon-checked">
              <check-outlined />
            </div>
          </div>
        </a-form-item>
        <a-form-item label="上级" name="appModuleParentId" v-if="dataForm.app">
          <JnpfTreeSelect
            v-model:value="appModuleParentId"
            :options="appTreeData"
            treeCheckStrictly
            multiple
            :dropdownMatchSelectWidth="false"
            @change="onAppChange" />
        </a-form-item>
        <a-form-item label="已发布菜单路径" v-if="record.appIsRelease">
          <div class="released">{{ record.appReleaseName }}</div>
        </a-form-item>
      </div>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { release } from '/@/api/onlineDev/visualDev';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, reactive, toRefs, nextTick, computed } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { CheckOutlined } from '@ant-design/icons-vue';
  import { getMenuSelectorFilter } from '/@/api/system/menu';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    dataForm: any;
    record: any;
    treeData: any[];
    appTreeData: any[];
    pcModuleParentId: any[];
    appModuleParentId: any[];
  }

  const emit = defineEmits(['register', 'reload']);
  const { createMessage, createConfirm } = useMessage();
  const { t } = useI18n();
  const [registerModal, { changeOkLoading, closeModal }] = useModalInner(init);
  const formElRef = ref<FormInstance>();
  const state = reactive<State>({
    dataForm: {
      pc: 1,
      app: 1,
      pcModuleParentId: [],
      appModuleParentId: [],
    },
    record: {},
    treeData: [],
    appTreeData: [],
    pcModuleParentId: [],
    appModuleParentId: [],
  });
  const { dataForm, record, treeData, appTreeData, pcModuleParentId, appModuleParentId } = toRefs(state);

  const rules = computed(() => {
    let rules: any = {
      pcModuleParentId: [],
      appModuleParentId: [],
    };
    if (!state.record.pcIsRelease) rules.pcModuleParentId = [{ required: true, message: '必填', trigger: 'change', type: 'array' }];
    if (!state.record.appIsRelease) rules.appModuleParentId = [{ required: true, message: '必填', trigger: 'change', type: 'array' }];
    return rules;
  });

  function init(data) {
    state.pcModuleParentId = [];
    state.appModuleParentId = [];
    state.record = data;
    const platformRelease = data.platformRelease ? JSON.parse(data.platformRelease) : {};
    state.dataForm = {
      pc: platformRelease.pc === 0 ? 0 : 1,
      app: platformRelease.app === 0 ? 0 : 1,
      pcModuleParentId: [],
      appModuleParentId: [],
    };
    getMenuOptions(data.id);
    getAppMenuOptions(data.id);
    nextTick(() => {
      formElRef.value?.clearValidate();
    });
  }
  function getMenuOptions(id) {
    getMenuSelectorFilter({ category: 'Web' }, id).then(res => {
      state.treeData = res.data.list;
    });
  }
  function getAppMenuOptions(id) {
    getMenuSelectorFilter({ category: 'App' }, id).then(res => {
      let list = res.data.list || [];
      for (let index = 0; index < list.length; index++) {
        const item = list[index];
        if (item.type == 0) item.disabled = true;
      }
      state.appTreeData = list;
    });
  }
  function onPcChange(data) {
    state.dataForm.pcModuleParentId = data.map(o => o.value);
  }
  function onAppChange(data) {
    state.dataForm.appModuleParentId = data.map(o => o.value);
  }
  function selectToggle(key) {
    state.dataForm[key] = state.dataForm[key] === 1 ? 0 : 1;
  }
  async function handleSubmit() {
    try {
      if (!state.dataForm.pc && !state.dataForm.app) return createMessage.error('请至少选择一种发布类型');
      const values = await formElRef.value?.validate();
      if (!values) return;
      const platform = { pc: state.dataForm.pc, app: state.dataForm.app };
      const query = { ...state.dataForm, platformRelease: JSON.stringify(platform) };
      const handleRelease = () => {
        changeOkLoading(true);
        release(state.record.id, query)
          .then(res => {
            changeOkLoading(false);
            createMessage.success(res.msg);
            emit('reload');
            closeModal();
          })
          .catch(() => {
            changeOkLoading(false);
          });
      };
      if (!state.record.isRelease) return handleRelease();
      createConfirm({
        iconType: 'warning',
        title: t('common.tipTitle'),
        content: '发布确定后会覆盖当前线上版本且进行菜单同步，是否继续?',
        onOk: handleRelease,
      });
    } catch (_) {}
  }
</script>
