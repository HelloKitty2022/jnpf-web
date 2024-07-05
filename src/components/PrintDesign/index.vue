<template>
  <div class="print-template-detail">
    <div class="print-template-detail__body">
      <div class="system-view-nav">
        <ScrollContainer>
          <div class="jnpf-common-title"><h2>表单字段</h2></div>
          <BasicLeftTree
            ref="leftTreeRef"
            :showSearch="false"
            :treeData="getTreeData"
            :fieldNames="{ key: 'newId', title: 'fullName' }"
            @select="handleNodeClick" />
          <div class="jnpf-common-title"><h2>系统字段</h2></div>
          <BasicLeftTree ref="leftTreeRef" :showSearch="false" :treeData="getSysTreeData" @select="handleNodeClick" />
          <div class="jnpf-common-title"><h2>函数</h2></div>
          <BasicLeftTree ref="leftTreeRef" :showSearch="false" :treeData="funData" @select="handleNodeClick" />
        </ScrollContainer>
      </div>
      <div class="system-view-content">
        <PrintDesignTinymce v-model:value="content" ref="createTinymce" :height="richHeight" :init="initConfig" class="rich-txt" @input="onDesignChange" />
      </div>
      <PageSize @register="registerPageSize" @change="getEditConfig" />
      <SelectDictionaryModal @register="registerDictionaryModal" @reload="reload" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, watch, ref, toRefs, computed, unref, nextTick } from 'vue';
  import { BasicLeftTree } from '/@/components/Tree';
  import { ScrollContainer } from '/@/components/Container';
  import PrintDesignTinymce from './PrintDesign/index.vue';
  import { useModal } from '/@/components/Modal';
  import PageSize from './PageSize/index.vue';
  import SelectDictionaryModal from './SelectDictionaryModal/index.vue';

  const emit = defineEmits(['register', 'input', 'pageParamChange']);

  interface State {
    showEdit: boolean;
    tabs: any[];
    initConfig: any;
    menuList: any[];
    init: any;
    menuIndex: string;
    content: string;
    activeTab: string;
    richHeight: any;
    systemData: any[];
    selectNodes: any;
    funData: any[];
  }
  const props = defineProps({
    value: { type: String, default: '' },
    type: { type: Number },
    treeData: { type: Array, default: () => [] },
    pageParam: { type: Object, default: {} },
  });
  const state = reactive<State>({
    showEdit: false,
    tabs: [],
    initConfig: {},
    menuList: [],
    init: {},
    menuIndex: '',
    content: '',
    activeTab: '',
    richHeight: document.documentElement.clientHeight - 42,
    systemData: [
      { fullName: '打印人员', id: 'systemPrinter' },
      { fullName: '打印时间', id: 'systemPrintTime' },
      { fullName: '审批内容', id: 'systemApprovalContent' },
      { fullName: '图片', id: 'img' },
      { fullName: '二维码', id: 'qrCode' },
      { fullName: '条形码', id: 'barCode' },
    ],
    selectNodes: null,
    funData: [
      { fullName: '千位分隔符(字段或数字,小数位数)', id: 'thousands' },
      { fullName: '大写金额(字段或数字)', id: 'isAmountChinese' },
      { fullName: '数据字典(字段,字典分类)', id: 'jnpfDictionary' },
      { fullName: '日期选择(字段,日期格式)', id: 'jnpfDate' },
    ],
  });
  const { content, richHeight, initConfig, funData } = toRefs(state);
  const createTinymce = ref();
  const [registerPageSize, { openModal: openPageSizeModal }] = useModal();
  const [registerDictionaryModal, { openModal: openDictionaryModal }] = useModal();

  const editor = computed(() => unref(createTinymce)?.editor);
  const getTreeData = computed<any[]>(() => {
    const list = props.treeData || [];
    const loop = dataList => {
      for (let i = 0; i < dataList.length; i++) {
        const element: any = dataList[i];
        element.newId = element.parentId + '_' + element.id;
        if (element.children?.length) loop(element.children);
      }
    };
    loop(list);
    return list;
  });
  const getSysTreeData = computed(() => {
    let data = state.systemData;
    if (props.type == 2) data = state.systemData.filter(o => o.id !== 'systemApprovalContent');
    return data;
  });

  watch(
    () => props.value,
    newValue => {
      if (newValue != state.content) state.content = newValue;
    },
    { immediate: true, deep: true },
  );
  watch(
    () => props.pageParam,
    newValue => {
      getEditConfig(newValue);
    },
    { immediate: true, deep: true },
  );
  watch(
    () => state.content,
    _newValue => {
      emit('input', state.content);
    },
  );

  function handleNodeClick(_item, node) {
    const item = node.dataRef.id;
    if (node.dataRef?.children?.length > 0) return;
    const tableParent = getCurrentParentByTag('table[data-jnpf-table-tag="table"]');
    if (!tableParent) {
      if (item == 'jnpfDictionary') return openDictionaryModal(true, { node });
      unref(editor).insertContent(getSpanNode(item, node));
      state.content = unref(editor).getContent({ format: 'html' });
    }
  }
  function reload(item, node) {
    unref(editor).insertContent(getSpanNode('jnpfDictionary', node, item));
    state.content = unref(editor).getContent({ format: 'html' });
  }
  function getEditConfig(e) {
    if (!e) {
      e = {};
      e.mt = 0;
      e.mb = 0;
      e.ml = 0;
      e.mr = 0;
      e.width = 210;
      e.height = 297;
    }
    emit('pageParamChange', e);
    let mt = e.mt;
    let mb = e.mb;
    let ml = e.ml;
    let mr = e.mr;
    let width = e.width ? e.width : 210;
    let height = e.height ? e.height : 297;
    state.initConfig = {
      menubar: false,
      toolbar_sticky: true,
      statusbar: false,
      content_style: `html {
          background: #fff;
          padding: 20px 0;
          box-sizing: border-box;
          padding-bottom:20px;
        }
        body {
          font-family: simsun, serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          padding: 40px 30px;
          width: ${width}mm;
          height: ${height}mm;
          padding: ${mt}mm ${mr}mm ${mb}mm ${ml}mm !important;
          margin: 0 auto !important;
          background: white;
          min-height: 100%;
          box-sizing: border-box;
          box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
          word-break:break-all;
        }
        .jnpf-tiny-color--customer {
          color: #005AF3;
        }
        .jnpf-tiny-color--contacts {
          color: #1CB24C;
        }
        .jnpf-tiny-color--business {
          color: #FF852F;
        }
        .jnpf-tiny-color--contract {
          color: #FF4A43;
        }
        .jnpf-tiny-color--receivables {
          color: #FFAE46;
        }
        .jnpf-tiny-color--product {
          color: #00D0D4;
        }
        .jnpf-tiny-color--common {
          color: #2362FB;
        }
        p { margin: 5px 0; line-height: 1.5;}`,
      table_advtab: false,
      table_cell_advtab: false,
      table_row_advtab: false,
      setup: editor => {
        editor.ui.registry.addButton('page', {
          text: `<i class="icon-ym icon-ym-orderExample" style="font-size:18px"></i>`,
          tooltip: '纸张大小',
          onAction: function () {
            openPageSizeModal(true, { pageParam: props.pageParam });
          },
        });
        editor.on('init', function () {
          editor.setContent(state.content);
          nextTick(() => editor.execCommand('mceFocus'));
        });
        editor.on('keydown', e => {
          state.selectNodes = null;
          /* Backspace key and del key*/
          if (e.keyCode === 8 || e.keyCode == 46) {
            const currentNode = editor.selection.getNode();
            if (currentNode.getAttribute('data-jnpf-table-td-tag') === 'value') {
              e.preventDefault();
              return false;
            } else if (currentNode.nodeName == 'SPAN') {
              if (currentNode.hasAttribute('contenteditable')) {
                e.preventDefault();
                editor.dom.remove(currentNode);
                return false;
              } else {
                const span = getCurrentParentByTag('span[contenteditable]');
                if (span) {
                  e.preventDefault();
                  editor.dom.remove(span);
                  return false;
                }
              }
            }
          } else if (e.keyCode == '65' && (e.metaKey || e.ctrlKey)) {
            // 全选
            state.selectNodes = editor.selection.getNode();
            setSpanEditAttr(state.selectNodes, true);
          } else {
            // table 里面不允许写内容
            const currentNode = editor.selection.getNode();
            if (currentNode.getAttribute('data-jnpf-table-td-tag') === 'value') {
              // 只允许输入上下左右
              if (e.keyCode !== 37 && e.keyCode !== 38 && e.keyCode !== 39 && e.keyCode !== 40) {
                e.preventDefault();
                return false;
              }
            } else if (currentNode.nodeName == 'SPAN') {
              if (currentNode.hasAttribute('contenteditable')) {
                if (currentNode.getAttribute('contenteditable')) {
                  e.preventDefault();
                  currentNode.setAttribute('contenteditable', false);
                  return false;
                }
                return false;
              } else {
                const span = getCurrentParentByTag('span[contenteditable]');
                if (span) {
                  if (span.getAttribute('contenteditable')) {
                    e.preventDefault();
                    span.setAttribute('contenteditable', false);
                    return false;
                  }
                  return false;
                }
              }
            }
            if (e.keyCode == 37 && e.keyCode == 38 && e.keyCode == 39 && e.keyCode == 40) cancelSpanEdit();
          }
        });
        editor.on('mousedown', () => {
          cancelSpanEdit();
        });
        editor.on('input', () => {
          state.content = editor.getContent({ format: 'html' });
        });
        editor.on('paste', () => {
          state.content = editor.getContent({ format: 'html' });
        });
        editor.on('ExecCommand', () => {
          state.content = editor.getContent({ format: 'html' });
        });
        editor.on('mouseup', e => {
          const selection = unref(editor).selection?.getSel();
          if (e.target.hasAttribute('contenteditable') && selection.isCollapsed) {
            cancelSpanEdit();
          } else {
            if (!selection.isCollapsed) {
              state.selectNodes = editor.selection.getNode();
              setSpanEditAttr(state.selectNodes, true);
            } else {
              cancelSpanEdit();
            }
          }
        });
      },
    };
  }
  function cancelSpanEdit() {
    if (state.selectNodes) {
      setTimeout(() => {
        const selection = unref(editor).selection?.getSel();
        if (!selection.isCollapsed) {
          setSpanEditAttr(state.selectNodes, false);
          state.selectNodes = null;
        }
      }, 300);
    }
  }
  function setSpanEditAttr(node, canEdit) {
    if (node && node.hasAttribute('contenteditable')) {
      if (node.getAttribute('contenteditable') != canEdit) node.setAttribute('contenteditable', canEdit);
    }
    if (node && node.children) {
      for (let index = 0; index < node.children.length; index++) {
        const element = node.children[index];
        if (element.children) {
          setSpanEditAttr(element, canEdit);
        } else if (element.hasAttribute('contenteditable')) {
          if (node.getAttribute('contenteditable') != canEdit) element.setAttribute('contenteditable', canEdit);
        }
      }
    }
  }
  function getCurrentParentByTag(tag) {
    return unref(editor).dom.getParent(unref(editor).selection.getNode(), tag);
  }
  function getSpanNode(id, node, item?) {
    const parent = node?.parent?.node?.id || 'headTable';
    if (id == 'img' || id == 'barCode' || id == 'qrCode') return `&lt;${id} width='100' height='100'&gt;&lt;/${id}&gt;`;
    if (id == 'isAmountChinese') return `<p style="display:inline-block" data-tag='isAmountChinese'>大写金额(${parent})<p>`;
    if (id == 'thousands') return `<p style="display:inline-block" data-tag='thousands'>千位分隔符(${parent},2)<p>`;
    if (id == 'jnpfDictionary') return `<p style="display:inline-block" data-tag='jnpfDictionary'>数据字典(${parent},"${item}")<p>`;
    if (id == 'jnpfDate') return `<p style="display:inline-block" data-tag='jnpfDate'>日期选择(${parent},"yyyy-MM-dd")<p>`;
    return `<span data-tag="${parent}.${id}" class="jnpf-print-tag-span ${getSpanColorClass()}" contenteditable="false">{${id}}</span>`;
  }
  function getSpanColorClass() {
    const color = ['customer', 'contacts', 'business', 'contract', 'receivables', 'product'].includes(state.activeTab) ? state.activeTab : 'common';
    return `jnpf-tiny-color--${color}`;
  }
  function onDesignChange(val) {
    state.content = val;
  }
</script>
<style lang="less" scoped>
  .print-template-detail {
    height: 100%;
    display: flex;

    &__body {
      flex: 1;
      position: relative;
      display: flex;
      overflow: hidden;
    }
  }
  .system-view-nav {
    width: 300px;
    position: relative;
    background: @component-background;
    margin-right: 10px;
    border-radius: 4px;
    overflow: hidden;
    .left-scrollbar {
      height: 100%;
      :deep(.el-scrollbar__wrap) {
        overflow-x: hidden;
      }
    }
    .jnpf-common-title {
      padding: 0 10px;
      margin-bottom: 10px;
      height: 39px;
      border-bottom: 1px solid @border-color-base1;

      h2 {
        font-size: 14px;
        line-height: 39px;
        color: @primary-color;
        font-weight: bold;
      }
    }
  }
  .system-view-content {
    flex: 1;
    background: #fff;
    display: flex;
    flex-direction: column;
    overflow-x: auto;
    border-radius: 4px;
    :deep(.tox-tinymce) {
      border: none;
    }
  }
  .xr-reminder {
    :deep(.reminder-body) {
      align-items: stretch;
      width: 100%;
      height: 35px;
      line-height: 35px;
      border-radius: 0;
    }
  }
</style>
