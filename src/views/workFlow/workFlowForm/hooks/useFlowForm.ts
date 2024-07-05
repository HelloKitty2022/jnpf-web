import { reactive, computed, nextTick, unref } from 'vue';
import { useUserStore } from '/@/store/modules/user';
import type { FormInstance } from 'ant-design-vue';
import type { Ref } from 'vue';
import { getBillNumber } from '/@/api/system/billRule';
import { useMessage } from '/@/hooks/web/useMessage';
import { isEmpty } from '/@/utils/is';

interface State {
  config: any;
  loading: boolean;
  eventType: string;
  flowUrgent: number;
  formRef: string;
  tableRequiredData: any;
}
interface UseFlowFormContext {
  config: any;
  selfState: any;
  emit: EmitType;
  formRef: Ref<FormInstance | undefined>;
  beforeInit?: any;
  selfGetInfo?: any;
  selfInit?: any;
  beforeSubmit?: any;
  selfSubmit?: any;
  selfExist?: any;
}

const userStore = useUserStore();
const { createMessage } = useMessage();
const state = reactive<State>({
  config: {},
  loading: false,
  eventType: '',
  flowUrgent: 1,
  formRef: 'formRef',
  tableRequiredData: {},
});

const includeList = ['crmOrder', 'salesOrder', 'leaveApply'];

const getUserInfo = computed(() => userStore.getUserInfo || {});

export function useFlowForm(data: UseFlowFormContext) {
  const { config, emit, formRef, selfState } = data;

  function getForm() {
    const form = unref(formRef);
    if (!form) {
      throw new Error('form is null!');
    }
    return form;
  }

  function init() {
    selfState.dataForm.id = config.id || '';
    state.config = config;
    state.loading = true;
    updateDataRule();
    nextTick(() => {
      getForm().resetFields();
      // 自定义初始化前方法
      if (data.beforeInit && typeof data.beforeInit === 'function') data.beforeInit();
      if (config.id) {
        selfState.dataForm = config.draftData || config.formData;
        // 自定义获取详情方法
        if (data.selfGetInfo && typeof data.selfGetInfo === 'function') data.selfGetInfo(selfState.dataForm);
        if (includeList.includes(config.formEnCode) && selfState.dataForm.fileJson) selfState.fileList = JSON.parse(selfState.dataForm.fileJson);
        emit('setPageLoad');
        return;
      } else {
        selfState.dataForm.flowId = config.flowId;
        // 自定义初始化方法
        if (data.selfInit && typeof data.selfInit === 'function') data.selfInit(data);
        if (!selfState.billEnCode) return emit('setPageLoad');
        getBillNumber(selfState.billEnCode).then(res => {
          if (selfState.billEnCode === 'OrderNumber') {
            selfState.dataForm.orderCode = res.data;
          } else {
            selfState.dataForm.billNo = res.data;
          }
          emit('setPageLoad');
        });
      }
      state.loading = false;
      emit('setPageLoad');
    });
  }
  // 更新校验规则
  function updateDataRule() {
    if (!config.formOperates || !config.formOperates.length) return (selfState.dataRule = {});
    let newRules = {};
    for (let i = 0; i < config.formOperates.length; i++) {
      const item = config.formOperates[i];
      if (!item.id.includes('-')) {
        const newRulesItem = {
          required: item.required || false,
          message: item.name + '不能为空',
          trigger: item.trigger || 'blur',
        };
        if (!selfState.dataRule.hasOwnProperty(item.id)) {
          if (item.required) newRules[item.id] = [newRulesItem];
        } else {
          let withoutRequiredItem = true;
          for (let i = 0; i < selfState.dataRule[item.id].length; i++) {
            if (selfState.dataRule[item.id][i].hasOwnProperty('required')) {
              selfState.dataRule[item.id][i].required = item.required || false;
              withoutRequiredItem = false;
            }
          }
          if (withoutRequiredItem && item.required) selfState.dataRule[item.id].push(newRulesItem);
        }
      } else {
        let key = item.id.split('-')[0];
        let newId = item.id.split('-')[1];
        let newItem = {
          ...item,
          id: newId,
        };
        if (!state.tableRequiredData.hasOwnProperty(key)) {
          state.tableRequiredData[key] = [newItem];
        } else {
          state.tableRequiredData[key].push(newItem);
        }
      }
    }
    selfState.dataRule = { ...selfState.dataRule, ...newRules };
  }
  async function dataFormSubmit(eventType, flowUrgent) {
    try {
      const values = await getForm()?.validate();
      if (!values) return;
      selfState.dataForm = { ...selfState.dataForm, ...values };
      if (!exist()) return;
      if (data.selfExist && typeof data.selfExist === 'function' && !data.selfExist()) return;
      let formData: any = {};
      if (data.beforeSubmit && typeof data.beforeSubmit === 'function') {
        formData = data.beforeSubmit();
      } else {
        formData = selfState.dataForm;
      }
      if (includeList.includes(config.formEnCode)) formData.fileJson = JSON.stringify(selfState.fileList || []);
      if (eventType === 'save' || eventType === 'submit') {
        if (data.selfSubmit && typeof data.selfSubmit === 'function') {
          data.selfSubmit(formData, eventType, flowUrgent);
          return;
        }
      }
      emit('eventReceiver', { formData }, eventType);
    } catch (_) {}
  }
  function exist() {
    let isOk = true;
    if (JSON.stringify(state.tableRequiredData) === '{}') return isOk;
    for (let key in state.tableRequiredData) {
      if (selfState.dataForm[key] && Array.isArray(selfState.dataForm[key])) {
        for (let i = 0; i < selfState.dataForm[key].length; i++) {
          let item = selfState.dataForm[key][i];
          inner: for (let id in item) {
            let arr = state.tableRequiredData[key].filter(o => o.id === id) || [];
            if (!arr.length) continue inner;
            if (arr[0].required) {
              const msg = `${arr[0].name}不能为空`;
              const boo = (!item[id] && item[id] != 0) || isEmpty(item[id]);
              if (boo) {
                createMessage.error(msg);
                isOk = false;
                break;
              }
            }
          }
        }
      }
    }
    return isOk;
  }
  function judgeRequired(id) {
    if (!config.formOperates || !config.formOperates.length) return false;
    let arr = config.formOperates.filter(o => o.id === id) || [];
    if (!arr.length) return false;
    let item = arr[0];
    return item.required;
  }
  function judgeShow(id) {
    if (config.opType == 4) return true;
    if (!config.formOperates || !config.formOperates.length) return true;
    let arr = config.formOperates.filter(o => o.id === id) || [];
    if (!arr.length) return true;
    let item = arr[0];
    return item.read;
  }
  function judgeWrite(id) {
    if (config.disabled) return true;
    if (!config.formOperates || !config.formOperates.length) return false;
    let arr = config.formOperates.filter(o => o.id === id) || [];
    if (!arr.length) return true;
    let item = arr[0];
    return !item.write;
  }

  return {
    comState: state,
    init,
    getUserInfo,
    judgeRequired,
    judgeShow,
    judgeWrite,
    getForm,
    dataFormSubmit,
  };
}
