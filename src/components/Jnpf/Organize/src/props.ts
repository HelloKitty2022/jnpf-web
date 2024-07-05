export const baseProps = {
  value: { type: [String, Array] as PropType<String | string[]> },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: '请选择' },
  disabled: { type: Boolean, default: false },
  allowClear: { type: Boolean, default: true },
  size: String,
  selectType: { type: String, default: 'all' },
  buttonType: { type: String as PropType<'' | 'select' | 'button' | undefined>, default: 'select' },
  hasSys: { type: Boolean, default: false },
  ableIds: { type: Array as PropType<string[]>, default: () => [] },
};

export const organizeSelectProps = {
  ...baseProps,
  auth: { type: Boolean, default: false },
  isOnlyOrg: { type: Boolean, default: false },
  currOrgId: { default: '0' },
  parentId: { default: '' },
  modalTitle: { type: String, default: '选择组织' },
};
export const depSelectProps = {
  ...baseProps,
  modalTitle: { type: String, default: '选择部门' },
};
export const posSelectProps = {
  ...baseProps,
  modalTitle: { type: String, default: '选择岗位' },
};
export const roleSelectProps = {
  ...baseProps,
  modalTitle: { type: String, default: '选择角色' },
};
export const groupSelectProps = {
  ...baseProps,
  modalTitle: { type: String, default: '选择分组' },
};
export const userSelectProps = {
  ...baseProps,
  ableRelationIds: { type: Array as PropType<string[]>, default: () => [] },
  modalTitle: { type: String, default: '选择用户' },
};
export const usersSelectProps = {
  ...baseProps,
  modalTitle: { type: String, default: '选择用户' },
};
