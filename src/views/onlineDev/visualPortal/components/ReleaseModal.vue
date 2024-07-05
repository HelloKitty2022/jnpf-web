<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="发布" @ok="handleSubmit" class="jnpf-release-modal">
    <a-form :colon="false" :model="dataForm" :rules="rules" layout="vertical" ref="formElRef">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="first" tab="主页门户">
          <a-alert message="将该门户发布至应用主页门户" type="warning" show-icon />
          <div class="release-main">
            <div class="release-item">
              <a-form-item>
                <div class="top-item" :class="{ active: dataForm.pcPortal === 1 }" @click="selectToggle('pcPortal')">
                  <i class="item-icon icon-ym icon-ym-pc"></i>
                  <p class="item-title">桌面端</p>
                  <div class="icon-checked">
                    <check-outlined />
                  </div>
                </div>
              </a-form-item>
              <a-form-item label="应用" name="pcPortalSystemId" v-if="dataForm.pcPortal">
                <JnpfSelect v-model:value="dataForm.pcPortalSystemId" :options="treeData" multiple allowClear />
              </a-form-item>
              <a-form-item label="已发布应用" v-if="record.pcPortalIsRelease">
                <div class="released">{{ record.pcPortalReleaseName }}</div>
              </a-form-item>
            </div>
            <div class="release-item">
              <a-form-item>
                <div class="top-item" :class="{ active: dataForm.appPortal === 1 }" @click="selectToggle('appPortal')">
                  <i class="item-icon icon-ym icon-ym-mobile"></i>
                  <p class="item-title">移动端</p>
                  <div class="icon-checked">
                    <check-outlined />
                  </div>
                </div>
              </a-form-item>
              <a-form-item label="应用" name="appPortalSystemId" v-if="dataForm.appPortal">
                <JnpfSelect v-model:value="dataForm.appPortalSystemId" :options="treeAppData" multiple allowClear />
              </a-form-item>
              <a-form-item label="已发布应用" v-if="record.appPortalIsRelease">
                <div class="released">{{ record.appPortalReleaseName }}</div>
              </a-form-item>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="second" tab="应用菜单" force-render>
          <a-alert message="将该门户发布至应用菜单" type="warning" show-icon />
          <div class="release-main">
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
                  :options="menuTreeData"
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
                  :options="appMenuTreeData"
                  treeCheckStrictly
                  multiple
                  :dropdownMatchSelectWidth="false"
                  @change="onAppChange" />
              </a-form-item>
              <a-form-item label="已发布菜单路径" v-if="record.appIsRelease">
                <div class="released">{{ record.appReleaseName }}</div>
              </a-form-item>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { release, getSystemListFilter } from '/@/api/onlineDev/portal';
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
    treeAppData: any[];
    menuTreeData: any[];
    appMenuTreeData: any[];
    pcModuleParentId: any[];
    appModuleParentId: any[];
    activeKey: String;
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
      pcPortal: 1,
      appPortal: 1,
      pcPortalSystemId: [],
      appPortalSystemId: [],
    },
    record: {},
    treeData: [],
    treeAppData: [],
    menuTreeData: [],
    appMenuTreeData: [],
    pcModuleParentId: [],
    appModuleParentId: [],
    activeKey: 'first',
  });
  const { dataForm, record, treeData, treeAppData, menuTreeData, appMenuTreeData, activeKey, pcModuleParentId, appModuleParentId } = toRefs(state);

  const rules = computed(() => {
    let rules: any = {
      pcModuleParentId: [],
      appModuleParentId: [],
      pcPortalSystemId: [],
      appPortalSystemId: [],
    };
    if (!state.record.pcPortalIsRelease) rules.pcPortalSystemId = [{ required: true, message: '必填', trigger: 'change', type: 'array' }];
    if (!state.record.appPortalIsRelease) rules.appPortalSystemId = [{ required: true, message: '必填', trigger: 'change', type: 'array' }];
    if (!state.record.pcIsRelease) rules.pcModuleParentId = [{ required: true, message: '必填', trigger: 'change', type: 'array' }];
    if (!state.record.appIsRelease) rules.appModuleParentId = [{ required: true, message: '必填', trigger: 'change', type: 'array' }];
    return rules;
  });
  function init(data) {
    state.activeKey = 'first';
    state.pcModuleParentId = [];
    state.appModuleParentId = [];
    state.record = data;
    const platformRelease = data.platformRelease ? JSON.parse(data.platformRelease) : {};
    state.dataForm = {
      pc: platformRelease.pc === 0 ? 0 : 1,
      app: platformRelease.app === 0 ? 0 : 1,
      pcModuleParentId: [],
      appModuleParentId: [],
      pcPortal: platformRelease.pcPortal === 0 ? 0 : 1,
      appPortal: platformRelease.appPortal === 0 ? 0 : 1,
      pcPortalSystemId: [],
      appPortalSystemId: [],
    };
    getSystemOptions(data.id);
    getAppSystemOptions(data.id);
    getMenuOptions(data.id);
    getAppMenuOptions(data.id);
    nextTick(() => {
      formElRef.value?.clearValidate();
    });
  }
  function getSystemOptions(id) {
    getSystemListFilter({ category: 'Web' }, id).then(res => {
      state.treeData = res.data.list || [];
    });
  }
  function getAppSystemOptions(id) {
    getSystemListFilter({ category: 'App' }, id).then(res => {
      state.treeAppData = res.data.list || [];
    });
  }
  function selectToggle(key) {
    state.dataForm[key] = state.dataForm[key] === 1 ? 0 : 1;
  }
  async function handleSubmit() {
    try {
      if (!state.dataForm.pc && !state.dataForm.app && !state.dataForm.pcPortal && !state.dataForm.appPortal)
        return createMessage.error('请至少选择一种发布类型');
      const values = await formElRef.value?.validate();
      if (!values) return;
      const platform = {
        pc: state.dataForm.pc,
        app: state.dataForm.app,
        pcPortal: state.dataForm.pcPortal,
        appPortal: state.dataForm.appPortal,
      };
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
        content: '发布确定后会覆盖当前线上版本且进行门户同步，是否继续?',
        onOk: handleRelease,
      });
    } catch (_) {
      if (
        (state.dataForm.pcPortalSystemId.length || !state.dataForm.pcPortal) &&
        (state.dataForm.appPortalSystemId.length || !state.dataForm.appPortal) &&
        !state.dataForm.pcModuleParentId.length &&
        !state.dataForm.appModuleParentId.length
      )
        return createMessage.error('应用菜单的上级必填');
      if (
        !state.dataForm.pcPortalSystemId.length &&
        !state.dataForm.appPortalSystemId.length &&
        (state.dataForm.pcModuleParentId.length || !state.dataForm.pc) &&
        (state.dataForm.appModuleParentId.length || !state.dataForm.app)
      )
        return createMessage.error('主页门户的应用必填');
    }
  }
  function getMenuOptions(id) {
    getMenuSelectorFilter({ category: 'Web' }, id).then(res => {
      state.menuTreeData = res.data.list || [];
    });
  }
  function getAppMenuOptions(id) {
    getMenuSelectorFilter({ category: 'App' }, id).then(res => {
      state.appMenuTreeData = res.data.list || [];
      for (let index = 0; index < state.appMenuTreeData.length; index++) {
        const item = state.appMenuTreeData[index];
        if (item.type == 0) item.disabled = true;
      }
    });
  }
  function onPcChange(data) {
    state.dataForm.pcModuleParentId = data.map(o => o.value);
  }
  function onAppChange(data) {
    state.dataForm.appModuleParentId = data.map(o => o.value);
  }
</script>
