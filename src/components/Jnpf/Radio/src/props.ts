export interface FieldNames {
  label?: string;
  value?: string;
  disabled?: string;
}

export const radioProps = {
  value: {
    type: [String, Number, Boolean] as PropType<string | number | boolean>,
  },
  options: {
    type: Array,
    default: () => [],
  },
  fieldNames: {
    type: Object as PropType<FieldNames>,
    default: () => ({ value: 'id', label: 'fullName', disabled: 'disabled' }),
  },
  optionType: {
    type: String as PropType<'default' | 'button'>,
    default: 'default',
  },
  direction: {
    type: String,
    default: 'horizontal',
  },
};
