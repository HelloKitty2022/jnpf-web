@ -0,0 +1,789 @@
<template>
  <div :class="prefixCls">
    <JnpfGroupTitle
      :content="config.__config__.label"
      :helpMessage="config.__config__.tipLabel"
      v-if="config.__config__.showTitle && config.__config__.label"
      :bordered="false" />
    <a-table :data-source="dataSource" v-bind="getTableBindValues">
      <template #headerCell="{ column }">
        <span class="required-sign" v-if="column.__config__ && column.__config__.required">*</span>{{ column.title }}
        <BasicHelp v-if="column.title && column.__config__ && column.__config__.tipLabel" :text="column.__config__.tipLabel" />
      </template>
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'index'">{{ index + 1 }}</template>
        <template v-for="(item, cIndex) in rowConfig">
          <template v-if="column.key === item.__vModel__ && column.__config__.formId === item.__config__.formId">
            <div :key="item.__config__.formId">
              <JnpfRelationForm
                v-if="item.__config__.tag === 'JnpfRelationForm'"
                :rowIndex="index"
                :tableVModel="config.__vModel__"
                :componentVModel="item.__vModel__"
                v-bind="getConfById(item.__config__.formId, index)"
                v-model:value="record[column.__vModel__]"
                :formData="formData"
                @blur="onFormBlur(index, cIndex, $event)"
                @change="(val, data) => onFormDataChange(index, cIndex, val, data)" />
              <component
                :is="item.__config__.tag"
                :rowIndex="index"
                :tableVModel="config.__vModel__"
                :componentVModel="item.__vModel__"
                v-bind="getConfById(item.__config__.formId, index)"
                v-model:value="record[column.__vModel__]"
                :formData="formData"
                @blur="onFormBlur(index, cIndex, $event)"
                @change="(val, data) => onFormDataChange(index, cIndex, val, data)" />
              <div class="error-tip required-sign" v-show="!tableFormData[index][cIndex].valid">{{ column.title }}不能为空</div>
              <div class="error-tip required-sign" v-show="tableFormData[index][cIndex].valid && !tableFormData[index][cIndex].regValid">
                {{ tableFormData[index][cIndex].regErrorText }}
              </div>
            </div>
          </template>
        </template>
        <template v-if="column.key === 'action'">
          <a-space v-if="getColumnBtnsList.length">
            <a-button
              class="action-btn"
              type="link"
              :color="item.value == 'remove' ? 'error' : ''"
              @click="columnBtnsHandle(item, index)"
              size="small"
              v-for="item in getColumnBtnsList"
              :key="item.value">
              {{ item.label }}
            </a-button>
          </a-space>
        </template>
      </template>
      <template #summary v-if="tableFormData.length && config.showSummary">
        <a-table-summary fixed>
          <a-table-summary-row>
            <a-table-summary-cell :index="0">合计</a-table-summary-cell>
            <a-table-summary-cell v-for="(item, index) in getColumnSum" :key="index" :index="index + 1" :align="getSummaryCellAlign(index)">
              {{ item }}
            </a-table-summary-cell>
            <a-table-summary-cell :index="getColumnSum.length + 1" v-if="!disabled"></a-table-summary-cell>
          </a-table-summary-row>
        </a-table-summary>
      </template>
    </a-table>
    <a-space class="input-table-footer-btn" v-if="!disabled && getFooterBtnsList.length">
      <a-button
        :type="item.btnType == 'text' ? 'link' : item.btnType"
        :preIcon="item.btnIcon"
        @click="footerBtnsHandle(item)"
        v-for="item in getFooterBtnsList"
        :key="item.value">
        {{ item.label }}
      </a-button>
    </a-space>
    <SelectModal :config="actionConfig" :formData="formData" ref="selectModal" @select="addForSelect" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, inject, reactive, unref, nextTick, toRefs, ref, onMounted } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { dyOptionsList } from '/@/components/FormGenerator/src/helper/config';
  import { getDataInterfaceRes } from '/@/api/systemData/dataInterface';
  import { Form } from 'ant-design-vue';
  import { getScriptFunc, getDateTimeUnit, thousandsFormat } from '/@/utils/jnpf';
  import { getRealProps } from '/@/components/FormGenerator/src/helper/transform';
  import SelectModal from '/@/components/CommonModal/src/SelectModal.vue';
  import { JnpfRelationForm } from '/@/components/Jnpf';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import dayjs from 'dayjs';
  import { useBaseStore } from '/@/store/modules/base';
  import type { TableProps } from 'ant-design-vue';
  import { cloneDeep } from 'lodash-es';
  import { buildUUID } from '/@/utils/uuid';
  import { isUnDef } from '/@/utils/is';

  interface State {
    tableFormData: any[];
    dataSource: any[];
    rowConfig: any[];
    activeRowIndex: number;
    isAddRow: boolean;
    dataInterfaceInfo: any[];
    selectedRowKeys: any[];
    actionConfig: any;
    defaultRowData: any;
  }

  defineOptions({ name: 'JnpfInputTable', inheritAttrs: false });
  const props = defineProps({
    config: {
      type: Object,
      default: () => {},
    },
    value: {
      type: Array,
      default: () => [],
    },
    formData: Object,
    relations: Object,
    vModel: String,
    disabled: {
      type: Boolean,
      default: false,
    },
  });
  const emit = defineEmits(['update:value', 'change']);
  const { createMessage, createConfirm } = useMessage();
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const formItemContext = Form.useInjectFormItemContext();
  const parameter: any = inject('parameter');
  const formStyle: string | undefined = inject('formStyle');
  const { prefixCls } = useDesign('input-table');
  const state = reactive<State>({
    tableFormData: [],
    dataSource: [],
    rowConfig: [],
    activeRowIndex: 0,
    isAddRow: true,
    dataInterfaceInfo: [],
    selectedRowKeys: [],
    actionConfig: {},
    defaultRowData: {},
  });
  const { tableFormData, dataSource, actionConfig, rowConfig } = toRefs(state);
  const selectModal = ref(null);

  defineExpose({
    handleRelationForParent,
    submit,
    setTableFormData,
    setTableShowOrHide,
    setTableDisabled,
    resetTable,
  });

  const childRelations = computed(() => {
    let obj = {};
    for (let key in props.relations) {
      if (key.includes('-')) {
        let tableVModel = key.split('-')[0];
        if (tableVModel === props.vModel) {
          let newKey = key.split('-')[1];
          obj[newKey] = props.relations[key];
        }
      }
    }
    return obj;
  });
  const getColumnBtnsList = computed(() => {
    if (!props.config?.columnBtnsList?.length) return [];
    return props.config.columnBtnsList.filter(o => o.show);
  });
  const getFooterBtnsList = computed(() => {
    if (!props.config?.footerBtnsList?.length) return [];
    return props.config.footerBtnsList.filter(o => o.show);
  });
  const getHasBatchBtn = computed(() => unref(getFooterBtnsList).some(o => o.value == 'batchRemove'));
  const getActionWidth = computed(() => unref(getColumnBtnsList).length * 50);
  const getColumns = computed(() => {
    const noColumn = { width: 50, title: '序号', dataIndex: 'index', key: 'index', align: 'center', customRender: ({ index }) => index + 1, fixed: 'left' };
    const actionColumn = { title: '操作', dataIndex: 'action', key: 'action', width: unref(getActionWidth), fixed: 'right' };
    let list = state.rowConfig
      .map(o => ({
        ...o,
        dataIndex: o.__vModel__,
        key: o.__vModel__,
        width: o.__config__.columnWidth,
        title: o.__config__.label,
        align: o.__config__.tableAlign || 'left',
        fixed: o.__config__.tableFixed == 'left' || o.__config__.tableFixed == 'right' ? o.__config__.tableFixed : false,
        customCell: () => ({ class: 'align-top' }),
      }))
      .filter(o => !o.__config__.noShow && (!o.__config__.visibility || (Array.isArray(o.__config__.visibility) && o.__config__.visibility.includes('pc'))));
    let columnList = list;
    let complexHeaderList: any[] = props.config.__config__.complexHeaderList || [];
    if (complexHeaderList.length) {
      let childColumns: any[] = [];
      let firstChildColumns: string[] = [];
      for (let i = 0; i < complexHeaderList.length; i++) {
        const e = complexHeaderList[i];
        e.title = e.fullName;
        e.align = e.align;
        e.children = [];
        e.jnpfKey = 'complexHeader';
        if (e.childColumns?.length) {
          childColumns.push(...e.childColumns);
          for (let k = 0; k < e.childColumns.length; k++) {
            const item = e.childColumns[k];
            for (let j = 0; j < list.length; j++) {
              const o = list[j];
              if (o.__vModel__ == item && o.__config__.tableFixed !== 'left' && o.__config__.tableFixed !== 'right') e.children.push({ ...o });
            }
          }
        }
        if (e.children.length) firstChildColumns.push(e.children[0].__vModel__);
      }
      complexHeaderList = complexHeaderList.filter(o => o.children.length);
      let newList: any[] = [];
      for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (!childColumns.includes(e.__vModel__)) {
          newList.push(e);
        } else {
          if (firstChildColumns.includes(e.__vModel__)) {
            const item = complexHeaderList.find(o => o.childColumns.includes(e.__vModel__));
            newList.push(item);
          }
        }
      }
      columnList = newList;
    }
    let columns = props.disabled || !unref(getActionWidth) ? [noColumn, ...columnList] : [noColumn, ...columnList, actionColumn];
    const leftFixedList = columns.filter(o => o.fixed === 'left');
    const rightFixedList = columns.filter(o => o.fixed === 'right');
    const noFixedList = columns.filter(o => o.fixed !== 'left' && o.fixed !== 'right');
    return [...leftFixedList, ...noFixedList, ...rightFixedList];
  });
  const getSummaryColumn = computed(() => {
    let defaultColumns = unref(getColumns);
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
    return columns.filter(o => o?.key != 'index' && o?.key != 'action');
  });
  const getColumnSum = computed(() => {
    const list = unref(getSummaryColumn);
    const sums: any[] = [];
    const isSummary = key => props.config.summaryField.includes(key);
    const useThousands = key => list.some(o => o.__vModel__ === key && o.thousands);
    const rowConfig = list.filter(o => !o.__config__.noShow && (!o.__config__.visibility || o.__config__.visibility.includes('pc')));
    rowConfig.forEach((column, index) => {
      let sumVal = state.dataSource.reduce((sum, d) => sum + getCmpValOfRow(d, column.__vModel__), 0);
      if (!isSummary(column.__vModel__)) sumVal = '';
      sumVal = Number.isNaN(sumVal) ? '' : sumVal;
      const realVal = sumVal && !Number.isInteger(sumVal) ? Number(sumVal).toFixed(2) : sumVal;
      sums[index] = useThousands(column.__vModel__) ? thousandsFormat(realVal) : realVal;
    });
    if (unref(getHasBatchBtn)) sums.unshift('');
    return sums;
  });
  const getRowSelection = computed(() => {
    if (!unref(getHasBatchBtn)) return undefined;
    const rowSelection: TableProps['rowSelection'] = {
      selectedRowKeys: state.selectedRowKeys,
      onChange: (selectedRowKeys: string[]) => {
        state.selectedRowKeys = selectedRowKeys || [];
      },
    };
    return rowSelection;
  });
  const getTableBindValues = computed(() => {
    return {
      columns: unref(getColumns),
      rowSelection: unref(getRowSelection),
      pagination: false,
      size: 'small',
      rowKey: 'jnpfId',
      scroll: { x: 'max-content' },
      bordered: formStyle === 'word-form' || !!props.config.__config__?.complexHeaderList?.length,
    };
  });

  function buildOptions() {
    state.rowConfig.forEach((cur, index) => {
      const config = cur.__config__;
      if (dyOptionsList.indexOf(config.jnpfKey) > -1) {
        if (config.dataType === 'dictionary' && config.dictionaryType) {
          baseStore.getDicDataSelector(config.dictionaryType).then(res => {
            cur.options = res;
          });
        }
        if (config.dataType === 'dynamic' && config.propsUrl) {
          const query = { paramList: config.templateJson ? getDefaultParamList(config.templateJson, props.formData) : [] };
          const matchInfo = JSON.stringify({ id: config.propsUrl, query });
          const item = { matchInfo, rowIndex: -1, colIndex: index };
          state.dataInterfaceInfo.push(item);
          getDataInterfaceRes(config.propsUrl, query).then(res => {
            cur.options = Array.isArray(res.data) ? res.data : [];
          });
        }
      }
    });
  }
  function handleRelationForParent(e, defaultValue, notSetDefault) {
    if (!state.tableFormData.length) return;
    for (let i = 0; i < state.tableFormData.length; i++) {
      let row: any[] = state.tableFormData[i];
      for (let j = 0; j < row.length; j++) {
        let item = row[j];
        if (e.__vModel__ === item.__vModel__) {
          if (!notSetDefault) state.dataSource[i][item.__vModel__] = defaultValue;
          if (e.opType === 'setOptions') {
            item.config.options = [];
            const query = { paramList: getParamList(e.__config__.templateJson, props.formData, i) };
            getDataInterfaceRes(e.__config__.propsUrl, query).then(res => {
              const realData = res.data;
              item.config.options = Array.isArray(realData) ? realData : [];
            });
          }
          if (e.opType === 'setUserOptions') {
            const value = (props.formData as any)[e.relationField] || [];
            item.config.ableRelationIds = Array.isArray(value) ? value : [value];
          }
          if (e.opType === 'setStartTime') {
            const value = (props.formData as any)[e.__config__.startRelationField] || null;
            item.config.startTime = value;
          }
          if (e.opType === 'setEndTime') {
            const value = (props.formData as any)[e.__config__.endRelationField] || null;
            item.config.endTime = value;
          }
        }
      }
    }
    updateParentData();
  }
  function handleRelation(data, rowIndex) {
    const currRelations = unref(childRelations);
    for (let key in currRelations) {
      if (key === data.__vModel__) {
        for (let i = 0; i < currRelations[key].length; i++) {
          const e = currRelations[key][i];
          const config = e.__config__;
          const jnpfKey = config.jnpfKey;
          let defaultValue: any = null;
          if (
            ['checkbox', 'cascader', 'organizeSelect'].includes(jnpfKey) ||
            (['select', 'treeSelect', 'popupSelect', 'popupTableSelect', 'userSelect'].includes(jnpfKey) && e.multiple)
          ) {
            defaultValue = [];
          }
          let row: any[] = state.tableFormData[rowIndex];
          for (let j = 0; j < row.length; j++) {
            let item = row[j];
            if (e.__vModel__ === item.__vModel__) {
              if (e.opType === 'setOptions') {
                item.config.options = [];
                const query = { paramList: getParamList(e.__config__.templateJson, props.formData, rowIndex) };
                getDataInterfaceRes(e.__config__.propsUrl, query).then(res => {
                  item.config.options = Array.isArray(res.data) ? res.data : [];
                });
              }
              if (e.opType === 'setUserOptions') {
                const value = getFieldVal(e.relationField, rowIndex) || [];
                item.config.ableRelationIds = Array.isArray(value) ? value : [value];
              }
              if (e.opType === 'setStartTime') {
                const value = getFieldVal(e.__config__.startRelationField, rowIndex) || null;
                item.config.startTime = value;
              }
              if (e.opType === 'setEndTime') {
                const value = getFieldVal(e.__config__.endRelationField, rowIndex) || null;
                item.config.endTime = value;
              }
              if (state.dataSource[rowIndex][item.__vModel__] !== defaultValue) {
                state.dataSource[rowIndex][item.__vModel__] = defaultValue;
                nextTick(() => handleRelation(item, rowIndex));
              }
            }
          }
        }
      }
    }
    updateParentData();
  }
  function buildRowAttr(rowIndex) {
    let row: any[] = state.tableFormData[rowIndex];
    for (let i = 0; i < row.length; i++) {
      const cur = row[i].config;
      const config = cur.__config__;
      if (dyOptionsList.indexOf(config.jnpfKey) > -1) {
        if (config.dataType === 'dictionary' && config.dictionaryType) {
          baseStore.getDicDataSelector(config.dictionaryType).then(res => {
            cur.options = res;
          });
        }
        if (config.dataType === 'dynamic' && config.propsUrl) {
          if (cur.options?.length && (!config.templateJson || !config.templateJson.length || !hasTemplateJsonRelation(config.templateJson))) continue;
          const query = { paramList: config.templateJson ? getParamList(config.templateJson, props.formData, rowIndex) : [] };
          const matchInfo = JSON.stringify({ id: config.propsUrl, query });
          const item = { matchInfo, rowIndex, colIndex: i };
          const infoIndex = state.dataInterfaceInfo.findIndex(item => item.matchInfo === matchInfo);
          let useCacheOptions = false;
          if (infoIndex === -1) {
            state.dataInterfaceInfo.push(item);
          } else {
            const cacheOptions = getCacheOptions(infoIndex);
            if (cacheOptions.length) {
              cur.options = cacheOptions;
              useCacheOptions = true;
            }
          }
          if (!useCacheOptions) {
            getDataInterfaceRes(config.propsUrl, query)
              .then(res => {
                cur.options = Array.isArray(res.data) ? res.data : [];
              })
              .catch(() => {
                cur.options = [];
              });
          }
        }
      }
      if (config.jnpfKey === 'userSelect' && cur.relationField && cur.selectType !== 'all' && cur.selectType !== 'custom') {
        let value = getFieldVal(cur.relationField, rowIndex) || [];
        cur.ableRelationIds = Array.isArray(value) ? value : [value];
      }
      if (config.jnpfKey === 'datePicker' || config.jnpfKey === 'timePicker') {
        if (config.startTimeRule && config.startTimeType == 2 && config.startRelationField) {
          cur.startTime = getFieldVal(config.startRelationField, rowIndex) || null;
        }
        if (config.endTimeRule && config.endTimeType == 2 && config.endRelationField) {
          cur.endTime = getFieldVal(config.endRelationField, rowIndex) || null;
        }
      }
    }
  }
  // 获取缓存options数据
  function getCacheOptions(index) {
    const item = state.dataInterfaceInfo[index];
    if (item.rowIndex === -1) {
      return state.rowConfig[item.colIndex].options || [];
    } else {
      return state.tableFormData[item.rowIndex][item.colIndex].config.options || [];
    }
  }
  // 判断templateJson里是否有关联字段
  function hasTemplateJsonRelation(templateJson) {
    return templateJson.some(o => o.relationField);
  }
  function getParamList(templateJson, formData, index) {
    for (let i = 0; i < templateJson.length; i++) {
      if (templateJson[i].relationField && templateJson[i].sourceType == 1) {
        if (templateJson[i].relationField.includes('-')) {
          const childVModel = templateJson[i].relationField.split('-')[1];
          templateJson[i].defaultValue = state.dataSource[index][childVModel] || '';
        } else {
          templateJson[i].defaultValue = formData[templateJson[i].relationField] || '';
        }
      }
    }
    return templateJson;
  }
  function getDefaultParamList(templateJson, formData) {
    for (let i = 0; i < templateJson.length; i++) {
      if (templateJson[i].relationField && templateJson[i].sourceType == 1) {
        if (templateJson[i].relationField.includes('-')) {
          let childVModel = templateJson[i].relationField.split('-')[1];
          let list = state.rowConfig.filter(o => o.__vModel__ === childVModel);
          templateJson[i].defaultValue = '';
          if (list.length) templateJson[i].defaultValue = list[0].__config__.defaultValue || '';
        } else {
          templateJson[i].defaultValue = formData[templateJson[i].relationField] || '';
        }
      }
    }
    return templateJson;
  }
  function getFieldVal(field, rowIndex) {
    let val = '';
    if (field.includes('-')) {
      const childVModel = field.split('-')[1];
      val = state.dataSource[rowIndex][childVModel] || '';
    } else {
      val = (props.formData as any)[field] || '';
    }
    return val;
  }
  function clearAddRowFlag() {
    nextTick(() => {
      state.isAddRow = false;
    });
  }
  function setTableFormData(prop, value) {
    state.dataSource[state.activeRowIndex || 0][prop] = value;
  }
  function setTableDisabled(prop, value) {
    let activeRow: any[] = state.tableFormData[state.activeRowIndex || 0];
    for (let i = 0; i < activeRow.length; i++) {
      if (activeRow[i].__vModel__ === prop) {
        activeRow[i].config.disabled = value;
        break;
      }
    }
  }
  function setTableShowOrHide(prop, value) {
    for (let i = 0; i < state.rowConfig.length; i++) {
      if (state.rowConfig[i].__vModel__ === prop) {
        state.rowConfig[i].__config__.noShow = value;
        break;
      }
    }
  }
  function onFormBlur(rowIndex, colIndex, e) {
    const data: any = state.tableFormData[rowIndex][colIndex];
    if (data && data.on && data.on.blur) {
      const func: any = getScriptFunc(data.on.blur);
      if (!func) return;
      func({ data: e, rowIndex, ...unref(parameter) });
    }
  }
  function onFormDataChange(rowIndex, colIndex, val, row) {
    if (state.isAddRow) return;
    const data: any = state.tableFormData[rowIndex][colIndex] || {};
    data.value = val;
    state.activeRowIndex = rowIndex;
    data.required && (data.valid = checkData(data));
    data.regList && data.regList.length && (data.regValid = checkRegData(data));
    updateParentData();
    handleRelation(data, rowIndex);
    if (data && data.on && data.on.change) {
      const func: any = getScriptFunc(data.on.change);
      if (!func) return;
      const value = row ? row : val;
      func({ data: value, rowIndex, ...unref(parameter) });
    }
    if (['popupSelect', 'relationForm'].includes(data.jnpfKey)) setTransferFormData(row, data.config.__config__);
  }
  function setTransferFormData(data, config) {
    if (!config?.transferList?.length) return;
    for (let index = 0; index < config.transferList.length; index++) {
      const element = config.transferList[index];
      if (element.sourceValue.includes('-')) element.sourceValue = element.sourceValue.split('-')[1];
      state.dataSource[state.activeRowIndex][element.sourceValue] = data ? data[element.targetField] : undefined;
      updateParentData();
    }
  }
  /**
   * 校验单个表单数据
   * @param {CmpConfig} 组件配置对象
   */
  function checkData({ value }) {
    if ([null, undefined, ''].includes(value)) return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }
  function checkRegData(col) {
    let res = true;
    for (let i = 0; i < col.regList.length; i++) {
      const item = col.regList[i];
      if (item.pattern) {
        let pattern = eval(item.pattern);
        if (col.value && !pattern.test(col.value)) {
          res = false;
          col.regErrorText = item.message;
          break;
        }
      }
    }
    return res;
  }
  /**
   * 校验表格数据必填项
   */
  function submit() {
    let res = true;
    const checkCol = (i, col) => {
      col.value = state.dataSource[i][col.__vModel__];
      col.required && !checkData(col) && (res = col.valid = false);
      col.regList && col.regList.length && !checkRegData(col) && (res = col.regValid = false);
    };
    state.tableFormData.forEach((row, i) => row.forEach(checkCol.bind(null, i)));
    return res ? getDataSource() : false;
  }
  /**
   * 根据formId获取完整组件配置
   */
  function getConfById(formId, rowIndex) {
    let item = state.tableFormData[rowIndex].find(t => t.formId === formId).config;
    let itemConfig = item.__config__;
    let newObj = {};
    item = getRealProps(item, itemConfig.jnpfKey);
    for (const key in item) {
      if (!['__config__', '__vModel__', 'on'].includes(key)) {
        newObj[key] = item[key];
      }
      if (key === 'disabled') {
        newObj[key] = props.disabled || item[key];
      }
    }
    if (['relationForm', 'popupSelect'].includes(itemConfig.jnpfKey)) {
      newObj['field'] = props.config.__vModel__ + item.__vModel__ + '_jnpfRelation_' + rowIndex;
    }
    if (['relationFormAttr', 'popupAttr'].includes(itemConfig.jnpfKey)) {
      let prop = newObj['relationField'].split('_jnpfTable_')[0];
      newObj['relationField'] = props.config.__vModel__ + prop + '_jnpfRelation_' + rowIndex;
    }
    return newObj;
  }
  /**
   * 获取默认行数据
   */
  function getEmptyRow(val) {
    return state.rowConfig.map((t: any) => ({
      tag: t.__config__.tag,
      formId: t.__config__.formId,
      value: !val ? t.__config__.defaultValue : Reflect.has(val, t.__vModel__) ? val[t.__vModel__] : getDefaultEmptyValue(t),
      options: dyOptionsList.indexOf(t.__config__.jnpfKey) > -1 ? t.options : [],
      valid: true,
      regValid: true,
      regErrorText: '',
      on: t.on || {},
      jnpfKey: t.__config__.jnpfKey,
      __vModel__: t.__vModel__,
      regList: t.__config__.regList || [],
      required: t.__config__.required,
      rowData: val || {},
      config: t,
    }));
  }
  function getDefaultEmptyValue(item) {
    if (!item.__config__ || !item.__config__.jnpfKey) return undefined;
    const jnpfKey = item.__config__.jnpfKey;
    const list = ['checkbox', 'uploadFile', 'uploadImg', 'cascader', 'organizeSelect', 'areaSelect'];
    return list.includes(jnpfKey) || item.multiple ? [] : undefined;
  }
  // 获取表格数据
  function getDataSource() {
    return state.dataSource;
  }
  // 更新父级数据 触发计算公式更新
  function updateParentData() {
    const newVal = getDataSource();
    emit('update:value', newVal);
    emit('change', newVal);
    formItemContext.onFieldChange();
  }
  function columnBtnsHandle(item, index) {
    if (item.value == 'remove') return removeRow(index, item.showConfirm);
    if (item.value == 'copy') return copyRow(index);
  }
  // 删除行
  function removeRow(index, showConfirm = false) {
    const handleRemove = () => {
      state.tableFormData.splice(index, 1);
      state.dataSource.splice(index, 1);
      nextTick(() => updateParentData());
    };
    if (!showConfirm) return handleRemove();
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '此操作将永久删除该数据, 是否继续?',
      onOk: handleRemove,
    });
  }
  // 打开选择数据的弹出
  function openSelectDialog() {
    (unref(selectModal) as any)?.openSelectModal();
  }
  // 从弹窗选择数据
  function addForSelect(data) {
    data.forEach(t => copyData(cloneDeep(t)));
  }
  // 添加一行
  function addRow(val?, isUpdate = true) {
    state.isAddRow = true;
    if (!val) updateRowConfig();
    const rowData = cloneDeep(val || state.defaultRowData);
    const jnpfId = buildUUID();
    rowData.jnpfId = jnpfId;
    state.dataSource.push(rowData);
    if (!Array.isArray(state.tableFormData)) state.tableFormData = [];
    const rowIndex = state.tableFormData.length;
    const item: any = cloneDeep(getEmptyRow(val));
    item.jnpfId = jnpfId;
    state.tableFormData.push(item);
    buildRowAttr(rowIndex);
    nextTick(() => {
      if (isUpdate) updateParentData();
      clearAddRowFlag();
    });
  }
  // 复制一行
  function copyRow(index) {
    copyData(cloneDeep(state.dataSource[index]));
  }
  function copyData(data) {
    const rowData = {};
    for (let [key] of Object.entries(state.defaultRowData)) {
      rowData[key] = !isUnDef(data[key]) ? data[key] : null;
    }
    addRow(rowData);
  }
  function footerBtnsHandle(item) {
    if (item.value == 'add') return addRow();
    if (item.value == 'batchRemove') return batchRemoveRow(item);
    state.actionConfig = item.actionConfig;
    openSelectDialog();
  }
  // 批量删除
  function batchRemoveRow(item) {
    if (!state.selectedRowKeys.length) return createMessage.error('请选择一条数据');
    const handleBatchRemove = () => {
      state.tableFormData = state.tableFormData.filter(o => !state.selectedRowKeys.includes(o.jnpfId));
      state.dataSource = state.dataSource.filter(o => !state.selectedRowKeys.includes(o.jnpfId));
      nextTick(() => {
        state.selectedRowKeys = [];
        updateParentData();
      });
    };
    if (!item.showConfirm) return handleBatchRemove();
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '此操作将永久删除该数据, 是否继续?',
      onOk: handleBatchRemove,
    });
  }
  function getCmpValOfRow(row, key) {
    const isSummary = key => props.config.summaryField.includes(key);
    if (!props.config.summaryField.length || !isSummary(key)) return 0;
    const target = row[key];
    if (!target) return 0;
    const data = isNaN(target) ? 0 : Number(target);
    return data;
  }
  // 重置数据
  function resetTable() {
    state.dataSource = [];
    state.tableFormData = [];
  }
  function getSummaryCellAlign(index) {
    if (!unref(getSummaryColumn).length) return;
    if (unref(getHasBatchBtn)) index--;
    return unref(getSummaryColumn)[index]?.align || 'left';
  }
  // 更新行配置
  function updateRowConfig() {
    const defaultRowData = {};
    const currDate = new Date();
    state.rowConfig = props.config.__config__.children.map(o => {
      if (o.__config__.defaultCurrent) {
        if (o.__config__.jnpfKey === 'datePicker') {
          o.__config__.defaultValue = dayjs(currDate).startOf(getDateTimeUnit(o.format)).valueOf();
        }
        if (o.__config__.jnpfKey === 'timePicker') {
          o.__config__.defaultValue = dayjs(currDate).format(o.format || 'HH:mm:ss');
        }
      }
      defaultRowData[o.__vModel__] = o.__config__.defaultValue;
      if (o.__config__ && dyOptionsList.includes(o.__config__.jnpfKey) && o.__config__.dataType !== 'static') o.options = [];
      return o;
    });
    state.defaultRowData = defaultRowData;
  }
  // 初始化
  function init() {
    resetTable();
    updateRowConfig();
    buildOptions();
    state.dataSource = [];
    state.tableFormData = [];
    if (props.value && Array.isArray(props.value) && props.value.length) {
      props.value.forEach(t => addRow(t, false));
    }
  }

  onMounted(() => {
    init();
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-input-table';

  .@{prefix-cls} {
    .error-tip {
      font-size: 12px;
    }
  }
</style>
