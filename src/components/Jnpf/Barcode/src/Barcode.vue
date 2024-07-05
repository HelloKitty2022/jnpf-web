<template>
  <div :class="`${prefixCls}`">
    <div v-if="barcode">
      <canvas :id="id" class="barcode"></canvas>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, unref, watch, onMounted, nextTick } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { buildShortUUID } from '/@/utils/uuid';
  import JsBarcode from 'jsbarcode';

  defineOptions({ name: 'JnpfBarcode', inheritAttrs: false });
  const props = defineProps({
    dataType: { type: String, default: 'static' },
    format: { type: String, default: 'code128' },
    lineColor: { type: String, default: '#000' },
    background: { type: String, default: '#fff' },
    width: { type: Number, default: 4 },
    height: { type: Number, default: 40 },
    relationField: { type: String, default: '' },
    staticText: { type: String, default: '' },
    formData: { type: Object },
  });
  const { prefixCls } = useDesign('barcode');
  const id = ref('');
  const relationText = ref('');

  const barcode = computed(() => {
    if (props.dataType === 'static') {
      return props.staticText;
    } else {
      return relationText.value;
    }
  });

  watch(
    () => props.formData,
    val => {
      if (val && props.dataType === 'relation' && props.relationField) {
        relationText.value = val[props.relationField];
      }
    },
    { deep: true, immediate: true },
  );
  watch(
    () => [props.format, props.lineColor, props.background, props.width, props.height, unref(barcode)],
    () => {
      nextTick(() => {
        buildBarcode();
      });
    },
  );

  function buildBarcode() {
    if (!unref(barcode)) return;
    let reg = /^[A-Za-z0-9]+$/;
    if (!reg.test(unref(barcode))) {
      return;
    }
    JsBarcode('#' + id.value, unref(barcode), {
      format: props.format,
      lineColor: props.lineColor,
      width: props.width,
      height: props.height,
      background: props.background,
      displayValue: false,
      margin: 5,
    });
  }
  id.value = buildShortUUID('barcode');

  onMounted(() => {
    buildBarcode();
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-barcode';
  .@{prefix-cls} {
    width: 100%;
    padding: 0;
    overflow: hidden;
    min-height: 40px;
    background: #fff;
  }
</style>
