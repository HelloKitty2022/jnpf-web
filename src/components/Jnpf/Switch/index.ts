import { withInstall } from '/@/utils';
import type { ExtractPropTypes } from 'vue';
import Switch from './src/Switch.vue';
import { switchProps } from './src/props';

export const JnpfSwitch = withInstall(Switch);
export declare type SwitchProps = Partial<ExtractPropTypes<typeof switchProps>>;
