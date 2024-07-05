<template>
  <BasicPopup v-bind="$attrs" @register="registerPopup" title="项目任务" class="full-popup" :destroy-on-close="true">
    <BasicTable :columns="columns" @register="registerTable" class="jnpf-task-table jnpf-sub-table">
      <template #toolbar>
        <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'signColor'">
          <i class="icon-ym icon-ym-extend-star" :style="'color:' + record.signColor + '!important;'" v-if="record.signColor"></i>
          <i class="icon-ym icon-ym-extend-star-o i-default" v-else></i>
        </template>
        <template v-else-if="column.key === 'fullName' || column.key === 'schedule'">
          <span>{{ record[column.key] }}</span>
          <span v-if="column.key === 'schedule'">%</span>
        </template>
        <template v-else-if="column.key === 'startTime' || column.key === 'endTime'">
          <span>{{ dayjs(record[column.key]).format('YYYY-M-D') }}</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <TableAction v-if="record.parentId != '0'" :actions="getTableActions(record)" />
        </template>
        <template v-else>
          <div :class="dayGanttType(record, column.key)" :style="'background:' + record.signColor + '!important;'" v-if="record.signColor"></div>
          <div :class="dayGanttType(record, column.key)" v-else></div>
        </template>
      </template>
    </BasicTable>
  </BasicPopup>
  <Form @register="registerForm" @reload="reload" />
