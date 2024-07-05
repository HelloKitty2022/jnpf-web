<template>
  <section class="common-pane">
    <ScrollContainer class="config-content">
      <a-alert message="定时器将根据设置的延迟时间流转审批" type="warning" showIcon class="!mb-10px" />
      <a-form :colon="false" layout="vertical" :model="formConf" class="config-form">
        <a-form-item label="延迟时间">
          <a-input-number v-model:value="formConf.day" :min="0" :precision="0" addon-after="天" class="mb-10px" placeholder="请输入" />
          <a-input-number v-model:value="formConf.hour" :min="0" :precision="0" addon-after="小时" class="mb-10px" placeholder="请输入" />
          <a-input-number v-model:value="formConf.minute" :min="0" :precision="0" addon-after="分钟" class="mb-10px" placeholder="请输入" />
          <a-input-number v-model:value="formConf.second" :min="0" :precision="0" addon-after="秒" placeholder="请输入" />
        </a-form-item>
      </a-form>
    </ScrollContainer>
  </section>
</template>
<script lang="ts" setup>
  import { ScrollContainer } from '/@/components/Container';

  const props = defineProps(['formConf']);
  defineOptions({ name: 'timerNode', inheritAttrs: false });
  defineExpose({ getContent });

  function getContent() {
    let content = '';
    const { day, hour, minute, second } = props.formConf;
    if (!day && !hour && !minute && !second) {
      content = '请设置时间';
    } else {
      content = `将于${day ? day + '天' : ''}${hour ? hour + '小时' : ''}${minute ? minute + '分钟' : ''}${second ? second + '秒' : ''}后流转`;
    }
    return content;
  }
</script>
