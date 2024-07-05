<template>
  <div id="container" :style="{ height, width }"></div>
</template>
<script lang="ts">
  import { defineComponent, onMounted } from 'vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import AMapLoader from '@amap/amap-jsapi-loader';

  export default defineComponent({
    name: 'extend-map',
    props: {
      width: {
        type: String,
        default: '100%',
      },
      height: {
        type: String,
        default: '100%',
      },
    },
    setup() {
      const globSetting = useGlobSetting();

      async function initMap() {
        AMapLoader.load({
          key: globSetting.aMapJsKey,
          version: '2.0',
        }).then(AMap => {
          const query: any = {
            viewMode: '3D',
            zoom: 11,
            center: [116.397428, 39.90923],
          };
          new AMap.Map('container', query);
        });
      }

      onMounted(() => {
        initMap();
      });
    },
  });
</script>
