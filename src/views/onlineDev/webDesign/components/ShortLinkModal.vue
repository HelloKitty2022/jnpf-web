<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="表单外链配置" :width="800" @ok="handleSubmit" class="jnpf-shortLink-modal">
    <a-form :colon="false" :model="dataForm" :rules="rules" :labelCol="{ style: { width: '100px' } }" ref="formElRef" hideRequiredMark class="h-500px">
      <a-form-item label="外链填单" name="formUse">
        <a-space :size="15">
          <JnpfSwitch v-model:value="dataForm.formUse" />
          <span class="shortLink-tip">开启后，会生成表单填写链接，无需登录即可填写表单。</span>
        </a-space>
      </a-form-item>
      <template v-if="dataForm.formUse">
        <a-form-item label="外链地址">
          <a-space :size="15">
            <a-input v-model:value="dataForm.formLink" readonly class="!w-410px" />
            <template v-if="dataForm.alreadySave">
              <a-input-group compact>
                <a-button @click="openWindow(dataForm.formLink)">打开</a-button>
                <a-button type="primary" @click="handleCopy(dataForm.formLink)">复制</a-button>
              </a-input-group>
              <a-popover placement="bottomRight">
                <template #content>
                  <p class="shortLink-tip">扫描二维码，分享此链接</p>
                  <QrCode :value="dataForm.formLink" ref="qrRef" :width="154" :options="{ margin: 1 }" class="my-5px" />
                  <a-button pre-icon="icon-ym icon-ym-download" block size="mini" @click="handleDownload(1)">下载</a-button>
                </template>
                <i class="ym-custom ym-custom-qrcode"></i>
              </a-popover>
            </template>
            <template v-else>
              <a-input-group compact>
                <a-tooltip placement="bottom">
                  <template #title>请先保存，再打开</template>
                  <a-button disabled>打开</a-button>
                </a-tooltip>
                <a-tooltip placement="bottom">
                  <template #title>请先保存，再复制</template>
                  <a-button type="primary" disabled>复制</a-button>
                </a-tooltip>
              </a-input-group>
              <a-tooltip placement="bottom">
                <template #title>请先保存，再下载二维码</template>
                <i class="ym-custom ym-custom-qrcode"></i>
              </a-tooltip>
            </template>
          </a-space>
        </a-form-item>
        <a-row justify="start">
          <a-col>
            <a-form-item label="凭密码填写" name="formPassUse">
              <JnpfSwitch v-model:value="dataForm.formPassUse" />
            </a-form-item>
          </a-col>
          <a-col class="ml-15px">
            <a-form-item name="formPassword" v-if="dataForm.formPassUse">
              <a-input-password v-model:value="dataForm.formPassword" class="!w-200px" placeholder="请输入密码" :maxlength="20" />
            </a-form-item>
          </a-col>
        </a-row>
        <div></div>
      </template>
      <template v-if="webType != '1'">
        <a-divider></a-divider>
        <a-form-item label="公开查询" name="columnUse">
          <a-space :size="15">
            <JnpfSwitch v-model:value="dataForm.columnUse" />
            <span class="shortLink-tip">开启后，无需登录即可查询已有数据。</span>
          </a-space>
        </a-form-item>
        <template v-if="dataForm.columnUse">
          <a-form-item label="查询地址">
            <a-space :size="15">
              <a-input v-model:value="dataForm.columnLink" readonly class="!w-410px" />
              <template v-if="dataForm.alreadySave">
                <a-input-group compact>
                  <a-button @click="openWindow(dataForm.columnLink)">打开</a-button>
                  <a-button type="primary" @click="handleCopy(dataForm.columnLink)">复制</a-button>
                </a-input-group>
                <a-popover placement="bottomRight">
                  <template #content>
                    <p class="shortLink-tip">扫描二维码，分享此链接</p>
                    <QrCode :value="dataForm.columnLink" ref="columnQrRef" :width="154" :options="{ margin: 1 }" class="my-5px" />
                    <a-button pre-icon="icon-ym icon-ym-download" block size="mini" @click="handleDownload(2)">下载</a-button>
                  </template>
                  <i class="ym-custom ym-custom-qrcode"></i>
                </a-popover>
              </template>
              <template v-else>
                <a-input-group compact>
                  <a-tooltip placement="bottom">
                    <template #title>请先保存，再打开</template>
                    <a-button disabled>打开</a-button>
                  </a-tooltip>
                  <a-tooltip placement="bottom">
                    <template #title>请先保存，再复制</template>
                    <a-button type="primary" disabled>复制</a-button>
                  </a-tooltip>
                </a-input-group>
                <a-tooltip placement="bottom">
                  <template #title>请先保存，再下载二维码</template>
                  <i class="ym-custom ym-custom-qrcode"></i>
                </a-tooltip>
              </template>
            </a-space>
          </a-form-item>
          <a-form-item label="查询条件" name="columnCondition">
            <JnpfSelect
              v-model:value="columnCondition"
              placeholder="请选择"
              :options="searchOptions"
              :fieldNames="{ options: 'options1' }"
              allowClear
              showSearch
              multiple
              @change="onConditionChange" />
          </a-form-item>
          <a-form-item label="显示内容" name="columnText">
            <JnpfSelect
              v-model:value="columnText"
              placeholder="请选择"
              :options="columnOptions"
              :fieldNames="{ options: 'options1' }"
              allowClear
              showSearch
              multiple
              @change="onColumnTextChange" />
          </a-form-item>
          <a-row justify="start">
            <a-col>
              <a-form-item label="凭密码填写" name="columnPassUse">
                <JnpfSwitch v-model:value="dataForm.columnPassUse" />
              </a-form-item>
            </a-col>
            <a-col class="ml-15px">
              <a-form-item name="columnPassword" v-if="dataForm.columnPassUse">
                <a-input-password v-model:value="dataForm.columnPassword" class="!w-200px" placeholder="请输入密码" :maxlength="20" />
              </a-form-item>
            </a-col>
          </a-row>
        </template>
      </template>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { getShortLinkInfo, updateShortLink } from '/@/api/onlineDev/shortLink';
  import { getInfo } from '/@/api/onlineDev/visualDev';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, reactive, toRefs, nextTick, unref } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { noColumnShowList, noSearchList } from '/@/components/ColumnDesign/src/helper/config';
  import { QrCode, QrCodeActionType } from '/@/components/Qrcode/index';
  import { openWindow } from '/@/utils';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';

  interface State {
    dataForm: any;
    record: any;
    rules: any;
    columnCondition: any[];
    columnText: any[];
    columnConditionData: any[];
    columnTextData: any[];
    columnOptions: any[];
    searchOptions: any[];
    webType: string;
    id: string;
  }

  const validFieldsList = [
    'input',
    'textarea',
    'inputNumber',
    'switch',
    'datePicker',
    'timePicker',
    'colorPicker',
    'rate',
    'slider',
    'editor',
    'link',
    'text',
    'alert',
    'table',
    'collapse',
    'collapseItem',
    'tabItem',
    'tab',
    'row',
    'card',
    'groupTitle',
    'divider',
    'tableGrid',
    'tableGridTr',
    'tableGridTd',
    'location',
  ];
  const selectFieldsList = ['radio', 'checkbox', 'select', 'treeSelect', 'cascader'];
  defineEmits(['register']);
  const { createMessage } = useMessage();
  const [registerModal, { changeLoading, changeOkLoading }] = useModalInner(init);
  const formElRef = ref<FormInstance>();
  const qrRef = ref<Nullable<QrCodeActionType>>(null);
  const columnQrRef = ref<Nullable<QrCodeActionType>>(null);
  const state = reactive<State>({
    dataForm: {
      id: '',
      formLink: '',
      formUse: 0,
      formPassUse: 0,
      formPassword: '',
      columnUse: 0,
      columnLink: '',
      columnPassUse: 0,
      columnPassword: '',
      columnCondition: '',
      columnText: '',
      alreadySave: false,
    },
    columnCondition: [],
    columnText: [],
    columnConditionData: [],
    columnTextData: [],
    record: {},
    rules: {
      formPassword: [{ required: true, message: '请输入密码', trigger: 'blur' }],
      columnPassword: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    },
    columnOptions: [],
    searchOptions: [],
    webType: '1',
    id: '',
  });
  const { dataForm, rules, columnCondition, columnText, searchOptions, columnOptions, webType } = toRefs(state);

  function init(data) {
    changeLoading(true);
    state.webType = '1';
    state.dataForm = {
      id: '',
      formLink: '',
      formUse: 0,
      formPassUse: 0,
      formPassword: '',
      columnUse: 0,
      columnLink: '',
      columnPassUse: 0,
      columnPassword: '',
      columnCondition: '',
      columnText: '',
      alreadySave: false,
    };
    state.columnCondition = [];
    state.columnText = [];
    state.id = data.id;
    getOptions(data.id);
    nextTick(() => {
      clearValidate();
      getShortLinkData(data.id);
    });
  }
  function getShortLinkData(id) {
    changeLoading(true);
    getShortLinkInfo(id).then(res => {
      state.dataForm = res.data || {};
      state.columnConditionData = state.dataForm.columnCondition ? JSON.parse(state.dataForm.columnCondition) : [];
      state.columnTextData = state.dataForm.columnText ? JSON.parse(state.dataForm.columnText) : [];
      state.columnCondition = state.columnConditionData.map(o => o.id);
      state.columnText = state.columnTextData.map(o => o.id);
      changeLoading(false);
    });
  }
  function getOptions(id) {
    getInfo(id).then(res => {
      state.webType = res.data.webType || '1';
      const formData = res.data.formData ? JSON.parse(res.data.formData) : {};
      let list: any[] = [];
      const loop = (data, parent?) => {
        if (!data) return;
        if (data.__config__ && data.__config__.children && Array.isArray(data.__config__.children)) {
          loop(data.__config__.children, data);
        }
        if (Array.isArray(data)) data.forEach(d => loop(d, parent));
        if (data.__config__ && data.__config__.jnpfKey) {
          const visibility = !data.__config__.visibility || (Array.isArray(data.__config__.visibility) && data.__config__.visibility.includes('pc'));
          if (data.__config__.layout === 'colFormItem' && data.__vModel__ && visibility) {
            const isTableChild = parent && parent.__config__ && parent.__config__.jnpfKey === 'table';
            list.push({
              id: isTableChild ? parent.__vModel__ + '-' + data.__vModel__ : data.__vModel__,
              fullName: isTableChild ? parent.__config__.label + '-' + data.__config__.label : data.__config__.label,
              ...data,
              disabled: false,
            });
          }
        }
      };
      loop(formData.fields);
      list = list.filter(o => {
        if (!o.__config__ || !o.__config__.jnpfKey) return true;
        const jnpfKey = o.__config__.jnpfKey;
        if (validFieldsList.includes(jnpfKey) || (selectFieldsList.includes(jnpfKey) && o.__config__.dataType === 'static')) return true;
        return false;
      });
      const columnOptions = list.filter(o => !noColumnShowList.includes(o.__config__.jnpfKey) || o.isStorage);
      const searchOptions = list.filter(o => !noSearchList.includes(o.__config__.jnpfKey));
      state.columnOptions = columnOptions.map(o => ({
        label: o.fullName,
        prop: o.id,
        fixed: 'none',
        align: 'left',
        jnpfKey: o.__config__.jnpfKey,
        sortable: false,
        width: null,
        ...o,
      }));
      state.searchOptions = searchOptions.map(o => ({
        label: o.fullName,
        prop: o.id,
        jnpfKey: o.__config__.jnpfKey,
        value: '',
        ...o,
      }));
    });
  }
  function clearValidate() {
    formElRef.value?.clearValidate();
  }
  function handleDownload(type) {
    const qrEl = type == 1 ? unref(qrRef) : unref(columnQrRef);
    if (!qrEl) return;
    qrEl.download('二维码');
  }
  function handleCopy(text) {
    const { isSuccessRef } = useCopyToClipboard(text);
    unref(isSuccessRef) && createMessage.success('复制成功');
  }
  function onConditionChange(_val, data) {
    state.columnConditionData = data || [];
  }
  function onColumnTextChange(_val, data) {
    state.columnTextData = data || [];
  }
  async function handleSubmit() {
    try {
      const values = await formElRef.value?.validate();
      if (!values) return;
      changeOkLoading(true);
      state.dataForm.columnCondition = JSON.stringify(state.columnConditionData);
      state.dataForm.columnText = JSON.stringify(state.columnTextData);
      updateShortLink(state.dataForm)
        .then(res => {
          changeOkLoading(false);
          createMessage.success(res.msg);
          getShortLinkData(state.id);
        })
        .catch(() => {
          changeOkLoading(false);
        });
    } catch (_) {}
  }
</script>
<style lang="less">
  .jnpf-shortLink-modal {
    .shortLink-tip {
      color: @text-color-label;
    }
    .ym-custom-qrcode {
      font-size: 32px;
      line-height: 29px;
      height: 29px;
      display: inline-block;
      cursor: pointer;
      color: @text-color-label;
    }
    .ant-divider {
      margin-top: 0 !important;
    }
  }
</style>
