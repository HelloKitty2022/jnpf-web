<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" showOkBtn @ok="handleSubmit">
    <BasicForm @register="registerForm">
      <template #dbSchema="{ model, field }">
        <a-input
          v-model:value="model[field]"
          allowClear
          :placeholder="dbType === 'Oracle' || dbType === 'DM' ? '与用户同名' : ''"
          :disabled="dbType !== 'KingbaseES'">
          <template #addonAfter>
            <loading-outlined class="mr-5px" v-if="testLoading" />
            <span class="cursor-pointer" @click="test()">连接测试</span>
          </template>
        </a-input>
      </template>
      <template #serviceName="{ model, field }">
        <a-input v-if="dbType === 'MySQL'" v-model:value="model[field]" allowClear placeholder="库名">
          <template #addonAfter>
            <loading-outlined class="mr-5px" v-if="testLoading" />
            <span class="cursor-pointer" @click="test()">连接测试</span>
          </template>
        </a-input>
        <a-input v-else v-model:value="model[field]" allowClear placeholder="库名" />
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, unref, computed, reactive, toRefs } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { testDbConnection, getDataSourceInfo, createDataSource, updateDataSource } from '/@/api/systemData/dataSource';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useBaseStore } from '/@/store/modules/base';
  import { LoadingOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    testLoading: boolean;
    dbType: string;
  }

  const id = ref('');
  const baseStore = useBaseStore();
  const state = reactive<State>({
    testLoading: false,
    dbType: '',
  });
  const { testLoading, dbType } = toRefs(state);
  const schemas: FormSchema[] = [
    {
      field: 'dbType',
      label: '连接驱动',
      component: 'Select',
      componentProps: { placeholder: '请选择', fieldNames: { label: 'fullName', value: 'enCode' }, onChange },
      rules: [{ required: true, trigger: 'change', message: '必填' }],
    },
    {
      field: 'fullName',
      label: '连接名称',
      component: 'Input',
      componentProps: { placeholder: '请输入', maxlength: 50 },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'host',
      label: '主机地址',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'port',
      label: '端口',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [
        { required: true, trigger: 'blur', message: '必填' },
        { pattern: /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/, message: '请输入正确的端口号', trigger: 'blur' },
      ],
    },
    {
      field: 'userName',
      label: '用户',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      field: 'password',
      label: '密码',
      component: 'InputPassword',
      componentProps: { placeholder: '请输入' },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      ifShow: ({ values }) => values.dbType === 'MySQL' || values.dbType === 'SQLServer' || values.dbType === 'PostgreSQL' || values.dbType === 'KingbaseES',
      field: 'serviceName',
      label: '库名',
      component: 'Input',
      slot: 'serviceName',
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
    {
      ifShow: ({ values }) => values.dbType && values.dbType !== 'MySQL',
      field: 'dbSchema',
      label: '模式',
      component: 'InputSearch',
      slot: 'dbSchema',
    },
    {
      ifShow: ({ values }) => values.dbType === 'Oracle',
      field: 'oracleExtend',
      label: '更多',
      component: 'Switch',
      defaultValue: 0,
    },
    {
      ifShow: ({ values }) => values.dbType === 'Oracle' && !!values.oracleExtend,
      field: 'oracleLinkType',
      label: '连接方式',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { fullName: 'SERVICE', id: 'SERVICE' },
          { fullName: 'SID', id: 'SID' },
          { fullName: 'SCHEMA', id: 'SCHEMA' },
          { fullName: 'TNS', id: 'TNS' },
        ],
      },
    },
    {
      ifShow: ({ values }) => values.dbType === 'Oracle' && !!values.oracleExtend,
      field: 'oracleRole',
      label: '角色',
      component: 'Select',
      componentProps: {
        placeholder: '请选择',
        options: [
          { fullName: 'Default', id: 'Default' },
          { fullName: 'SYSDBA', id: 'SYSDBA' },
          { fullName: 'SYSOPER', id: 'SYSOPER' },
        ],
      },
    },
    {
      ifShow: ({ values }) => values.dbType === 'Oracle' && !!values.oracleExtend,
      field: 'oracleService',
      label: '服务名',
      component: 'Input',
      componentProps: { placeholder: '请输入' },
    },
    {
      field: 'sortCode',
      label: '排序',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: { min: '0', max: '999999', placeholder: '请输入' },
    },
  ];
  const getTitle = computed(() => (!unref(id) ? t('common.addText') : t('common.editText')));
  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const { t } = useI18n();
  const [registerForm, { setFieldsValue, validate, clearValidate, resetFields, updateSchema }] = useForm({ labelWidth: 80, schemas: schemas });
  const [registerModal, { closeModal, changeLoading, changeOkLoading }] = useModalInner(init);

  function init(data) {
    state.testLoading = false;
    resetFields();
    getDictionaryData();
    id.value = data.id || 0;
    updateSchema({ field: 'dbType', componentProps: { disabled: !!unref(id) } });
    if (id.value) {
      changeLoading(true);
      getDataSourceInfo(id.value).then(res => {
        const data = res.data;
        data.oracleExtend = data.oracleExtend ? 1 : 0;
        state.dbType = data.dbType;
        setFieldsValue(data);
        changeLoading(false);
      });
    }
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    values.oracleExtend = !!values.oracleExtend;
    const query = {
      ...values,
      id: id.value,
    };
    const formMethod = id.value ? updateDataSource : createDataSource;
    formMethod(query)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        closeModal();
        emit('reload');
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
  async function getDictionaryData() {
    const categoryList = (await baseStore.getDictionaryData('dbType')) as any[];
    updateSchema({ field: 'dbType', componentProps: { options: categoryList } });
  }
  async function test() {
    const values = await validate();
    if (!values) return;
    state.testLoading = true;
    values.oracleExtend = !!values.oracleExtend;
    const query = {
      ...values,
      id: id.value,
    };
    testDbConnection(query)
      .then(res => {
        createMessage.success(res.msg);
        state.testLoading = false;
      })
      .catch(() => {
        state.testLoading = false;
      });
  }
  function onChange(e) {
    state.dbType = e;
    let port = '';
    let dbSchema = '';
    switch (e) {
      case 'SQLServer':
        port = '1433';
        dbSchema = 'dbo';
        break;
      case 'MySQL':
        port = '3306';
        break;
      case 'Oracle':
        port = '1521';
        break;
      case 'DM':
        port = '5236';
        break;
      case 'KingbaseES':
        port = '54321';
        dbSchema = 'public';
        break;
      case 'PostgreSQL':
        port = '5432';
        dbSchema = 'public';
        break;
      default:
        port = '';
        break;
    }
    setFieldsValue({ port, dbSchema });
    clearValidate();
  }
</script>
