<template>
  <div class="common-container">
    <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="openSelectModal">选择产品</a-button>
    <a-modal
      v-model:visible="visible"
      title="选择产品"
      :width="1000"
      class="common-container-modal"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :maskClosable="false"
      destroy-on-close>
      <template #closeIcon>
        <ModalClose :canFullscreen="false" @cancel="handleCancel" />
      </template>
      <div class="jnpf-content-wrapper">
        <div class="jnpf-content-wrapper-left">
          <BasicLeftTree ref="leftTreeRef" :showSearch="false" :treeData="treeData" :loading="treeLoading" @select="handleTreeSelect" />
        </div>
        <div class="jnpf-content-wrapper-center">
          <div class="jnpf-content-wrapper-content">
            <BasicTable @register="registerTable" :searchInfo="searchInfo" class="jnpf-sub-table"></BasicTable>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { Form, Modal as AModal } from 'ant-design-vue';
  import { reactive, ref, unref, nextTick } from 'vue';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { BasicLeftTree, TreeActionType } from '/@/components/Tree';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { getGoodsList, getProductClassify } from '/@/api/extend/saleOrder';

  defineOptions({ inheritAttrs: false });
  const emit = defineEmits(['update:value', 'change']);
  const formItemContext = Form.useInjectFormItemContext();
  const visible = ref(false);
  const columns: BasicColumn[] = [
    { title: '产品编码', dataIndex: 'code' },
    { title: '产品名称', dataIndex: 'fullName' },
    { title: '库存', dataIndex: 'qty' },
  ];
  const searchInfo = reactive({
    classifyId: '',
  });
  const leftTreeRef = ref<Nullable<TreeActionType>>(null);
  const treeLoading = ref(false);
  const treeData = ref<any[]>([]);
  const [registerTable, { getForm, getSelectRows, getSelectRowKeys }] = useTable({
    api: getGoodsList,
    columns,
    immediate: false,
    useSearchForm: true,
    formConfig: {
      baseColProps: { span: 8 },
      schemas: [
        {
          field: 'code',
          label: '产品编号',
          component: 'Input',
          componentProps: {
            placeholder: '请输入',
          },
        },
        {
          field: 'fullName',
          label: '产品名称',
          component: 'Input',
          componentProps: {
            placeholder: '请输入',
          },
        },
      ],
    },
    tableSetting: { size: false, setting: false },
    isCanResizeParent: true,
    resizeHeightOffset: -74,
    rowSelection: { type: 'checkbox' },
  });

  async function openSelectModal() {
    visible.value = true;
    treeLoading.value = true;
    getProductClassify().then(res => {
      treeLoading.value = false;
      treeData.value = res.data.list || [];
      searchInfo.classifyId = treeData.value[0].children[0].id;
      nextTick(() => {
        const leftTree = unref(leftTreeRef);
        leftTree?.setSelectedKeys([searchInfo.classifyId]);
        getForm().resetFields();
      });
    });
  }
  function handleTreeSelect(id) {
    if (!id || searchInfo.classifyId === id) return;
    searchInfo.classifyId = id;
    getForm().resetFields();
  }
  function handleCancel() {
    visible.value = false;
  }
  function handleSubmit() {
    if (!getSelectRowKeys().length && !getSelectRows().length) return;
    if (!getSelectRows().length) {
      emit('change', getSelectRows(), searchInfo.classifyId);
      formItemContext.onFieldChange();
      handleCancel();
      return;
    }
    const selectRow = getSelectRows();
    emit('change', selectRow, searchInfo.classifyId);
    formItemContext.onFieldChange();
    handleCancel();
  }
</script>
