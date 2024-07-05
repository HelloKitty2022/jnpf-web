export interface FieldNames {
  label?: string;
  value?: string;
  disabled?: string;
  options?: string;
}

export const selectProps = {
  value: {
    type: [String, Number, Array] as PropType<String | number | string[] | number[] | [string, number][]>,
  },
  options: {
    type: Array,
    default: () => [],
  },
  fieldNames: {
    type: Object as PropType<FieldNames>,
    default: () => ({ value: 'id', label: 'fullName', disabled: 'disabled' }),
  },
  optionFilterProp: { type: String },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: '请选择' },
};
