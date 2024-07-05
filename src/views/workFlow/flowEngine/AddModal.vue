<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="t('common.addText')" :footer="null" :width="600" class="jnpf-add-modal">
    <div class="add-main">
      <div class="add-item add-item-left" @click="add(0)">
        <i class="add-icon icon-ym icon-ym-launchFlow"></i>
        <div class="add-txt">
          <p class="add-title">发起流程</p>
          <p class="add-desc">用于协同办公的业务流程</p>
        </div>
      </div>
      <div class="add-item" @click="add(1)">
        <i class="add-icon icon-ym icon-ym-funcFlow"></i>
        <div class="add-txt">
          <p class="add-title">功能流程</p>
          <p class="add-desc">用于业务系统的功能流程</p>
        </div>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';

  const emit = defineEmits(['register', 'select']);
  const { t } = useI18n();
  const [registerModal, { closeModal }] = useModalInner();

  function add(type) {
    emit('select', type);
    closeModal();
  }
</script>
