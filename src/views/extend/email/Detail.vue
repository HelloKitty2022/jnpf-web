<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" :title="isSend ? '查看邮件 - 已发送' : '查看邮件 - 收件箱'">
    <DetailMain :dataForm="dataForm" :isSend="isSend" />
  </BasicPopup>
</template>
<script lang="ts" setup>
  import { reactive, toRefs } from 'vue';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { getEmailInfo } from '/@/api/extend/email';
  import DetailMain from './DetailMain.vue';

  interface State {
    dataForm: any;
    isSend: boolean;
  }

  defineEmits(['register']);
  const state = reactive<State>({
    dataForm: {},
    isSend: false,
  });
  const { dataForm, isSend } = toRefs(state);
  const [registerPopup, { changeLoading }] = usePopupInner(init);

  function init(data) {
    state.isSend = !!data.isSend;
    if (data.id) {
      changeLoading(true);
      getEmailInfo(data.id).then(res => {
        state.dataForm = res.data;
        changeLoading(false);
      });
    }
  }
</script>
