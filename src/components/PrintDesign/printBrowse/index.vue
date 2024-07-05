<template>
  <BasicModal v-bind="$attrs" @register="registerModal" defaultFullscreen :footer="null" :closable="false" :keyboard="false" class="jnpf-full-modal full-modal">
    <template #title>
      <div class="jnpf-full-modal-header">
        <div class="header-title">
          <img src="../../../assets/images/jnpf.png" class="header-logo" />
          <p class="header-txt"> · 打印预览</p>
        </div>
        <div class="header-page" v-if="isBatchPrint">
          <a-button @click="pre" :disabled="loading">上一页</a-button>
          <a-input-number
            class="!w-60px text-center"
            v-model:value="pageIndex"
            :min="1"
            :max="batchData.length || 1"
            :controls="false"
            :disabled="loading"
            @change="scrollToPage"
            @blur="scrollToPage" />
          <span class="page-size">/ {{ batchData.length }}</span>
          <a-button @click="next" :disabled="loading">下一页</a-button>
        </div>
        <a-space class="options" :size="10">
          <a-button type="primary" @click="handleDownload" :disabled="loading">下 载</a-button>
          <a-button type="primary" @click="handlePrint" :disabled="loading">打 印</a-button>
          <a-button @click="closeModal()">{{ t('common.cancelText') }}</a-button>
        </a-space>
      </div>
    </template>
    <div class="basic-content" ref="tsPrint">
      <div class="print-content" v-html="item" v-for="(item, index) in batchData" :key="index" />
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, nextTick, ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getData, getBatchData, createPrintLog } from '/@/api/system/printDev';
  import { useGlobSetting } from '/@/hooks/setting';
  import { buildBitUUID } from '/@/utils/uuid';
  import JsBarcode from 'jsbarcode';
  import { toDataURL } from 'qrcode';
  import { useUserStore } from '/@/store/modules/user';
  import { getAmountChinese } from '/@/utils/jnpf';
  import dayjs from 'dayjs';
  import { useBaseStore } from '/@/store/modules/base';
  import { getDateFormat } from '/@/utils/jnpf';

  interface State {
    data: any;
    printTemplate: string;
    recordList: any[];
    fullName: string;
    id: string;
    pageIndex: number;
    batchData: any[];
    isBatchPrint: boolean;
    qrList: any[];
    barList: any[];
    loading: boolean;
  }

  const state = reactive<State>({
    data: {},
    printTemplate: '',
    recordList: [],
    fullName: '',
    id: '',
    pageIndex: 1,
    batchData: [],
    isBatchPrint: false,
    qrList: [],
    barList: [],
    loading: false,
  });
  const { pageIndex, batchData, isBatchPrint, loading } = toRefs(state);
  const tsPrint = ref();
  const { t } = useI18n();
  const globSetting = useGlobSetting();
  const apiUrl = ref(globSetting.apiUrl);
  const userStore = useUserStore();
  const baseStore = useBaseStore();
  const getUserInfo = computed(() => userStore.getUserInfo || {});
  const [registerModal, { closeModal, changeLoading }] = useModalInner(init);

  async function init(data) {
    if (!data.id) return;
    await baseStore.getDictionaryAll();
    //初始化数据
    state.printTemplate = '';
    state.pageIndex = 1;
    state.data = {};
    state.fullName = data.fullName || '';
    state.id = data.id || '';
    state.isBatchPrint = data.batchIds ? true : false;
    state.batchData = [];
    //获取打印数据
    let query = { id: data.id, formId: state.isBatchPrint ? data.batchIds : data.formId };
    changeLoading(true);
    state.loading = true;
    const method = state.isBatchPrint ? getBatchData : getData;
    method(query).then(res => {
      state.loading = false;
      if (!res.data) return changeLoading(false);
      changeLoading(false);
      let list = state.isBatchPrint ? res.data : [res.data];
      for (let i = 0; i < list.length; i++) {
        state.batchData.push(list[i].printTemplate);
      }
      nextTick(async () => {
        for (let i = 0; i < list.length; i++) {
          const element = list[i];
          let dom = tsPrint.value.querySelectorAll('.print-content')[i];
          if (!element.printData) state.batchData[i] = dom.innerHTML.replace(/\{(.*?)\}/g, '');
          await handleData(element, dom);
          state.batchData[i] = state.printTemplate;
          setTimeout(() => {
            replaceQr();
            replaceBar();
          }, 100);
        }
      });
    });
  }
  async function handleData(data, dom) {
    state.data = data.printData || {};
    state.recordList = data.operatorRecordList || [];
    state.printTemplate = dom.innerHTML;
    replaceSysValue();
    replaceTable(dom, false);
    replaceTable(dom, true);
    handleReplaceValue(dom, 'p');
    replaceCommonValue();
    replaceOther();
    nextTick(() => collapseBorder());
    const pageBreak = '<p style="page-break-after:always;"></p>';
    state.printTemplate = state.printTemplate.replace('<p><!-- pagebreak --></p>', pageBreak);
  }
  // 当table是100%,且外层是td时合并border
  function collapseBorder() {
    let strList: any[] = state.printTemplate.match(/<td.*>\n<table style="border-collapse: collapse; width: 100%; height: 100%;"/g) || [];
    for (let i = 0; i < strList.length; i++) {
      const item = strList[i];
      let newStr = item.substring(0, item.length - 1) + ' border-style:hidden;"';
      replaceValue(item, newStr);
    }
  }
  function handleReplaceValue(dom, tag) {
    const getValueFun = tag == 'td' ? getTdValue : getValue;
    let dataList = dom.getElementsByTagName(tag);
    for (let i = 0; i < dataList.length; i++) {
      const element = dataList[i];
      const elementText = element.outerHTML;
      if (elementText.includes('{') && elementText.includes('data-tag')) {
        // 千位分隔符
        if (elementText.includes('千位分隔符(')) {
          let text = elementText.match(/千位分隔符\(\<span[^>]+"[^<]+\>[^)]+\)/)[0];
          let place = text.includes(`</span>,`) ? text.split('</span>,')[1].replace(')', '') || 0 : 0;
          let value = getValueFun(tag == 'td' ? elementText : text);
          replaceValue(text, getThousands(value, place));
          continue;
        }
        // 大写金额
        if (elementText.includes('大写金额(')) {
          let text = elementText.match(/大写金额\(\<span[^>]+"[^<]+\>[^)]+\)/)[0];
          let value = getValueFun(tag == 'td' ? elementText : text);
          replaceValue(text, getAmountChinese(value));
          continue;
        }
        // 数据字典
        if (elementText.includes('数据字典(')) {
          let text = elementText.match(/数据字典\(\<span[^>]+"[^<]+\>[^)]+\)/)[0];
          let value = getValueFun(tag == 'td' ? elementText : text);
          let id = text.includes(`</span>,`) ? text.split('</span>,')[1].replace(')', '') || '' : '';
          id = id.replaceAll('"', '').replaceAll("'", '');
          replaceValue(text, getDictionaryValue(value, id));
          continue;
        }
        // 日期
        if (elementText.includes('日期选择(')) {
          let text = elementText.match(/日期选择\(\<span[^>]+"[^<]+\>[^)]+\)/)[0];
          let value = getValueFun(tag == 'td' ? elementText : text);
          let format = text.includes(`</span>,`) ? text.split('</span>,')[1].replace(')', '') || '' : '';
          format = format.replaceAll('"', '').replaceAll("'", '');
          replaceValue(text, getDateValue(value, format));
          continue;
        }
        // 替换图片
        if (elementText.includes('&lt;img')) {
          let value = getValueFun(elementText);
          if (!value) {
            let cloneNode = element.cloneNode(true);
            const height = getWidthHeight(element.innerHTML, 'height');
            cloneNode.height = height;
            const beginDom = cloneNode.innerHTML.substring(0, cloneNode.innerHTML.indexOf('&lt;img'));
            const endDom = cloneNode.innerHTML.substring(cloneNode.innerHTML.indexOf('&lt;/img&gt;') + 12, cloneNode.innerHTML.length);
            cloneNode.innerText = beginDom + endDom;
            replaceValue(elementText, cloneNode.outerHTML);
            continue;
          }
          replaceImage(element, value || '[]');
          continue;
        }
        // 替换二维码
        if (elementText.includes('&lt;qrCode')) {
          let value = getValueFun(elementText);
          if (!value) continue;
          if (value.trim() == '') {
            let cloneNode = element.cloneNode(true);
            cloneNode.innerText = '';
            replaceValue(elementText, cloneNode.outerHTML);
            continue;
          }
          replaceQrCode(element, value);
          continue;
        }
        // 替换条码
        if (elementText.includes('&lt;barCode')) {
          let value = getValueFun(elementText);
          if (!value) continue;
          if (value.trim() == '') {
            replaceValue(elementText, '');
            continue;
          }
          replaceBarCode(element, value);
          continue;
        }
        // 替换普通值;
        if (tag == 'td') {
          let value = getValueFun(elementText);
          let spanText = elementText.match(/<span class="jnpf-print-tag-span.*?[^}]}.*?<\/span>/);
          if (spanText) spanText = spanText[0];
          let fieldStr = spanText.match(/{.*}/g);
          let newVal = spanText.replace(fieldStr[0], value);
          replaceValue(spanText, newVal);
        }
      } else {
        //千位分隔符
        if (elementText.includes('千位分隔符(')) {
          let data = elementText.match(/千位分隔符\((.*?)\)/);
          if (!data || isNaN(Number(data))) continue;
          let arr = data && data[1].split(',');
          let value = arr[0] ? arr[0] : '';
          if (isNaN(Number(value))) continue;
          let place = arr[1] ? arr[1] : 0;
          replaceValue(data, getThousands(value, place));
          continue;
        }
        //大写金额
        if (elementText.includes('大写金额(')) {
          let arr = elementText.match(/大写金额\((.*?)\)/);
          let text = arr[0] || '';
          let value = arr[1] || '';
          if (!value || isNaN(Number(value))) continue;
          replaceValue(text, getAmountChinese(value));
          continue;
        }
        // 二维码
        if (elementText.includes('&lt;qrCode')) {
          let value = elementText.match(/&gt;(.*)&lt;/)[1];
          replaceQrCode(element, value);
          continue;
        }
        // 替换条码
        if (elementText.includes('&lt;barCode')) {
          let value = elementText.match(/&gt;(.*)&lt;/)[1];
          replaceBarCode(element, value);
          continue;
        }
        // 替换图片
        if (elementText.includes('&lt;img')) {
          let value = elementText.match(/&gt;(http.*)&lt;/)[1];
          replaceImage(element, JSON.stringify([{ url: value }]));
        }
      }
    }
  }
  // 替换普通值
  function replaceCommonValue() {
    const list: any[] = state.printTemplate.match(/<span class="jnpf-print-tag-span.*?[^}]}.*?<\/span>/g) || [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].includes('{') && list[i].includes('data-tag')) {
        let value = getValue(list[i]);
        let spanText = list[i].match(/<span class="jnpf-print-tag-span.*?[^}]}.*?<\/span>/);
        if (spanText?.length) {
          spanText = spanText[0];
          let fieldStr = spanText.match(/{.*}/g);
          let newStr = spanText.replace(fieldStr[0], value);
          replaceValue(spanText, newStr);
        }
      }
    }
  }
  function replaceOther() {
    const list: any[] = state.printTemplate.match(/大写金额\((.*?)\)/g) || [];
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      let value = element.match(/大写金额\((.*?)\)/)[1];
      if (isNaN(Number(value))) continue;
      replaceValue(element, getAmountChinese(value));
    }
    const list_: any[] = state.printTemplate.match(/千位分隔符\((.*?)\)/g) || [];
    for (let i = 0; i < list_.length; i++) {
      const element = list_[i];
      let data = element.match(/千位分隔符\((.*?)\)/);
      let arr = data && data[1].split(',');
      let value = arr[0] ? arr[0] : '';
      if (isNaN(Number(value))) continue;
      let place = arr[1] ? arr[1] : 0;
      replaceValue(element, getThousands(value, place));
    }
  }
  function replaceTable(dom, jump) {
    let list = dom.querySelectorAll('table');
    for (let i = 0; i < list.length; i++) {
      let table = list[i];
      let tdMode = table.parentElement.tagName === 'TD';
      if ((tdMode && jump == false) || jump) {
        let tableWrap = document.createElement('table');
        let tableHead = tableWrap.appendChild(document.createElement('thead'));
        let tableBody = tableWrap.appendChild(document.createElement('tbody'));
        let tableKey = getTableKey(table);
        let data = state.data[tableKey] || '';
        if (data && Array.isArray(data)) {
          let tableSize = data && Array.isArray(data) ? data.length : 0;
          let cloneTable = table.cloneNode(true);
          const tableHeadTrs = cloneTable.querySelector('thead')?.querySelectorAll('tr') || [];
          for (const tr of tableHeadTrs) {
            tableHead.appendChild(tr);
          }
          for (let index = 0; index < tableSize; index++) {
            createTr(table, tableKey, index, index == 0 ? false : true, tableBody);
          }
        } else {
          let cloneTable = table.cloneNode(true);
          const tableHeadTrs = cloneTable.querySelector('thead')?.querySelectorAll('tr') || [];
          for (const tr of tableHeadTrs) {
            tableHead.appendChild(tr);
          }
          createTr(table, 'headTable', '', false, tableBody);
        }
        replaceValue(table.innerHTML, tableWrap.innerHTML);
        handleReplaceValue(tableWrap, 'td');
      }
    }
  }
  function getTableKey(dom) {
    let tdDoms = dom.querySelectorAll('span');
    for (let tdDom of tdDoms) {
      let dataTag = tdDom.getAttribute('data-tag');
      if (['thousands', 'isAmountChinese', 'jnpfDictionary', 'jnpfDate'].includes(dataTag)) {
        tdDom = tdDom.querySelector('span');
        dataTag = tdDom && tdDom.getAttribute('data-tag');
      }
      if (dataTag) return dataTag.split('.')[0];
    }
    return '';
  }
  /**
   * 创建表格行
   * @param {*} table 表格dom
   * @param {*} tableKey 表格的key
   * @param {*} index 记录下标
   * @param {*} removeTitleTr 是否移除标题行
   */
  function createTr(table, tableKey, index, removeTitleTr, tableBody) {
    let cloneTable = table.cloneNode(true);
    let tableBodyTrs = cloneTable.querySelector('tbody').querySelectorAll('tr') || [];
    for (const tr of tableBodyTrs) {
      tr.style.height = '17px';
      if (tr.innerText.trim() == '') {
        tableBody.appendChild(tr);
        continue;
      }
      if (removeTitleTr && !tr.innerHTML.includes('{')) continue;
      let tds = tr.querySelectorAll('td');
      for (const td of tds) {
        if (td.innerHTML.includes('{')) td.setAttribute('tableKey', tableKey + '.' + index);
      }
      tableBody.appendChild(tr);
    }
  }
  function getValue(text) {
    let info = text.match(/data-tag="([^"]*)"/)[1];
    let dataTag = info.split('.')[0];
    let field = text.match(/{([^}]*)}/)[1];
    if (dataTag == 'headTable') return state.data[field] || '';
    let data = state.data[dataTag] || '';
    if (!data) return '';
    let val = '';
    for (const item of data) {
      val += item[field] || '' + '-';
    }
    return val;
  }
  function getTdValue(text) {
    if (!text.match(/tablekey="([^"]*)"/)) return;
    let info = text.match(/tablekey="([^"]*)"/)[1];
    let dataTag = info.split('.')[0];
    let line = info.split('.')[1];
    let field = text.match(/{([^}]*)}/)[1];
    let value = dataTag == 'headTable' ? state.data[field] || '' : state.data[dataTag][line][field] || '';
    return value;
  }
  function replaceImage(dom, data) {
    if (!data) return;
    let list: any[] = [];
    try {
      list = data ? JSON.parse(data) : [];
    } catch (error) {
      list = [{ url: data }];
    }
    if (JSON.stringify(list) == '[]') {
      let replaceDom = dom.cloneNode(true);
      replaceDom.innerHTML = '';
      replaceValue(dom.innerHTML, replaceDom.innerHTML);
    }
    let template = '';
    const width = getWidthHeight(dom.innerHTML);
    const height = getWidthHeight(dom.innerHTML, 'height');
    for (let i = 0; i < list.length; i++) {
      const element: any = list[i];
      if (element.url) {
        let value = !element.url.includes('http') && element.url.indexOf('data:image/png;base64') < 0 ? apiUrl.value + element.url : element.url;
        template += `<img style="width:${width}px;height:${height}px;display:inline-block;" src='${value}'/>`;
      }
    }
    let replaceDom = dom.cloneNode(true);
    const beginDom = replaceDom.innerHTML.substring(0, replaceDom.innerHTML.indexOf('&lt;img'));
    const endDom = replaceDom.innerHTML.substring(replaceDom.innerHTML.indexOf('&lt;/img&gt;') + 12, replaceDom.innerHTML.length);
    replaceDom.innerHTML = beginDom + template + endDom;
    replaceValue(dom.innerHTML, replaceDom.innerHTML);
  }
  function replaceValue(key, value) {
    state.printTemplate = state.printTemplate.replace(key, value);
  }
  function getThousands(value, place) {
    if (!value && value !== 0) return '';
    place = place ? place : getPlace(value);
    value = Number(value).toFixed(place);
    const numArr = value.toString().split('.');
    numArr[0] = numArr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    numArr[1] = numArr[1] ? numArr[1].toString().substring(0, place) : '';
    return numArr[1] ? numArr.join('.') : numArr[0];
  }
  function getPlace(value) {
    if (!value || value.toString().indexOf('.') == -1) return 0;
    var index = value.toString().indexOf('.') + 1;
    var count = value.toString().length - index;
    return count;
  }
  function pre() {
    if (state.pageIndex == 1) return;
    state.pageIndex--;
    scrollToPage();
  }
  function next() {
    if (state.pageIndex == state.batchData.length) return;
    state.pageIndex++;
    scrollToPage();
  }
  function scrollToPage() {
    let index = state.pageIndex - 1 < 0 ? 0 : state.pageIndex - 1;
    nextTick(() => {
      let dom = document.querySelector('.basic-content');
      dom?.scrollTo({
        top: (window.document.body.clientHeight - 30) * index,
        behavior: 'smooth',
      });
    });
  }
  function handleDownload() {
    let print = tsPrint.value.innerHTML;
    const blob = new Blob([print], { type: '' });
    const name = state.fullName ? `${state.fullName}.doc` : '下载文档.doc';
    downloadFile(blob, name);
  }
  function downloadFile(data, name, type?) {
    let blob = new Blob([data], { type: type || '' });
    let downloadElement = document.createElement('a');
    let href = window.URL.createObjectURL(blob);
    downloadElement.href = href;
    downloadElement.download = name;
    document.body.appendChild(downloadElement);
    downloadElement.click();
    document.body.removeChild(downloadElement);
    window.URL.revokeObjectURL(href);
  }
  function handlePrint() {
    let print = tsPrint.value.innerHTML;
    print = print + `<style>html * {word-break:break-all}</style>`;
    let iframe: any = document.createElement('IFRAME');
    document.body.appendChild(iframe);
    iframe.setAttribute('style', 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;');
    iframe.contentWindow.focus();
    let doc = iframe.contentWindow.document;
    iframe.onload = function () {
      let oldTitle = document.title;
      iframe.contentWindow.onafterprint = function () {
        let title = oldTitle.split('-')[0];
        let data = {
          printTitle: state.fullName ? state.fullName : title,
          printNum: 1,
          printId: state.id,
        };
        createPrintLog(data);
      };
      document.title = 'JNPF快速开发平台';
      iframe.contentWindow.print();
      document.title = oldTitle;
      document.body.removeChild(iframe);
    };
    doc.write(print);
    doc.close();
  }
  function replaceQrCode(dom, value) {
    let imgRegular = /&lt;qrCode(\S|\s)*?&lt;\/qrCode&gt;/g;
    let imgList = dom.innerHTML.match(imgRegular);
    if (imgList && imgList.length) {
      for (var i = 0; i < imgList.length; i++) {
        const item = imgList[i];
        const width = getWidthHeight(item);
        const height = getWidthHeight(item, 'height');
        const id = buildBitUUID();
        const obj = { replaceStr: item, width, height, qrcodeId: `qrcode${id}`, value };
        state.qrList.push(obj);
        let template = `<img style="width:${width}px;height:${height}px;display:inline-block;" id='qrcode${id}'/>`;
        replaceValue(dom.innerHTML, template);
      }
    }
  }
  function replaceBarCode(dom, value) {
    let imgRegular = /&lt;barCode(\S|\s)*?&lt;\/barCode&gt;/g;
    let imgList = dom.innerHTML.match(imgRegular);
    if (imgList && imgList.length) {
      for (var i = 0; i < imgList.length; i++) {
        const item = imgList[i];
        const width = getWidthHeight(item);
        const height = getWidthHeight(item, 'height');
        const id = buildBitUUID();
        const obj = { replaceStr: item, width, height, barcodeId: `barcode${id}`, value };
        state.barList.push(obj);
        let template = `<img style="width:${width}px;height:${height}px;display:inline-block;" id='barcode${id}'/>`;
        replaceValue(dom.innerHTML, template);
      }
    }
  }
  function replaceBar() {
    if (!state.barList.length) return;
    for (let i = 0; i < state.barList.length; i++) {
      const element = state.barList[i];
      getJsBarcode(element.value, `#${element.barcodeId}`, element.width, element.height);
    }
  }
  function replaceQr() {
    if (!state.qrList.length) return;
    for (let i = 0; i < state.qrList.length; i++) {
      const element = state.qrList[i];
      getJsQrcode(element.value, element.qrcodeId, element.width);
    }
  }
  function getJsBarcode(value, id, width, height) {
    if (!value) return;
    JsBarcode(id, value, {
      format: 'code128',
      width: width || 4,
      height: height || 80,
      displayValue: false,
      margin: 5,
    });
  }
  async function getJsQrcode(value, id, width) {
    toDataURL(value, {
      margin: 0,
      width,
    }).then(url => {
      document.getElementById(id)?.setAttribute('src', url);
    });
  }
  function replaceSysValue() {
    const recordList = state.recordList;
    const systemPrinter = unref(getUserInfo).userName + '/' + unref(getUserInfo).userAccount;
    const systemPrintTime = dayjs(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss');
    let systemApprovalContent = '';
    if (recordList.length) {
      systemApprovalContent +=
        '<table style="border-collapse: collapse;table-layout: fixed; width: 100%;" border="1" data-mce-style="border-collapse: collapse; width: 100%;"><tbody><tr><td style="width:20%;" data-mce-style="width: 20%;">节点名称</td><td style="width:20%;" data-mce-style="width: 20%;">操作人员</td><td style="width:20%;" data-mce-style="width: 20%;">操作时间</td><td style="width:20%;" data-mce-style="width: 20%;">执行动作</td><td style="width: 20%;" data-mce-style="width: 20%;">备注</td><td style="width: 100px" data-mce-style="width: 100px;">签名</td></tr>';
      let content = '';
      for (let i = 0; i < recordList.length; i++) {
        const record = recordList[i];
        content += `<tr><td style="width: 20%;" data-mce-style="width: 20%;"><span class="jnpf-print-tag-span jnpf-tiny-color--common" contenteditable="false">${
          record.nodeName
        }</span></td><td style="width: 20%;" data-mce-style="width: 20%;"><span class="jnpf-print-tag-span jnpf-tiny-color--common" contenteditable="false">${
          record.userName
        }</span></td><td style="width: 20%;" data-mce-style="width: 20%;"><span class="jnpf-print-tag-span jnpf-tiny-color--common" contenteditable="false">${dayjs(
          record.handleTime,
        ).format(
          'YYYY-MM-DD HH:mm:ss',
        )}</span></td><td style="width: 20%;" data-mce-style="width: 20%;"><span class="jnpf-print-tag-span jnpf-tiny-color--common" contenteditable="false">${getHandleName(
          record.handleStatus,
        )}</span></td><td style="width: 20%;" data-mce-style="width: 20%;"><span class="jnpf-print-tag-span jnpf-tiny-color--common" contenteditable="false">${
          record.handleOpinion || ''
        }</span></td><td style="width: 100px" data-mce-style="width: 20%;"><span class="jnpf-print-tag-span jnpf-tiny-color--common" contenteditable="false">${
          record.signImg ? `<img src=${record.signImg} width="100px"/>` : ''
        }</span></td></tr>`;
      }
      systemApprovalContent += content;
      systemApprovalContent += '</tbody></table>';
    }
    state.printTemplate = state.printTemplate.replaceAll('{systemPrinter}', systemPrinter);
    state.printTemplate = state.printTemplate.replaceAll('{systemPrintTime}', systemPrintTime);
    state.printTemplate = state.printTemplate.replaceAll('{systemApprovalContent}', systemApprovalContent);
  }
  function getWidthHeight(item, type = 'width') {
    let regular: any = '';
    if (type == 'width') regular = /width=[\"|'](.*?)[\"|']/gi;
    if (type == 'height') regular = /height=[\"|'](.*?)[\"|']/gi;
    let quotes = /["|'](.*)["|']/;
    let data = item.match(regular);
    let value = '';
    if (data && data.length) {
      let res = data[0].match(quotes);
      value = res && res.length ? res[1] : 100;
    }
    return value;
  }
  function getHandleName(handleStatus) {
    if (handleStatus == 0) return '退回';
    if (handleStatus == 1) return '同意';
    if (handleStatus == 2) return '发起';
    if (handleStatus == 3) return '撤回';
    if (handleStatus == 4) return '终止';
    if (handleStatus == 5) return '指派';
    if (handleStatus == 6) return '后加签';
    if (handleStatus == 7) return '转办';
    if (handleStatus == 8) return '变更';
    if (handleStatus == 9) return '复活';
    if (handleStatus == 10) return '前加签';
    if (handleStatus == 11) return '挂起';
    if (handleStatus == 12) return '恢复';
    if (handleStatus == 13) return '转向';
    return '';
  }
  function getDictionaryValue(value, id) {
    if (!value || !id) return '';
    const list: any[] = getDicDataSelector(id);
    if (!list.length) return '';
    try {
      let val = JSON.parse(value);
      if (Array.isArray(val)) {
        let txt: any[] = [];
        for (let i = 0; i < list.length; i++) {
          for (let j = 0; j < val.length; j++) {
            if (list[i].id == val[j]) txt.push(list[i].fullName);
          }
        }
        return txt.join(',');
      } else {
        const arr = list.filter(o => o.id == value);
        return arr.length ? arr[0].fullName : '';
      }
    } catch (error) {
      const arr = list.filter(o => o.id == value);
      return arr.length ? arr[0].fullName : '';
    }
  }
  function getDicDataSelector(id: string) {
    const list = baseStore.getDicList;
    let arr = list.filter(o => o.id === id);
    if (!arr.length) return [];
    if (!arr[0].isTree) return arr[0].dictionaryList;
    let rowData: any[] = [];
    const findData = list => {
      for (let i = 0; i < list.length; i++) {
        const e: any = list[i];
        rowData.push(e);
        if (e.children && e.children.length) findData(e.children);
      }
    };
    findData(arr[0].dictionaryList);
    return rowData;
  }
  function getDateValue(value, format) {
    if (!value) return '';
    return dayjs(value).format(getDateFormat(format) || 'YYYY-MM-DD HH:mm:ss');
  }
</script>
<style lang="less" scoped>
  .basic-content {
    overflow: auto !important;
    .print-content {
      background-color: @component-background;
      padding: 40px 30px;
      margin: 0 auto 10px;
      border-radius: 4px;
      width: 776px;
      height: 100%;
      overflow: auto;

      &:last-child {
        margin-bottom: 0;
      }
      :deep(table) {
        border-color: gray;
      }
    }
  }

  .header-page {
    display: flex;
    align-items: center;
    .ant-btn {
      margin: 0 10px;
    }
    .page-size {
      margin-left: 10px;
      font-size: 18px;
      font-weight: 400;
      color: @text-color-base;
    }
  }
</style>
