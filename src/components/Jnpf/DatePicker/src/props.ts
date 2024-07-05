export const datePickerProps = {
  value: [Number, String],
  format: { type: String, default: 'YYYY-MM-DD' },
  startTime: { type: Number, default: null },
  endTime: { type: Number, default: null },
};
export const dateRangeProps = {
  value: { type: Array as PropType<number[] | string[]> },
  format: { type: String, default: 'YYYY-MM-DD' },
  startTime: { type: Number, default: null },
  endTime: { type: Number, default: null },
  placeholder: { type: Array, default: ['开始日期', '结束日期'] },
};
export const timePickerProps = {
  value: String,
  format: { type: String, default: 'HH:mm:ss' },
  startTime: { type: String, default: null },
  endTime: { type: String, default: null },
};
export const timeRangeProps = {
  value: { type: Array as PropType<string[]> },
  format: { type: String, default: 'HH:mm:ss' },
  startTime: { type: String, default: null },
  endTime: { type: String, default: null },
  placeholder: { type: Array, default: ['开始时间', '结束时间'] },
};
