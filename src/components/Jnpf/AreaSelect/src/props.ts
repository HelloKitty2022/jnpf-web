export const areaSelectProps = {
  value: { type: Array as PropType<String | string[]> },
  multiple: { type: Boolean, default: false },
  level: { type: Number, default: 2 },
  placeholder: { type: String, default: '请选择' },
  disabled: { type: Boolean, default: false },
  allowClear: { type: Boolean, default: true },
  size: String,
};
