<template>
  <div :class="[prefixCls, $attrs.class]">
    <a-input v-model:value="innerValue" :size="$attrs.size || 'default'" :placeholder="placeholder" readonly allowClear>
      <template #addonAfter>
        <span @click="openSelectModal">选择</span>
      </template>
      <template #suffix v-if="innerValue">
        <i :class="innerValue"></i>
      </template>
    </a-input>
    <a-modal v-model:visible="visible" :width="1000" class="icon-modal" centered :maskClosable="false" :keyboard="false">
      <template #title>
        <div class="icon-modal-title">
          图标选择
          <a-input-search placeholder="请输入关键词" allowClear v-model:value="keyword" @search="handleSearch" />
        </div>
      </template>
      <template #closeIcon>
        <ModalClose :canFullscreen="false" @cancel="handleCancel" />
      </template>
      <template #footer>
        <a-button type="error" @click="handleClear()">{{ t('common.cleanText') }}</a-button>
        <a-button @click="handleCancel()">{{ t('common.cancelText') }}</a-button>
        <a-button type="primary" @click="handleSubmit()">{{ t('common.okText') }}</a-button>
      </template>
      <div class="main">
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="1" tab="ymIcon图标">
            <ScrollContainer>
              <div class="icon-box-list">
                <a-button v-for="(item, index) in ymIconList" :key="index" @click="handleIconClick(item)" :class="{ 'is-active': item === active }">
                  <i :class="item" />
                </a-button>
              </div>
            </ScrollContainer>
          </a-tab-pane>
          <a-tab-pane key="2" tab="ymCustom图标">
            <ScrollContainer>
              <div class="icon-box-list">
                <a-button v-for="(item, index) in ymCustomList" :key="index" @click="handleIconClick(item)" :class="{ 'is-active': item === innerValue }">
                  <i :class="item" />
                </a-button>
              </div>
            </ScrollContainer>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { Form, Modal as AModal } from 'ant-design-vue';
  import { reactive, ref, watch, toRefs } from 'vue';
  import { ScrollContainer } from '/@/components/Container';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { ymIconJson } from '../data/ymIcon';
  import { ymCustomJson } from '../data/ymCustom';
  import { cloneDeep } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';

  const ymIcon = ymIconJson.glyphs.map(o => `icon-ym icon-ym-${o.font_class}`);
  const ymCustom = ymCustomJson.glyphs.map(o => `ym-custom ym-custom-${o.font_class}`);

  defineOptions({ name: 'JnpfIconPicker', inheritAttrs: false });
  const props = defineProps({
    value: String,
    placeholder: { type: String, default: '请选择' },
    disabled: { type: Boolean, default: false },
  });
  const emit = defineEmits(['update:value', 'change']);
  const { t } = useI18n();
  const { prefixCls } = useDesign('icon-picker');
  const formItemContext = Form.useInjectFormItemContext();
  const innerValue = ref('');
  const active = ref('');
  const visible = ref(false);
  const state = reactive({
    keyword: '',
    activeKey: '',
    ymIcon,
    ymCustom,
    ymIconList: [],
    ymCustomList: [],
  });

  const { keyword, activeKey, ymIconList, ymCustomList } = toRefs(state);

  watch(
    () => props.value,
    val => {
      setValue(val);
    },
    { immediate: true },
  );
  watch(
    () => state.activeKey,
    val => {
      if (!val) return;
      state.keyword = '';
      handleSearch();
    },
  );
  watch(
    () => visible.value,
    val => {
      if (!val) state.activeKey = '';
    },
  );

  function setValue(value) {
    innerValue.value = value;
  }
  function openSelectModal() {
    if (props.disabled) return;
    visible.value = true;
    active.value = innerValue.value;
    state.activeKey = '1';
  }
  function handleCancel() {
    visible.value = false;
  }
  function handleSubmit() {
    innerValue.value = active.value;
    emit('update:value', innerValue.value);
    emit('change', innerValue.value);
    formItemContext.onFieldChange();
    handleCancel();
  }
  function handleClear() {
    active.value = '';
  }
  function handleIconClick(item) {
    active.value = item;
  }
  function handleSearch() {
    const key = state.activeKey === '1' ? 'ymIcon' : 'ymCustom';
    if (state.keyword) {
      state[key + 'List'] = state[key].filter(o => o.indexOf(state.keyword) > -1);
    } else {
      state[key + 'List'] = cloneDeep(state[key]);
    }
  }
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-icon-picker';

  .@{prefix-cls} {
    width: 100%;

    :deep(.ant-input-group-addon) {
      cursor: pointer;
      padding: 0;

      span {
        display: inline-block;
        line-height: 30px;
        padding: 0 11px;
      }
    }

    :deep(.ant-input-suffix) {
      i {
        line-height: 20px;
        color: @text-color-help-dark;
      }
    }
  }
</style>
