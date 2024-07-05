import { genMessage } from '../helper';
import antdLocale from 'ant-design-vue/es/locale/zh_TW';

const modules = import.meta.glob('./zh-TW/**/*.ts', { eager: true });
(antdLocale as any).Calendar.timePickerLocale.rangePlaceholder = ['開始時間', '結束時間'];

export default {
  message: {
    ...genMessage(modules as Recordable<Recordable>, 'zh-TW'),
    antdLocale,
  },
};
