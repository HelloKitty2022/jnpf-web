<template>
  <div :class="`${prefixCls}`">
    <QrCode :value="qrcode" :width="width" :options="options" tag="img" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { QrCode } from '/@/components/Qrcode/index';
  import { useGeneratorStore } from '/@/store/modules/generator';
  import { isNullOrUnDef } from '/@/utils/is';

  defineOptions({ name: 'JnpfQrcode', inheritAttrs: false });
  const props = defineProps({
    dataType: { type: String, default: 'static' },
    colorDark: { type: String, default: '#000' },
    colorLight: { type: String, default: '#fff' },
    width: { type: Number, default: 100 },
    relationField: { type: String, default: '' },
    staticText: { type: String, default: '' },
    formData: { type: Object },
  });
  const generatorStore = useGeneratorStore();
  const { prefixCls } = useDesign('qrcode');
  const relationText = ref('');

  const options = computed(() => ({
    margin: 1,
    color: { dark: props.colorDark, light: props.colorLight },
  }));
  const qrcode = computed(() => {
    const dynamicModelExtra = generatorStore.getDynamicModelExtra;
    if (props.dataType === 'static') {
      return props.staticText;
    } else if (props.dataType === 'relation') {
      return relationText.value;
    } else {
      if (props.formData && dynamicModelExtra && dynamicModelExtra.id && dynamicModelExtra.modelId) {
        const json = {
          t: 'DFD',
          id: dynamicModelExtra.id,
          mid: dynamicModelExtra.modelId,
          mt: dynamicModelExtra.type,
          fid: dynamicModelExtra.flowId || '',
          pid: dynamicModelExtra.processId || '',
          ftid: dynamicModelExtra.taskId || '',
          opt: dynamicModelExtra.opType,
        };
        return JSON.stringify(json);
      }
      return '';
    }
  });

  watch(
    () => props.formData,
    val => {
      if (val && props.dataType === 'relation' && props.relationField) {
        relationText.value = isNullOrUnDef(val[props.relationField]) ? '' : val[props.relationField];
      }
    },
    { deep: true, immediate: true },
  );
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-qrcode';
  .@{prefix-cls} {
    width: 100%;
    padding: 0;
    min-height: 40px;
    max-width: 100% !important;
  }
</style>
