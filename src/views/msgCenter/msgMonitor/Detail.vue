<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :showOkBtn="false" :title="t('common.detailText')">
    <a-form :labelCol="{ style: { width: '100px' } }">
      <a-form-item label="账号名称" v-if="dataForm.accountName">
        <p>{{ dataForm.accountName }}</p>
      </a-form-item>
      <a-form-item label="账号编码" v-if="dataForm.accountCode">
        <p>{{ dataForm.accountCode }}</p>
      </a-form-item>
      <a-form-item label="消息来源" v-if="dataForm.messageSource">
        <p>{{ dataForm.messageSource }}</p>
      </a-form-item>
      <a-form-item label="消息类型" v-if="dataForm.messageType">
        <p>{{ dataForm.messageType }}</p>
      </a-form-item>
      <a-form-item label="发送时间" v-if="dataForm.sendTime">
        <p>{{ dayjs(dataForm.sendTime).format('YYYY-MM-DD HH:mm:ss') }}</p>
      </a-form-item>
      <a-form-item label="接收人" v-if="dataForm.receiveUser">
        <p>{{ dataForm.receiveUser }}</p>
      </a-form-item>
      <a-form-item label="标题" v-if="dataForm.title">
        <p>{{ dataForm.title }}</p>
      </a-form-item>
      <a-form-item label="内容" v-if="dataForm.content">
        <p class="content" v-html="dataForm.content"></p>
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getInfo } from '/@/api/msgCenter/msgMonitor';
  import dayjs from 'dayjs';
  import { useI18n } from '/@/hooks/web/useI18n';

  const dataForm = ref({
    accountName: '',
    accountCode: '',
    messageSource: '',
    messageType: '',
    sendTime: '',
    receiveUser: '',
    title: '',
    content: '',
  });
  const { t } = useI18n();
  const [registerModal, { changeLoading }] = useModalInner(init);

  function init(data) {
    if (data.id) {
      changeLoading(true);
      getInfo(data.id).then(res => {
        dataForm.value = res.data;
        changeLoading(false);
      });
    }
  }
</script>
