<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :width="800" :title="t('common.detailText')" :min-height="300" :footer="null" class="notice-modal">
    <div class="notice-wrapper">
      <h1 class="title">{{ state.dataForm.title }}</h1>
      <div class="info">
        <span v-if="state.dataForm.releaseTime">{{ state.dataForm.releaseTime }}</span>
        <span>{{ state.dataForm.releaseUser }}</span>
      </div>
      <div class="pt-20px pb-10px">
        <p class="pb-8px" v-if="state.dataForm.excerpt">{{ state.dataForm.excerpt }}</p>
        <div class="main" v-html="state.dataForm.bodyText"></div>
      </div>
      <div class="file-list" v-if="state.dataForm.files.length">
        <JnpfUploadFile v-model:value="state.dataForm.files" disabled detailed />
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal/index';
  import { getInfo, readInfo } from '/@/api/system/message';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    dataForm: any;
  }

  const state = reactive<State>({
    dataForm: {
      id: '',
      title: '',
      creatorUser: '',
      creatorTime: '',
      bodyText: '',
      files: [],
    },
  });
  const { t } = useI18n();
  const [registerModal, { changeLoading }] = useModalInner(init);

  function init(data) {
    changeLoading(true);
    const method = data.type == 1 ? readInfo : getInfo;
    method(data.id).then(res => {
      state.dataForm = res.data || {};
      state.dataForm.releaseTime = state.dataForm.releaseTime ? formatToDateTime(state.dataForm.releaseTime) : '';
      state.dataForm.files = state.dataForm.files ? JSON.parse(state.dataForm.files) : [];
      changeLoading(false);
    });
  }
</script>
<style lang="less" scoped>
  .notice-wrapper {
    .title {
      font-size: 18px;
      font-weight: normal;
      text-align: center;
      margin-bottom: 0;
    }
    .info {
      line-height: 35px;
      padding-bottom: 10px;
      border-bottom: 1px solid @border-color-base1;
      text-align: center;
      color: @text-color-label;
      span {
        padding: 0 10px;
      }
    }
    .main {
      line-height: 22px;
      min-height: 300px;
      overflow: auto;
      color: @text-color-label;
    }
    .file-list {
      padding: 10px 0 30px;
      border-top: 1px solid @border-color-base1;
    }
  }
</style>
<style lang="less">
  .notice-modal {
    .ant-modal-body > .scrollbar {
      padding: 10px 20px 0 !important;
    }
  }
</style>
