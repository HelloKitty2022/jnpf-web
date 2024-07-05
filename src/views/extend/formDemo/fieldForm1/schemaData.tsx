import { FormSchema } from '/@/components/Form';

export const getFormSchema = (): FormSchema[] => {
  const schemas: FormSchema[] = [
    {
      field: 'fieldInput',
      label: '单行输入',
      component: 'Input',
      helpMessage: '单行输入',
    },
    {
      field: 'fieldInput2',
      label: '单行输入',
      component: 'Input',
      componentProps: { showPassword: true },
    },
    {
      field: 'fieldTextarea',
      label: '多行输入',
      component: 'Textarea',
    },
    {
      field: 'fieldInputNumber',
      label: '数字输入',
      component: 'InputNumber',
      componentProps: {
        min: 0,
        max: 999999,
      },
    },
    {
      field: 'fieldSwitch',
      label: '开关',
      component: 'Switch',
    },
    {
      field: 'fieldDivider',
      label: '分割线',
      component: 'Divider',
      componentProps: { content: '分割线' },
    },
    {
      field: 'fieldSelect',
      label: '下拉选择',
      component: 'Select',
      componentProps: {
        options: [
          { fullName: '启用', id: 1 },
          { fullName: '锁定', id: 2 },
          { fullName: '禁用', id: 0 },
        ],
      },
    },
    {
      field: 'fieldSelect2',
      label: '下拉多选',
      component: 'Select',
      componentProps: {
        multiple: true,
        options: [
          { fullName: '启用', id: 1 },
          { fullName: '锁定', id: 2 },
          { fullName: '禁用', id: 0 },
        ],
      },
    },
    {
      field: 'fieldRadio',
      label: '单选框组',
      component: 'Radio',
      componentProps: {
        options: [
          { fullName: '启用', id: 1 },
          { fullName: '锁定', id: 2 },
          { fullName: '禁用', id: 0 },
        ],
      },
    },
    {
      field: 'fieldCheckbox',
      label: '多选框组',
      component: 'Checkbox',
      componentProps: {
        options: [
          { fullName: '启用', id: 1 },
          { fullName: '锁定', id: 2 },
          { fullName: '禁用', id: 0 },
        ],
      },
    },
    {
      field: 'fieldButton',
      label: '按钮',
      component: 'Button',
      componentProps: { buttonText: '按钮' },
    },
    {
      field: 'fieldTreeSelect',
      label: '下拉树形',
      component: 'TreeSelect',
    },
    {
      field: 'fieldGroupTitle',
      label: '分组标题',
      component: 'GroupTitle',
      componentProps: { content: '分组标题' },
    },
    {
      field: 'fieldDatePicker',
      label: '日期选择',
      component: 'DatePicker',
    },
    {
      field: 'fieldTimePicker',
      label: '时间选择',
      component: 'TimePicker',
    },
    {
      field: 'fieldUploadImg',
      label: '图片上传',
      component: 'UploadImg',
    },
    {
      field: 'fieldOrganizeSelect',
      label: '组织选择',
      component: 'OrganizeSelect',
    },
    {
      field: 'fieldDepSelect',
      label: '部门选择',
      component: 'DepSelect',
    },
    {
      field: 'fieldPosSelect',
      label: '岗位选择',
      component: 'PosSelect',
    },
    {
      field: 'fieldGroupSelect',
      label: '分组选择',
      component: 'GroupSelect',
    },
    {
      field: 'fieldRoleSelect',
      label: '角色选择',
      component: 'RoleSelect',
    },
    {
      field: 'fieldUserSelect',
      label: '用户选择',
      component: 'UserSelect',
    },
    {
      field: 'fieldUsersSelect',
      label: '用户组件',
      component: 'UsersSelect',
    },
    {
      field: 'fieldCascader',
      label: '级联选择',
      component: 'Cascader',
    },
    {
      field: 'fieldColorPicker',
      label: '颜色选择',
      component: 'ColorPicker',
    },
    {
      field: 'fieldRate',
      label: '评分',
      component: 'Rate',
    },
    {
      field: 'fieldSlider',
      label: '滑块',
      component: 'Slider',
    },
    {
      field: 'fieldEditor',
      label: '富文本',
      component: 'Editor',
    },
    {
      field: 'fieldLink',
      label: '链接',
      component: 'Link',
      componentProps: { content: '官网', href: 'https://jnpfsoft.com' },
    },
    {
      field: 'fieldText',
      label: '文本',
      component: 'Text',
      componentProps: { content: '这是一段文字' },
    },
    {
      field: 'fieldAlert',
      label: '提示',
      component: 'Alert',
      componentProps: { message: '这是一段提示', type: 'success', showIcon: true },
    },
    {
      field: 'fieldAreaSelect',
      label: '省市区域',
      component: 'AreaSelect',
    },
    {
      field: 'fieldBillRule',
      label: '单据规则',
      component: 'BillRule',
    },
    {
      field: 'fieldModifyUser',
      label: '修改人员',
      component: 'ModifyUser',
    },
    {
      field: 'fieldModifyTime',
      label: '修改时间',
      component: 'ModifyTime',
    },
    {
      field: 'fieldCreateUser',
      label: '创建人员',
      component: 'CreateUser',
      componentProps: { type: 'currUser' },
    },
    {
      field: 'fieldCreateTime',
      label: '创建时间',
      component: 'CreateTime',
      componentProps: { type: 'currTime' },
    },
    {
      field: 'fieldCurrOrganize',
      label: '所属组织',
      component: 'CurrOrganize',
      componentProps: { type: 'currOrganize' },
    },
    {
      field: 'fieldCurrPosition',
      label: '所属岗位',
      component: 'CurrPosition',
      componentProps: { type: 'currPosition' },
    },
    {
      field: 'fieldIconPicker',
      label: '图标选择',
      component: 'IconPicker',
    },
    {
      field: 'fieldSign',
      label: '在线签名',
      component: 'Sign',
    },
    {
      field: 'fieldQrcode',
      label: '二维码',
      component: 'Qrcode',
      componentProps: { staticText: '二维码' },
    },
    {
      field: 'fieldBarcode',
      label: '条形码',
      component: 'Barcode',
      componentProps: { staticText: '10241024' },
    },
    {
      field: 'fieldNumberRange',
      label: '条形码',
      component: 'NumberRange',
      componentProps: { staticText: '10241024' },
    },
  ];
  return schemas;
};
