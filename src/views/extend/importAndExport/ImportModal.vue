<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    title="批量导入"
    :width="1000"
    :show-cancel-btn="false"
    :show-ok-btn="false"
    destroyOnClose
    class="jnpf-import-modal">
    <div class="header-steps">
      <a-steps v-model:current="activeStep" type="navigation" size="small">
        <a-step title="上传文件" disabled />
        <a-step title="数据预览" disabled />
        <a-step title="导入数据" disabled />
      </a-steps>
    </div>
    <div class="import-main" v-show="activeStep == 0">
      <div class="upload">
        <div class="up_left">
          <img src="../../../assets/images/upload.png" />
        </div>
        <div class="up_right">
          <p class="title">上传填好的数据表</p>
          <p class="tip">文件后缀名必须是xls或xlsx，文件大小不超过500KB，最多支持导入1000条数据</p>
          <a-upload
            v-model:file-list="fileList"
            class="upload-area"
            accept=".xls,.xlsx"
            :max-count="1"
            :action="getAction"
            :headers="getHeaders"
            :before-upload="beforeUpload"
            @remove="handleFileRemove"
            @change="handleFileChange">
            <a-button type="link">上传文件</a-button>
          </a-upload>
        </div>
      </div>
      <div class="upload">
        <div class="up_left">
          <img src="../../../assets/images/import.png" />
        </div>
        <div class="up_right">
          <p class="title">填写导入数据信息</p>
          <p class="tip">请按照数据模板的格式准备导入数据，模板中的表头名称不可更改，表头行不能删除</p>
          <a-button type="link" @click="handleTemplateDownload()">下载模板</a-button>
        </div>
      </div>
    </div>
    <div class="import-main" v-show="activeStep == 1">
      <a-table :data-source="list" :columns="columns" size="small" :pagination="false" :scroll="{ x: 'max-content', y: '440px' }" class="import-preview-table">
        <template #bodyCell="{ column, record, index }">
          <template v-for="item in tableData">
            <template v-if="column.key === item.key">
              <a-input v-model:value="record[column.key]" />
            </template>
          </template>
          <template v-if="column.key === 'action'">
            <a-button class="action-btn" type="link" color="error" @click="handleDelItem(index)" size="small">删除</a-button>
          </template>
        </template>
      </a-table>
    </div>
    <div class="import-main" v-show="activeStep == 2">
      <div class="success" v-if="!result.resultType">
        <img src="../../../assets/images/success.png" />
        <p class="success-title">批量导入成功</p>
        <p class="success-tip">您已成功导入{{ result.snum }}条数据</p>
      </div>
      <div class="unsuccess" v-if="result.resultType">
        <a-alert message="错误提醒：导入失败数据展示" type="warning" show-icon />
        <div class="upload error-show">
          <div class="up_left">
            <img src="../../../assets/images/tip.png" />
          </div>
          <div class="up_right">
            <p class="tip success-tip">
              正常数据条数：<span>{{ result.snum }}条</span>
            </p>
            <p class="tip error-tip">
              异常数据条数：<span>{{ result.fnum }}条</span>
            </p>
          </div>
        </div>
        <div class="conTips">
          <p>以下文件数据为导入异常数据</p>
        </div>
        <a-table :data-source="resultList" :columns="resultColumns" size="small" :pagination="false" :scroll="{ x: 'max-content', y: '205px' }" />
      </div>
    </div>
    <template #insertFooter>
      <a-button @click="handleClose()" v-if="activeStep == 0">{{ t('common.cancelText') }}</a-button>
      <a-button @click="handlePrev" v-if="activeStep === 1">{{ t('common.prev') }}</a-button>
      <a-button type="primary" @click="handleNext" :loading="btnLoading" v-if="activeStep < 2" :disabled="activeStep === 0 && !fileName">
        {{ t('common.next') }}
      </a-button>
      <a-button type="primary" @click="handleClose(true)" v-else>关闭</a-button>
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { templateDownload, importPreview, importData } from '/@/api/extend/employee';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { downloadByUrl } from '/@/utils/file/download';
  import { useGlobSetting } from '/@/hooks/setting';
  import { getToken } from '/@/utils/auth';
  import { Upload as AUpload } from 'ant-design-vue';
  import type { UploadChangeParam, UploadFile } from 'ant-design-vue';

  interface State {
    activeStep: number;
    fileName: string;
    fileList: UploadFile[];
    btnLoading: boolean;
    list: any[];
    result: any;
    resultList: any[];
  }
  const emit = defineEmits(['register', 'reload']);
  const [registerModal, { closeModal }] = useModalInner(init);
  const { createMessage, createConfirm } = useMessage();
  const { t } = useI18n();
  const tableData = [
    { title: '工号', dataIndex: 'enCode', key: 'enCode', width: 150 },
    { title: '姓名', dataIndex: 'fullName', key: 'fullName', width: 150 },
    { title: '性别', dataIndex: 'gender', key: 'gender', width: 150 },
    { title: '部门', dataIndex: 'departmentName', key: 'departmentName', width: 150 },
    { title: '岗位', dataIndex: 'positionName', key: 'positionName', width: 150 },
    { title: '用工性质', dataIndex: 'workingNature', key: 'workingNature', width: 150 },
    { title: '身份证号', dataIndex: 'idNumber', key: 'idNumber', width: 150 },
    { title: '联系电话', dataIndex: 'telephone', key: 'telephone', width: 150 },
    { title: '出生年月', dataIndex: 'birthday', key: 'birthday', width: 150 },
    { title: '参加工作', dataIndex: 'attendWorkTime', key: 'attendWorkTime', width: 150 },
    { title: '最高学历', dataIndex: 'education', key: 'education', width: 150 },
    { title: '所学专业', dataIndex: 'major', key: 'major', width: 150 },
    { title: '毕业院校', dataIndex: 'graduationAcademy', key: 'graduationAcademy', width: 150 },
    { title: '毕业时间', dataIndex: 'graduationTime', key: 'graduationTime', width: 150 },
  ];
  const columns: any[] = [
    { width: 50, title: '序号', align: 'center', customRender: ({ index }) => index + 1 },
    ...tableData,
    { title: '操作', dataIndex: 'action', key: 'action', width: 50, fixed: 'right' },
  ];
  const resultColumns: any[] = [{ width: 50, title: '序号', align: 'center', customRender: ({ index }) => index + 1 }, ...tableData];
  const globSetting = useGlobSetting();
  const state = reactive<State>({
    activeStep: 0,
    fileName: '',
    fileList: [],
    btnLoading: false,
    list: [],
    result: {},
    resultList: [],
  });
  const { activeStep, fileName, fileList, btnLoading, list, result, resultList } = toRefs(state);

  const getAction = computed(() => globSetting.apiUrl + '/api/extend/Employee/Uploader');
  const getHeaders = computed(() => ({ Authorization: getToken() as string }));

  function init() {
    state.activeStep = 0;
    state.fileName = '';
    state.fileList = [];
    state.btnLoading = false;
  }
  function handlePrev() {
    if (state.activeStep == 0) return;
    state.activeStep -= 1;
  }
  function handleNext() {
    if (state.activeStep == 0) {
      if (!state.fileList.length || !state.fileName) return createMessage.warning('请先上传文件');
      state.btnLoading = true;
      importPreview({ fileName: state.fileName })
        .then(res => {
          state.list = res.data.dataRow || [];
          state.btnLoading = false;
          state.activeStep += 1;
        })
        .catch(() => {
          state.btnLoading = false;
        });
      return;
    }
    if (state.activeStep == 1) {
      if (!state.list.length) return createMessage.warning('导入数据为空');
      state.btnLoading = true;
      importData({ list: state.list })
        .then(res => {
          state.result = res.data;
          state.resultList = res.data.failResult;
          state.btnLoading = false;
          state.activeStep += 1;
        })
        .catch(() => {
          state.btnLoading = false;
        });
    }
  }
  function handleFileChange({ file }: UploadChangeParam) {
    if (file.status === 'error') {
      createMessage.error('上传失败');
      return;
    }
    if (file.status === 'done') {
      if (file.response.code === 200) {
        state.fileName = file.response.data.name;
      } else {
        createMessage.error(file.response.msg);
      }
    }
  }
  function beforeUpload(file) {
    const isRightSize = file.size / 1024 < 500;
    if (!isRightSize) createMessage.error(`文件大小不能超过500KB`);
    return isRightSize;
  }
  function handleFileRemove(file) {
    return new Promise<void>((resolve, reject) => {
      createConfirm({
        iconType: 'warning',
        title: t('common.tipTitle'),
        content: `确定移除${file.name}?`,
        onOk: () => {
          state.fileName = '';
          resolve();
        },
        onCancel: () => {
          reject();
        },
      });
    });
  }
  function handleTemplateDownload() {
    templateDownload().then(res => {
      downloadByUrl({ url: res.data?.url });
    });
  }
  function handleDelItem(index) {
    state.list.splice(index, 1);
  }
  function handleClose(reload = false) {
    closeModal();
    if (reload) emit('reload');
  }
</script>
