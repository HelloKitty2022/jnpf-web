export interface FieldNames {
  label?: string;
  value?: string;
  disabled?: string;
}

export const checkboxProps = {
  value: {
    type: Array as PropType<string[] | number[] | boolean[]>,
  },
  options: {
    type: Array,
    default: () => [],
  },
  fieldNames: {
    type: Object as PropType<FieldNames>,
    default: () => ({ value: 'id', label: 'fullName', disabled: 'disabled' }),
  },
  direction: {
    type: String,
    default: 'horizontal',
  },
};
