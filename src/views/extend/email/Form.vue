<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" title="写邮件">
    <template #insertToolbar>
      <a-button type="primary" @click="handleSubmit(true)" :loading="sendLoading" :disabled="saveLoading">发送</a-button>
      <a-button type="warning" @click="handleSubmit()" :loading="saveLoading" :disabled="sendLoading" class="ml-10px">草稿</a-button>
    </template>
    <a-form :colon="false" labelAlign="right" :labelCol="{ style: { width: '60px' } }" :model="dataForm" :rules="rules" ref="formElRef" class="!px-10px">
      <a-form-item label="收件人" name="recipient">
        <a-select v-model:value="dataForm.recipient" mode="tags" :token-separators="[',']" placeholder="收件人" :open="false" />
      </a-form-item>
      <a-form-item label="抄送人" name="cc" v-if="showCC">
        <a-select v-model:value="dataForm.cc" mode="tags" :token-separators="[',']" placeholder="抄送人" :open="false" />
      </a-form-item>
      <a-form-item label="密送人" name="bcc" v-if="showBCC">
        <a-select v-model:value="dataForm.bcc" mode="tags" :token-separators="[',']" placeholder="密送人" :open="false" />
      </a-form-item>
      <a-form-item label=" ">
        <span class="link-text" @click="toggleCC">{{ showCC ? '删除抄送' : '添加抄送' }}</span>
        &nbsp;-&nbsp;
        <span class="link-text" @click="toggleBCC">{{ showBCC ? '删除密送' : '添加密送' }} </span>
      </a-form-item>
      <a-form-item label="主题" name="subject">
        <a-input v-model:value="dataForm.subject" placeholder="输入主题" allowClear />
      </a-form-item>
      <a-form-item label="附件" name="attachment">
        <jnpf-upload-file v-model:value="fileList" type="mail" />
      </a-form-item>
      <a-form-item label="正文" name="bodyText">
        <jnpf-editor v-model:value="dataForm.bodyText" />
      </a-form-item>
    </a-form>
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { ref, reactive, toRefs } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { saveSent, saveDraft, getEmailInfo } from '/@/api/extend/email';
  import { useMessage } from '/@/hooks/web/useMessage';
  import type { FormInstance } from 'ant-design-vue';

  interface State {
    dataForm: any;
    rules: any;
    sendLoading: boolean;
    saveLoading: boolean;
    showCC: boolean;
    showBCC: boolean;
    fileList: any[];
  }

  const emit = defineEmits(['register', 'reload']);
  const formElRef = ref<FormInstance>();
  const state = reactive<State>({
    dataForm: {
      recipient: [],
      cc: [],
      bcc: [],
      subject: '',
      bodyText: '',
      id: '',
      attachment: '',
    },
    rules: {
      recipient: [{ type: 'array', required: true, message: '收件人不能为空', trigger: 'blur' }],
      cc: [{ type: 'array', required: true, message: '抄送人不能为空', trigger: 'blur' }],
      bcc: [{ type: 'array', required: true, message: '密送人不能为空', trigger: 'blur' }],
      subject: [{ required: true, message: '主题不能为空', trigger: 'blur' }],
    },
    sendLoading: false,
    saveLoading: false,
    showCC: false,
    showBCC: false,
    fileList: [],
  });
  const { dataForm, rules, sendLoading, saveLoading, showCC, showBCC, fileList } = toRefs(state);
  const { createMessage } = useMessage();
  const [registerPopup, { closePopup, changeLoading }] = usePopupInner(init);

  function init(data) {
    formElRef.value?.resetFields();
    resetData();
    state.showCC = false;
    state.showBCC = false;
    state.sendLoading = false;
    state.saveLoading = false;
    state.fileList = [];
    if (data.id) {
      changeLoading(true);
      getEmailInfo(data.id).then(res => {
        state.dataForm = {
          recipient: res.data.recipient ? res.data.recipient.split(',') : [],
          cc: res.data.cc ? res.data.cc.split(',') : [],
          bcc: res.data.bcc ? res.data.bcc.split(',') : [],
          subject: res.data.subject,
          bodyText: res.data.bodyText,
          id: res.data.id,
        };
        state.showCC = !!state.dataForm.cc.length;
        state.showBCC = !!state.dataForm.bcc.length;
        state.fileList = res.data.attachment ? JSON.parse(res.data.attachment) : [];
        changeLoading(false);
      });
    }
  }
  function toggleCC() {
    state.showCC = !state.showCC;
    state.dataForm.cc = [];
  }
  function toggleBCC() {
    state.showBCC = !state.showBCC;
    state.dataForm.bcc = [];
  }
  async function handleSubmit(isSend = false) {
    try {
      const values = await formElRef.value?.validate();
      if (!values) return;
      isSend ? (state.sendLoading = true) : (state.saveLoading = true);
      let data: any = {
        recipient: state.dataForm.recipient.join(','),
        subject: state.dataForm.subject,
        bodyText: state.dataForm.bodyText,
        attachment: JSON.stringify(state.fileList),
      };
      if (state.showCC) data = { ...data, cc: state.dataForm.cc.join(',') };
      if (state.showBCC) data = { ...data, bcc: state.dataForm.bcc.join(',') };
      if (state.dataForm.id) data = { ...data, id: state.dataForm.id };
      const formMethod = isSend ? saveSent : saveDraft;
      formMethod(data)
        .then(res => {
          createMessage.success(res.msg);
          isSend ? (state.sendLoading = false) : (state.saveLoading = false);
          closePopup();
          emit('reload');
        })
        .catch(() => {
          isSend ? (state.sendLoading = false) : (state.saveLoading = false);
        });
    } catch (_) {}
  }
  function resetData() {
    state.dataForm = {
      recipient: [],
      cc: [],
      bcc: [],
      subject: '',
      bodyText: '',
      id: '',
      attachment: '',
    };
  }
</script>
