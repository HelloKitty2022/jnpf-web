<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="t('common.addText')" :footer="null" :width="600" class="jnpf-add-modal">
    <div class="add-main">
      <div class="add-item add-item-left" @click="add(2)">
        <i class="add-icon icon-ym icon-ym-customForm"></i>
        <div class="add-txt">
          <p class="add-title">表单</p>
          <p class="add-desc">业务功能的表单</p>
        </div>
      </div>
      <div class="add-item add-item-list" @click="add(4)">
        <i class="add-icon icon-ym icon-ym-sysMenu"></i>
        <div class="add-txt">
          <p class="add-title">视图</p>
          <p class="add-desc">数据视图</p>
        </div>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const emit = defineEmits(['register', 'select']);

  const [registerModal, { closeModal }] = useModalInner();

  function add(type) {
    emit('select', type);
    closeModal();
  }
</script>
