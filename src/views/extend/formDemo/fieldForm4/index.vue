<template>
  <div class="jnpf-content-wrapper jnpf-content-wrapper-form">
    <div class="jnpf-content-wrapper-form-body px-10px">
      <ScrollContainer>
        <div class="my-10px">
          <a-alert message="文本域、HTML编辑器" type="warning" :show-icon="false" />
        </div>
        <a-form :colon="false" :labelCol="{ style: { width: '110px' } }">
          <a-form-item label="文本域">
            <a-textarea v-model:value="dataForm.textarea" placeholder="文本域" :autoSize="{ minRows: 3, maxRows: 10 }" />
          </a-form-item>
          <a-form-item label="HTML编辑器">
            <jnpf-editor v-model:value="dataForm.editor" />
          </a-form-item>
        </a-form>
      </ScrollContainer>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, toRefs } from 'vue';
  import { ScrollContainer } from '/@/components/Container';

  defineOptions({ name: 'extend-formDemo-verifyForm4' });

  const state = reactive({
    dataForm: {
      textarea: '',
      editor: '',
    },
  });
  const { dataForm } = toRefs(state);
</script>
