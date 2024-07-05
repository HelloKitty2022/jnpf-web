<template>
  <div class="common-container">
    <a-button :type="buttonType" :pre-icon="showIcon ? 'icon-ym icon-ym-btn-upload' : ''" @click="openModal">
      {{ buttonText || t('common.importText') }}
    </a-button>
    <a-modal
      v-model:visible="visible"
      :title="buttonText || t('common.importText')"
      :width="600"
      centered
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirmLoading="confirmLoading"
      :maskClosable="false"
      destroyOnClose>
      <template #closeIcon>
        <ModalClose :canFullscreen="false" @cancel="handleCancel" />
      </template>
      <div class="px-10 py-20px">
        <a-form :colon="false" labelAlign="right" :labelCol="{ style: { width: '90px' } }" :model="dataForm" :rules="rules" ref="formElRef">
          <a-form-item label="上级菜单" name="parentId" v-if="type == 'menu'">
            <jnpf-tree-select v-model:value="dataForm.parentId" :options="treeOptions" placeholder="请选择" :lastLevel="props.data.category == 'App'" />
          </a-form-item>
          <a-form-item label="识别重复" name="type" v-if="!getIsHideType">
            <a-radio-group v-model:value="dataForm.type" class="common-radio">
              <a-radio :value="0">跳过<BasicHelp text="当导入数据不存在，作为新数据导入；数据已存在，不做处理" /></a-radio>
              <a-radio :value="1">追加<BasicHelp text="当导入数据已存在，增加相同记录新数据，名称和编码自动增加随机码" /></a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="上传文件" name="fileList">
            <a-upload :file-list="dataForm.fileList" :accept="accept" :before-upload="beforeUpload" @remove="handleRemove">
              <a-button preIcon="icon-ym icon-ym-btn-upload" @click="uploadFile">上传文件</a-button>
              <div class="upload-file__tip">{{ getTipText }}</div>
            </a-upload>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, toRefs, computed } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Modal as AModal } from 'ant-design-vue';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import type { FormInstance } from 'ant-design-vue';
  import { upload } from '/@/api/basic/common';
  import { getMenuSelector } from '/@/api/system/menu';

  interface State {
    dataForm: any;
    rules: any;
    visible: boolean;
    treeOptions: any[];
    confirmLoading: boolean;
  }

  defineOptions({ name: 'JnpfUploadBtn', inheritAttrs: false });
  const props = defineProps({
    url: { type: String, default: '' },
    buttonText: { type: String, default: '' },
    buttonType: { type: String, default: 'link' },
    data: { type: Object, default: () => {} },
    showIcon: { type: Boolean, default: true },
    accept: { type: String, default: '*' },
    type: { type: String, default: '' },
  });
  const emit = defineEmits(['on-success']);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const fileUploaderRef = ref<any>(null);
  const formElRef = ref<FormInstance>();
  const state = reactive<State>({
    dataForm: {
      type: 0,
      parentId: '',
      fileList: [],
    },
    rules: {
      parentId: [{ required: true, message: '必填', trigger: 'change' }],
      type: [{ required: true, message: '必填', trigger: 'change', type: 'number' }],
      fileList: [{ required: true, message: '必填', trigger: 'change' }],
    },
    visible: false,
    treeOptions: [],
    confirmLoading: false,
  });
  const { dataForm, rules, visible, treeOptions, confirmLoading } = toRefs(state);
  const hideList = ['/system/DataModel', '/system/DataInterfaceVariate'];

  const getTipText = computed(() => `一次只能导入一个文件，文件后缀名必须是${props.accept}。`);
  const getIsHideType = computed(() => hideList.some(o => props.url.indexOf(o) > -1));

  function openModal() {
    state.confirmLoading = false;
    state.visible = true;
    state.dataForm = {
      type: 0,
      parentId: '',
      fileList: [],
    };
    if (props.type == 'menu') getMenuSelectorList();
  }
  function getMenuSelectorList() {
    getMenuSelector({ category: props.data.category }, '', props.data.systemId).then(res => {
      state.treeOptions = [
        {
          fullName: '顶级节点',
          hasChildren: true,
          id: '-1',
          children: res.data.list,
        },
      ];
    });
  }
  async function handleSubmit() {
    try {
      const values = await formElRef.value?.validate();
      if (!values) return;
      if (!props.url) return;
      const formData = new FormData();
      formData.append('file', state.dataForm.fileList[0]);
      formData.append('type', values.type);
      for (let [key, value] of Object.entries(props.data || {})) {
        formData.append(key, value);
      }
      if (props.type == 'menu') formData.append('parentId', values.parentId);
      state.confirmLoading = true;
      upload(props.url, formData)
        .then(res => {
          createMessage.success(res.msg);
          emit('on-success');
          state.confirmLoading = false;
          state.visible = false;
        })
        .catch(() => {
          state.confirmLoading = false;
        });
    } catch (_) {}
  }
  function handleCancel() {
    state.visible = false;
  }
  function uploadFile() {
    fileUploaderRef.value?.openUploader();
  }
  function handleRemove() {
    state.dataForm.fileList = [];
  }
  function beforeUpload(file) {
    const isAccept = checkAccept(file);
    if (!isAccept) {
      createMessage.error({ content: `请选择${props.accept}类型的文件`, key: 'upload' });
      return isAccept;
    }
    state.dataForm.fileList = [file];
    return false;
  }
  // 校验格式
  function checkAccept(file) {
    if (!props.accept || props.accept === '*') return true;
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    if (props.accept.indexOf(extension) > -1) return true;
    return false;
  }
</script>
<style lang="less" scoped>
  .upload-file__tip {
    line-height: 1.2;
    color: @text-color-secondary;
    margin-top: 5px;
    font-size: 12px;
    word-break: break-all;
  }
</style>
