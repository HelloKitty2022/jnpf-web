<template>
  <div class="jnpf-content-wrapper jnpf-content-wrapper-form">
    <iframe width="100%" height="100%" frameborder="0" scrolling="yes" :src="url"></iframe>
  </div>
</template>
<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useTabs } from '/@/hooks/web/useTabs';
  import { decodeByBase64 } from '/@/utils/cipher';

  defineOptions({ name: 'externalLink' });

  const route = useRoute();
  const { setTitle } = useTabs();
  const url = ref('');

  onMounted(() => {
    const { query } = route;
    if (!query.href) return;
    const href = decodeByBase64(query.href as string);
    url.value = href;
    if (query.name) setTitle(query.name as string);
  });
</script>
