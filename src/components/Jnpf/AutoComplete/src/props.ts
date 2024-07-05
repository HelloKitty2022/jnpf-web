export const autoCompleteProps = {
  value: [String, Number] as PropType<String | number>,
  interfaceId: { type: String, default: '' },
  templateJson: { type: Array, default: () => [] },
  relationField: { type: String, default: 'fullName' },
  total: { type: Number, default: 50 },
  placeholder: { type: String, default: '请选择' },
  allowClear: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  rowIndex: { default: null },
  formData: { type: Object },
};
