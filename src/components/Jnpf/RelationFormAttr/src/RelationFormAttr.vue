<template>
  <template v-if="!detailed">
    <a-input v-model:value="innerValue" readonly :disabled="disabled" placeholder="用于展示关联表单的属性，且数据同时会保存入库" v-if="isStorage" />
    <a-input v-model:value="innerValue" readonly :disabled="disabled" placeholder="用于展示关联表单的属性，且数据不会保存" v-else />
  </template>
  <p v-else>{{ innerValue }}</p>
</template>

<script lang="ts" setup>
  import { Form } from 'ant-design-vue';
  import { ref, watch, onBeforeMount, inject } from 'vue';
  import { useGeneratorStore } from '/@/store/modules/generator';

  defineOptions({ name: 'JnpfRelationFormAttr', inheritAttrs: false });
  const props = defineProps(['value', 'showField', 'relationField', 'detailed', 'isStorage', 'disabled']);
  const emit = defineEmits(['update:value']);
  const formItemContext = Form.useInjectFormItemContext();
  const generatorStore = useGeneratorStore();
  const emitter: any = inject('emitter');
  const innerValue = ref<string | number | undefined>(undefined);

  watch(
    () => generatorStore.getRelationData,
    val => {
      setValue(val);
    },
    {
      immediate: true,
      deep: true,
    },
  );

  function setValue(value) {
    if (props.isStorage || !props.showField || !props.relationField) return;
    const obj = value[props.relationField] || {};
    innerValue.value = obj[props.showField] || obj[props.showField] == 0 ? obj[props.showField] : '';
  }

  onBeforeMount(() => {
    emitter.on('setRelationData', data => {
      if (!props.isStorage || !props.showField || !props.relationField || props.relationField != data.jnpfRelationField) return;
      innerValue.value = data[props.showField] || data[props.showField] == 0 ? data[props.showField] : '';
      emit('update:value', innerValue.value);
      formItemContext.onFieldChange();
    });
  });
</script>
