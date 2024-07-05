<template>
  <div class="jnpf-content-wrapper icons-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-search-box">
        <BasicForm class="search-form" @register="registerForm" @submit="handleSubmit" @reset="handleReset"></BasicForm>
      </div>
      <div class="jnpf-content-wrapper-content bg-white">
        <a-tabs v-model:activeKey="activeKey" type="card" class="jnpf-content-wrapper-tabs">
          <a-tab-pane key="1" tab="ymIcon图标">
            <ScrollContainer>
              <a-row>
                <a-col :span="6" v-for="item in ymIconList" :key="item" @click="handleCopy('icon-ym ' + item)" :title="item" class="icon-item">
                  <i :class="'icon-ym ' + item" />
                  <span>{{ item }}</span>
                </a-col>
              </a-row>
            </ScrollContainer>
          </a-tab-pane>
          <a-tab-pane key="2" tab="更多图标">
            <ScrollContainer>
              <a-row>
                <a-col :span="6" v-for="item in ymCustomList" :key="item" @click="handleCopy('ym-custom ' + item)" :title="item" class="icon-item">
                  <i :class="'ym-custom ' + item" />
                  <span>{{ item }}</span>
                </a-col>
              </a-row>
            </ScrollContainer>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, watch, unref, onMounted } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { ymIconJson } from '/@/components/Jnpf/IconPicker/data/ymIcon';
  import { ymCustomJson } from '/@/components/Jnpf/IconPicker/data/ymCustom';
  import { cloneDeep } from 'lodash-es';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { ScrollContainer } from '/@/components/Container';

  const ymIcon = ymIconJson.glyphs.map(o => `icon-ym-${o.font_class}`);
  const ymCustom = ymCustomJson.glyphs.map(o => `ym-custom-${o.font_class}`);

  const { createMessage } = useMessage();
  const [registerForm, { resetFields }] = useForm({
    baseColProps: { span: 6 },
    showActionButtonGroup: true,
    showAdvancedButton: true,
    compact: true,
    schemas: [
      {
        field: 'keyword',
        label: '关键词',
        component: 'Input',
        componentProps: {
          placeholder: '请输入关键词',
          submitOnPressEnter: true,
        },
      },
    ],
  });
  const state = reactive({
    activeKey: '1',
    keyword: '',
    ymIcon,
    ymCustom,
    ymIconList: [],
    ymCustomList: [],
  });
  const { activeKey, ymIconList, ymCustomList } = toRefs(state);

  watch(
    () => state.activeKey,
    () => {
      resetFields();
    },
  );

  function handleSubmit(values) {
    state.keyword = values?.keyword || '';
    handleSearch();
  }
  function handleReset() {
    state.keyword = '';
    handleSearch();
  }
  function handleSearch() {
    const key = state.activeKey === '1' ? 'ymIcon' : 'ymCustom';
    if (state.keyword) {
      state[key + 'List'] = state[key].filter(o => o.indexOf(state.keyword) > -1);
    } else {
      state[key + 'List'] = cloneDeep(state[key]);
    }
  }
  function handleCopy(item) {
    const { isSuccessRef } = useCopyToClipboard(item);
    unref(isSuccessRef) && createMessage.success('复制成功');
  }
  onMounted(() => {
    handleReset();
  });
</script>
<style lang="less" scoped>
  .icons-wrapper {
    .icon-item {
      padding: 0 10px;
      height: 40px;
      line-height: 38px;
      border: 1px dashed transparent;
      color: #6b7a99;
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      i {
        font-size: 16px;
        line-height: 40px;
        margin-right: 14px;
        vertical-align: top;
      }

      span {
        line-height: 40px;
        vertical-align: top;
      }

      &:hover {
        border-color: @primary-color;

        i {
          font-size: 30px;
        }
      }
    }
  }
</style>
