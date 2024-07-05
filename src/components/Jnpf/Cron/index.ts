import { withInstall } from '/@/utils';
import cron from './EasyCronInput.vue';
import cronInner from './EasyCronInner.vue';
import cronModal from './EasyCronModal.vue';

export const JnpfCron = withInstall(cron);
export const CronInner = withInstall(cronInner);
export const CronModal = withInstall(cronModal);
