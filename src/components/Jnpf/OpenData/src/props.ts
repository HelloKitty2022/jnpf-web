export const openDataProps = {
  value: { type: String, default: '' },
  /**
   * currUser - 当前用户
   * currTime - 当前时间
   * currOrganize - 所属组织
   * currPosition - 所属岗位
   */
  type: { type: String, default: 'currUser' },
  showLevel: { type: String, default: 'last' },
  placeholder: { type: String, default: '系统自动生成' },
  detailed: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
};
