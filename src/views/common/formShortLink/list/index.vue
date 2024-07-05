<template>
  <div class="jnpf-content-wrapper short-link-wrapper short-link-wrapper-list">
    <div class="short-link-lock-wrapper" v-show="columnPassUse">
      <div class="short-link-lock-form">
        <a-input-group compact class="enter-y">
          <a-input-password v-model:value="password" placeholder="请输入密码" @keyup.enter="unLock()" />
          <a-button :loading="btnLoading" @click="unLock()">
            <template #icon><unlock-outlined /></template>
          </a-button>
        </a-input-group>
      </div>
    </div>
    <div class="short-link-main" v-show="!columnPassUse">
      <a-popover placement="bottomRight">
        <template #content>
          <p class="shortLink-tip">扫描二维码，分享此链接</p>
          <QrCode :value="state.columnLink" :width="154" :options="{ margin: 1 }" class="my-5px" />
        </template>
        <i class="ym-custom ym-custom-qrcode icon-qrcode"></i>
      </a-popover>
      <div class="short-link-header">
        {{ config.fullName }}
      </div>
      <div class="jnpf-content-wrapper-center">
        <div class="jnpf-content-wrapper-search-box" v-if="columnData.searchList?.length">
          <BasicForm
            @register="registerSearchForm"
            :schemas="searchSchemas"
            @advanced-change="redoHeight"
            @submit="handleSearchSubmit"
            @reset="handleSearchReset"
            class="search-form">
          </BasicForm>
        </div>
        <div class="jnpf-content-wrapper-content">
          <BasicTable @register="registerTable" v-bind="getTableBindValue" ref="tableRef" @columns-change="handleColumnChange">
            <template #expandedRowRender="{ record }" v-if="getChildTableStyle === 2 && childColumnList.length">
              <a-tabs size="small">
                <a-tab-pane :key="cIndex" :tab="child.label" :label="child.label" v-for="(child, cIndex) in childColumnList">
                  <a-table size="small" :data-source="record[child.prop]" :columns="child.children" :pagination="false" :scroll="{ x: 'max-content' }">
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.jnpfKey === 'rate'">
                        <jnpf-rate v-model:value="record[column.dataIndex]" :count="column.count" :allowHalf="column.allowHalf" disabled />
                      </template>
                      <template v-if="column.jnpfKey === 'slider'">
                        <jnpf-slider v-model:value="record[column.dataIndex]" :min="column.min" :max="column.max" :step="column.step" disabled />
                      </template>
                      <template v-if="column.jnpfKey === 'input'">
                        <jnpf-input
                          v-model:value="record[column.dataIndex]"
                          :useMask="column.useMask"
                          :maskConfig="column.maskConfig"
                          :showOverflow="columnData.showOverflow"
                          detailed />
                      </template>
                    </template>
                  </a-table>
                </a-tab-pane>
              </a-tabs>
            </template>
            <template #bodyCell="{ column, record }">
              <template v-for="(item, index) in childColumnList" v-if="getChildTableStyle !== 2 && childColumnList.length">
                <template v-if="column.id?.includes('-') && item.children && item.children[0] && column.key === item.children[0]?.dataIndex">
                  <ChildTableColumn
                    :data="record[item.prop]"
                    :head="item.children"
                    @toggleExpand="toggleExpand(record, `${item.prop}Expand`)"
                    :expand="record[`${item.prop}Expand`]"
                    :showOverflow="columnData.showOverflow"
                    :key="index" />
                </template>
              </template>
              <template v-if="!(record.top || column.id?.includes('-'))">
                <template v-if="column.jnpfKey === 'inputNumber'">
                  <jnpf-input-number v-model:value="record[column.dataIndex]" :precision="column.precision" :thousands="column.thousands" disabled detailed />
                </template>
                <template v-if="column.jnpfKey === 'calculate'">
                  <jnpf-calculate
                    v-model:value="record[column.dataIndex]"
                    :isStorage="column.isStorage"
                    :precision="column.precision"
                    :thousands="column.thousands"
                    detailed />
                </template>
                <template v-if="column.jnpfKey === 'rate'">
                  <jnpf-rate v-model:value="record[column.dataIndex]" :count="column.count" :allowHalf="column.allowHalf" disabled />
                </template>
                <template v-if="column.jnpfKey === 'slider'">
                  <jnpf-slider v-model:value="record[column.dataIndex]" :min="column.min" :max="column.max" :step="column.step" disabled />
                </template>
                <template v-if="column.jnpfKey === 'input'">
                  <jnpf-input
                    v-model:value="record[column.dataIndex]"
                    :useMask="column.useMask"
                    :maskConfig="column.maskConfig"
                    :showOverflow="columnData.showOverflow"
                    detailed />
                </template>
              </template>
              <template v-if="column.key === 'action' && (!record.top || columnData.type == 5)">
                <TableAction :actions="getTableActions(record)" />
              </template>
            </template>
            <template #summary v-if="columnData.showSummary && [1, 2, 4].includes(columnData.type)">
              <a-table-summary fixed>
                <a-table-summary-row>
                  <a-table-summary-cell :index="0">合计</a-table-summary-cell>
                  <a-table-summary-cell v-for="(item, index) in getColumnSum" :key="index" :index="index + 1">{{ item }}</a-table-summary-cell>
                  <a-table-summary-cell :index="getColumnSum.length + 1"></a-table-summary-cell>
                </a-table-summary-row>
              </a-table-summary>
            </template>
          </BasicTable>
        </div>
      </div>
    </div>
    <Detail ref="detailRef" />
  </div>
