<template>
  <BasicModal v-bind="$attrs" @register="registerModal" defaultFullscreen :footer="null" :closable="false" :keyboard="false" class="jnpf-full-modal full-modal">
    <template #title>
      <div class="jnpf-full-modal-header">
        <div class="header-title">
          <img src="../../assets/images/jnpf.png" class="header-logo" />
          <p class="header-txt"> · 代码预览</p>
        </div>
        <a-space class="options" :size="10">
          <a-button @click="closeModal()">{{ t('common.cancelText') }}</a-button>
        </a-space>
      </div>
    </template>
    <div class="jnpf-content-wrapper">
      <div class="jnpf-content-wrapper-left">
        <BasicLeftTree :showSearch="false" ref="leftTreeRef" :fieldNames="{ title: 'fileName' }" :treeData="treeData" @select="handleTreeSelect" />
      </div>
      <div class="jnpf-content-wrapper-center">
        <div class="jnpf-content-wrapper-content bg-white">
          <MonacoEditor v-model="currentContent" :options="editorOptions" :language="editorLanguage" :key="key" />
        </div>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { codePreview } from '/@/api/onlineDev/visualDev';
  import { reactive, toRefs, nextTick, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicLeftTree, TreeActionType } from '/@/components/Tree';
  import { MonacoEditor } from '/@/components/CodeEditor';

  interface State {
    treeData: any[];
    currentId: string;
    currentContent: string;
    editorOptions: any;
    editorLanguage: string;
    key: number;
  }

  defineEmits(['register']);
  const { t } = useI18n();
  const leftTreeRef = ref<Nullable<TreeActionType>>(null);
  const [registerModal, { closeModal, changeLoading }] = useModalInner(init);
  const state = reactive<State>({
    treeData: [],
    currentId: '',
    currentContent: '',
    editorOptions: {
      readOnly: true,
      scrollBeyondLastLine: true,
      minimap: {
        enabled: true,
      },
    },
    editorLanguage: 'html',
    key: +new Date(),
  });
  const { treeData, currentContent, editorOptions, editorLanguage, key } = toRefs(state);

  function init(data) {
    state.key = +new Date();
    changeLoading(true);
    const tablesList = data.tables ? JSON.parse(data.tables) : [];
    let subClassName: string[] = [];
    let dataForm = { module: 'system', description: '', subClassName: '', className: '' };
    for (let i = 0; i < tablesList.length; i++) {
      let e = tablesList[i];
      if (e.typeId == '1') {
        dataForm.className = e.table;
        dataForm.description = e.table;
      } else {
        subClassName.push(e.table);
      }
    }
    dataForm.subClassName = subClassName.join();
    codePreview(data.id, dataForm).then(res => {
      state.treeData = res.data.list;
      state.currentId = state.treeData[0].children[0].id;
      state.currentContent = state.treeData[0].children[0].fileContent;
      state.editorLanguage = ['web', 'app'].includes(state.treeData[0].children[0].fileType) ? 'html' : 'java';
      nextTick(() => {
        const leftTree = unref(leftTreeRef);
        leftTree?.setSelectedKeys([state.currentId]);
        changeLoading(false);
      });
    });
  }
  function handleTreeSelect(id, node) {
    state.key = +new Date();
    state.currentId = id;
    state.currentContent = node.fileContent;
    state.editorLanguage = ['web', 'app'].includes(node.fileType) ? 'html' : 'java';
  }
</script>
