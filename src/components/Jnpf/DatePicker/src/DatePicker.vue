<template>
  <DatePicker v-bind="getBindValue" v-model:value="innerValue" :picker="getPicker" @change="onChange" />
</template>

<script lang="ts" setup>
  import { DatePicker } from 'ant-design-vue';
  import dayjs, { Dayjs } from 'dayjs';
  import { computed, ref, unref, watch } from 'vue';
  import { datePickerProps } from './props';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { getDateTimeUnit, getDateFormat } from '/@/utils/jnpf';

  defineOptions({ name: 'JnpfDatePicker', inheritAttrs: false });
  const props = defineProps(datePickerProps);
  const emit = defineEmits(['update:value', 'change']);
  const attrs: any = useAttrs({ excludeDefaultKeys: false });
  const innerValue = ref('');

  const getFormat = computed(() => getDateFormat(props.format || 'YYYY-MM-DD'));
  const getShowTime = computed(() => unref(getFormat) === 'YYYY-MM-DD HH:mm' || unref(getFormat) === 'YYYY-MM-DD HH:mm:ss');
  const getPicker = computed(() => {
    if (unref(getFormat) === 'YYYY') return 'year';
    if (unref(getFormat) === 'YYYY-MM') return 'month';
    return 'date';
  });
  const getRealStartTime = computed(() => {
    const format = unref(getFormat);
    if (!props.startTime || format === 'YYYY-MM-DD HH:mm:ss') return props.startTime;
    const startTime = dayjs(props.startTime).startOf(getDateTimeUnit(format)).valueOf();
    return startTime;
  });
  const getRealEndTime = computed(() => {
    const format = unref(getFormat);
    if (!props.endTime || format === 'YYYY-MM-DD HH:mm:ss') return props.endTime;
    const endTime = dayjs(props.endTime).endOf(getDateTimeUnit(format)).valueOf();
    return endTime;
  });
  const getBindValue = computed(() => {
    const bindValue = {
      ...unref(attrs),
      format: unref(getFormat),
      valueFormat: unref(getFormat),
      showTime: unref(getShowTime),
      showToday: !props.startTime && !props.endTime,
      showNow: !props.startTime && !props.endTime,
      disabledDate: (current: Dayjs) => {
        const startTime = unref(getRealStartTime);
        const endTime = unref(getRealEndTime);
        if ((!startTime && !endTime) || !current) return false;
        const currentDate = current.startOf(getDateTimeUnit(unref(getFormat))).valueOf();
        if (startTime && endTime) return startTime > currentDate || endTime < currentDate;
        if (startTime) return startTime > currentDate;
        if (endTime) return endTime < currentDate;
        return false;
      },
      disabledTime: (current: Dayjs) => ({
        disabledHours: () => {
          const startTime = unref(getRealStartTime);
          const endTime = unref(getRealEndTime);
          if ((!startTime && !endTime) || !current) return [];
          const hours: number[] = [];
          if (startTime && current.format('YYYY-MM-DD') === dayjs(startTime).format('YYYY-MM-DD')) {
            const startHour = dayjs(startTime).hour();
            for (let i = 0; i < startHour; i++) {
              hours.push(i);
            }
          }
          if (endTime && current.format('YYYY-MM-DD') === dayjs(endTime).format('YYYY-MM-DD')) {
            const endHour = dayjs(endTime).hour();
            for (let i = 0; i < 24; i++) {
              if (i > endHour) hours.push(i);
            }
          }
          return hours;
        },
        disabledMinutes: selectedHour => {
          const startTime = unref(getRealStartTime);
          const endTime = unref(getRealEndTime);
          if ((!startTime && !endTime) || !current) return [];
          const minutes: number[] = [];
          if (startTime && current.format('YYYY-MM-DD') === dayjs(startTime).format('YYYY-MM-DD')) {
            const startHour = dayjs(startTime).hour();
            const startMinute = dayjs(startTime).minute();
            if (selectedHour < startHour) {
              for (let i = 0; i < 60; i++) {
                minutes.push(i);
              }
              return minutes;
            }
            if (selectedHour === startHour) {
              for (let i = 0; i < startMinute; i++) {
                minutes.push(i);
              }
            }
          }
          if (endTime && current.format('YYYY-MM-DD') === dayjs(endTime).format('YYYY-MM-DD')) {
            const endHour = dayjs(endTime).hour();
            const endMinute = dayjs(endTime).minute();
            if (selectedHour === endHour) {
              for (let i = 0; i < 60; i++) {
                if (i > endMinute) minutes.push(i);
              }
              return minutes;
            }
            if (selectedHour > endHour) {
              for (let i = 0; i < 60; i++) {
                minutes.push(i);
              }
              return minutes;
            }
          }
          return minutes;
        },
        disabledSeconds: (selectedHour, selectedMinute) => {
          const startTime = unref(getRealStartTime);
          const endTime = unref(getRealEndTime);
          if ((!startTime && !endTime) || !current || unref(getFormat) === 'YYYY-MM-DD HH:mm') return [];
          const seconds: number[] = [];
          const selectedHourMinute = padZero(selectedHour) + padZero(selectedMinute);
          if (startTime && current.format('YYYY-MM-DD') === dayjs(startTime).format('YYYY-MM-DD')) {
            const startHourMinute = padZero(dayjs(startTime).hour()) + padZero(dayjs(startTime).minute());
            const startSecond = dayjs(startTime).second();
            if (selectedHourMinute < startHourMinute) {
              for (let i = 0; i < 60; i++) {
                seconds.push(i);
              }
              return seconds;
            }
            if (selectedHourMinute === startHourMinute) {
              for (let i = 0; i < startSecond; i++) {
                seconds.push(i);
              }
            }
          }
          if (endTime && current.format('YYYY-MM-DD') === dayjs(endTime).format('YYYY-MM-DD')) {
            const endHourMinute = padZero(dayjs(endTime).hour()) + padZero(dayjs(endTime).minute());
            const endSecond = dayjs(endTime).second();
            if (selectedHourMinute === endHourMinute) {
              for (let i = 0; i < 60; i++) {
                if (i > endSecond) seconds.push(i);
              }
              return seconds;
            }
            if (selectedHourMinute > endHourMinute) {
              for (let i = 0; i < 60; i++) {
                seconds.push(i);
              }
              return seconds;
            }
          }
          return seconds;
        },
      }),
    };
    if (Reflect.has(unref(attrs), 'disabledDate')) bindValue.disabledDate = unref(attrs).disabledDate;
    if (Reflect.has(unref(attrs), 'disabledTime')) bindValue.disabledTime = unref(attrs).disabledTime;
    return bindValue;
  });

  watch(
    () => props.value,
    val => {
      setValue(val);
    },
    { immediate: true },
  );
  watch(
    () => unref(getFormat),
    () => {
      setValue(props.value);
    },
  );

  function setValue(value) {
    innerValue.value = value ? dayjs(Number(value)).format(unref(getFormat)) : '';
  }
  function onChange(date) {
    const timestamp = date ? dayjs(date).valueOf() : null;
    emit('update:value', timestamp);
    emit('change', timestamp);
  }
  function padZero(str) {
    return new RegExp(/^\d$/g).test(str) ? `0${str}` : str.toString();
  }
</script>
