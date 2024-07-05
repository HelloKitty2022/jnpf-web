<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="流程评论" @ok="handleSubmit" destroyOnClose>
    <a-form :colon="false" :model="dataForm" :rules="dataRule" ref="formElRef">
      <a-form-item name="text">
        <jnpf-textarea v-model:value="dataForm.text" placeholder="请输入评论" />
      </a-form-item>
      <a-form-item>
        <a-upload
          v-model:file-list="imgList"
          accept="image/*"
          :show-upload-list="false"
          multiple
          :max-count="9"
          :action="getAction"
          :headers="getHeaders"
          :before-upload="beforeUpload"
          @change="handleChange">
          <a-button preIcon="icon-ym icon-ym-file-image">图片</a-button>
        </a-upload>
        <a-button preIcon="icon-ym icon-ym-btn-upload" class="ml-20px" @click="uploadFile">附件</a-button>
      </a-form-item>
      <a-form-item v-if="dataForm.image.length">
        <div class="img-list">
          <div class="img-item" v-for="(item, i) in dataForm.image" :key="i">
            <img :src="apiUrl + item.url" class="img-item" @click="handlePreview(i)" />
            <div class="badge" @click.stop="handleImgRemove(i)">
              <i class="icon-ym icon-ym-nav-close"></i>
            </div>
          </div>
        </div>
      </a-form-item>
      <a-form-item>
        <jnpf-upload-file ref="uploadFileRef" v-model:value="dataForm.file" type="workFlow" :limit="2" detailed class="comment-upload-file" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive, ref, toRefs, nextTick, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { createComment } from '/@/api/workFlow/flowEngine';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Upload as AUpload } from 'ant-design-vue';
  import { createImgPreview } from '/@/components/Preview/index';
  import { useGlobSetting } from '/@/hooks/setting';
  import { getToken } from '/@/utils/auth';
  import type { UploadChangeParam, UploadFile } from 'ant-design-vue';

  interface State {
    dataForm: any;
    dataRule: any;
    imgList: UploadFile[];
    imgUploading: boolean;
  }

  const props = defineProps({
    id: { type: String, default: '' },
  });
  const emit = defineEmits(['register', 'reload']);
  const formElRef = ref<FormInstance>();
  const state = reactive<State>({
    dataForm: {
      text: '',
      file: [],
      image: [],
    },
    dataRule: {
      // text: [{ required: true, message: '请输入评论', trigger: 'blur' }],
    },
    imgList: [],
    imgUploading: false,
  });
  const { dataForm, dataRule, imgList } = toRefs(state);
  const { createMessage } = useMessage();
  const globSetting = useGlobSetting();
  const apiUrl = ref(globSetting.apiUrl);
  const uploadFileRef = ref<any>(null);
  const [registerModal, { changeOkLoading, closeModal }] = useModalInner(init);

  const getAction = computed(() => globSetting.uploadUrl + '/annexpic');
  const getHeaders = computed(() => ({ Authorization: getToken() as string }));

  function init() {
    changeOkLoading(false);
    state.dataForm = {
      text: '',
      file: [],
      image: [],
    };
    state.imgList = [];
    nextTick(() => {
      formElRef.value?.clearValidate();
    });
  }
  function beforeUpload(file) {
    const isTopLimit = state.dataForm.image.length >= 9;
    if (isTopLimit) {
      createMessage.error(`当前限制最多可以上传9张图片`);
      return false;
    }
    const isRightSize = file.size < 50 * 1024 * 1024;
    if (!isRightSize) {
      createMessage.error(`图片大小超过50MB`);
      return isRightSize;
    }
    let isAccept = new RegExp('image/*').test(file.type);
    if (!isAccept) {
      createMessage.error(`请上传图片`);
      return isAccept;
    }
    return isRightSize && isAccept;
  }
  function handleChange({ file }: UploadChangeParam) {
    if (file.status === 'uploading') return (state.imgUploading = true);
    if (file.status === 'error') {
      state.imgUploading = false;
      state.imgList.filter(o => o.uid != file.uid);
      createMessage.error('上传失败');
      return;
    }
    if (file.status === 'done') {
      state.imgUploading = false;
      if (file.response.code === 200) {
        const isTopLimit = state.dataForm.image.length >= 9;
        if (isTopLimit) {
          createMessage.error(`当前限制最多可以上传9张图片`);
          return false;
        }
        state.dataForm.image.push({
          name: file.name,
          fileId: file.response.data.name,
          url: file.response.data.url,
        });
      } else {
        state.imgList.filter(o => o.uid != file.uid);
        createMessage.error(file.response.msg);
      }
    }
  }
  function handleImgRemove(index) {
    state.dataForm.image.splice(index, 1);
    state.imgList.splice(index, 1);
  }
  function handlePreview(index) {
    const imageList = state.dataForm.image.map(o => apiUrl.value + o.url);
    createImgPreview({ imageList: imageList, index });
  }
  function uploadFile() {
    if (state.dataForm.file.length >= 2) return createMessage.error('最多只能上传两个附件');
    uploadFileRef.value?.uploadFile();
  }
  async function handleSubmit() {
    try {
      const values = await formElRef.value?.validate();
      if (!values) return;
      changeOkLoading(true);
      let query = {
        text: state.dataForm.text,
        file: JSON.stringify(state.dataForm.file),
        image: JSON.stringify(state.dataForm.image),
        taskId: props.id,
      };
      createComment(query).then(res => {
        createMessage.success(res.msg);
        setTimeout(() => {
          changeOkLoading(false);
          closeModal();
          emit('reload');
        }, 200);
      });
    } catch (_) {}
  }
</script>
<style lang="less" scoped>
  .comment-upload-file {
    :deep(.anticon-close) {
      display: block !important;
    }
    :deep(.upload-file-list__item) {
      margin-top: 5px !important;
    }
  }
  .img-list {
    display: flex;
    .img-item {
      width: 40px;
      height: 40px;
      position: relative;
      margin-right: 10px;
      cursor: pointer;
      object-fit: cover;

      .badge {
        background-color: @error-color;
        border-radius: 10px;
        color: #fff;
        font-size: 12px;
        height: 18px;
        width: 18px;
        line-height: 18px;
        border: 1px solid #fff;
        position: absolute;
        right: -9px;
        top: -9px;
        cursor: pointer;
        z-index: 100;
        display: flex;
        justify-content: center;
        align-items: center;
        .icon-ym {
          font-size: 12px;
          transform: scale(0.7);
          display: inline-block;
        }
      }
    }
  }
</style>
