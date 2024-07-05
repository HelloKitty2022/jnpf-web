import { withInstall } from '/@/utils';
import type { ExtractPropTypes } from 'vue';
import RelationForm from './src/RelationForm.vue';
import { relationFormProps } from './src/props';

export const JnpfRelationForm = withInstall(RelationForm);
export declare type RelationFormProps = Partial<ExtractPropTypes<typeof relationFormProps>>;
