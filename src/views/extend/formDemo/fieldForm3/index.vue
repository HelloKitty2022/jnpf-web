<template>
  <div class="jnpf-content-wrapper jnpf-content-wrapper-form">
    <div class="jnpf-content-wrapper-form-body px-10px">
      <ScrollContainer>
        <div class="my-10px">
          <a-alert message="单附件上传、图片上传组件" type="warning" :show-icon="false" />
        </div>
        <a-form :colon="false" :labelCol="{ style: { width: '110px' } }">
          <a-form-item label="上传附件">
            <jnpf-upload-file v-model:value="fileList" showTip :showView="false" :showDownload="false" />
          </a-form-item>
          <a-form-item label="图片上传">
            <jnpf-upload-img v-model:value="imgList" />
          </a-form-item>
        </a-form>
      </ScrollContainer>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, toRefs } from 'vue';
  import { ScrollContainer } from '/@/components/Container';

  defineOptions({ name: 'extend-formDemo-verifyForm3' });

  interface State {
    fileList: any[];
    imgList: any[];
  }

  const state = reactive<State>({
    fileList: [
      {
        name: 'food.jpeg',
        url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100',
      },
      {
        name: 'food2.jpeg',
        url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100',
      },
    ],
    imgList: [],
  });
  const { fileList, imgList } = toRefs(state);
</script>
