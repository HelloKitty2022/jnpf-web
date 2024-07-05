<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-search-box">
        <BasicForm class="search-form" @register="registerSearchForm" @submit="handleSubmit" @reset="handleReset" />
      </div>
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable" :dataSource="list" @change="handleTableChange" :pagination="getPagination">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'signArray'">
              <template v-if="record.signArray?.length">
                <span v-for="(item, i) in record.signArray" :key="i">
                  <i class="ym-custom ym-custom-checkbox-blank-circle" style="color: #ff625c; font-size: 16px" v-if="item == '1'"></i>
                  <i class="ym-custom ym-custom-checkbox-blank-circle" style="color: #f9a646; font-size: 16px" v-if="item == '2'"></i>
                  <i class="ym-custom ym-custom-checkbox-blank-circle" style="color: #f4ce4a; font-size: 16px" v-if="item == '3'"></i>
                  <i class="ym-custom ym-custom-checkbox-blank-circle" style="color: #6dcc51; font-size: 16px" v-if="item == '4'"></i>
                  <i class="ym-custom ym-custom-checkbox-blank-circle" style="color: #4bb8f3; font-size: 16px" v-if="item == '5'"></i>
                  <i class="ym-custom ym-custom-checkbox-blank-circle" style="color: #d088e1; font-size: 16px" v-if="item == '6'"></i>
                  <i class="ym-custom ym-custom-checkbox-blank-circle" style="color: #a5a5a8; font-size: 16px" v-if="item == '7'"></i>
                </span>
              </template>
              <i class="ym-custom ym-custom-checkbox-blank-circle-outline" v-else style="font-size: 16px; color: #cecece"></i>
            </template>
            <template v-if="column.key === 'action'">
              <a-dropdown>
                <a class="ant-dropdown-link" @click.prevent> 项目标记<DownOutlined /> </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item v-for="(item, i) in options" :key="item.value" @click.native="handleSign(record, item.value, i)">
                      <span :style="{ color: item.color }">{{ item.text }}</span>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
          </template>
          <template #toolbar>
            <ATooltip placement="top">
              <template #title>
                <span>{{ t('common.redo') }}</span>
              </template>
              <RedoOutlined @click="reload" />
            </ATooltip>
          </template>
        </BasicTable>
      </div>
    </div>
  </div>
  <Form @register="registerForm" @reload="reload" />
