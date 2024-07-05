<template>
  <div class="uploader-file" :status="getStatus">
    <div
      class="uploader-file-progress"
      :class="progressingClass"
      :style="file.customCompleted || getStatus === 'error' ? successProgressStyle : getProgressStyle"></div>
    <div class="uploader-file-info">
      <div class="uploader-file-name upload-file-list__item-name">
        <PaperClipOutlined />
        {{ file.name.replaceAll('#', '') }}
      </div>
      <!-- <div class="uploader-file-size">{{formatedSize}}</div>
      <div class="uploader-file-meta"></div> -->
      <div class="uploader-file-status">
        <span v-show="file.customCompleted">{{ getStatusText }}</span>
        <span v-show="!file.customCompleted">
          <span v-if="getStatus !== 'uploading' && getStatus !== 'success'"> {{ file.customStatus === 'check' ? '文件校验中' : getStatusText }}</span>
          <span v-else>
            <span>{{ getProgressStyle.progress === '100%' ? '99%' : getProgressStyle.progress }}</span>
            <!-- <em>{{ getFormatedAverageSpeed }}</em>
            <i>{{ getFormatedTimeRemaining }}</i> -->
          </span>
        </span>
      </div>
      <div class="uploader-file-actions">
        <template v-if="file.customStatus !== 'check'">
          <PauseOutlined class="actions-icon" v-show="getStatus === 'waiting' || getStatus === 'uploading'" @click="pause" />
          <CaretRightOutlined class="actions-icon" v-show="getStatus === 'paused'" @click="resume" />
          <RedoOutlined class="actions-icon" v-show="getStatus === 'error'" @click="retry" />
          <CloseOutlined class="actions-icon" v-show="getStatus !== 'success'" @click="remove" />
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, computed, unref, watch, toRefs, onMounted, onUnmounted } from 'vue';
  import { PaperClipOutlined, CloseOutlined, PauseOutlined, RedoOutlined, CaretRightOutlined } from '@ant-design/icons-vue';

  interface State {
    [prop: string]: any;
  }

  defineOptions({ name: 'uploader-file' });
  const props = defineProps({
    file: { type: Object, default: () => ({}) },
    list: { type: Boolean, default: false },
  });
  // const secondsToStr = temp => {
  //   const years = Math.floor(temp / 31536000);
  //   if (years) {
  //     return years + ' year' + numberEnding(years);
  //   }
  //   const days = Math.floor((temp %= 31536000) / 86400);
  //   if (days) {
  //     return days + ' day' + numberEnding(days);
  //   }
  //   const hours = Math.floor((temp %= 86400) / 3600);
  //   if (hours) {
  //     return hours + ' hour' + numberEnding(hours);
  //   }
  //   const minutes = Math.floor((temp %= 3600) / 60);
  //   if (minutes) {
  //     return minutes + ' minute' + numberEnding(minutes);
  //   }
  //   const seconds = temp % 60;
  //   return seconds + ' second' + numberEnding(seconds);
  //   function numberEnding(number) {
  //     return number > 1 ? 's' : '';
  //   }
  // };
  const events = ['fileProgress', 'fileSuccess', 'fileComplete', 'fileError'];
  const state = reactive<State>({
    response: null,
    paused: false,
    error: false,
    averageSpeed: 0,
    currentSpeed: 0,
    isComplete: false,
    isUploading: false,
    size: 0,
    formatedSize: '',
    uploadedSize: 0,
    progress: 0,
    timeRemaining: 0,
    type: '',
    extension: '',
    progressingClass: '',
    successProgressStyle: {
      progress: '100%',
      webkitTransform: 'translateX(0)',
      mozTransform: 'translateX(0)',
      msTransform: 'translateX(0)',
      transform: 'translateX(0)',
    },
    tid: null,
    _handlers: {},
  });
  const { progressingClass, successProgressStyle } = toRefs(state);

  // const getFileCategory = computed(() => {
  //   const extension = state.extension;
  //   const isFolder = props.file.isFolder;
  //   let type = isFolder ? 'folder' : 'unknown';
  //   const categoryMap = props.file.uploader.opts.categoryMap;
  //   const typeMap = categoryMap || {
  //     image: ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp'],
  //     video: ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'],
  //     audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'],
  //     document: ['doc', 'txt', 'docx', 'pages', 'epub', 'pdf', 'numbers', 'csv', 'xls', 'xlsx', 'keynote', 'ppt', 'pptx'],
  //   };
  //   Object.keys(typeMap).forEach(_type => {
  //     const extensions = typeMap[_type];
  //     if (extensions.indexOf(extension) > -1) {
  //       type = _type;
  //     }
  //   });
  //   return type;
  // });
  // const getFormatedAverageSpeed = computed(() => {
  //   return `${formatSize(state.averageSpeed)} / s`;
  // });
  // const getFormatedTimeRemaining = computed(() => {
  //   const timeRemaining = state.timeRemaining;
  //   const file = props.file;
  //   if (timeRemaining === Number.POSITIVE_INFINITY || timeRemaining === 0) {
  //     return '';
  //   }
  //   let parsedTimeRemaining = secondsToStr(timeRemaining);
  //   const parseTimeRemaining = file.uploader.opts.parseTimeRemaining;
  //   if (parseTimeRemaining) {
  //     parsedTimeRemaining = parseTimeRemaining(timeRemaining, parsedTimeRemaining);
  //   }
  //   return parsedTimeRemaining;
  // });
  const getProgressStyle = computed(() => {
    const realProgress = state.progress === 1 ? 0.99 : state.progress;
    const progress = Math.floor(realProgress * 100);
    const style = `translateX(${Math.floor(progress - 100)}%)`;
    return {
      progress: `${progress}%`,
      webkitTransform: style,
      mozTransform: style,
      msTransform: style,
      transform: style,
    };
  });
  const getStatus = computed(() => {
    const isUploading = state.isUploading;
    const isComplete = state.isComplete;
    const isError = state.error;
    const paused = state.paused;
    if (isComplete) {
      return 'success';
    } else if (isError) {
      return 'error';
    } else if (isUploading) {
      return 'uploading';
    } else if (paused) {
      return 'paused';
    } else {
      return 'waiting';
    }
  });
  const getStatusText = computed(() => {
    const status = unref(getStatus);
    const fileStatusText = props.file.uploader.fileStatusText;
    let txt = status;
    if (typeof fileStatusText === 'function') {
      txt = fileStatusText(status, state.response);
    } else {
      txt = fileStatusText[status];
    }
    return txt || status;
  });

  watch(
    () => unref(getStatus),
    (newStatus, oldStatus) => {
      if (oldStatus && newStatus === 'uploading' && oldStatus !== 'uploading') {
        state.tid = setTimeout(() => {
          state.progressingClass = 'uploader-file-progressing';
        }, 200);
      } else {
        clearTimeout(state.tid);
        state.progressingClass = '';
      }
    },
  );

  // function formatSize(size) {
  //   if (size < 1024) {
  //     return size.toFixed(0) + ' bytes';
  //   } else if (size < 1024 * 1024) {
  //     return (size / 1024.0).toFixed(0) + ' KB';
  //   } else if (size < 1024 * 1024 * 1024) {
  //     return (size / 1024.0 / 1024.0).toFixed(1) + ' MB';
  //   } else {
  //     return (size / 1024.0 / 1024.0 / 1024.0).toFixed(1) + ' GB';
  //   }
  // }
  function _actionCheck() {
    state.paused = props.file.paused;
    state.error = props.file.error;
    state.isUploading = props.file.isUploading();
  }
  function pause() {
    props.file.pause();
    _actionCheck();
    _fileProgress();
  }
  function resume() {
    props.file.resume();
    _actionCheck();
  }
  function remove() {
    props.file.cancel();
  }
  function retry() {
    props.file.retry();
    _actionCheck();
  }
  function processResponse(message) {
    let res = message;
    try {
      res = JSON.parse(message);
    } catch (e) {}
    state.response = res;
  }
  function fileEventsHandler(event, args) {
    const rootFile = args[0];
    const file = args[1];
    const target = props.list ? rootFile : file;
    if (props.file === target) {
      if (props.list && event === 'fileSuccess') {
        processResponse(args[2]);
        return;
      }
      if (event === 'fileProgress') _fileProgress.apply(null, args);
      if (event === 'fileComplete') _fileComplete.apply(null, args);
      if (event === 'fileSuccess') _fileSuccess.apply(null, args);
      if (event === 'fileError') _fileError.apply(null, args);
    }
  }
  function _fileProgress() {
    state.progress = props.file.progress();
    state.averageSpeed = props.file.averageSpeed;
    state.currentSpeed = props.file.currentSpeed;
    state.timeRemaining = props.file.timeRemaining();
    state.uploadedSize = props.file.sizeUploaded();
    _actionCheck();
  }
  function _fileSuccess(rootFile, _file, message) {
    if (rootFile) {
      processResponse(message);
    }
    _fileProgress();
    state.error = false;
    state.isComplete = true;
    state.isUploading = false;
  }
  function _fileComplete(rootFile, _file, message) {
    _fileSuccess(rootFile, _file, message);
  }
  function _fileError(_rootFile, _file, message) {
    _fileProgress();
    processResponse(message);
    state.error = true;
    state.isComplete = false;
    state.isUploading = false;
  }

  onMounted(() => {
    const staticProps = ['paused', 'error', 'averageSpeed', 'currentSpeed'];
    const fnProps = [
      'isComplete',
      'isUploading',
      { key: 'size', fn: 'getSize' },
      { key: 'formatedSize', fn: 'getFormatSize' },
      { key: 'uploadedSize', fn: 'sizeUploaded' },
      'progress',
      'timeRemaining',
      { key: 'type', fn: 'getType' },
      { key: 'extension', fn: 'getExtension' },
    ];
    staticProps.forEach(prop => {
      state[prop] = props.file[prop];
    });
    fnProps.forEach(fnProp => {
      if (typeof fnProp === 'string') {
        state[fnProp] = props.file[fnProp]();
      } else {
        state[fnProp.key] = props.file[fnProp.fn]();
      }
    });

    const handlers = (state._handlers = {});
    const eventHandler = event => {
      handlers[event] = (...args) => {
        fileEventsHandler(event, args);
      };
      return handlers[event];
    };
    events.forEach(event => {
      props.file.uploader.on(event, eventHandler(event));
    });
  });
  onUnmounted(() => {
    events.forEach(event => {
      props.file.uploader.off(event, state._handlers[event]);
    });
    state._handlers = null;
  });
</script>

<style lang="less" scoped>
  .uploader-file-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 26px;
    color: #606266;

    .uploader-file-actions {
      & > span {
        float: unset !important;
        margin: 0 !important;
        margin-right: 4px !important;
        background: unset;
      }
      display: flex;
      align-items: center;
      justify-content: flex-end;
      .actions-icon {
        color: #606266;
        opacity: 0.8;
        cursor: pointer;
        font-size: 14px;
        display: block;
        line-height: 0;
      }
    }
    .uploader-file-status {
      width: 150px !important;
      text-indent: 10px !important;
      em {
        margin: 0 5px;
      }
    }
  }
  .uploader-file-name {
    width: calc(100% - 200px);
    padding-left: 4px;
    padding-right: 10px;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-indent: 0;

    .anticon {
      height: 100%;
      margin-right: 5px;
      color: #909399;
    }
  }
  .uploader-file-size {
    width: 13%;
    text-indent: 10px;
  }
  .uploader-file-meta {
    width: 8%;
  }
</style>
