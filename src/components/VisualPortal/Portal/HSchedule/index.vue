<template>
  <a-card class="portal-card-box">
    <template #title v-if="activeData.title">
      <CardHeader :title="activeData.title" :card="activeData.card" />
    </template>
    <div class="portal-card-body schedule-container">
      <FullCalendar ref="calendarRef" :options="calendarOptions" />
      <Form @register="registerForm" @reload="reload" />
      <Detail @register="registerDetail" @reload="reload" />
    </div>
  </a-card>
</template>
<script lang="ts" setup>
  import { watch, reactive, computed, unref } from 'vue';
  import CardHeader from '../CardHeader/index.vue';
  import FullCalendar from '@fullcalendar/vue3';
  import { CalendarOptions } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction';
  import timeGridPlugin from '@fullcalendar/timegrid';
  import { calendar } from '../../Design/helper/calendar';
  import { getScheduleList } from '/@/api/onlineDev/portal';
  import { useModal } from '/@/components/Modal';
  import { useUserStore } from '/@/store/modules/user';
  import dayjs from 'dayjs';
  import Form from './Form.vue';
  import Detail from './Detail.vue';

  const state = reactive({
    startTime: '',
    endTime: '',
  });
  const props = defineProps(['activeData']);
  const userStore = useUserStore();
  const calendarOptions = reactive<CalendarOptions>({
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    initialView: props.activeData.defaultView || 'dayGridMonth',
    firstDay: props.activeData.firstDay,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridDay,timeGridWeek,dayGridMonth',
    },
    events: [], //数据
    eventColor: '#3BB2E3', //事件背景颜色
    eventClick: handleEventClick,
    dateClick: handleDateClick,
    editable: false, // 是否可以进行（拖动、缩放）修改
    eventStartEditable: false, // Event日程开始时间可以改变，默认true，如果是false其实就是指日程块不能随意拖动，只能上下拉伸改变他的endTime
    eventDurationEditable: false, // Event日程的开始结束时间距离是否可以改变，默认true，如果是false则表示开始结束时间范围不能拉伸，只能拖拽
    selectable: false, // 是否可以选中日历格
    selectMirror: false,
    selectMinDistance: 0, // 选中日历格的最小距离
    dayMaxEvents: false,
    weekends: true,
    navLinks: false, // 天链接
    slotEventOverlap: false,
    datesSet: datesRender,
    dayMaxEventRows: 2,
    locale: 'zh',
    aspectRatio: 1.65,
    buttonText: { today: '今日', month: '月', week: '周', day: '日' },
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', meridiem: false, hour12: false }, // 设置时间为24小时
    allDayText: '全天',
    views: {
      //对应月视图
      dayGridMonth: {
        displayEventTime: false, //是否显示时间
        dayMaxEventRows: 4,
        moreLinkClick: 'popover',
        dayCellContent(item) {
          let date = new Date(item.date); // 参数需要毫秒数，所以这里将秒数乘于 1000
          let Y = date.getFullYear();
          let M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
          let D = date.getDate();
          let _dateF: any = calendar.solar2lunar(Y, M, D);
          let myClass = '';
          if (_dateF.isToday) myClass = 'today-month';
          if (props.activeData.showLunarCalendar) {
            let IDayCn = _dateF.IDayCn;
            if (IDayCn == '初一') IDayCn = _dateF.IMonthCn;
            return { html: `<p class='calendar-right'><label class='${myClass}'>${_dateF.cDay}</label><span>${IDayCn}</span></p>` };
          }
          return { html: `<p class='calendar-right'><label class='${myClass}'>${_dateF.cDay}</label></p>` };
        },
      },
      //对应周视图调整
      timeGridWeek: {
        displayEventTime: false, //是否显示时间
        dayHeaderContent(item) {
          let date = new Date(item.date); // 参数需要毫秒数，所以这里将秒数乘于 1000
          let Y = date.getFullYear();
          let M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
          let D = date.getDate();
          let _dateF: any = calendar.solar2lunar(Y, M, D);
          let myClass = 'calender-week';
          if (_dateF.isToday) myClass = 'calender-week today-week';
          if (props.activeData.showLunarCalendar) {
            const htmlVal = `<div class='${myClass}'>${_dateF.cDay}</div><div class="list-week"><div>周${_dateF.ncWeek.slice(
              2,
            )}</div><div class='list-calendar'>${_dateF.IDayCn}</div></div></div>`;
            return {
              html: htmlVal,
            };
          }
          return { html: `<div class='${myClass}'>${_dateF.cDay}</div><div class='list-week'><div >周${_dateF.ncWeek.slice(2)}</div></div></div>` };
        },
      },
      timeGridDay: {
        displayEventTime: false, //是否显示时间
        dayHeaderContent(item) {
          let date = new Date(item.date); // 参数需要毫秒数，所以这里将秒数乘于 1000
          let Y = date.getFullYear() + '-';
          let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
          let D = date.getDate();
          let date_ = Y + M + D;
          let _date = date_.split('-');
          let _dateF: any = calendar.solar2lunar(_date[0], _date[1], _date[2]);
          let myClass = 'calender-week';
          if (_dateF.isToday) myClass = 'calender-week today-week';
          if (props.activeData.showLunarCalendar) {
            return {
              html: `<div class='${myClass}'>${_dateF.cDay}</div><div class='list-week'><div>周${_dateF.ncWeek.slice(2)}</div><div class='list-calendar'>${
                _dateF.IDayCn
              }</div></div></div>`,
            };
          }
          return { html: `<div class='${myClass}'>${_dateF.cDay}</div><div class='list-week'><div >周${_dateF.ncWeek.slice(2)}</div></div></div>` };
        },
      },
    },
  });
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerDetail, { openModal: openDetailModal }] = useModal();

  const getUserInfo = computed(() => userStore.getUserInfo || {});

  watch(
    () => props.activeData.firstDay,
    val => {
      calendarOptions.firstDay = val;
    },
  );
  watch(
    () => props.activeData.showLunarCalendar,
    () => {
      props.activeData.renderKey = +new Date();
    },
  );
  watch(
    () => props.activeData.defaultView,
    () => {
      props.activeData.renderKey = +new Date();
    },
  );

  function handleEventClick(data) {
    if (unref(getUserInfo).userId == data.event.extendedProps.creatorUserId) return openFormModal(true, { id: data.event.id });
    openDetailModal(true, { id: data.event.id, type: 1 });
  }
  function handleDateClick(data) {
    let startTime = dayjs(data.date).format('YYYY-MM-DD HH:00');
    let clickTime = dayjs(data.date).format('YYYY-MM-DD');
    let currTime = dayjs().format('YYYY-MM-DD');
    if (clickTime == currTime) {
      let thisDate = new Date();
      thisDate.setHours(thisDate.getHours() + 1);
      startTime = dayjs(thisDate).format('YYYY-MM-DD HH:00');
    }
    openFormModal(true, { startTime: new Date(startTime).getTime(), id: '', duration: props.activeData.duration });
  }
  function datesRender(calendar) {
    let view = calendar.view;
    state.startTime = dayjs(view.activeStart).format('YYYY-MM-DD HH:mm');
    state.endTime = dayjs(view.activeEnd).format('YYYY-MM-DD HH:mm');
    initData();
  }
  function initData() {
    let query = {
      startTime: state.startTime,
      endTime: state.endTime,
    };
    getScheduleList(query).then(res => {
      calendarOptions.events = res?.data?.list.map(o => {
        let allDay = false;
        let startDay = dayjs(o.startDay).format('YYYY-MM-DD');
        let endDay = '';
        if (o.endDay) endDay = dayjs(o.endDay).format('YYYY-MM-DD');
        allDay = o.allDay && startDay != endDay ? false : o.allDay;
        return {
          id: o.id,
          title: o.title,
          start: o.startDay,
          end: o.endDay,
          color: o.color,
          editable: false,
          allDay: allDay,
          creatorUserId: o.creatorUserId,
        };
      });
    });
  }
  function reload() {
    initData();
  }