</template>

<script lang="ts" setup>
  import { getModelList, getConfig, checkPwd } from '/@/api/onlineDev/shortLink';
  import { ref, reactive, onMounted, toRefs, computed, unref, nextTick } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, useForm } from '/@/components/Form';
  import { BasicTable, useTable, TableAction, ActionItem, TableActionType, SorterResult } from '/@/components/Table';
  import Detail from './detail/index.vue';
  import ChildTableColumn from '../../dynamicModel/list/ChildTableColumn.vue';
  import { getScriptFunc, thousandsFormat } from '/@/utils/jnpf';
  import { getSearchFormSchemas } from '/@/components/FormGenerator/src/helper/transform';
  import { cloneDeep } from 'lodash-es';
  import { QrCode } from '/@/components/Qrcode/index';
  import { UnlockOutlined } from '@ant-design/icons-vue';
  import { encryptByMd5 } from '/@/utils/cipher';

  interface State {
    flowList: any[];
    config: any;
    columnData: any;
    formConf: any;
    hasBatchBtn: boolean;
    columnBtnsList: any[];
    customBtnsList: any[];
    columnOptions: any[];
    treeFieldNames: any;
    leftTreeData: any[];
    leftTreeLoading: boolean;
    treeActiveId: string;
    treeActiveNodePath: any;
    columns: any[];
    complexColumns: any[];
    childColumnList: any[];
    exportList: any[];
    cacheList: any[];
    currFlow: any;
    isCustomCopy: boolean;
    candidateType: number;
    currRow: any;
    workFlowFormData: any;
    expandObj: any;
    columnSettingList: any[];
    searchSchemas: any[];
    treeRelationObj: any;
    customRow: any;
    customCell: any;
    columnLink: string;
    btnLoading: boolean;
    key: number;
    shortLinkId: string;
    columnPassUse: number;
    password: string;
    realSearchList: any[];
    realColumnList: any[];
  }

  const props = defineProps(['config', 'modelId', 'isPreview']);
  const { createMessage } = useMessage();
  const tableRef = ref<Nullable<TableActionType>>(null);
  const detailRef = ref<any>(null);
  const searchInfo = reactive({
    modelId: '',
    menuId: '',
    queryJson: '',
    superQueryJson: '',
    encryption: props.config.encryption,
  });
  const state = reactive<State>({
    flowList: [],
    config: {},
    columnData: {},
    formConf: {},
    hasBatchBtn: false,
    columnBtnsList: [],
    customBtnsList: [],
    columnOptions: [],
    treeFieldNames: {
      children: 'children',
      title: 'fullName',
      key: 'id',
      isLeaf: 'isLeaf',
    },
    leftTreeData: [],
    leftTreeLoading: false,
    treeActiveId: '',
    treeActiveNodePath: [],
    columns: [],
    complexColumns: [], // 复杂表头
    childColumnList: [],
    exportList: [],
    cacheList: [],
    currFlow: {},
    isCustomCopy: false,
    candidateType: 1,
    currRow: {},
    workFlowFormData: {},
    expandObj: {},
    columnSettingList: [],
    searchSchemas: [],
    treeRelationObj: null,
    customRow: null,
    customCell: null,
    columnLink: '',
    btnLoading: false,
    key: +new Date(),
    shortLinkId: '',
    columnPassUse: -1,
    password: '',
    realSearchList: [],
    realColumnList: [],
  });
  const { columnData, childColumnList, searchSchemas, config, btnLoading, columnPassUse, password } = toRefs(state);
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
    'iframe',
  ];
  const selectFieldsList = ['radio', 'checkbox', 'select', 'treeSelect', 'cascader'];
  const [registerSearchForm, { submit: searchFormSubmit }] = useForm({
    baseColProps: { span: 6 },
    showActionButtonGroup: true,
    showAdvancedButton: true,
    compact: true,
  });
  const [registerTable, { reload, setLoading, redoHeight }] = useTable({
    api: getModelList,
    immediate: false,
    clickToRowSelect: false,
    resizeHeightOffset: -10,
    // scroll: { x: 'max-content' },
    afterFetch: data => {
      // 行内编辑
      if (state.columnData.type === 4) {
        const list = data.map(o => ({ ...o, rowEdit: false }));
        state.cacheList = cloneDeep(list);
        return list;
      }
      let list = data.map(o => ({
        ...o,
        ...state.expandObj,
      }));
      state.cacheList = cloneDeep(list);
      // 分组表格
      if (state.columnData.type === 3) {
        list.map(o => {
          if (o.children && o.children.length) {
            o.children = o.children.map(e => ({
              ...e,
              ...state.expandObj,
            }));
          }
        });
      }
      return list;
    },
  });

  const getPagination = computed(() => {
    if ([3, 5].includes(state.columnData.type) || !state.columnData.hasPage) return false;
    return { pageSize: state.columnData.pageSize };
  });
  const getChildTableStyle = computed(() => (state.columnData.type == 3 || state.columnData.type == 5 ? 1 : state.columnData.childTableStyle));
  const getColumns = computed(() => (unref(getChildTableStyle) == 2 || state.columnData.type == 4 ? state.columns : state.complexColumns));
  const getTableBindValue = computed(() => {
    let columns = unref(getColumns);
    if (state.config.enableFlow) {
      const boo = columns.some(o => o.dataIndex === 'flowState');
      if (!boo) columns.push({ title: '状态', dataIndex: 'flowState', width: 100 });
    }
    const defaultSortConfig = (state.columnData.defaultSortConfig || []).map(o => (o.sort === 'desc' ? '-' : '') + o.field);
    const data: any = {
      pagination: unref(getPagination),
      searchInfo: unref(searchInfo),
      defSort: { sidx: defaultSortConfig.join(',') },
      sortFn: (sortInfo: SorterResult | SorterResult[]) => {
        if (Array.isArray(sortInfo)) {
          const sortList = sortInfo.map(o => (o.order === 'descend' ? '-' : '') + o.field);
          return { sidx: sortList.join(',') };
        } else {
          const { field, order } = sortInfo;
          if (field && order) {
            // 排序字段
            return { sidx: (order === 'descend' ? '-' : '') + field };
          } else {
            return {};
          }
        }
      },
      columns,
      clearSelectOnPageChange: true,
      ellipsis: !!state.columnData.showOverflow,
      isTreeTable: [3, 5].includes(state.columnData.type),
      bordered: (unref(getChildTableStyle) != 2 && !!state.childColumnList?.length) || !!state.columnData.complexHeaderList?.length,
    };
    data.actionColumn = {
      width: 50,
      title: '操作',
      dataIndex: 'action',
      fixed: 'right',
    };
    if (state.customRow) data.customRow = state.customRow;
    return data;
  });
  const getSummaryColumn = computed(() => {
    let defaultColumns = unref(getColumns);
    // 处理列固定
    if (state.columnSettingList?.length) {
      for (let i = 0; i < defaultColumns.length; i++) {
        inner: for (let j = 0; j < state.columnSettingList.length; j++) {
          if (defaultColumns[i].dataIndex === state.columnSettingList[j].dataIndex) {
            defaultColumns[i].fixed = state.columnSettingList[j].fixed;
            defaultColumns[i].visible = state.columnSettingList[j].visible;
            break inner;
          }
        }
      }
      defaultColumns = defaultColumns.filter(o => o.visible);
    }
    let columns: any[] = [];
    for (let i = 0; i < defaultColumns.length; i++) {
      const e = defaultColumns[i];
      if (e.jnpfKey === 'table' || e.jnpfKey === 'complexHeader') {
        if (e.children?.length) columns.push(...e.children);
      } else {
        columns.push(e);
      }
      if (e.fixed && e.children?.length) {
        for (let j = 0; j < e.children.length; j++) {
          e.children[j].fixed = e.fixed;
        }
      }
    }
    const leftFixedList = columns.filter(o => o.fixed === 'left');
    const rightFixedList = columns.filter(o => o.fixed === 'right');
    const noFixedList = columns.filter(o => o.fixed !== 'left' && o.fixed !== 'right');
    return [...leftFixedList, ...rightFixedList, ...noFixedList];
  });
  // 列表合计
  const getColumnSum = computed(() => {
    const sums: any[] = [];
    const isSummary = key => state.columnData.summaryField.includes(key);
    const useThousands = key => unref(getSummaryColumn).some(o => o.__vModel__ === key && o.thousands);
    unref(getSummaryColumn).forEach((column, index) => {
      let sumVal = state.cacheList.reduce((sum, d) => sum + getCmpValOfRow(d, column.prop), 0);
      if (!isSummary(column.prop)) sumVal = '';
      sumVal = Number.isNaN(sumVal) ? '' : sumVal;
      const realVal = sumVal && !Number.isInteger(sumVal) ? Number(sumVal).toFixed(2) : sumVal;
      sums[index] = useThousands(column.prop) ? thousandsFormat(realVal) : realVal;
    });
    if ([1, 2].includes(state.columnData.type) && unref(getChildTableStyle) === 2 && state.childColumnList.length) sums.unshift('');
    return sums;
  });

  function getCmpValOfRow(row, key) {
    const isSummary = key => state.columnData.summaryField.includes(key);
    if (!state.columnData.summaryField.length || !isSummary(key)) return 0;
    const target = row[key];
    if (!target) return 0;
    const data = isNaN(target) ? 0 : Number(target);
    return data;
  }
  function getTableActions(record): ActionItem[] {
    return [{ label: '详情', onClick: columnBtnsHandle.bind(null, 'detail', record) }];
  }
  // 行按钮点击事件
  function columnBtnsHandle(key, record) {
    if (key === 'detail') return goDetail(record);
  }
  // 查看详情
  function goDetail(record) {
    const formConf = cloneDeep(state.formConf);
    formConf.fields = getRealFields(formConf.fields);
    const data = {
      id: record.id,
      formConf: formConf,
      modelId: props.modelId,
      menuId: searchInfo.menuId,
      useFormPermission: false,
      encryption: props.config.encryption,
    };
    detailRef.value?.init(data);
  }
  function validFields(o) {
    if (!o.__config__ || !o.__config__.jnpfKey) return true;
    const jnpfKey = o.__config__.jnpfKey;
    if (validFieldsList.includes(jnpfKey) || (selectFieldsList.includes(jnpfKey) && o.__config__.dataType === 'static')) return true;
    return false;
  }
  function getRealFields(list) {
    let newList = list.filter(item => validFields(item));
    newList.forEach(o => o.__config__?.children && Array.isArray(o.__config__.children) && (o.__config__.children = getRealFields(o.__config__.children)));
    return newList;
  }
  function init() {
    state.config = {
      modelId: props.modelId,
      isPreview: props.isPreview,
      ...props.config,
    };
    searchInfo.menuId = props.modelId;
    searchInfo.modelId = props.modelId;
    if (!state.config.columnData || (state.config.webType != '4' && !state.config.formData)) return;
    state.columnData = JSON.parse(state.config.columnData);
    state.columnData.type = 1;
    state.columnData.searchList = state.realSearchList;
    state.columnData.columnList = state.realColumnList;
    if (state.columnData.type === 3) {
      state.columnData.columnList = state.columnData.columnList.filter(o => o.prop != state.columnData.groupField);
    }
    state.hasBatchBtn = state.columnData.btnsList.some(o => ['batchRemove', 'batchPrint'].includes(o.value));
    state.formConf = state.config.formData ? JSON.parse(state.config.formData) : {};
    state.formConf.popupType = 'general';
    state.columnOptions = state.columnData.columnOptions || [];
    setLoading(true);
    if (state.columnData.funcs.rowStyle) {
      state.customRow = (record, index) => {
        const data = { row: record, rowIndex: index };
        const func: any = getScriptFunc(state.columnData.funcs.rowStyle);
        const style: any = func ? func(data) : null;
        if (!style) return {};
        return { style };
      };
    }
    if (state.columnData.funcs.cellStyle) {
      state.customCell = (record, rowIndex, column) => {
        const data = { row: record, rowIndex, column, columnIndex: column.key };
        const func: any = getScriptFunc(state.columnData.funcs.cellStyle);
        const style: any = func ? func(data) : null;
        if (!style) return {};
        return { style };
      };
    }
    getSearchSchemas();
    getColumnList();
    if (props.isPreview) return setLoading(false);
    nextTick(() => {
      state.columnData.searchList?.length ? searchFormSubmit() : reload({ page: 1 });
    });
  }
  function getSearchSchemas() {
    if (state.columnData.treeRelation) {
      for (let i = 0; i < state.columnData.searchList.length; i++) {
        const e = state.columnData.searchList[i];
        if (e.id === state.columnData.treeRelation) {
          state.treeRelationObj = e;
          break;
        }
      }
      // 搜索字段里无左侧树关联字段时，去全部字段里获取关联字段属性
      if (!state.treeRelationObj) {
        for (let i = 0; i < state.columnData.columnOptions.length; i++) {
          const e = state.columnData.columnOptions[i];
          if (e.id === state.columnData.treeRelation) {
            state.treeRelationObj = { ...e, searchMultiple: false, jnpfKey: e.__config__.jnpfKey };
            break;
          }
        }
      }
    }
    const schemas = getSearchFormSchemas(state.columnData.searchList);
    state.searchSchemas = schemas;
  }
  function getColumnList() {
    let columnList: any[] = [];
    columnList = state.columnData.columnList;
    state.exportList = columnList;
    let columns = columnList.map(o => ({
      ...o,
      title: o.label,
      dataIndex: o.prop,
      align: o.align,
      fixed: o.fixed == 'none' ? false : o.fixed,
      sorter: o.sortable,
      width: o.width || 100,
      customCell: state.customCell || null,
    }));
    if (state.columnData.type !== 3 && state.columnData.type !== 5) columns = getComplexColumns(columns);
    state.columns = columns.filter(o => o.prop.indexOf('-') < 0);
    getChildComplexColumns(columns);
  }
  function getComplexColumns(columns) {
    let complexHeaderList: any[] = state.columnData.complexHeaderList || [];
    if (!complexHeaderList.length) return columns;
    let childColumns: any[] = [];
    let firstChildColumns: string[] = [];
    for (let i = 0; i < complexHeaderList.length; i++) {
      const e = complexHeaderList[i];
      e.title = e.fullName;
      e.align = e.align;
      e.dataIndex = e.id;
      e.prop = e.id;
      e.children = [];
      e.jnpfKey = 'complexHeader';
      if (e.childColumns?.length) {
        childColumns.push(...e.childColumns);
        for (let k = 0; k < e.childColumns.length; k++) {
          const item = e.childColumns[k];
          for (let j = 0; j < columns.length; j++) {
            const o = columns[j];
            if (o.prop == item && o.fixed !== 'left' && o.fixed !== 'right') e.children.push({ ...o });
          }
        }
      }
      if (e.children.length) firstChildColumns.push(e.children[0].prop);
    }
    complexHeaderList = complexHeaderList.filter(o => o.children.length);
    let list: any[] = [];
    for (let i = 0; i < columns.length; i++) {
      const e = columns[i];
      if (!childColumns.includes(e.prop)) {
        list.push(e);
      } else {
        if (firstChildColumns.includes(e.prop)) {
          const item = complexHeaderList.find(o => o.childColumns.includes(e.prop));
          list.push(item);
        }
      }
    }
    return list;
  }
  function getChildComplexColumns(columnList) {
    let list: any[] = [];
    for (let i = 0; i < columnList.length; i++) {
      const e = columnList[i];
      if (!e.prop.includes('-')) {
        list.push(e);
      } else {
        let prop = e.prop.split('-')[0];
        let vModel = e.prop.split('-')[1];
        let label = e.label.split('-')[0];
        let childLabel = e.label.replace(label + '-', '');
        let newItem = {
          align: 'center',
          jnpfKey: 'table',
          prop,
          label,
          title: label,
          dataIndex: prop,
          children: [],
          customCell: state.customCell || null,
        };
        e.dataIndex = vModel;
        e.title = childLabel;
        if (!state.expandObj.hasOwnProperty(`${prop}Expand`)) state.expandObj[`${prop}Expand`] = false;
        if (!list.some(o => o.prop === prop)) list.push(newItem);
        for (let i = 0; i < list.length; i++) {
          if (list[i].prop === prop) {
            list[i].children.push(e);
            break;
          }
        }
      }
    }
    if (unref(getChildTableStyle) != 2) getMergeList(list);
    state.complexColumns = list;
    state.childColumnList = list.filter(o => o.jnpfKey === 'table');
  }
  function getMergeList(list) {
    list.forEach(item => {
      if (item.jnpfKey === 'table' && item.children && item.children.length) {
        item.children.forEach((child, index) => {
          if (index == 0) {
            child.customCell = (record, rowIndex, column) => ({
              ...(state.customCell ? state.customCell(record, rowIndex, column) : {}),
              ...{
                rowspan: 1,
                colspan: item.children.length,
                class: 'child-table-box',
              },
            });
          } else {
            child.customCell = () => ({
              rowspan: 0,
              colspan: 0,
            });
          }
        });
      }
    });
  }
  function toggleExpand(row, field) {
    row[field] = !row[field];
  }
  function handleColumnChange(data) {
    state.columnSettingList = data;
  }
  function handleSearchSubmit(data) {
    let obj = {};
    for (let [key, value] of Object.entries(data)) {
      if (value) {
        if (Array.isArray(value)) {
          if (value.length) obj[key] = value;
        } else {
          obj[key] = value;
        }
      }
    }
    searchInfo.queryJson = JSON.stringify(obj) === '{}' ? '' : JSON.stringify(obj);
    reload({ page: 1 });
  }
  function handleSearchReset() {
    searchFormSubmit();
  }
  function unLock() {
    if (!state.password) return createMessage.error('请输入密码');
    state.btnLoading = true;
    const query = {
      id: state.shortLinkId,
      type: 1,
      encryption: props.config.encryption,
      password: encryptByMd5(state.password),
    };
    checkPwd(query)
      .then(() => {
        state.btnLoading = false;
        state.columnPassUse = 0;
        init();
      })
      .catch(() => {
        state.btnLoading = false;
      });
  }

  onMounted(() => {
    getConfig(props.modelId, props.config.encryption).then(res => {
      state.columnLink = res.data.columnLink || '';
      state.shortLinkId = res.data.id || '';
      state.columnPassUse = res.data.columnPassUse || 0;
      state.realSearchList = res.data.columnCondition ? JSON.parse(res.data.columnCondition) : [];
      state.realColumnList = res.data.columnText ? JSON.parse(res.data.columnText) : [];
      if (state.columnPassUse) return;
      init();
    });
  });
</script>
