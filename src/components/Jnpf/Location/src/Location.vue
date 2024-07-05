<template>
  <div :class="`${prefixCls}`">
    <a-button preIcon="icon-ym icon-ym-daka" @click="handleLocation()" v-if="!detailed">{{ innerValue.fullAddress ? '重新定位' : '添加定位' }}</a-button>
    <div class="location-card" v-if="innerValue.fullAddress" @click="handleClick()">
      <div class="location-card-info">
        <img class="location-card-static-map" :src="staticMapUrl" v-if="enableLocationScope" />
        <div class="location-card-address">{{ innerValue.fullAddress }}</div>
      </div>
      <CloseCircleFilled class="location-card-actions" @click.stop="handleClear()" v-if="!detailed && !disabled && allowClear" />
    </div>
  </div>
  <a-modal
    v-model:visible="visible"
    title="选择位置"
    :width="600"
    class="location-container-modal"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :maskClosable="false"
    destroyOnClose>
    <template #closeIcon>
      <ModalClose :canFullscreen="false" @cancel="handleCancel" />
    </template>
    <div class="location-contain">
      <a-input-search v-model:value="keyword" placeholder="搜索或直接在地图上点选" allowClear @search="onSearch" />
      <div class="map-contain">
        <div id="container" class="map"></div>
        <img class="map-marker" src="../../../../assets/images/mark.png" draggable="false" />
      </div>
      <ScrollContainer ref="infiniteBody" class="around-contain" v-loading="loading && listQuery.currentPage == 1">
        <a-form-item-rest>
          <a-radio-group v-model:value="selectValue" @change="onSelectValueChange">
            <a-radio class="around-contain-item" :value="index" v-for="(item, index) in list">
              <div class="around-item-title" :title="item.name"> {{ item.name }}</div>
              <div class="around-item-sub-title" :title="item.address.length ? item.address : item.name">
                {{ item.address.length ? item.address : item.name }}</div
              >
            </a-radio>
          </a-radio-group>
        </a-form-item-rest>
        <!-- 请选择允许微调范围内的地点 -->
        <jnpf-empty class="!mt-100px" v-if="!list.length && !loading" />
      </ScrollContainer>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, reactive, nextTick, toRefs, watch, computed } from 'vue';
  import { Modal as AModal } from 'ant-design-vue';
  import ModalClose from '/@/components/Modal/src/components/ModalClose.vue';
  import AMapLoader from '@amap/amap-jsapi-loader';
  import { ScrollContainer, ScrollActionType } from '/@/components/Container';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getAroundList, getTextList } from '/@/api/basic/common';
  import { CloseCircleFilled } from '@ant-design/icons-vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useDesign } from '/@/hooks/web/useDesign';

  defineOptions({ name: 'JnpfLocation', inheritAttrs: false });
  const defaultValue = {
    lat: '',
    lng: '',
    name: '',
    fullAddress: '',
  };

  interface State {
    visible: boolean;
    keyword: string;
    location: any;
    currentLocation: any;
    AMap: any;
    map: any;
    list: any[];
    loading: boolean;
    finish: boolean;
    listQuery: {
      currentPage: number;
      pageSize: number;
    };
    selectValue: number;
    innerValue: any;
    setCenterLoading: boolean;
    dragLoading: boolean;
  }

  const state = reactive<State>({
    visible: false,
    keyword: '',
    location: {
      lng: 116.404,
      lat: 39.915,
    },
    currentLocation: {},
    AMap: null,
    map: null,
    list: [],
    loading: false,
    finish: false,
    listQuery: {
      currentPage: 1,
      pageSize: 50,
    },
    selectValue: -1,
    innerValue: defaultValue,
    setCenterLoading: false,
    dragLoading: false,
  });
  const { visible, keyword, list, loading, listQuery, selectValue, innerValue } = toRefs(state);
  const props = defineProps({
    value: { type: String, default: '' },
    autoLocation: { type: Boolean, default: false },
    useAutoLocation: { type: Boolean, default: true },
    enableLocationScope: { type: Boolean, default: false },
    adjustmentScope: { type: Number, default: 500 },
    enableDesktopLocation: { type: Boolean, default: false },
    locationScope: { type: Array, default: [] },
    allowClear: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    detailed: { type: Boolean, default: false },
  });
  const { createMessage } = useMessage();
  const emit = defineEmits(['update:value', 'change']);
  const { prefixCls } = useDesign('location');
  const infiniteBody = ref<Nullable<ScrollActionType>>(null);
  const globSetting = useGlobSetting();

  (window as any)._AMapSecurityConfig = {
    securityJsCode: globSetting.aMapSecurityJsCode,
  };

  watch(
    () => props.value,
    val => {
      state.innerValue = val ? JSON.parse(val) : defaultValue;
    },
    { immediate: true },
  );

  const staticMapUrl = computed(() => {
    if (!props.enableLocationScope) return ' ';
    const location = state.innerValue.lng + ',' + state.innerValue.lat;
    const url = `${globSetting.apiUrl}/api/system/Location/staticmap?location=${location}&zoom=19&size=80*80&key=${globSetting.aMapWebKey}`;
    return url;
  });

  function handleLocation() {
    if (props.disabled) return;
    state.visible = true;
    state.selectValue = -1;
    state.list = [];
    state.keyword = '';
    nextTick(() => {
      initMap();
    });
  }
  async function initMap() {
    AMapLoader.load({
      key: globSetting.aMapJsKey,
      version: '2.0',
      plugins: ['AMap.PlaceSearch', 'AMap.Geolocation'],
    }).then(AMap => {
      state.AMap = AMap;
      const query: any = {
        viewMode: '3D',
        zoom: 16,
      };
      if (state.innerValue && state.innerValue.lng && state.innerValue.lat) {
        state.location = { lat: state.innerValue.lat, lng: state.innerValue.lng };
        query.center = [state.location.lng, state.location.lat];
      }
      state.map = new AMap.Map('container', query);
      //获取中心位置
      handleGetCenter();
      //查询附近地点
      getList();
      bindScroll();
      //添加可选区域圆形
      handleCircle();
      //添加微调区域圆形
      handleScopeCircle();
      //地图事件
      handleListener();
      //添加定位按钮
      state.map.addControl(new AMap.Geolocation());
    });
  }
  function handleCircle() {
    if (!props.enableDesktopLocation || !props.locationScope.length) return;
    for (let i = 0; i < props.locationScope.length; i++) {
      const o: any = props.locationScope[i];
      if (!o.lng || !o.lat || !o.radius) continue;
      addCircle({ ...o, fillColor: '#7ad98f' });
    }
  }
  function handleScopeCircle() {
    if (!props.enableLocationScope) return;
    state.currentLocation = state.location;
    addCircle({ ...state.location, radius: props.adjustmentScope || 500, fillColor: '#1791fc' });
  }
  function addCircle(o) {
    var circle = new state.AMap.Circle({
      center: [o.lng, o.lat],
      radius: o.radius,
      strokeOpacity: 0.2,
      fillOpacity: 0.4,
      fillColor: o.fillColor,
      bubble: false,
    });
    circle.on('click', handleCenter);
    state.map.add(circle);
  }
  function bindScroll() {
    const bodyRef = infiniteBody.value;
    const vBody = bodyRef?.getScrollWrap();
    vBody?.addEventListener('scroll', () => {
      if (vBody.scrollHeight - vBody.clientHeight - vBody.scrollTop <= 50 && !state.loading && !state.finish) {
        state.listQuery.currentPage += 1;
        getList();
      }
    });
  }
  function getList() {
    state.loading = true;
    const query = {
      key: globSetting.aMapWebKey,
      location: state.location.lng + ',' + state.location.lat,
      radius: -1,
      offset: state.listQuery.pageSize,
      page: state.listQuery.currentPage,
    };
    getAroundList(query).then(res => {
      handleResult(res.data);
    });
  }
  function handleGetCenter() {
    const { lat, lng } = state.map.getCenter();
    state.location = { lat, lng };
  }
  function handleListener() {
    state.map.on('moveend', handleMapChange);
    state.map.on('movestart', handleSetLoading);
    state.map.on('click', handleCenter);
  }
  function handleOffListener() {
    state.map.off('moveend', handleMapChange);
    state.map.off('movestart', handleSetLoading);
    state.map.off('click', handleCenter);
  }
  function handleCenter(e) {
    state.map.setCenter(e.lnglat);
  }
  function handleMapChange() {
    if (state.dragLoading) return (state.dragLoading = false);
    handleGetCenter();
    state.selectValue = -1;
    state.listQuery.currentPage = 1;
    state.list = [];
    if (props.enableLocationScope) {
      const discount = getDiscount(state.currentLocation.lat, state.currentLocation.lng, state.location.lat, state.location.lng) || 0;
      if (discount > (props.adjustmentScope || 500)) return createMessage.warning('超出微调范围');
    }
    getList();
  }
  function handleSetLoading() {
    if (state.setCenterLoading) state.dragLoading = true;
  }
  function onSelectValueChange() {
    state.setCenterLoading = true;
    nextTick(() => {
      const location = state.list[state.selectValue]?.location || '';
      const [lng, lat] = location.split(',');
      state.location = { lat, lng };
      state.map.setCenter([lng, lat]);
      setTimeout(() => {
        state.setCenterLoading = false;
      }, 500);
    });
  }
  function handleSearch() {
    state.loading = true;
    const query = {
      key: globSetting.aMapWebKey,
      keywords: state.keyword,
      radius: props.enableLocationScope ? props.adjustmentScope || 500 : -1,
      offset: state.listQuery.pageSize,
      page: state.listQuery.currentPage,
    };
    getTextList(query).then(res => {
      handleResult(res.data);
    });
  }
  function onSearch() {
    state.selectValue = -1;
    state.listQuery.currentPage = 1;
    state.list = [];
    state.keyword ? handleSearch() : getList();
  }
  function handleResult(res) {
    state.loading = false;
    if (res.status == '1') {
      if (res.pois.length < state.listQuery.pageSize) state.finish = true;
      state.list = [...state.list, ...res.pois];
    } else {
      createMessage.error(res.info || res.infocode);
    }
  }
  function handleSubmit() {
    if ((!state.selectValue && state.selectValue != 0) || state.selectValue == -1) return createMessage.error('请选择地址');
    const data = state.list[state.selectValue];
    const [lng, lat] = data.location.split(',');
    //判断微调范围
    if (props.enableLocationScope) {
      const discount = getDiscount(state.currentLocation.lat, state.currentLocation.lng, lat, lng) || 0;
      if (discount > (props.adjustmentScope || 500)) return createMessage.warning('超出微调范围');
    }
    //判断可选范围
    if (props.enableDesktopLocation && props.locationScope.length) {
      let list: any[] = [];
      for (let i = 0; i < props.locationScope.length; i++) {
        const o: any = props.locationScope[i];
        const discount = getDiscount(o.lat, o.lng, lat, lng) || 0;
        list.push(discount > o.radius);
      }
      if (list.every(o => o === true)) return createMessage.warning('超出规定范围');
    }
    const address = data.address && data.address.length ? data.address : '';
    //台湾、北京、上海、重庆、深圳地址特殊处理
    let fullAddress = data.pname + data.cityname + data.adname + address + data.name;
    if (data.pname == data.cityname) fullAddress = data.pname + data.adname + address + data.name;
    if (data.pname == data.cityname && data.pname == data.adname) fullAddress = data.pname + address + data.name;
    state.innerValue = {
      pName: data.pname,
      cName: data.cityname,
      adName: data.adname,
      address,
      name: data.name,
      lng,
      lat,
      fullAddress,
    };
    emit('update:value', JSON.stringify(state.innerValue));
    emit('change', JSON.stringify(state.innerValue));
    handleCancel();
  }
  function handleCancel() {
    state.visible = false;
    state.map && state.map.destroy();
    handleOffListener();
  }
  function handleClear() {
    state.innerValue = defaultValue;
    emit('update:value', '');
    emit('change', '');
  }
  function getDiscount(lat1, lng1, lat2, lng2) {
    const p1 = new state.AMap.LngLat(lng1, lat1);
    const p2 = new state.AMap.LngLat(lng2, lat2);
    return p1.distance(p2) || 0;
  }
  function handleClick() {
    if (props.detailed) return openAMap();
    if (props.disabled) return;
    if (props.enableLocationScope) return handleLocation();
  }
  function openAMap() {
    const position = state.innerValue.lng + ',' + state.innerValue.lat;
    const url = `http://uri.amap.com/marker?position=${position}&name=${state.innerValue.name}&coordinate=gaode&callnative=0`;
    window.open(url, '_blank');
  }
  /**
   *  自动定位
   */
  // function handleAutoLocation() {
  //   if (!props.autoLocation || state.innerValue.fullAddress || props.detailed || !props.useAutoLocation) return;
  //   AMapLoader.load({
  //     key: globSetting.aMapJsKey,
  //     version: '2.0',
  //     plugins: ['AMap.Geolocation', 'AMap.Geocoder'],
  //   }).then(AMap => {
  //     state.AMap = AMap;
  //     var geolocation = new AMap.Geolocation({
  //       enableHighAccuracy: true,
  //       timeout: 1500,
  //     });
  //     const getAddress = position => {
  //       var geocoder = new AMap.Geocoder();
  //       geocoder.getAddress(position, function (status, res) {
  //         if (status === 'complete' && res.info === 'OK') {
  //           const data = res.regeocode.addressComponent;
  //           state.innerValue = {
  //             pName: data.province,
  //             cName: data.city,
  //             adName: data.district,
  //             address: data.street + data.streetNumber,
  //             name: '',
  //             lng: position[0],
  //             lat: position[1],
  //             fullAddress: res.regeocode.formattedAddress,
  //           };
  //           emit('update:value', JSON.stringify(state.innerValue));
  //           emit('change', JSON.stringify(state.innerValue));
  //         }
  //       });
  //     };
  //     geolocation.getCityInfo((_status, res) => {
  //       if (res.status == 0) {
  //         if (props.enableDesktopLocation && props.locationScope.length) {
  //           let list: any[] = [];
  //           for (let i = 0; i < props.locationScope.length; i++) {
  //             const o: any = props.locationScope[i];
  //             const discount = getDiscount(o.lat, o.lng, res.position[1], res.position[0]) || 0;
  //             list.push(discount > o.radius);
  //           }
  //           if (list.every(o => o === true)) return;
  //         }
  //         getAddress(res.position);
  //       } else {
  //         console.error('定位失败');
  //       }
  //     });
  //   });
  // }

  // onMounted(() => {
  //   handleAutoLocation();
  // });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-location';

  .location-container-modal {
    .ant-modal-body {
      height: 62vh;
      overflow: hidden;

      .location-contain {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 20px 20px 0 20px;

        .map-contain {
          position: relative;
          .map {
            margin: 10px 0;
            width: 100%;
            height: 230px;
          }
          .map-marker {
            width: 19px;
            height: 32px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, calc(-50% - 9.5px));
          }
        }

        .around-contain {
          .ant-radio-group {
            width: 100%;
          }

          .around-contain-item {
            padding: 8px;
            border-bottom: 1px solid @border-color-base1;
            display: flex;
            height: 60px;
            line-height: 22px;
            align-items: center;
            width: 100%;
            .around-item-title {
              width: 512px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .around-item-sub-title {
              color: #b9babb;
              width: 512px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
    }
  }
  .@{prefix-cls} {
    .location-card {
      display: flex;
      align-items: center;
      margin-top: 8px;
      background: @app-main-background;
      padding: 12px;
      border-radius: 8px;
      justify-content: space-between;
      cursor: pointer;
      .location-card-info {
        flex: 1;
        display: flex;
        align-items: center;
        .location-card-static-map {
          width: 48px;
          height: 48px;
          margin-right: 4px;
          flex-shrink: 0;
        }
        .location-card-address {
          padding: 0 4px;
          word-break: normal;
          white-space: normal;
        }
      }
      .location-card-actions {
        color: rgb(135, 143, 149);
        cursor: pointer;
        flex-shrink: 0;
      }
    }
  }
</style>
