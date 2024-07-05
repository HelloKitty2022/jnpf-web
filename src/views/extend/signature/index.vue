<template>
  <div class="tem-container h-full">
    <a-button @click="handlePrint" class="signs print">打印</a-button>
    <div ref="printRef" class="tem_list">
      <h1>引迈信息技术有限公司</h1>
      <h2>报 价 单</h2>
      <h4>TO：</h4>
      <p class="title"> 感谢惠顾，现将贵公司所需配件报价如下：</p>
      <p class="lip">一、产品价格</p>
      <div class="table-box">
        <a-table :data-source="tableData" :columns="columns" size="small" :pagination="false" bordered />
      </div>
      <div class="sigbut">
        <div class="tip">请在这里输入你的签名</div>
        <div class="left-bu">
          <a-button class="clear-bu" @click="handleReset">清空</a-button>
          <a-button class="sure" @click="handleSubmit" :disabled="!showSig">确定签名 </a-button>
        </div>
      </div>
      <div class="online-sig">
        <vue-esign
          ref="esignRef"
          :height="150"
          :width="800"
          :lineWidth="lineWidth"
          :isCrop="isCrop"
          :lineColor="lineColor"
          :bgColor.sync="bgColor"
          v-if="showSig" />
        <img :src="resultImg" alt="" v-if="!showSig" class="sig-img" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, ref, unref } from 'vue';
  import printStyle from '../printData/components/printStyle';
  import vueEsign from '/@/components/Jnpf/Sign/src/esign.vue';
  import { useMessage } from '/@/hooks/web/useMessage';

  defineOptions({ name: 'extend-signature' });

  const state = reactive({
    lineWidth: 6,
    lineColor: '#000000',
    bgColor: '',
    resultImg: '',
    isCrop: false,
    showSig: true,
    tableData: [
      {
        order: '1',
        name: '服务器硬件',
        standards: '联想',
        num: '5',
        unit: '台',
        unitprice: '20000.00',
        total: '100000.00',
        remarks: '',
      },
      {
        order: '2',
        name: '数据库正版',
        standards: 'SQLServer',
        num: '5',
        unit: '套',
        unitprice: '9998.00',
        total: '49990.00',
        remarks: '',
      },
      {
        order: '3',
        name: 'OA内部管理系统',
        standards: '定制',
        num: '5',
        unit: '套',
        unitprice: '	390000.00',
        total: '	390000.00',
        remarks: '',
      },
      {
        order: '4',
        name: '进销存管理系统',
        standards: '定制',
        num: '5',
        unit: '套',
        unitprice: '260000.00',
        total: '260000.00',
        remarks: '',
      },
      {
        order: '5',
        name: '	服务费',
        standards: '',
        num: '5',
        unit: '年',
        unitprice: '80000.00',
        total: '80000.00',
        remarks: '',
      },
      {
        order: '6',
        name: '差旅费用',
        standards: '',
        num: '5',
        unit: '年',
        unitprice: '60000.00',
        total: '80000.00',
        remarks: '',
      },
    ],
  });
  const printRef = ref();
  const esignRef = ref();
  const { createMessage } = useMessage();
  const { tableData, isCrop, lineWidth, lineColor, bgColor, showSig, resultImg } = toRefs(state);
  const columns = [
    { title: '序号', align: 'center', customRender: ({ index }) => index + 1, width: 50 },
    { title: '品名', dataIndex: 'name', key: 'name', width: 150 },
    { title: '规格', dataIndex: 'standards', key: 'standards', width: 100 },
    { title: '数量', dataIndex: 'num', key: 'num', width: 60 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
    { title: '单价', dataIndex: 'unitprice', key: 'unitprice', width: 60 },
    { title: '金额', dataIndex: 'total', key: 'total', width: 60 },
    { title: '备注', dataIndex: 'remarks', key: 'remarks', width: 100 },
  ];

  function handlePrint() {
    const print = printRef.value.innerHTML + printStyle;
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
  function getESign() {
    const esign = unref(esignRef);
    if (!esign) return null;
    return esign;
  }
  function handleReset() {
    state.resultImg = '';
    state.showSig = true;
    (getESign() as unknown as Recordable)?.reset();
  }
  function handleSubmit() {
    (getESign() as unknown as Recordable)
      .generate()
      .then(res => {
        state.showSig = false;
        state.resultImg = res;
      })
      .catch(() => {
        createMessage.warning('请签名');
      });
  }
</script>
<style lang="less" scoped>
  .tem-container {
    background: @app-main-background;
    overflow: auto;
    position: relative;
    padding: 0;
    .signs {
      position: absolute;
      right: 10px;
      top: 70px;
      &.print {
        top: 20px;
      }
    }
    .tem_list {
      width: 800px;
      margin: 0 auto;
      background: @component-background;
      color: @text-color-label;
      position: relative;
      padding: 0 40px 15px;
      font-size: 12px;
    }

    h1 {
      padding-top: 36px;
      font-size: 24px;
    }
    h2 {
      font-size: 18px;
    }
    h1,
    h2 {
      text-align: center;
      color: @text-color-label;
      font-weight: 700;
    }
    .title {
      border-bottom: 2px dashed #000;
      padding-left: 30px;
      line-height: 30px;
      font-size: 12px;
    }
    .lip {
      padding: 20px 0;
    }
    .table-box {
      padding: 0 1px 0 0;
    }
    .demo-form-inline {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    }
    .temdate {
      text-align: right;
      margin: 20px 60px;
    }
    .seal {
      text-align: right;
      margin: 10px 120px;
      padding-bottom: 40px;
    }
    .sigbut {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: @text-color-label;
      padding: 8px;
      border: 1px solid @border-color-base1;
      border-top: 0;
      .left-bu {
        display: flex;
        align-items: center;
        .clear-bu,
        .sure {
          margin-left: 5px;
        }
      }
    }
    .online-sig {
      border: 1px solid @border-color-base1;
      border-top: 0;
      height: 150px;
      padding-top: 10px;
    }
  }
</style>
