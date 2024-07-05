import type { Component } from 'vue';
import type { ComponentType } from './types/index';

/**
 * Component list, register here to setting it in the form
 */
import { StrengthMeter } from '/@/components/StrengthMeter';
import { CountdownInput } from '/@/components/CountDown';
// jnpf 组件
import {
  JnpfAlert,
  JnpfAreaSelect,
  JnpfAutoComplete,
  JnpfButton,
  JnpfCron,
  JnpfCascader,
  JnpfColorPicker,
  JnpfCheckbox,
  JnpfCheckboxSingle,
  JnpfDatePicker,
  JnpfDateRange,
  JnpfTimePicker,
  JnpfTimeRange,
  JnpfMonthPicker,
  JnpfWeekPicker,
  JnpfDivider,
  JnpfEditor,
  JnpfGroupTitle,
  JnpfIconPicker,
  JnpfInput,
  JnpfInputPassword,
  JnpfInputGroup,
  JnpfInputSearch,
  JnpfTextarea,
  JnpfInputNumber,
  JnpfLink,
  JnpfOpenData,
  JnpfOrganizeSelect,
  JnpfDepSelect,
  JnpfPosSelect,
  JnpfGroupSelect,
  JnpfRoleSelect,
  JnpfUserSelect,
  JnpfUsersSelect,
  JnpfQrcode,
  JnpfBarcode,
  JnpfRadio,
  JnpfRate,
  JnpfSelect,
  JnpfSlider,
  JnpfSign,
  JnpfSignature,
  JnpfSwitch,
  JnpfText,
  JnpfTreeSelect,
  JnpfUploadFile,
  JnpfUploadImg,
  JnpfUploadImgSingle,
  JnpfRelationForm,
  JnpfRelationFormAttr,
  JnpfPopupSelect,
  JnpfPopupTableSelect,
  JnpfPopupAttr,
  JnpfNumberRange,
  JnpfCalculate,
  JnpfInputTable,
  JnpfLocation,
  JnpfIframe,
} from '/@/components/Jnpf';

const componentMap = new Map<ComponentType, Component>();

componentMap.set('StrengthMeter', StrengthMeter);
componentMap.set('InputCountDown', CountdownInput);

componentMap.set('InputGroup', JnpfInputGroup);
componentMap.set('InputSearch', JnpfInputSearch);
componentMap.set('MonthPicker', JnpfMonthPicker);
componentMap.set('WeekPicker', JnpfWeekPicker);

componentMap.set('Alert', JnpfAlert);
componentMap.set('AreaSelect', JnpfAreaSelect);
componentMap.set('AutoComplete', JnpfAutoComplete);
componentMap.set('Button', JnpfButton);
componentMap.set('Cron', JnpfCron);
componentMap.set('Cascader', JnpfCascader);
componentMap.set('ColorPicker', JnpfColorPicker);
componentMap.set('Checkbox', JnpfCheckbox);
componentMap.set('JnpfCheckboxSingle', JnpfCheckboxSingle);
componentMap.set('DatePicker', JnpfDatePicker);
componentMap.set('DateRange', JnpfDateRange);
componentMap.set('TimePicker', JnpfTimePicker);
componentMap.set('TimeRange', JnpfTimeRange);
componentMap.set('Divider', JnpfDivider);
componentMap.set('Editor', JnpfEditor);
componentMap.set('GroupTitle', JnpfGroupTitle);
componentMap.set('Input', JnpfInput);
componentMap.set('InputPassword', JnpfInputPassword);
componentMap.set('Textarea', JnpfTextarea);
componentMap.set('InputNumber', JnpfInputNumber);
componentMap.set('IconPicker', JnpfIconPicker);
componentMap.set('Link', JnpfLink);
componentMap.set('OrganizeSelect', JnpfOrganizeSelect);
componentMap.set('DepSelect', JnpfDepSelect);
componentMap.set('PosSelect', JnpfPosSelect);
componentMap.set('GroupSelect', JnpfGroupSelect);
componentMap.set('RoleSelect', JnpfRoleSelect);
componentMap.set('UserSelect', JnpfUserSelect);
componentMap.set('UsersSelect', JnpfUsersSelect);
componentMap.set('Qrcode', JnpfQrcode);
componentMap.set('Barcode', JnpfBarcode);
componentMap.set('Radio', JnpfRadio);
componentMap.set('Rate', JnpfRate);
componentMap.set('Select', JnpfSelect);
componentMap.set('Slider', JnpfSlider);
componentMap.set('Sign', JnpfSign);
componentMap.set('Signature', JnpfSignature);
componentMap.set('Switch', JnpfSwitch);
componentMap.set('Text', JnpfText);
componentMap.set('TreeSelect', JnpfTreeSelect);
componentMap.set('UploadFile', JnpfUploadFile);
componentMap.set('UploadImg', JnpfUploadImg);
componentMap.set('UploadImgSingle', JnpfUploadImgSingle);
componentMap.set('BillRule', JnpfInput);
componentMap.set('ModifyUser', JnpfInput);
componentMap.set('ModifyTime', JnpfInput);
componentMap.set('CreateUser', JnpfOpenData);
componentMap.set('CreateTime', JnpfOpenData);
componentMap.set('CurrOrganize', JnpfOpenData);
componentMap.set('CurrPosition', JnpfOpenData);
componentMap.set('RelationForm', JnpfRelationForm);
componentMap.set('RelationFormAttr', JnpfRelationFormAttr);
componentMap.set('PopupSelect', JnpfPopupSelect);
componentMap.set('PopupTableSelect', JnpfPopupTableSelect);
componentMap.set('PopupAttr', JnpfPopupAttr);
componentMap.set('NumberRange', JnpfNumberRange);
componentMap.set('Calculate', JnpfCalculate);
componentMap.set('InputTable', JnpfInputTable);
componentMap.set('Location', JnpfLocation);
componentMap.set('Iframe', JnpfIframe);

export function add(compName: ComponentType, component: Component) {
  componentMap.set(compName, component);
}

export function del(compName: ComponentType) {
  componentMap.delete(compName);
}

export { componentMap };