</template>
<script lang="ts" setup>
  import { reactive, nextTick } from 'vue';
  import { getTaskList, delProject } from '/@/api/extend/projectGantt';
  import { BasicPopup, usePopupInner } from '/@/components/Popup';
  import { BasicTable, useTable, TableAction, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { buildBitUUID } from '/@/utils/uuid';
  import { useModal } from '/@/components/Modal';
  import dayjs from 'dayjs';
  import isBetween from 'dayjs/plugin/isBetween';
  import Form from './TaskForm.vue';
  dayjs.extend(isBetween);

  defineEmits(['register']);

  const state = reactive({
    managerIds: '',
    startDate: '',
    endDate: '',
    list: [],
  });
  const { t } = useI18n();
  const { createMessage } = useMessage();
  const [registerPopup] = usePopupInner(init);
  const searchInfo = reactive({
    projectId: '',
  });
  const columnsData = [
    { title: '任务名称', dataIndex: 'fullName', width: 200, fixed: 'left' },
    { title: '标记', dataIndex: 'signColor', width: 50, fixed: 'left' },
    { title: '开始日期', dataIndex: 'startTime', width: 100, fixed: 'left' },
    { title: '结束日期', dataIndex: 'endTime', width: 100, fixed: 'left' },
    { title: '完成进度', dataIndex: 'schedule', width: 80, fixed: 'left' },
  ];
  let columns: any[] = reactive([]);
  const [registerTable, { reload, expandAll }] = useTable({
    api: getTaskList,
    searchInfo: searchInfo,
    useSearchForm: true,
    showTableSetting: false,
    showIndexColumn: false,
    isTreeTable: true,
    bordered: true,
    formConfig: {
      baseColProps: { span: 8 },
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
    },
    immediate: false,
    actionColumn: {
      width: 100,
      title: '操作',
      dataIndex: 'action',
    },
    afterFetch: data => {
      state.list = data;
      return data;
    },
  });
  const [registerForm, { openModal: openFormModal }] = useModal();

  function init(data) {
    searchInfo.projectId = data.id;
    state.managerIds = data.managerIds;
    state.startDate = data.startTime;
    state.endDate = data.endTime;
    columns = JSON.parse(JSON.stringify(columnsData));
    getColumns();
    reload();
    nextTick(() => expandAll());
  }
  function getColumns() {
    let start_date_spilt = dayjs(state.startDate).format('YYYY-M-D').split('-');
    let end_date_spilt = dayjs(state.endDate).format('YYYY-M-D').split('-');
    let start_year = Number(start_date_spilt[0]);
    let start_mouth = Number(start_date_spilt[1]);
    let end_year = Number(end_date_spilt[0]);
    let end_mouth = Number(end_date_spilt[1]);
    let mouth = mouthAndDayTitleDate(start_year, start_mouth, end_year, end_mouth);
    for (let i = 0; i < mouth.length; i++) {
      const element = mouth[i];
      const newColumns = { title: element.full_date, dataIndex: 'mouth' + element.date, align: 'center', children: [] };
      if (element.children?.length) {
        for (let j = 0; j < element.children.length; j++) {
          const item = element.children[j];
          (newColumns.children as any[]).push({
            title: item.name,
            dataIndex: item.full_date,
            align: 'center',
            width: 50,
            customCell: () => {
              return { style: { overflow: 'inherit' } };
            },
          });
        }
      }
      columns.push(newColumns);
    }
  }
  function getTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.editText'),
        onClick: addOrUpdateHandle.bind(null, record.id),
      },
      {
        label: t('common.delText'),
        color: 'error',
        modelConfirm: {
          onOk: handleDelete.bind(null, record.id),
        },
      },
    ];
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id, projectId: searchInfo.projectId, managerIds: state.managerIds });
  }
  function handleDelete(id) {
    delProject(id).then(res => {
      createMessage.success(res.msg);
      reload();
    });
  }
  /**
   * 月-日模式gantt标题
   * start_year: 起始年
   * start_mouth：起始月
   * end_year：结束年
   * end_mouth：结束月
   */
  function mouthAndDayTitleDate(start_year, start_mouth, end_year, end_mouth) {
    // 处理年份
    let year_diff = end_year - start_year;
    // 只存在同年或前后年的情况
    if (year_diff === 0) {
      // 年间隔为同一年
      let isLeap = isLeapFun(start_year); // 是否闰年
      let mouths = generationMonths(start_year, start_mouth, end_mouth + 1, isLeap); // 处理月份
      return mouths;
    }
    // 处理开始月份
    let startIsLeap = isLeapFun(start_year);
    let start_mouths = generationMonths(start_year, start_mouth, 13, startIsLeap);
    // 处理结束月份
    let endIsLeap = isLeapFun(end_year);
    let end_mouths = generationMonths(end_year, 1, end_mouth + 1, endIsLeap);
    return start_mouths.concat(end_mouths);
  }
  /**
   * 是否闰年函数
   * year: Number 当前年份
   */
  function isLeapFun(year) {
    return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
  }
  /**
   * 生成月份函数
   * year: Number 当前年份
   * start_num: Number 开始月分
   * end_num：Number 结束月份
   * isLeap: Boolean 是否闰年
   * insert_days: Boolean 是否需要插入 日
   * week: 是否以周的间隔
   */
  function generationMonths(year, start_num = 1, end_num = 13, isLeap = false, insert_days = true, week = false) {
    let months: any[] = [];
    if (insert_days) {
      // 无需 日 的模式
      for (let i = start_num; i < end_num; i++) {
        // 需要 日 的模式
        let days = generationDays(year, i, isLeap, week);
        months.push({ name: `${i}月`, date: i, full_date: `${year}-${i}`, children: days, id: buildBitUUID() });
      }
      return months;
    }
    for (let i = start_num; i < end_num; i++) {
      // 需要 日 的模式
      months.push({ name: `${i}月`, date: i, full_date: `${year}-${i}`, id: buildBitUUID() });
    }
    return months;
  }
  /**
   * 生成日期函数
   * year: Number 当前年份
   * month: Number 当前月份
   * isLeap: Boolean 是否闰年
   * week: Boolean 是否间隔一周
   */
  function generationDays(year, month, isLeap = false, week = false) {
    let big_month = [1, 3, 5, 7, 8, 10, 12].includes(month);
    let small_month = [4, 6, 9, 11].includes(month);
    let dates_num = big_month ? 32 : small_month ? 31 : isLeap ? 30 : 29;
    let days: any[] = [];
    if (week) {
      let _day = 1; // 从周日开始
      let _start_day_inweek = timeInWeek(`${year}-${month}-1`);
      if (_start_day_inweek !== 0) _day = 8 - _start_day_inweek;
      for (let i = _day; i < dates_num; i += 7) {
        days.push({ date: i, name: `${i}日`, id: buildBitUUID(), full_date: `${year}-${month}-${i}` });
      }
    } else {
      for (let i = 1; i < dates_num; i++) {
        days.push({ date: i, name: `${i}日`, id: buildBitUUID(), full_date: `${year}-${month}-${i}` });
      }
    }
    return days;
  }
  /**
   * 当前日期gantt状态
   * row: object 当前行信息
   * date: string 当前格子日期
   * unit: string 时间单位，以天、月、年计算
   */
  function dayGanttType(row, date, unit: any = 'days') {
    let start_date = row.startTime;
    let end_date = row.endTime;
    let between = dayjs(date).isBetween(start_date, end_date, unit);
    if (between) return 'item-on';
    let start = dayjs(start_date).isSame(date, unit);
    let end = dayjs(end_date).isSame(date, unit);
    if (start && end) return 'item-on item-full';
    if (start) return 'item-on item-start';
    if (end) return 'item-on item-end';
  }
  /**
   * 查询时间是周几
   */
  function timeInWeek(date) {
    return dayjs(date).day();
  }
</script>
<style lang="less" scoped>
  .item-on {
    position: absolute;
    top: 50%;
    left: 0;
    right: -1px;
    margin-top: -8px;
    height: 16px;
    background: #409eff;
    -webkit-transition: all 0.4s;
    transition: all 0.4s;
    &.item-start {
      left: 50%;
    }
    &.item-end {
      right: 50%;
    }
  }
</style>
