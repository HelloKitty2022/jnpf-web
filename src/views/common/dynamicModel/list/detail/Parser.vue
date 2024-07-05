<template>
  <a-row :class="formConf.formStyle ? formConf.formStyle + ' word-form-detail' : ''">
    <a-form
      class="w-full"
      ref="formElRef"
      :name="getFormName"
      :colon="formConf.colon"
      :size="formConf.size"
      :disabled="formConf.disabled"
      :labelCol="getLabelCol"
      :layout="formConf.labelPosition === 'top' ? 'vertical' : 'horizontal'"
      :labelAlign="formConf.labelPosition === 'right' ? 'right' : 'left'">
      <a-row :gutter="formConf.formStyle ? 0 : formConf.gutter">
        <Item v-for="(item, index) in formConf.fields" :key="index" :item="item" v-bind="getBindValue" @toDetail="toDetail" />
      </a-row>
    </a-form>
  </a-row>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { buildUUID } from '/@/utils/uuid';
  import Item from './Item.vue';

  const props = defineProps({
    formConf: { type: Object, required: true },
    relationData: { type: Object, default: () => {} },
    formData: { type: Object },
    loading: { type: Boolean, default: false },
  });
  const emit = defineEmits(['toDetail']);

  const getFormName = computed(() => `form-${buildUUID()}`);
  const getLabelCol = computed(() => ({ style: { width: props.formConf.labelWidth + 'px' } }));
  const getBindValue = computed(() => ({ ...props }));

  function toDetail(data) {
    emit('toDetail', data);
  }
</script>
