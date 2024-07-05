<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="批量新增" showOkBtn @ok="handleSubmit">
    <a-form layout="vertical">
      <div class="json-demo">
        <pre>
          // 示例
          [
            {
              "fullName":"名称",
              "enCode":"fullName",
              "bindTable":"table1", //数据库表名
              "fieldRule":1, //字段规则 0:主表规则  1:副表规则  2:子表规则
              "childTableKey":"tableField107" //关联字段,fieldRule为子表规则才需要输入
            }
          ]
        </pre>
      </div>
      <a-form-item label="字段Json" name="columnJson">
        <div class="formCodeEditor">
          <MonacoEditor class="h-full" ref="editorRef" v-model="state.columnJson" language="json" />
        </div>
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { batchCreate } from '/@/api/system/columnAuthorize';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { MonacoEditor } from '/@/components/CodeEditor';

  interface State {
    columnJson: string;
    dataForm: any;
  }

  const state = reactive<State>({
    columnJson: '',
    dataForm: {
      moduleId: '',
      columnJson: '',
    },
  });
  const emit = defineEmits(['register', 'reload']);
  const { createMessage } = useMessage();
  const [registerModal, { closeModal, changeOkLoading }] = useModalInner(init);

  function init(data) {
    state.columnJson = '';
    state.dataForm.columnJson = '';
    state.dataForm.moduleId = data.moduleId;
  }
  async function handleSubmit() {
    if (!state.columnJson) return createMessage.warning('请输入字段JSON');
    let columnJson = state.columnJson.replace(/("\w+":)(?=[},])/g, '$1null');
    state.dataForm.columnJson = JSON.parse(columnJson);
    changeOkLoading(true);
    batchCreate(state.dataForm)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        closeModal();
        emit('reload');
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
</script>
<style lang="less" scoped>
  .formCodeEditor {
    width: 100%;
    height: 260px;
    margin: 0 0 20px;
    padding: 0;
    border: 1px solid #c0c4cc;
    overflow: hidden;
  }
  .json-demo {
    width: 100%;
    background: #f4f4f5;
    border-radius: 4px;
    color: #909399;
    padding-top: 10px;
    pre {
      margin-left: -55px;
      font-size: 12px;
    }
  }
</style>
