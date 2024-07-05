import {
  useInputList,
  useDateList,
  noVModelList,
  noColumnShowList,
  noSearchList,
  systemComponentsList,
  noGroupList,
} from '/@/components/FormGenerator/src/helper/config';

const noUploadList = [
  ...noVModelList,
  'uploadFile',
  'uploadImg',
  'colorPicker',
  'popupTableSelect',
  'relationForm',
  'popupSelect',
  'calculate',
  'sign',
  'signature',
  'location',
];

const getSearchType = item => {
  const jnpfKey = item.__config__.jnpfKey;
  // 等于-1  模糊-2  范围-3
  const fuzzyList = [...useInputList];
  const RangeList = [...useDateList, 'timePicker', 'datePicker', 'inputNumber', 'calculate', 'rate', 'slider'];
  if (RangeList.includes(jnpfKey)) return 3;
  if (fuzzyList.includes(jnpfKey)) return 2;
  return 1;
};
const getSearchMultiple = jnpfKey => {
  const searchMultipleList = ['select', 'depSelect', 'roleSelect', 'userSelect', 'usersSelect', 'organizeSelect', 'posSelect', 'groupSelect'];
  return searchMultipleList.includes(jnpfKey);
};
const getDefaultValue = item => {
  if (item.__config__.isFromParam) return undefined;
  const jnpfKey = item.__config__.jnpfKey;
  const list = ['areaSelect', 'timePicker', 'datePicker', 'inputNumber', 'organizeSelect', 'calculate'];
  return list.includes(jnpfKey) || item.multiple ? [] : undefined;
};

const defaultBtnFunc = '({ data, index, refresh, onlineUtils }) => {\r\n   \r\n}';
const defaultFuncsData = {
  afterOnload: '({ data, tableRef, onlineUtils }) => {\r\n   \r\n}',
  rowStyle: '({ row, rowIndex }) => {\r\n   \r\n}',
  cellStyle: '({ row, column, rowIndex, columnIndex }) => {\r\n   \r\n}',
};

const defaultColumnData = {
  ruleList: { matchLogic: 'and', conditionList: [] }, // 过滤规则
  searchList: [], // 查询字段
  hasSuperQuery: true, // 高级查询
  showOverflow: true, // 溢出省略
  childTableStyle: 1, // 子表样式
  showSummary: false, // 合计配置
  summaryField: [], // 合计字段
  columnList: [], // 字段列表
  columnOptions: [], // 字段列表
  defaultColumnList: [], // 所有可选择字段列表
  type: 1, //列表类型
  defaultSortConfig: [], // 默认排序配置
  hasPage: true, // 列表分页
  pageSize: 20, // 分页条数
  hasTreeQuery: false, //左侧树查询
  treeTitle: '左侧标题', // 树形标题
  treeDataSource: 'dictionary', // 树形数据来源
  treeDictionary: '', //数据字典
  treeRelation: '', // 关联字段
  treeSyncType: 0, //数据加载 同步、异步
  treeSyncInterfaceId: '',
  treeSyncInterfaceName: '',
  treeSyncTemplateJson: [],
  treePropsUrl: '', // 数据选择id
  treePropsName: '', // 数据选择名称
  treeTemplateJson: [],
  treePropsValue: 'id', // 主键字段
  treePropsChildren: 'children', // 子级字段
  treePropsLabel: 'fullName', // 显示字段
  groupField: '', // 分组字段
  parentField: '', // 父级字段
  printIds: [],
  useColumnPermission: false,
  useFormPermission: false,
  useBtnPermission: false,
  useDataPermission: false,
  customBtnsList: [],
  btnsList: [{ value: 'add', icon: 'icon-ym icon-ym-btn-add', label: '新增' }], // 按钮
  columnBtnsList: [
    { value: 'edit', icon: 'icon-ym icon-ym-btn-edit', label: '编辑' },
    { value: 'remove', icon: 'icon-ym icon-ym-btn-clearn', label: '删除' },
    { value: 'detail', icon: 'icon-ym icon-ym-generator-menu', label: '详情' },
  ], // 列按钮
  funcs: {
    afterOnload: '({ data, tableRef, onlineUtils }) => {\r\n   \r\n}',
    rowStyle: '({ row, rowIndex }) => {\r\n   \r\n}',
    cellStyle: '({ row, column, rowIndex, columnIndex }) => {\r\n   \r\n}',
  },
  uploaderTemplateJson: {},
  complexHeaderList: [],
};
const defaultAppColumnData = {
  ruleListApp: { matchLogic: 'and', conditionList: [] }, // 过滤规则
  searchList: [], // 查询字段
  hasSuperQuery: false, // 高级查询
  showOverflow: true, // 溢出省略
  columnList: [], // 字段列表
  columnOptions: [],
  defaultColumnList: [], // 所有可选择字段列表
  type: 1, //列表类型
  defaultSortConfig: [], // 默认排序配置
  hasPage: true, // 列表分页
  pageSize: 20, // 分页条数
  useColumnPermission: false,
  useFormPermission: false,
  useBtnPermission: false,
  useDataPermission: false,
  customBtnsList: [],
  btnsList: [{ value: 'add', icon: 'icon-ym icon-ym-btn-add', label: '新增' }], // 按钮
  columnBtnsList: [
    { value: 'edit', icon: 'icon-ym icon-ym-btn-edit', label: '编辑' },
    { value: 'remove', icon: 'icon-ym icon-ym-btn-clearn', label: '删除' },
    { value: 'detail', icon: 'icon-ym icon-ym-generator-menu', label: '详情' },
  ], // 列按钮
  funcs: {
    afterOnload: '({ data, tableRef, onlineUtils }) => {\r\n   \r\n}',
  },
};

export {
  noColumnShowList,
  noSearchList,
  systemComponentsList,
  noGroupList,
  noUploadList,
  getSearchType,
  getSearchMultiple,
  getDefaultValue,
  defaultBtnFunc,
  defaultFuncsData,
  defaultColumnData,
  defaultAppColumnData,
};
