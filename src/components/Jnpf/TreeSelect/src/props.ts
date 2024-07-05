export interface FieldNames {
  children?: string;
  label?: string;
  value?: string;
  key?: string;
}
export const treeSelectProps = {
  disabled: { type: Boolean, default: false },
  allowClear: { type: Boolean, default: true },
  multiple: { type: Boolean, default: false },
  showSearch: { type: Boolean, default: true },
  showIcon: { type: Boolean, default: true },
  treeDefaultExpandAll: { type: Boolean, default: true },
  dropdownMatchSelectWidth: { type: Boolean, default: false },
  treeNodeFilterProp: { type: String, default: 'fullName' },
  placeholder: { type: String, default: '请选择' },
  options: { type: Array, default: () => [] },
  fieldNames: {
    type: Object as PropType<FieldNames>,
    default: () => ({ value: 'id', label: 'fullName', children: 'children' }),
  },
  value: [String, Number, Array],
  modelValue: [String, Number, Array],
  // 只能选择最后一层的数值
  lastLevel: { type: Boolean, default: false },
  // 只能选择最后一层的数值时，需要根据 lastLevelKey来判断是否最后一层
  lastLevelKey: { type: String, default: 'hasChildren' },
  lastLevelValue: { default: false },
};
