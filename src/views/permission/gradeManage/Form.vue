<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" :width="900" @ok="handleSubmit" class="grade-modal">
    <a-form :colon="false" :labelCol="{ style: { width: '100px' } }" :model="dataForm" :rules="dataRule" ref="formElRef">
      <a-form-item label="管理组" name="managerGroup">
        <a-input v-model:value="dataForm.managerGroup" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="管理员" name="userId">
        <jnpf-user-select v-model:value="dataForm.userId" placeholder="请选择" @change="onChange" :disabled="!!dataForm.id" v-if="getIsAdmin" />
        <grade-user-select v-model:value="dataForm.userId" placeholder="请选择" @change="onChange" :disabled="!!dataForm.id" v-else />
      </a-form-item>
    </a-form>
    <a-tabs v-model:activeKey="activeName">
      <a-tab-pane key="module" tab="开发平台"></a-tab-pane>
      <a-tab-pane key="system" tab="应用权限"></a-tab-pane>
      <a-tab-pane key="gradeManage" tab="组织权限"></a-tab-pane>
    </a-tabs>
    <a-table
      :data-source="orgAdminList"
      :columns="columns"
      size="small"
      :pagination="false"
      rowKey="organizeId"
      defaultExpandAllRows
      :scroll="{ y: '400px' }"
      v-loading="loading"
      :key="key"
      v-if="activeName === 'gradeManage'">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'fullName'">
          <i :class="record.icon"></i>
          {{ record.fullName }}
        </template>
        <template v-if="column.key === 'thisLayer'">
          <JnpfCheckboxSingle label="查看" checked disabled v-if="record.thisLayerSelect === 2" />
          <JnpfCheckboxSingle label="查看" disabled v-if="record.thisLayerSelect === 3" />
          <template v-if="record.thisLayerSelect === 0 || record.thisLayerSelect === 1">
            <JnpfCheckboxSingle label="查看" v-model:value="record.thisLayerSelect" @change="onThisLayerSelectChange($event, record)" />
          </template>
          <JnpfCheckboxSingle label="添加" checked disabled v-if="record.thisLayerAdd === 2" />
          <JnpfCheckboxSingle label="添加" disabled v-if="record.thisLayerAdd === 3" />
          <template v-if="record.thisLayerAdd === 0 || record.thisLayerAdd === 1">
            <JnpfCheckboxSingle label="添加" v-model:value="record.thisLayerAdd" :disabled="!record.thisLayerSelect" />
          </template>
          <JnpfCheckboxSingle label="编辑" checked disabled v-if="record.thisLayerEdit === 2" />
          <JnpfCheckboxSingle label="编辑" disabled v-if="record.thisLayerEdit === 3" />
          <template v-if="record.thisLayerEdit === 0 || record.thisLayerEdit === 1">
            <JnpfCheckboxSingle label="编辑" v-model:value="record.thisLayerEdit" :disabled="!record.thisLayerSelect" />
          </template>
          <JnpfCheckboxSingle label="删除" checked disabled v-if="record.thisLayerDelete === 2" />
          <JnpfCheckboxSingle label="删除" disabled v-if="record.thisLayerDelete === 3" />
          <template v-if="record.thisLayerDelete === 0 || record.thisLayerDelete === 1">
            <JnpfCheckboxSingle label="删除" v-model:value="record.thisLayerDelete" :disabled="!record.thisLayerSelect" />
          </template>
        </template>
        <template v-if="column.key === 'subLayer'">
          <JnpfCheckboxSingle label="查看" checked disabled v-if="record.subLayerSelect === 2" />
          <JnpfCheckboxSingle label="查看" disabled v-if="record.subLayerSelect === 3" />
          <template v-if="record.subLayerSelect === 0 || record.subLayerSelect === 1">
            <JnpfCheckboxSingle label="查看" v-model:value="record.subLayerSelect" @change="onSubLayerSelectChange($event, record)" />
          </template>
          <JnpfCheckboxSingle label="添加" checked disabled v-if="record.subLayerAdd === 2" />
          <JnpfCheckboxSingle label="添加" disabled v-if="record.subLayerAdd === 3" />
          <template v-if="record.subLayerAdd === 0 || record.subLayerAdd === 1">
            <JnpfCheckboxSingle label="添加" v-model:value="record.subLayerAdd" :disabled="!record.subLayerSelect" />
          </template>
          <JnpfCheckboxSingle label="编辑" checked disabled v-if="record.subLayerEdit === 2" />
          <JnpfCheckboxSingle label="编辑" disabled v-if="record.subLayerEdit === 3" />
          <template v-if="record.subLayerEdit === 0 || record.subLayerEdit === 1">
            <JnpfCheckboxSingle label="编辑" v-model:value="record.subLayerEdit" :disabled="!record.subLayerSelect" />
          </template>
          <JnpfCheckboxSingle label="删除" checked disabled v-if="record.subLayerDelete === 2" />
          <JnpfCheckboxSingle label="删除" disabled v-if="record.subLayerDelete === 3" />
          <template v-if="record.subLayerDelete === 0 || record.subLayerDelete === 1">
            <JnpfCheckboxSingle label="删除" v-model:value="record.subLayerDelete" :disabled="!record.subLayerSelect" />
          </template>
        </template>
      </template>
    </a-table>
    <BasicTree
      v-else
      ref="treeRef"
      defaultExpandAll
      checkable
      clickRowToExpand
      :treeData="getTreeData"
      :loading="loading"
      :fieldNames="{ key: 'id' }"
      :key="key + 1"
      @check="handleTreeCheck" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { getSelectorOrgList, create } from '/@/api/permission/gradeManage';
  import { ref, computed, reactive, toRefs, nextTick, watch, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import type { FormInstance } from 'ant-design-vue';
  import GradeUserSelect from './GradeUserSelect.vue';
  import { BasicTree, TreeActionType } from '/@/components/Tree';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    dataForm: any;
    dataRule: any;
    loading: boolean;
    key: number;
    moduleIds: any[];
    modulePermissionList: any[];
    orgAdminList: any[];
    systemIds: any[];
    systemPermissionList: any[];
    activeName: string;
  }

  const emit = defineEmits(['register', 'reload']);
  const formElRef = ref<FormInstance>();
  const columns = [
    { title: '组织架构', dataIndex: 'fullName', key: 'fullName' },
    { title: '组织操作权限(本层级)', dataIndex: 'thisLayer', key: 'thisLayer', width: 280 },
    { title: '子组织操作权限(子层级)', dataIndex: 'subLayer', key: 'subLayer', width: 280 },
  ];
  const state = reactive<State>({
    dataForm: {
      id: '',
      userId: '',
      managerGroup: '',
    },
    dataRule: {
      userId: [{ required: true, message: '必填', trigger: 'change' }],
      managerGroup: [{ required: true, message: '必填', trigger: 'blur' }],
    },
    loading: false,
    key: +new Date(),
    moduleIds: [],
    modulePermissionList: [],
    orgAdminList: [],
    systemIds: [],
    systemPermissionList: [],
    activeName: 'module',
  });
  const { dataForm, dataRule, orgAdminList, loading, key, activeName } = toRefs(state);
  const treeRef = ref<Nullable<TreeActionType>>(null);
  const [registerModal, { closeModal, changeOkLoading }] = useModalInner(init);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const userStore = useUserStore();

  const getTitle = computed(() => (!state.dataForm.id ? t('common.addText') : t('common.editText')));
  const getIsAdmin = computed(() => !!userStore.getUserInfo?.isAdministrator);
  const getTreeData = computed(() => state[state.activeName + 'PermissionList']);

  watch(
    () => state.activeName,
    () => setTreeCheckedKeys(),
  );

  function init(data) {
    state.dataForm.id = data.id;
    state.dataForm.userId = data.id || '';
    state.dataForm.managerGroup = '';
    state.activeName = 'module';
    nextTick(() => {
      formElRef.value?.clearValidate();
      initData(true);
    });
  }
  function onChange(val) {
    if (!val) return;
    initData();
  }
  function initData(isInit = false) {
    state.loading = true;
    getSelectorOrgList(state.dataForm.userId)
      .then(res => {
        state.moduleIds = res.data.moduleIds || [];
        state.modulePermissionList = res.data.modulePermissionList || [];
        state.systemIds = res.data.systemIds || [];
        state.systemPermissionList = res.data.systemPermissionList || [];
        state.orgAdminList = res.data.orgAdminList || [];
        if (isInit) state.dataForm.managerGroup = res.data.managerGroup || '';
        state.loading = false;
        state.key = +new Date();
        setTreeCheckedKeys();
      })
      .catch(() => {
        state.loading = false;
        state.dataForm.userId = '';
        state.dataForm.managerGroup = '';
      });
  }
  function setTreeCheckedKeys() {
    if (state.activeName === 'gradeManage') return;
    state.key = +new Date();
    nextTick(() => {
      const list = getTree().getParentKeys();
      const keys = state.activeName === 'module' ? state.moduleIds.filter(id => !list.includes(id)) : state.systemIds;
      getTree().setCheckedKeys(keys);
    });
  }
  function getTree() {
    const tree = unref(treeRef);
    if (!tree) throw new Error('tree is null!');
    return tree;
  }
  function handleTreeCheck() {
    const childrenIds: any[] = (getTree().getCheckedKeys() as any[]) || [];
    const parentIds: any[] = (getTree().getHalfCheckedKeys() as any[]) || [];
    const ids = [...parentIds, ...childrenIds];
    state[state.activeName + 'Ids'] = ids;
  }
  function onThisLayerSelectChange(val, record) {
    if (val) return;
    if (record.thisLayerAdd === 1) record.thisLayerAdd = 0;
    if (record.thisLayerEdit === 1) record.thisLayerEdit = 0;
    if (record.thisLayerDelete === 1) record.thisLayerDelete = 0;
  }
  function onSubLayerSelectChange(val, record) {
    if (val) return;
    if (record.subLayerAdd === 1) record.subLayerAdd = 0;
    if (record.subLayerEdit === 1) record.subLayerEdit = 0;
    if (record.subLayerDelete === 1) record.subLayerDelete = 0;
  }
  async function handleSubmit() {
    try {
      const values = await formElRef.value?.validate();
      if (!values) return;
      changeOkLoading(true);
      const query = { ...state.dataForm, orgAdminModel: state.orgAdminList, systemIds: state.systemIds, moduleIds: state.moduleIds };
      create(query)
        .then(res => {
          createMessage.success(res.msg);
          changeOkLoading(false);
          closeModal();
          emit('reload');
        })
        .catch(() => {
          changeOkLoading(false);
        });
    } catch (_) {}
  }
</script>
<style lang="less">
  .grade-modal {
    .jnpf-tree,
    .ant-table {
      height: 439px;
      overflow: auto;
    }

    .ant-modal-body > .scrollbar {
      padding: 20px !important;
    }
  }
</style>
