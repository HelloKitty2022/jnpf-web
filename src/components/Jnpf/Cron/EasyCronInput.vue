<template>
  <div :class="`${prefixCls}`">
    <a-input-search v-model:value="value" :placeholder="placeholder" readonly @search="showConfigModal">
      <template #enterButton>
        <Button>
          <template #icon> <i class="icon-ym icon-ym-btn-edit"></i> </template>
        </Button>
      </template>
    </a-input-search>
    <EasyCronModal
      ref="easyCronModalRef"
      v-model:value="editCronValue"
      :exeStartTime="exeStartTime"
      :hideYear="hideYear"
      :remote="remote"
      :hideSecond="hideSecond"
      @ok="handleSubmit" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import { Form, Button } from 'ant-design-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { propTypes } from '/@/utils/propTypes';
  import EasyCronModal from './EasyCronModal.vue';
  import { cronEmits, cronProps } from './easy.cron.data';

  defineOptions({ name: 'JnpfCron', inheritAttrs: false });

  const { prefixCls } = useDesign('easy-cron-input');
  const emit = defineEmits([...cronEmits]);
  const props = defineProps({
    ...cronProps,
    placeholder: propTypes.string.def('Cron表达式'),
    exeStartTime: propTypes.oneOfType([propTypes.number, propTypes.string, propTypes.object]).def(0),
  });
  const editCronValue = ref(props.value);
  const formItemContext = Form.useInjectFormItemContext();
  const easyCronModalRef = ref();

  watch(
    () => props.value,
    newVal => {
      if (newVal !== editCronValue.value) {
        editCronValue.value = newVal;
      }
    },
  );

  function showConfigModal() {
    if (props.disabled) return;
    easyCronModalRef.value?.openModal();
  }
  function handleSubmit() {
    emit('change', editCronValue.value);
    emit('update:value', editCronValue.value);
    formItemContext.onFieldChange();
  }
</script>

<style lang="less">
  @import 'easy.cron.input';
</style>
