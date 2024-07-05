<template>
  <div class="jnpf-content-wrapper bg-white jnpf-extend-print-data">
    <div class="jnpf-content-wrapper-center">
      <a-button @click="handlePrint()" class="prtBtn">
        <i class="icon-ym icon-ym-report-icon-preview-print"></i>
        打印
      </a-button>
      <a-tabs v-model:activeKey="activeKey" type="card" class="jnpf-content-wrapper-tabs" destroyInactiveTabPane>
        <a-tab-pane key="1" tab="报价单子"> <offer ref="offer"></offer></a-tab-pane>
        <a-tab-pane key="2" tab="水电费用"><bill ref="bill"></bill></a-tab-pane>
        <a-tab-pane key="3" tab="员工档案"><record ref="record"></record></a-tab-pane>
        <a-tab-pane key="4" tab="入库通知"><storage ref="storage"></storage></a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import Offer from './components/Offer.vue';
  import Bill from './components/Bill.vue';
  import Record from './components/Record.vue';
  import Storage from './components/Storage.vue';
  import printStyle from './components/printStyle';

  defineOptions({ name: 'extend-printData' });

  const activeKey = ref('1');
  const offer = ref();
  const bill = ref();
  const record = ref();
  const storage = ref();

  function getRef() {
    if (activeKey.value === '1') return offer.value;
    if (activeKey.value === '2') return bill.value;
    if (activeKey.value === '3') return record.value;
    if (activeKey.value === '4') return storage.value;
  }
  function handlePrint() {
    let print = getRef().printRef.innerHTML + printStyle;
    const iframe: any = document.createElement('IFRAME');
    iframe.setAttribute('style', 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;');
    document.body.appendChild(iframe);
    let doc = iframe.contentWindow.document;
    iframe.onload = function () {
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    };
    doc.write(print);
    doc.close();
  }
</script>
<style lang="less" scoped>
  .prtBtn {
    position: absolute;
    right: 20px;
    top: 3px;
    z-index: 1;
  }
</style>
