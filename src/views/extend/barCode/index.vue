<template>
  <div class="jnpf-content-wrapper bg-white jnpf-extend-barCode">
    <div class="jnpf-content-wrapper-center">
      <a-tabs v-model:activeKey="activeKey" type="card" class="jnpf-content-wrapper-tabs" destroyInactiveTabPane>
        <a-tab-pane key="1" tab="生成二维码">
          <a-row class="mt-20px">
            <a-col :span="16">
              <a-form :colon="false" :labelCol="{ style: { width: '100px' } }">
                <a-form-item label="二维码内容">
                  <a-input v-model:value="qrcode" placeholder="输入要生成二维码的字符串">
                    <template #addonAfter>
                      <span class="cursor-pointer" @click="getQrcode">生成</span>
                    </template>
                  </a-input>
                </a-form-item>
                <a-form-item label="二维码图像">
                  <canvas id="qrcode" ref="qrCodeRef"></canvas>
                  <p class="tips">使用微信扫一扫</p>
                </a-form-item>
              </a-form>
            </a-col>
          </a-row>
        </a-tab-pane>
        <a-tab-pane key="2" tab="生成条形码">
          <a-row class="mt-20px">
            <a-col :span="16">
              <a-form :colon="false" :labelCol="{ style: { width: '100px' } }">
                <a-form-item label="条形码内容">
                  <a-input v-model:value="barcode" placeholder="输入要生成条形码的字符串">
                    <template #addonAfter>
                      <span class="cursor-pointer" @click="getBarcode">生成</span>
                    </template>
                  </a-input>
                </a-form-item>
                <a-form-item label="条形码图像">
                  <canvas id="barcode"></canvas>
                  <p class="tips">使用微信扫一扫</p>
                </a-form-item>
              </a-form>
            </a-col>
          </a-row>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, ref } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import JsBarcode from 'jsbarcode';
  import { toCanvas } from 'qrcode';

  defineOptions({ name: 'extend-barCode' });

  const state = reactive({
    activeKey: '1',
    barcode: '',
    qrcode: '',
  });
  const { activeKey, barcode, qrcode } = toRefs(state);
  const qrCodeRef = ref();
  const { createMessage } = useMessage();

  function getQrcode() {
    if (!state.qrcode) return createMessage.error('请输入二维码内容');
    toCanvas(qrCodeRef.value, state.qrcode, {
      margin: 0,
      width: 265,
    });
  }
  function getBarcode() {
    let reg = /^[A-Za-z0-9]+$/;
    if (!reg.test(state.barcode)) return createMessage.error('请输入数字或者英文字母');
    JsBarcode('#barcode', state.barcode, {
      width: 4,
      height: 80,
      displayValue: false,
    });
  }
</script>
<style lang="less" scoped>
  #qrcode {
    width: 265px;
    height: 265px;
    border: 1px solid @border-color-base1;
  }
  #barcode {
    width: 265px;
    height: 80px;
    border: 1px solid @border-color-base1;
  }
  .tips {
    padding: 8px 0;
    color: @text-color-label;
  }
</style>
