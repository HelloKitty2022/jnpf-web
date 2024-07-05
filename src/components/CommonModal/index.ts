import { withInstall } from '/@/utils';
import interfaceModal from './src/InterfaceModal.vue';
import billRuleModal from './src/BillRuleModal.vue';
import selectModal from './src/SelectModal.vue';
import previewModal from './src/PreviewModal.vue';
import exportModal from './src/ExportModal.vue';
import importModal from './src/ImportModal.vue';
import superQueryModal from './src/SuperQueryModal.vue';
import selectFlowModal from './src/SelectFlowModal.vue';

export const InterfaceModal = withInstall(interfaceModal);
export const BillRuleModal = withInstall(billRuleModal);
export const SelectModal = withInstall(selectModal);
export const PreviewModal = withInstall(previewModal);
export const ExportModal = withInstall(exportModal);
export const ImportModal = withInstall(importModal);
export const SuperQueryModal = withInstall(superQueryModal);
export const SelectFlowModal = withInstall(selectFlowModal);
