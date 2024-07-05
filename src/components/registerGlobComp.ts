import type { App } from 'vue';
import { Button } from './Button';
import {
  Input,
  InputNumber,
  Layout,
  Form,
  Switch,
  Dropdown,
  Menu,
  Select,
  Table,
  Checkbox,
  Tabs,
  Collapse,
  Card,
  Tooltip,
  Row,
  Col,
  Popconfirm,
  Divider,
  Alert,
  AutoComplete,
  Cascader,
  Rate,
  Slider,
  Avatar,
  Tag,
  Space,
  Steps,
  Popover,
  Radio,
  Progress,
  Image,
  Upload,
} from 'ant-design-vue';

import { BasicHelp, BasicCaption } from '/@/components/Basic';
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
import { JnpfEmpty } from '/@/components/Jnpf/Empty';
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
import { JnpfUploadFile, JnpfUploadImg, JnpfUploadImgSingle, JnpfUploadBtn } from '/@/components/Jnpf/Upload';
import { Tinymce } from '/@/components/Tinymce/index';
import { JnpfNumberRange } from '/@/components/Jnpf/NumberRange';
import { JnpfRelationFormAttr } from '/@/components/Jnpf/RelationFormAttr';
import { JnpfPopupSelect, JnpfPopupTableSelect } from '/@/components/Jnpf/PopupSelect';
import { JnpfPopupAttr } from '/@/components/Jnpf/PopupAttr';
import { JnpfCalculate } from '/@/components/Jnpf/Calculate';
import { JnpfLocation } from '/@/components/Jnpf/Location';
import { JnpfIframe } from '/@/components/Jnpf/Iframe';

const JnpfEditor = Tinymce;
JnpfEditor.name = 'JnpfEditor';
const JnpfGroupTitle = BasicCaption;
JnpfGroupTitle.name = 'JnpfGroupTitle';

export function registerGlobComp(app: App) {
  app
    .use(Input)
    .use(InputNumber)
    .use(Button)
    .use(Layout)
    .use(Form)
    .use(Switch)
    .use(Dropdown)
    .use(Menu)
    .use(Select)
    .use(Table)
    .use(Checkbox)
    .use(Tabs)
    .use(Card)
    .use(Collapse)
    .use(Tooltip)
    .use(Row)
    .use(Col)
    .use(Popconfirm)
    .use(Popover)
    .use(Divider)
    .use(Slider)
    .use(Rate)
    .use(Alert)
    .use(AutoComplete)
    .use(Cascader)
    .use(Avatar)
    .use(Tag)
    .use(Space)
    .use(Steps)
    .use(Radio)
    .use(Progress)
    .use(Image)
    .use(Upload)
    .use(BasicHelp)
    .use(JnpfAlert)
    .use(JnpfRate)
    .use(JnpfSlider)
    .use(JnpfAreaSelect)
    .use(JnpfAutoComplete)
    .use(JnpfButton)
    .use(JnpfCron)
    .use(JnpfCascader)
    .use(JnpfCheckbox)
    .use(JnpfCheckboxSingle)
    .use(JnpfColorPicker)
    .use(JnpfDatePicker)
    .use(JnpfDateRange)
    .use(JnpfTimePicker)
    .use(JnpfTimeRange)
    .use(JnpfDivider)
    .use(JnpfEmpty)
    .use(JnpfGroupTitle)
    .use(JnpfIconPicker)
    .use(JnpfInput)
    .use(JnpfTextarea)
    .use(JnpfInputNumber)
    .use(JnpfLink)
    .use(JnpfOrganizeSelect)
    .use(JnpfDepSelect)
    .use(JnpfPosSelect)
    .use(JnpfGroupSelect)
    .use(JnpfRoleSelect)
    .use(JnpfUserSelect)
    .use(JnpfUsersSelect)
    .use(JnpfOpenData)
    .use(JnpfQrcode)
    .use(JnpfBarcode)
    .use(JnpfRadio)
    .use(JnpfSelect)
    .use(JnpfSign)
    .use(JnpfSignature)
    .use(JnpfSwitch)
    .use(JnpfText)
    .use(JnpfTreeSelect)
    .use(JnpfEditor)
    .use(JnpfRelationFormAttr)
    .use(JnpfPopupSelect)
    .use(JnpfPopupTableSelect)
    .use(JnpfPopupAttr)
    .use(JnpfNumberRange)
    .use(JnpfCalculate)
    .use(JnpfUploadFile)
    .use(JnpfUploadImg)
    .use(JnpfUploadImgSingle)
    .use(JnpfUploadBtn)
    .use(JnpfLocation)
    .use(JnpfIframe);
}
