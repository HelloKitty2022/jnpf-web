<template>
  <div :class="`${prefixCls}`" v-loading="loading">
    <div class="left-container">
      <div class="left-search">
        <a-input-search :placeholder="t('common.enterKeyword')" allowClear v-model:value="keyword" />
      </div>
      <draggable v-if="!keyword" v-model="flowList" :animation="300" group="selectItem" handle=".option-drag" itemKey="flowId" class="left-list">
        <template #item="{ element, index }">
          <div class="left-item" @click="changeFlow(element)" :class="{ active: activeConf.flowId === element.flowId }">
            <div class="option-drag">
              <i class="icon-ym icon-ym-darg" />
            </div>
            <p class="name">{{ element.fullName }}</p>
            <a-dropdown>
              <more-outlined :rotate="90" class="icon icon-more" />
              <template #overlay>
                <a-menu>
                  <a-menu-item @click.stop="copyFlow(element)">复制</a-menu-item>
                  <a-menu-item @click.stop="editFlow(element)">{{ t('common.editText') }}</a-menu-item>
                  <a-menu-item @click.stop="delFlow(index, element.isDelete)">{{ t('common.delText') }}</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </template>
      </draggable>
      <div class="left-list" v-else>
        <div class="left-item" v-for="(element, index) in getFlowList" @click="changeFlow(element)" :class="{ active: activeConf.flowId === element.flowId }">
          <p class="name">{{ element.fullName }}</p>
          <a-dropdown>
            <more-outlined :rotate="90" class="icon icon-more" />
            <template #overlay>
              <a-menu>
                <a-menu-item @click.stop="copyFlow(element)">复制</a-menu-item>
                <a-menu-item @click.stop="editFlow(element)">{{ t('common.editText') }}</a-menu-item>
                <a-menu-item @click.stop="delFlow(index, element.isDelete)">{{ t('common.delText') }}</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <jnpf-empty v-if="!getFlowList.length" />
      </div>

      <div class="add-btn" @click="addFlow">
        <a-button type="link" preIcon="icon-ym icon-ym-btn-add">添加流程</a-button>
      </div>
    </div>
    <div class="center-container">
      <process-main
        :conf="activeConf.flowTemplateJson"
        :formInfo="formInfo"
        :verifyMode="verifyMode"
        :key="key"
        v-if="activeConf && activeConf.flowTemplateJson" />
    </div>
    <BasicModal v-bind="$attrs" @register="registerModal" :title="handleType === 'add' ? '新建流程' : '编辑流程'" @ok="handleSubmit">
      <BasicForm @register="registerForm" />
    </BasicModal>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, nextTick, onMounted, computed } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { getInfo as getFormInfo } from '/@/api/workFlow/formDesign';
  import { NodeUtils, getMockData } from './helper/util';
  import { buildBitUUID } from '/@/utils/uuid';
  import draggable from 'vuedraggable';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { MoreOutlined } from '@ant-design/icons-vue';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { cloneDeep, omit } from 'lodash-es';
  import ProcessMain from './Main.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    loading: boolean;
    verifyMode: boolean;
    flowList: any[];
    activeConf: any;
    defaultData: any;
    formFieldList: any;
    key: number;
    handleType: string;
    dataForm: any;
    keyword: string;
  }

  const props = defineProps(['conf', 'formInfo']);
  defineExpose({ getData });

  const { createMessage, createConfirm } = useMessage();
  const { prefixCls } = useDesign('basic-process');
  const [registerModal, { openModal, closeModal }] = useModal();
  const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
    labelWidth: 100,
    schemas: [
      {
        field: 'fullName',
        label: '流程名称',
        component: 'Input',
        componentProps: { placeholder: '请输入', maxlength: 50 },
        rules: [
          {
            required: true,
            trigger: 'blur',
            validator: (_rule, val) => {
              if (!val) return Promise.reject('必填');
              const boo = state.flowList.some(o => o.fullName === val && o.flowId !== state.dataForm.flowId);
              if (boo) return Promise.reject('流程名称重复，请重新输入');
              return Promise.resolve();
            },
          },
        ],
      },
    ],
  });
  const state = reactive<State>({
    loading: false,
    verifyMode: false,
    flowList: [],
    activeConf: {},
    defaultData: {},
    formFieldList: [],
    key: +new Date(),
    handleType: '',
    dataForm: {
      fullName: '',
      id: '',
      flowId: '',
      flowTemplateJson: {},
    },
    keyword: '',
  });
  const { flowList, loading, activeConf, handleType, key, verifyMode, keyword } = toRefs(state);
  const { t } = useI18n();

  const getFlowList = computed(() => (state.keyword ? state.flowList.filter(o => o.fullName.indexOf(state.keyword) !== -1) : state.flowList));

  // 供父组件使用 获取表单JSON
  function getData() {
    return new Promise((resolve, reject) => {
      state.verifyMode = true;
      let boo = true;
      let errorItem: any = {};
      for (let i = 0; i < state.flowList.length; i++) {
        boo = NodeUtils.checkAllNode(state.flowList[i].flowTemplateJson);
        errorItem = state.flowList[i];
        if (!boo) break;
      }
      if (boo) {
        return resolve({ data: state.flowList });
      } else {
        return reject({ target: 2, msg: `请完善${errorItem.fullName}的流程设计` });
      }
    });
  }
  function addFlow() {
    state.handleType = 'add';
    openModal(true);
    nextTick(() => {
      resetFields();
      let flowTemplateJson = cloneDeep(state.defaultData);
      if (state.flowList.length) {
        const defaultProperties = state.flowList[0].flowTemplateJson.properties;
        flowTemplateJson.properties.formName = defaultProperties.formName;
        flowTemplateJson.properties.formId = defaultProperties.formId;
        const formFieldList = defaultProperties.allFormMap['form_' + defaultProperties.formId] || [];
        flowTemplateJson.properties.allFormMap['form_' + defaultProperties.formId] = formFieldList;
        state.formFieldList = formFieldList;
        flowTemplateJson.properties.formOperates = initFormOperates(flowTemplateJson, true);
      }
      state.dataForm = {
        id: '',
        flowId: buildBitUUID(),
        fullName: '',
        flowTemplateJson: flowTemplateJson,
      };
    });
  }
  function editFlow(item) {
    state.handleType = 'edit';
    openModal(true);
    nextTick(() => {
      resetFields();
      state.dataForm = cloneDeep(item);
      setFieldsValue(state.dataForm);
    });
  }
  function delFlow(index, isDelete) {
    if (state.flowList.length === 1) return createMessage.warning(`最后一个流程不能删除`);
    if (isDelete) return createMessage.warning(`流程已被使用，不能删除`);
    createConfirm({
      iconType: 'warning',
      title: '提示',
      content: '此操作将永久删除该流程，是否继续?',
      onOk: () => {
        state.flowList.splice(index, 1);
        state.activeConf = state.flowList[state.flowList.length - 1];
        state.key = +new Date();
      },
    });
  }
  function copyFlow(item) {
    let itemCopy = cloneDeep(item);
    createConfirm({
      iconType: 'warning',
      title: '提示',
      content: '您确定要复制该流程，是否继续?',
      onOk: () => {
        const flowId = buildBitUUID();
        let fullName = itemCopy.fullName + flowId;
        if (fullName.length > 50) {
          fullName = fullName.substring(fullName.length - 50);
        }
        const data = {
          id: '',
          flowId,
          fullName,
          flowTemplateJson: itemCopy.flowTemplateJson,
        };
        state.flowList.push(data);
      },
    });
  }
  function changeFlow(item) {
    if (item.flowId === state.activeConf.flowId) return;
    state.activeConf = item;
    state.key = +new Date();
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    state.dataForm = { ...state.dataForm, ...values };
    if (state.handleType === 'add') {
      state.flowList.push(cloneDeep(state.dataForm));
      state.activeConf = state.flowList[state.flowList.length - 1];
      state.key = +new Date();
    } else {
      for (let i = 0; i < state.flowList.length; i++) {
        if (state.dataForm.flowId === state.flowList[i].flowId) {
          state.flowList[i].fullName = state.dataForm.fullName;
          break;
        }
      }
    }
    closeModal();
  }
  function transformFieldList(formFieldList) {
    let list: any[] = [];
    const loop = (data, parent?) => {
      if (!data) return;
      if (data.__vModel__) {
        const isTableChild = parent && parent.__config__ && parent.__config__.jnpfKey === 'table';
        list.push({
          id: isTableChild ? parent.__vModel__ + '-' + data.__vModel__ : data.__vModel__,
          fullName: isTableChild ? parent.__config__.label + '-' + data.__config__.label : data.__config__.label,
          ...omit(data, ['__config__', 'on', 'style', 'options', 'props', 'templateJson', 'columnOptions', 'addTableConf', 'tableConf']),
          __vModel__: isTableChild ? parent.__vModel__ + '-' + data.__vModel__ : data.__vModel__,
          __config__: {
            label: isTableChild ? parent.__config__.label + '-' + data.__config__.label : data.__config__.label,
            jnpfKey: data.__config__.jnpfKey,
            required: data.__config__.required,
            isSubTable: data.__config__.isSubTable,
          },
        });
      }
      if (Array.isArray(data)) data.forEach(d => loop(d, parent));
      if (data.__config__ && data.__config__.children && Array.isArray(data.__config__.children)) {
        loop(data.__config__.children, data);
      }
    };
    loop(formFieldList);
    return list;
  }
  const requiredDisabled = jnpfKey => {
    return ['billRule', 'createUser', 'createTime', 'modifyTime', 'modifyUser', 'currPosition', 'currOrganize', 'table'].includes(jnpfKey);
  };
  const getDataType = data => {
    if (!data.__config__ || !data.__config__.jnpfKey) return '';
    const jnpfKey = data.__config__.jnpfKey;
    if (['inputNumber', 'datePicker', 'rate', 'slider'].includes(jnpfKey)) {
      return 'number';
    } else if (['checkbox', 'uploadFile', 'uploadImg', 'cascader', 'organizeSelect', 'areaSelect'].includes(jnpfKey)) {
      return 'array';
    } else if (
      ['select', 'treeSelect', 'depSelect', 'posSelect', 'userSelect', 'usersSelect', 'roleSelect', 'groupSelect', 'popupSelect', 'popupTableSelect'].includes(
        jnpfKey,
      )
    ) {
      if (data.multiple) return 'array';
    }
    return '';
  };
  function initFormOperates(target, isUpdate = false, isSameForm = false) {
    const formOperates = (target.properties && target.properties.formOperates) || [];
    let res: any[] = [];
    const getWriteById = id => {
      const arr = formOperates.filter(o => o.id === id);
      return arr.length ? arr[0].write : NodeUtils.isStartNode(target);
    };
    const getReadById = id => {
      const arr = formOperates.filter(o => o.id === id);
      return arr.length ? arr[0].read : true;
    };
    const getRequiredById = id => {
      const arr = formOperates.filter(o => o.id === id);
      return arr.length ? arr[0].required : false;
    };
    if (!formOperates.length || isUpdate) {
      for (let i = 0; i < state.formFieldList.length; i++) {
        const data = state.formFieldList[i];
        res.push({
          id: data.id,
          name: data.fullName,
          required: !isSameForm ? data.__config__.required : data.__config__.required || getRequiredById(data.id),
          requiredDisabled: requiredDisabled(data.__config__.jnpfKey) || data.__config__.required,
          jnpfKey: data.__config__.jnpfKey,
          dataType: getDataType(data),
          read: !isSameForm ? true : getReadById(data.id),
          write: !isSameForm ? NodeUtils.isStartNode(target) : getWriteById(data.id),
        });
      }
    } else {
      res = formOperates;
    }
    return res;
  }
  function updateData() {
    for (let i = 0; i < state.flowList.length; i++) {
      state.flowList[i].flowTemplateJson = Object.assign(NodeUtils.createNode('start'), state.flowList[i].flowTemplateJson);
      updateAllFormMap(state.flowList[i].flowTemplateJson);
    }
  }
  function updateAllFormMap(flowTemplateJson) {
    if (!flowTemplateJson.properties.allFormMap) flowTemplateJson.properties.allFormMap = {};
    if (!flowTemplateJson.properties.formFieldList && (!props.formInfo.onlineDev || !props.formInfo.onlineFormId)) return;
    if (props.formInfo.onlineDev && props.formInfo.onlineFormId) {
      flowTemplateJson.properties.allFormMap['form_' + flowTemplateJson.properties.formId] = state.formFieldList;
    }
    const loop = data => {
      if (Array.isArray(data)) data.forEach(d => loop(d));
      if (data.type === 'approver' || data.type === 'start') {
        // 兼容旧数据，将表单字段都整理到allFormMap
        if (data.properties.formFieldList?.length) {
          if (data.properties.formId) {
            const formFieldList = data.properties.formFieldList.map(o => (o.id ? o : { ...o, id: o.__vModel__, fullName: o.__config__.label }));
            flowTemplateJson.properties.allFormMap['form_' + data.properties.formId] = formFieldList;
          }
          delete data.properties.formFieldList;
        }
        if (props.formInfo.onlineDev && props.formInfo.onlineFormId) data.properties.formOperates = initFormOperates(data, true, true);
      }
      if (data.conditionNodes && Array.isArray(data.conditionNodes)) loop(data.conditionNodes);
      if (data.childNode) loop(data.childNode);
    };
    loop(flowTemplateJson);
  }
  function initData() {
    if (Array.isArray(props.conf) && props.conf !== null && JSON.stringify(props.conf) !== '[]') {
      state.flowList = props.conf;
      updateData();
    } else {
      let item = {
        id: '',
        flowId: buildBitUUID(),
        fullName: props.formInfo.fullName,
        flowTemplateJson: cloneDeep(state.defaultData),
      };
      state.flowList = [item];
    }
    state.activeConf = state.flowList[0];
    nextTick(() => {
      state.loading = false;
    });
  }

  onMounted(() => {
    state.loading = true;
    if (props.formInfo.onlineDev && props.formInfo.onlineFormId) {
      getFormInfo(props.formInfo.onlineFormId).then(res => {
        const defaultData = getMockData();
        defaultData.properties.formName = res.data.fullName;
        defaultData.properties.formId = res.data.id;
        let { propertyJson } = res.data;
        let formJson: any = {},
          fieldList = [];
        if (propertyJson) formJson = JSON.parse(propertyJson);
        fieldList = formJson.fields;
        state.formFieldList = transformFieldList(fieldList);
        if (!defaultData.properties.allFormMap) defaultData.properties.allFormMap = {};
        defaultData.properties.allFormMap['form_' + res.data.id] = state.formFieldList;
        defaultData.properties.formOperates = initFormOperates(defaultData);
        state.defaultData = defaultData;
        initData();
      });
    } else {
      state.defaultData = getMockData();
      initData();
    }
  });
</script>
