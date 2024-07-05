<template>
  <a-form-item label="上传提示">
    <a-input v-model:value="activeData.tipText" placeholder="请输入" />
  </a-form-item>
  <a-form-item label="文件大小">
    <a-input-number v-model:value="activeData.fileSize" placeholder="请输入" :min="1" :precision="0">
      <template #addonAfter>
        <a-select v-model:value="activeData.sizeUnit" style="width: 66px">
          <a-select-option value="KB">KB</a-select-option>
          <a-select-option value="MB">MB</a-select-option>
        </a-select>
      </template>
    </a-input-number>
  </a-form-item>
  <a-form-item label="最大上传数">
    <a-input-number v-model:value="activeData.limit" placeholder="请输入" :min="1" :precision="0" />
  </a-form-item>
  <a-form-item label="上传路径">
    <jnpf-radio v-model:value="activeData.pathType" :options="pathTypeOptions" optionType="button" button-style="solid" class="right-radio" />
  </a-form-item>
  <template v-if="activeData.pathType === 'selfPath'">
    <a-form-item label="分用户存储">
      <jnpf-switch v-model:value="activeData.isAccount" />
    </a-form-item>
    <a-form-item>
      <template #label
        >文件夹名
        <BasicHelp
          :text="[
            '以字母、数字开头；',
            '只能输入字母、数字、下划线(_)、连字符(-)、斜杠(/)；',
            '上下级文件夹名之间用/隔开，不能以/结尾；',
            '合法的文件夹名如：Soft-1 或 Soft/1_test。',
          ]"
      /></template>
      <a-input v-model:value="activeData.folder" placeholder="请输入" :maxlength="100" />
    </a-form-item>
  </template>
</template>
<script lang="ts" setup>
  defineOptions({ inheritAttrs: false });
  defineProps(['activeData']);

  const pathTypeOptions = [
    { id: 'defaultPath', fullName: '默认路径' },
    { id: 'selfPath', fullName: '自定义路径' },
  ];
</script>
