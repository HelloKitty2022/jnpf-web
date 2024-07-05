<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="发起委托" :footer="null" :width="600" class="jnpf-add-modal">
    <div class="add-main">
      <div class="add-item add-item-left" @click="add(0)">
        <i class="add-icon icon-ym icon-ym-launchFlow"></i>
        <div class="add-txt">
          <p class="add-title">发起流程</p>
          <p class="add-desc">发起表单的业务流程</p>
        </div>
      </div>
      <div class="add-item" @click="add(1)">
        <i class="add-icon icon-ym icon-ym-funcFlow"></i>
        <div class="add-txt">
          <p class="add-title">功能流程</p>
          <p class="add-desc">发起功能的赋予流程</p>
        </div>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';

  const emit = defineEmits(['register', 'select']);

  const [registerModal, { closeModal }] = useModalInner();

  function add(flowType) {
    emit('select', flowType);
    closeModal();
  }
</script>
