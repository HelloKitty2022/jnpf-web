<template>
  <a-form-item label="合计设置">
    <jnpf-switch v-model:value="activeData.showSummary" />
  </a-form-item>
  <a-form-item label="合计字段" v-if="activeData.showSummary">
    <jnpf-select v-model:value="activeData.summaryField" placeholder="请选择" :options="childrenList" allowClear showSearch multiple />
  </a-form-item>
  <a-form-item label="复杂表头" v-show="showType === 'pc'">
    <a-button block @click="handleComplexHeader">{{ activeData.__config__.complexHeaderList?.length ? '编辑复杂表头' : '复杂表头配置' }}</a-button>
  </a-form-item>
  <a-divider>子表字段</a-divider>
  <div class="custom-draggable-list">
    <draggable v-model="activeData.__config__.children" :animation="300" group="selectItem" handle=".option-drag" itemKey="value">
      <template #item="{ element, index }">
        <div class="custom-draggable-item">
          <div class="custom-line-icon option-drag">
            <i class="icon-ym icon-ym-darg" />
          </div>
          <p class="custom-line-value" @click="handleActiveFormItem(element)">{{ element.__config__.label }}</p>
          <div class="close-btn custom-line-icon" @click="activeData.__config__.children.splice(index, 1)">
            <i class="icon-ym icon-ym-btn-clearn" />
          </div>
        </div>
      </template>
    </draggable>
    <div class="add-btn">
      <a-dropdown :trigger="['click']" destroyPopupOnHide>
        <a-button type="link" preIcon="icon-ym icon-ym-btn-add">添加字段</a-button>
        <template #overlay>
          <a-menu class="custom-draggable-dropdown-menu">
            <a-menu-item v-for="item in getInputComponents" @click.native="addComponent(item)">
              <i :class="item.__config__.tagIcon" />
              {{ item.__config__.label }}
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item v-for="item in getSelectComponents" @click.native="addComponent(item)">
              <i :class="item.__config__.tagIcon" />
              {{ item.__config__.label }}
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item v-for="item in getSystemComponents" @click.native="addComponent(item)">
              <i :class="item.__config__.tagIcon" />
              {{ item.__config__.label }}
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
  <a-divider>操作列按钮</a-divider>
  <draggable v-model="activeData.columnBtnsList" :animation="300" group="selectItem" handle=".option-drag" itemKey="value" class="custom-draggable-list">
    <template #item="{ element }">
      <div class="custom-draggable-item">
        <div class="custom-line-icon option-drag">
          <i class="icon-ym icon-ym-darg" />
        </div>
        <p class="custom-line-value">{{ element.label }}</p>
        <div class="edit-btn custom-line-icon" @click="editBtnConfig(element)">
          <i class="icon-ym icon-ym-btn-edit" />
        </div>
      </div>
    </template>
  </draggable>
  <a-divider>底部按钮</a-divider>
  <div class="custom-draggable-list">
    <draggable v-model="activeData.footerBtnsList" :animation="300" group="selectItem" handle=".option-drag" itemKey="value">
      <template #item="{ element, index }">
        <div class="custom-draggable-item">
          <div class="custom-line-icon option-drag">
            <i class="icon-ym icon-ym-darg" />
          </div>
          <p class="custom-line-value">{{ element.label }}</p>
          <div class="close-btn custom-line-icon" @click="activeData.footerBtnsList.splice(index, 1)" v-if="index > 1">
            <i class="icon-ym icon-ym-btn-clearn" />
          </div>
          <div class="edit-btn custom-line-icon" @click="editBtnConfig(element)">
            <i class="icon-ym icon-ym-btn-edit" />
          </div>
        </div>
      </template>
    </draggable>
    <div class="add-btn" v-if="activeData.footerBtnsList?.length < 5">
      <a-button type="link" preIcon="icon-ym icon-ym-btn-add" @click="addBtn()">添加按钮</a-button>
    </div>
  </div>
  <BtnConfigModal @register="registerModal" @confirm="updateConf" />
  <ComplexHeaderModal @register="registerComplexHeaderModal" @confirm="updateComplexHeaderList" />
