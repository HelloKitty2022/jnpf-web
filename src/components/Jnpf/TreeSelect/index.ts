import { withInstall } from '/@/utils';
import type { ExtractPropTypes } from 'vue';
import TreeSelect from './src/TreeSelect.vue';
import { treeSelectProps } from './src/props';

export const JnpfTreeSelect = withInstall(TreeSelect);
export declare type TreeSelectProps = Partial<ExtractPropTypes<typeof treeSelectProps>>;