</script>
<style lang="less">
  .schedule-container {
    padding: 0;
    height: 100%;
    .fc .fc-scroller {
      overflow: hidden scroll !important;
    }
    .fc-media-screen {
      height: 100%;
      cursor: pointer;
    }
    .fc-toolbar.fc-header-toolbar {
      padding: 10px;
      margin-bottom: 0;
    }
    .fc-toolbar-chunk {
      display: flex;
    }
    .fc-button-primary {
      background-color: @primary-color !important;
      border-color: @primary-color !important;
      height: 32px;
      line-height: 32px;
      padding: 0 0.65em;
      font-size: 12px;
      display: flex;
      align-items: center;
    }
    .fc-button-primary:not(:disabled):active,
    .fc-button-primary:not(:disabled).fc-button-active {
      background-color: @primary-5 !important;
      border-color: @primary-5 !important;
    }
    .fc-button-primary:not(:disabled):focus {
      box-shadow: unset !important;
    }
    .fc-button .fc-icon {
      line-height: 16px;
    }
    .fc-view th {
      height: 40px;
      line-height: 40px;
      font-size: 12px;
      color: #909399;
      font-weight: normal;
      background: @app-content-background;
    }
    .fc .fc-popover {
      z-index: 999 !important;
      max-height: 200px;
      display: flex;
      flex-direction: column;
      .fc-popover-body {
        overflow: auto;
        flex: 1;
      }
    }
    .fc-center {
      color: @text-color-base;
    }
    .fc-view th,
    .fc-view td,
    .fc-view thead,
    .fc-view tbody,
    .fc-view .fc-divider,
    .fc-view .fc-row,
    .fc-view .fc-content,
    .fc-view .fc-popover,
    .fc-view .fc-list-view,
    .fc-view .fc-list-header td {
      border-color: #ebeef5;
      color: @text-color-base;
      a {
        color: @text-color-base;
      }
    }
  }
  .fc .fc-timeGridDay-view .fc-col-header-cell-cushion,
  .fc .fc-timeGridWeek-view .fc-col-header-cell-cushion {
    padding: 2px 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 64px;
  }

  .fc-col-header,
  .fc-daygrid-body,
  .fc-scrollgrid-sync-table,
  .fc-daygrid-day-top,
  .fc-daygrid-day-number {
    width: 100% !important;
  }

  .fc-daygrid-day-events,
  .fc-daygrid-body-unbalanced {
    min-height: unset;
  }
  .today-month {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: @primary-color !important;
    line-height: 20px;
    color: #fff;
    text-align: center;
  }

  .calendar-right {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 5px;
  }

  .calender-week {
    width: 45px;
    height: 45px;
    font-size: 24px;
    line-height: 45px;
    background-color: #eaedf0;
    color: #303133;
    font-weight: bold;
    border-radius: 50%;

    .fc-view-harness th {
      height: 85px !important;
    }
  }

  .today-week {
    width: 45px;
    height: 45px;
    font-size: 24px;
    line-height: 45px;
    background-color: @primary-color !important;
    color: #fff;
    font-weight: bold;
    border-radius: 50%;

    .fc-view-harness th {
      height: 85px !important;
    }
  }

  .list-week {
    margin-left: 10px;
    font-size: 14px;
  }

  .list-calendar {
    margin-top: -20px;
    font-size: 14px;
  }
  @media (max-width: 1360px) {
    .fc .fc-timeGridWeek-view .fc-col-header-cell-cushion {
      display: inline-block !important;
      margin-top: 10px;
    }
    .fc .fc-timeGridWeek-view .list-week {
      text-align: center;
      width: 100%;
      margin-left: 0 !important;
    }
  }
  html[data-theme='dark'] {
    .schedule-container {
      .fc-theme-standard .fc-scrollgrid {
        border: 1px solid #303030 !important;
      }
      .fc-theme-standard td,
      .fc-theme-standard th {
        border: 1px solid #303030 !important;
      }
      .calender-week {
        background-color: #303030;
        color: #fff;
      }
    }
  }
</style>
