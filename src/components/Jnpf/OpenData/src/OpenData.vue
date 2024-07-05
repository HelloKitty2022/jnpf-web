<template>
  <Input :value="value" placeholder="系统自动生成" readonly :disabled="disabled" v-if="!detailed" />
  <p class="m-0" v-else>{{ value || '' }}</p>
</template>

<script lang="ts" setup>
  import { Input } from 'ant-design-vue';
  import { computed, ref, unref, onMounted, watch } from 'vue';
  import { openDataProps } from './props';
  import { useUserStore } from '/@/store/modules/user';
  import dayjs from 'dayjs';

  defineOptions({ name: 'JnpfOpenData', inheritAttrs: false });
  const props = defineProps(openDataProps);
  const innerValue = ref('');
  const userStore = useUserStore();
  const getUserInfo = computed(() => userStore.getUserInfo || {});

  watch(
    () => props.showLevel,
    () => {
      setValue();
    },
  );

  function setValue() {
    if (props.type === 'currUser') {
      innerValue.value =
        unref(getUserInfo).userName && unref(getUserInfo).userAccount ? unref(getUserInfo).userName + '/' + unref(getUserInfo).userAccount : '';
    }
    if (props.type === 'currTime') {
      innerValue.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
    }
    if (props.type === 'currOrganize') {
      innerValue.value = props.showLevel === 'last' ? (unref(getUserInfo).departmentName as string) : (unref(getUserInfo).organizeName as string);
    }
    if (props.type === 'currPosition') {
      innerValue.value = unref(getUserInfo).positionName;
    }
  }

  onMounted(() => {
    setValue();
  });
</script>
