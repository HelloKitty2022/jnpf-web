import { withInstall } from '/@/utils';
import DatePicker from './src/DatePicker.vue';
import DateRange from './src/DateRange.vue';
import TimePicker from './src/TimePicker.vue';
import TimeRange from './src/TimeRange.vue';

export const JnpfDatePicker = withInstall(DatePicker);
export const JnpfDateRange = withInstall(DateRange);
export const JnpfTimePicker = withInstall(TimePicker);
export const JnpfTimeRange = withInstall(TimeRange);
