<template>
  <a-radio-group button-style="solid" v-bind="getBindValue" v-model:value="innerValue" @change="onChange">
    <template v-if="optionType === 'button'">
      <span class="vertical-button" v-for="item in getOptions" :key="item[getFieldNames.value]" v-if="direction === 'vertical'">
        <a-radio-button :value="item[getFieldNames.value]" :disabled="item[getFieldNames.disabled]">
          {{ item[getFieldNames.label] }}
        </a-radio-button>
      </span>
      <a-radio-button v-for="item in getOptions" :value="item[getFieldNames.value]" :disabled="item[getFieldNames.disabled]" v-else>
        {{ item[getFieldNames.label] }}
      </a-radio-button>
    </template>
    <template v-else>
      <a-radio v-for="item in getOptions" :key="item[getFieldNames.value]" :value="item[getFieldNames.value]" :disabled="item[getFieldNames.disabled]">
        {{ item[getFieldNames.label] }}
      </a-radio>
    </template>
  </a-radio-group>
</template>

<script lang="ts" setup>
  import { computed, ref, unref, watch } from 'vue';
  import { radioProps, FieldNames } from './props';
  import { useAttrs } from '/@/hooks/core/useAttrs';

  defineOptions({ name: 'JnpfRadio', inheritAttrs: false });
  const props = defineProps(radioProps);
  const emit = defineEmits(['update:value', 'change']);
  const attrs: any = useAttrs({ excludeDefaultKeys: false });
  const innerValue = ref('');

  const getBindValue = computed(() => ({
    ...unref(attrs),
    class: unref(attrs).class ? `jnpf-${props.direction}-radio ${unref(attrs).class}` : `jnpf-${props.direction}-radio`,
  }));
  const getOptions = computed<any[]>(() => props.options);
  const getFieldNames = computed((): Required<FieldNames> => {
    const { fieldNames } = props;
    return {
      disabled: 'disabled',
      label: 'fullName',
      value: 'id',
      ...fieldNames,
    };
  });

  watch(
    () => props.value,
    val => {
      setValue(val);
    },
    {
      immediate: true,
    },
  );

  function setValue(value) {
    innerValue.value = value;
  }
  function onChange(e) {
    const val = e.target.value;
    const data = unref(getOptions).filter(o => o[unref(getFieldNames).value] === val);
    emit('update:value', val);
    emit('change', val, data[0]);
  }
</script>
<style lang="less">
  .jnpf-vertical-radio {
    .ant-radio-wrapper {
      display: flex;
      margin-right: 0;
      .ant-radio + span {
        word-break: break-all;
      }
    }
    .vertical-button {
      display: block;
      margin-bottom: 4px;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
</style>
