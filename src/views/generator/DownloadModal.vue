<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="输出设置" okText="下载代码" @ok="handleSubmit">
    <a-alert message="注意：以下只能包含数字、字母、下划线、小圆点，不能用数字开头，不能是关键字或保留字。" type="warning" showIcon class="!mb-18px" />
    <a-form :colon="false" :labelCol="{ style: { width: '100px' } }" :model="dataForm" ref="formElRef">
      <a-form-item label="模块命名" name="module" v-if="type != 3" :rules="[{ required: true, message: '必填', trigger: 'change' }]">
        <jnpf-select v-model:value="dataForm.module" :options="moduleOptions" placeholder="请选择" showSearch />
      </a-form-item>
      <a-form-item name="modulePackageName" :rules="[{ required: true, message: '必填', trigger: 'blur' }]" v-if="hasPackage">
        <template #label>模块包名<BasicHelp text="修改包名需要调整controller和mapper扫描配置" /></template>
        <a-input v-model:value="dataForm.modulePackageName" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="功能描述" name="description" :rules="[{ required: true, message: '必填', trigger: 'blur' }]">
        <a-input v-model:value="dataForm.description" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="功能类名" name="className" :rules="[{ required: true, message: '必填', trigger: 'blur' }]">
        <a-input v-model:value="dataForm.className" placeholder="请输入" />
      </a-form-item>
      <a-form-item
        :label="item.placeholderText"
        :name="['subClassName', i, 'fullName']"
        v-for="(item, i) in dataForm.subClassName"
        :key="i"
        :rules="item.rules">
        <a-input v-model:value="item.fullName" :placeholder="item.placeholderText" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive, ref, toRefs, nextTick } from 'vue';
  import { downloadCode } from '/@/api/onlineDev/visualDev';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { downloadByUrl } from '/@/utils/file/download';
  import { useBaseStore } from '/@/store/modules/base';

  interface State {
    dataForm: any;
    moduleOptions: any[];
    tables: any[];
    type: number;
    id: string;
    hasPackage: boolean;
  }

  defineEmits(['register']);
  const baseStore = useBaseStore();
  const [registerModal, { changeOkLoading, closeModal }] = useModalInner(init);
  const formElRef = ref<FormInstance>();
  const state = reactive<State>({
    dataForm: {
      module: '',
      modulePackageName: 'jnpf',
      description: '',
      subClassName: [],
      className: '',
    },
    moduleOptions: [],
    tables: [],
    type: 0,
    id: '',
    hasPackage: false,
  });
  const { dataForm, type, moduleOptions, hasPackage } = toRefs(state);

  function init(data) {
    state.tables = JSON.parse(data.tables);
    state.id = data.id;
    state.type = data.type || 0;
    state.hasPackage = !!data.hasPackage;
    getOptions();
    nextTick(() => {
      formElRef.value?.clearValidate();
      const mainTable = state.tables.filter(o => o.typeId == '1')[0].table;
      state.dataForm.className = mainTable;
      state.dataForm.description = mainTable;
      const subClassName = state.tables.filter(o => o.typeId != '1');
      state.dataForm.subClassName = subClassName.map(o => ({
        fullName: o.table,
        placeholderText: '子表类名',
        rules: { required: true, message: `子表类名不能为空`, trigger: 'blur' },
      }));
    });
  }
  function getOptions() {
    baseStore.getDictionaryData('createModule').then(res => {
      state.moduleOptions = res as any;
      if (state.moduleOptions.length) state.dataForm.module = state.moduleOptions[0].id;
    });
  }
  async function handleSubmit() {
    try {
      const values = await formElRef.value?.validate();
      if (!values) return;
      changeOkLoading(true);
      const subClassName = state.dataForm.subClassName.map(o => o.fullName);
      const query = {
        module: state.dataForm.module,
        className: state.dataForm.className,
        subClassName: subClassName.join(','),
        description: state.dataForm.description,
        modulePackageName: state.dataForm.modulePackageName,
      };
      downloadCode(state.id, query)
        .then(res => {
          downloadByUrl({ url: res.data.url });
          closeModal();
        })
        .catch(() => {
          changeOkLoading(false);
        });
    } catch (_) {}
  }
</script>