</template>
<script lang="ts" setup>
  import { inject, computed, onMounted } from 'vue';
  import { useModal } from '/@/components/Modal';
  import BtnConfigModal from './BtnConfigModal.vue';
  import ComplexHeaderModal from '/@/components/ColumnDesign/src/components/ComplexHeaderModal.vue';
  import draggable from 'vuedraggable';
  import { inputComponents, selectComponents, systemComponents } from '/@/components/FormGenerator/src/helper/componentMap';
  import { noTableAllowList, calculateItem } from '/@/components/FormGenerator/src/helper/config';
  import { useGeneratorStore } from '/@/store/modules/generator';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { cloneDeep } from 'lodash-es';
  import { buildBitUUID } from '/@/utils/uuid';

  const defaultAddTableConf = {
    popupTitle: '选择数据',
    popupType: 'dialog',
    popupWidth: '800px',
    dataSource: 'dynamic',
    modelId: '',
    interfaceId: '',
    interfaceName: '',
    templateJson: [],
    hasPage: true,
    pageSize: 20,
    columnOptions: [],
    relationOptions: [],
  };

  defineOptions({ inheritAttrs: false });
  const generatorStore = useGeneratorStore();
  const { createMessage } = useMessage();
  const props = defineProps(['activeData', 'formInfo']);
  const emit = defineEmits(['addTableComponent', 'activeFormItem']);
  const [registerModal, { openModal }] = useModal();
  const [registerComplexHeaderModal, { openModal: openComplexHeaderModal }] = useModal();
  const defaultColumnBtnsList = [
    { value: 'copy', label: '复制', show: true, btnType: 'primary', btnIcon: 'icon-ym icon-ym-btn-edit' },
    { value: 'remove', label: '删除', show: true, btnType: 'danger', btnIcon: 'icon-ym icon-ym-btn-clearn', showConfirm: true },
  ];
  const defaultFooterBtnsList = [
    { value: 'add', label: '添加', show: true, btnType: 'primary', btnIcon: 'icon-ym icon-ym-btn-add' },
    { value: 'batchRemove', label: '批量删除', show: true, btnType: 'danger', btnIcon: 'icon-ym icon-ym-btn-clearn', showConfirm: true },
  ];

  const childrenList = computed(() => {
    const list = props.activeData.__config__.children.filter(
      o => ['input', 'inputNumber', 'calculate'].includes(o.__config__.jnpfKey) && o.__vModel__ && !o.useMask,
    );
    return list.map(o => ({ id: o.__vModel__, fullName: o.__config__.label }));
  });
  const getInputComponents = computed(() => inputComponents.filter(o => !noTableAllowList.includes(o.__config__.jnpfKey)));
  const getSelectComponents = computed(() => {
    const list = selectComponents.filter(o => !noTableAllowList.includes(o.__config__.jnpfKey));
    return props.formInfo.type == 1 || props.formInfo.type == 6 ? [...list, calculateItem] : list;
  });
  const getSystemComponents = computed(() => systemComponents.filter(o => !noTableAllowList.includes(o.__config__.jnpfKey)));

  const getShowType: (() => string | undefined) | undefined = inject('getShowType');
  const showType = computed(() => (getShowType as () => string | undefined)());

  function handleComplexHeader() {
    let columnOptions = props.activeData.__config__.children.map(o => ({
      fullName: o.__config__.label,
      id: o.__vModel__,
      ...o,
    }));
    columnOptions = columnOptions.filter(o => o.__config__.tableFixed !== 'left' && o.__config__.tableFixed !== 'right' && o.id);
    openComplexHeaderModal(true, { list: props.activeData.__config__.complexHeaderList, columnOptions: columnOptions });
  }
  function updateConf(data) {
    props.activeData.columnBtnsList = props.activeData.columnBtnsList.map(o => (data.value == o.value ? data : o));
    props.activeData.footerBtnsList = props.activeData.footerBtnsList.map(o => (data.value == o.value ? data : o));
    const list: [] = props.activeData.footerBtnsList.filter(o => data.value == o.value);
    if (!['copy', 'remove', 'add', 'batchRemove'].includes(data.value) && !list.length) props.activeData.footerBtnsList.push(data);
  }
  function updateComplexHeaderList(data) {
    props.activeData.__config__.complexHeaderList = data;
  }
  function addComponent(item) {
    if (generatorStore.getHasTable && !props.activeData.__config__.tableName) return createMessage.warning(`子表请先关联数据表`);
    let activeItem = cloneDeep(item);
    activeItem.__config__.isSubTable = true;
    activeItem.__config__.parentVModel = props.activeData.__vModel__;
    if (generatorStore.getHasTable) activeItem.__config__.relationTable = props.activeData.__config__.tableName;
    emit('addTableComponent', activeItem, props.activeData.__config__.children);
  }
  function handleActiveFormItem(item) {
    emit('activeFormItem', item);
  }
  function addBtn() {
    const config = {
      value: 'custom' + buildBitUUID(),
      label: '',
      show: true,
      btnType: '',
      btnIcon: '',
      actionConfig: cloneDeep(defaultAddTableConf),
    };
    openModal(true, { config, children: props.activeData.__config__.children });
  }
  function editBtnConfig(item) {
    let config = cloneDeep(item);
    openModal(true, { config, children: props.activeData.__config__.children });
  }

  onMounted(() => {
    if (!props.activeData.columnBtnsList?.length) props.activeData.columnBtnsList = cloneDeep(defaultColumnBtnsList);
    if (!props.activeData.footerBtnsList?.length) props.activeData.footerBtnsList = cloneDeep(defaultFooterBtnsList);
  });
</script>