</template>
<script lang="ts" setup>
  import { onMounted, reactive, toRefs, computed } from 'vue';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { getTableList, updateSign } from '/@/api/extend/table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useBaseStore } from '/@/store/modules/base';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useModal } from '/@/components/Modal';
  import { RedoOutlined } from '@ant-design/icons-vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import Form from '../commonForm/index.vue';

  defineOptions({ name: 'extend-tableDemo-signTable' });

  interface State {
    industryTypeList: any[];
    options: any[];
    list: any[];
    listQuery: any;
    total: string;
  }

  const state = reactive<State>({
    industryTypeList: [],
    options: [
      { text: '红色', value: '1', color: '#ff625c' },
      { text: '橙色', value: '2', color: '#f9a646' },
      { text: '黄色', value: '3', color: '#f4ce4a' },
      { text: '绿色', value: '4', color: '#6dcc51' },
      { text: '蓝色', value: '5', color: '#4bb8f3' },
      { text: '紫色', value: '6', color: '#d088e1' },
      { text: '灰色', value: '7', color: '#a5a5a8' },
      { text: '清空', value: '0', color: '' },
    ],
    list: [],
    listQuery: {
      currentPage: 1,
      pageSize: 20,
      sort: 'desc',
      keyword: '',
    },
    total: '',
  });
  const { options, list } = toRefs(state);
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const { createMessage } = useMessage();
  const columns: BasicColumn[] = [
    { title: '项目名称', dataIndex: 'projectName', width: 200 },
    { title: '项目编码', dataIndex: 'projectCode', width: 160 },
    {
      title: '项目类型',
      dataIndex: 'projectType',
      width: 120,
      customRender: ({ record }) => {
        let item = state.industryTypeList.filter(o => o.id == record.projectType)[0];
        return item && item.fullName ? item.fullName : '';
      },
    },
    { title: '项目阶段', dataIndex: 'projectPhase', width: 120 },
    {
      title: '项目标记',
      dataIndex: 'signArray',
      width: 170,
      align: 'center',
      filters: [
        { text: '红色', value: '1' },
        { text: '橙色', value: '2' },
        { text: '黄色', value: '3' },
        { text: '绿色', value: '4' },
        { text: '蓝色', value: '5' },
        { text: '紫色', value: '6' },
        { text: '灰色', value: '7' },
      ],
      onFilter: (value: string, record) => record.signArray.includes(value),
    },
    { title: '客户名称', dataIndex: 'customerName', width: 200 },
    { title: '负责人', dataIndex: 'principal', width: 80 },
    { title: '立项人', dataIndex: 'jackStands', width: 80 },
    { title: '交互时间', dataIndex: 'interactionDate', width: 100, format: 'date|YYYY-MM-DD' },
    { title: '费用金额', dataIndex: 'costAmount', width: 100 },
    { title: '已用金额', dataIndex: 'tunesAmount', width: 100 },
    { title: '预计收入', dataIndex: 'projectedIncome', width: 100 },
    { title: '登记人', dataIndex: 'registrant', width: 80 },
    { title: '登记时间', dataIndex: 'registerDate', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '备注', dataIndex: 'description', width: 100 },
  ];
  const [registerTable, { setLoading }] = useTable({
    columns,
    useSearchForm: false,
    actionColumn: {
      width: 100,
      title: '操作',
      dataIndex: 'action',
    },
    tableSetting: {
      redo: false,
    },
  });
  const [registerSearchForm] = useForm({
    baseColProps: { span: 6 },
    showActionButtonGroup: true,
    showAdvancedButton: true,
    compact: true,
    schemas: [
      {
        field: 'keyword',
        label: t('common.keyword'),
        component: 'Input',
        componentProps: {
          placeholder: t('common.enterKeyword'),
          submitOnPressEnter: true,
        },
      },
    ],
  });
  const [registerForm, { openModal: openFormModal }] = useModal();

  const getPagination = computed<any>(() => {
    return {
      current: state.listQuery.currentPage,
      pageSize: state.listQuery.pageSize,
      size: 'small',
      defaultPageSize: state.listQuery.pageSize,
      showTotal: total => t('component.table.total', { total }),
      showSizeChanger: true,
      pageSizeOptions: ['20', '50', '80', '100'],
      showQuickJumper: true,
      total: state.total,
    };
  });

  async function init() {
    state.industryTypeList = (await baseStore.getDictionaryData('IndustryType')) as any[];
    initData();
  }
  function initData() {
    setLoading(true);
    getTableList(state.listQuery)
      .then(res => {
        setLoading(false);
        let data = res.data.list;
        for (let i = 0; i < data.length; i++) {
          const e = data[i];
          e.signArray = e.sign ? e.sign.split('').filter(o => o != '0') : [];
        }
        state.list = data;
        state.total = res.data.pagination.total;
      })
      .then(() => {
        setLoading(false);
      });
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id, industryTypeList: state.industryTypeList });
  }
  function handleSign(row, value, i) {
    let sign = '0000000';
    if (value !== '0') {
      let signArray = row.sign.split('');
      signArray[i] = signArray[i] == value ? '0' : value;
      sign = signArray.join('');
    }
    updateSign(row.id, { sign }).then(res => {
      row.signArray = sign.split('').filter(o => o != '0');
      row.sign = sign;
      createMessage.success(res.msg);
    });
  }
  function reload() {
    initData();
  }
  function handleTableChange(pagination, _e, _v, type) {
    if (type?.action === 'paginate') {
      state.listQuery.currentPage = pagination.current;
      state.listQuery.pageSize = pagination.pageSize;
      initData();
    }
  }
  function handleSubmit(values) {
    state.listQuery.currentPage = 1;
    state.listQuery.keyword = values?.keyword || '';
    initData();
  }
  function handleReset() {
    state.listQuery.currentPage = 1;
    state.listQuery.keyword = '';
    initData();
  }

  onMounted(() => init());
</script>
