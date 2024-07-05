import { Input, DatePicker } from 'ant-design-vue';

// jnpf 组件
import { BasicCaption } from '/@/components/Basic';
import { JnpfAlert } from '/@/components/Jnpf/Alert';
import { JnpfAreaSelect } from '/@/components/Jnpf/AreaSelect';
import { JnpfAutoComplete } from '/@/components/Jnpf/AutoComplete';
import { JnpfButton } from '/@/components/Jnpf/Button';
import { JnpfCron } from '/@/components/Jnpf/Cron';
import { JnpfCascader } from '/@/components/Jnpf/Cascader';
import { JnpfCheckbox, JnpfCheckboxSingle } from '/@/components/Jnpf/Checkbox';
import { JnpfColorPicker } from '/@/components/Jnpf/ColorPicker';
import { JnpfDatePicker, JnpfDateRange, JnpfTimePicker, JnpfTimeRange } from '/@/components/Jnpf/DatePicker';
import { JnpfDivider } from '/@/components/Jnpf/Divider';
import { JnpfIconPicker } from '/@/components/Jnpf/IconPicker';
import { JnpfInput, JnpfTextarea } from '/@/components/Jnpf/Input';
import { JnpfInputNumber } from '/@/components/Jnpf/InputNumber';
import { JnpfLink } from '/@/components/Jnpf/Link';
import { JnpfOpenData } from '/@/components/Jnpf/OpenData';
import {
  JnpfOrganizeSelect,
  JnpfDepSelect,
  JnpfPosSelect,
  JnpfGroupSelect,
  JnpfRoleSelect,
  JnpfUserSelect,
  JnpfUsersSelect,
} from '/@/components/Jnpf/Organize';
import { JnpfQrcode } from '/@/components/Jnpf/Qrcode';
import { JnpfBarcode } from '/@/components/Jnpf/Barcode';
import { JnpfRadio } from '/@/components/Jnpf/Radio';
import { JnpfSelect } from '/@/components/Jnpf/Select';
import { JnpfRate } from '/@/components/Jnpf/Rate';
import { JnpfSlider } from '/@/components/Jnpf/Slider';
import { JnpfSign } from '/@/components/Jnpf/Sign';
import { JnpfSignature } from '/@/components/Jnpf/Signature';
import { JnpfSwitch } from '/@/components/Jnpf/Switch';
import { JnpfText } from '/@/components/Jnpf/Text';
import { JnpfTreeSelect } from '/@/components/Jnpf/TreeSelect';
import { JnpfUploadFile, JnpfUploadImg, JnpfUploadImgSingle } from '/@/components/Jnpf/Upload';
import { Tinymce } from '/@/components/Tinymce/index';
import { JnpfRelationForm } from '/@/components/Jnpf/RelationForm';
import { JnpfRelationFormAttr } from '/@/components/Jnpf/RelationFormAttr';
import { JnpfPopupSelect, JnpfPopupTableSelect } from '/@/components/Jnpf/PopupSelect';
import { JnpfPopupAttr } from '/@/components/Jnpf/PopupAttr';
import { JnpfNumberRange } from '/@/components/Jnpf/NumberRange';
import { JnpfCalculate } from '/@/components/Jnpf/Calculate';
import { JnpfInputTable } from '/@/components/Jnpf/InputTable';
import { JnpfLocation } from '/@/components/Jnpf/Location';
import { JnpfIframe } from '/@/components/Jnpf/Iframe';

const JnpfInputPassword = Input.Password;
JnpfInputPassword.name = 'JnpfInputPassword';
const JnpfInputGroup = Input.Group;
JnpfInputGroup.name = 'JnpfInputGroup';
const JnpfInputSearch = Input.Search;
JnpfInputSearch.name = 'JnpfInputSearch';
const JnpfEditor = Tinymce;
JnpfEditor.name = 'JnpfEditor';
const JnpfGroupTitle = BasicCaption;
JnpfGroupTitle.name = 'JnpfGroupTitle';
const JnpfMonthPicker = DatePicker.MonthPicker;
JnpfMonthPicker.name = 'JnpfMonthPicker';
const JnpfWeekPicker = DatePicker.WeekPicker;
JnpfWeekPicker.name = 'JnpfWeekPicker';

export {
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
};
