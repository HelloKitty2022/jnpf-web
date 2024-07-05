<template>
  <a-form :colon="false" labelAlign="right" :labelCol="{ style: { width: '60px' } }" :model="dataForm" ref="formElRef" class="!px-10px">
    <a-form-item name="subject">
      <h4 class="text">{{ dataForm.subject }}</h4>
    </a-form-item>
    <a-divider></a-divider>
    <a-form-item label="发件人">
      <p class="text recipient">{{ isSend ? dataForm.sender : dataForm.senderName + '&lt;' + dataForm.sender + '>' }} </p>
    </a-form-item>
    <a-divider></a-divider>
    <a-form-item label="时间">
      <p class="text" v-if="isSend">{{ formatToDateTime(dataForm.creatorTime) }}</p>
      <p class="text" v-if="!isSend">{{ formatToDateTime(dataForm.fdate) }}</p>
    </a-form-item>
    <a-divider></a-divider>
    <a-form-item label="收件人">
      <p class="text">{{ isSend ? dataForm.recipient : dataForm.mAccount }}</p>
    </a-form-item>
    <a-divider></a-divider>
    <template v-if="dataForm.cc">
      <a-form-item label="抄送人" name="cc">
        <p>{{ dataForm.cc }}</p>
      </a-form-item>
      <a-divider></a-divider>
    </template>
    <template v-if="dataForm.bcc">
      <a-form-item label="密送人" name="bcc">
        <p class="text">{{ dataForm.bcc }}</p>
      </a-form-item>
      <a-divider></a-divider>
    </template>
    <template v-if="getFileList.length">
      <a-form-item label="附件" name="attachment">
        <jnpf-upload-file v-model:value="getFileList" type="mail" detailed disabled />
      </a-form-item>
      <a-divider></a-divider>
    </template>
    <a-form-item name="bodyText">
      <p class="content" v-html="dataForm.bodyText"></p>
    </a-form-item>
  </a-form>
</template>
<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { formatToDateTime } from '/@/utils/dateUtil';

  const props = defineProps(['dataForm', 'isSend']);
  defineEmits(['register']);
  const formElRef = ref<FormInstance>();

  const getFileList = computed(() => (props.dataForm.attachment ? JSON.parse(props.dataForm.attachment) : []));
</script>
<style lang="less" scoped>
  .ant-form {
    :deep(.ant-form-item) {
      margin-bottom: 0;
    }
    .ant-divider-horizontal {
      margin: 5px 0;
    }
    .text {
      word-break: break-all;
      &.recipient {
        color: @success-color;
      }
    }
    h4.text {
      font-size: 15px;
      margin-bottom: 0;
    }
  }
</style>
