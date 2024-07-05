<template>
  <textarea :id="tinymceId" style="height: 100%" v-if="showEditor"></textarea>
</template>

<script lang="ts" setup>
  import { reactive, toRefs, watch, computed, onMounted, onDeactivated, onBeforeUnmount, unref, nextTick } from 'vue';
  import plugins from './plugins';
  import toolbar from './toolbar';
  import tinymce from 'tinymce/tinymce';
  import 'tinymce/themes/silver';
  import 'tinymce/icons/default/icons';
  import 'tinymce/plugins/advlist';
  import 'tinymce/plugins/anchor';
  import 'tinymce/plugins/autolink';
  import 'tinymce/plugins/autosave';
  import 'tinymce/plugins/code';
  import 'tinymce/plugins/codesample';
  import 'tinymce/plugins/directionality';
  import 'tinymce/plugins/fullscreen';
  import 'tinymce/plugins/hr';
  import 'tinymce/plugins/insertdatetime';
  import 'tinymce/plugins/link';
  import 'tinymce/plugins/lists';
  import 'tinymce/plugins/media';
  import 'tinymce/plugins/nonbreaking';
  import 'tinymce/plugins/noneditable';
  import 'tinymce/plugins/pagebreak';
  import 'tinymce/plugins/paste';
  import 'tinymce/plugins/preview';
  import 'tinymce/plugins/print';
  import 'tinymce/plugins/save';
  import 'tinymce/plugins/searchreplace';
  import 'tinymce/plugins/spellchecker';
  import 'tinymce/plugins/tabfocus';
  import 'tinymce/plugins/table';
  import 'tinymce/plugins/template';
  import 'tinymce/plugins/textpattern';
  import 'tinymce/plugins/visualblocks';
  import 'tinymce/plugins/visualchars';
  import 'tinymce/plugins/wordcount';
  import 'tinymce/plugins/image';
  import 'tinymce/plugins/charmap';
  import 'tinymce/plugins/imagetools';
  import 'tinymce/plugins/help';
  import 'tinymce/plugins/quickbars';
  import 'tinymce/plugins/importcss';
  import 'tinymce/plugins/toc';
  import 'tinymce/plugins/emoticons/js/emojis';
  import { useLocale } from '/@/locales/useLocale';
  import { useAppStore } from '/@/store/modules/app';
  import { buildBitUUID } from '/@/utils/uuid';

  const emit = defineEmits(['register', 'input']);

  defineOptions({ inheritAttrs: false });

  interface State {
    showEditor: boolean;
    tinymceId: string;
    dataValue: string;
  }

  const state = reactive<State>({
    showEditor: false,
    tinymceId: buildBitUUID(),
    dataValue: '',
  });
  const { tinymceId, showEditor } = toRefs(state);
  const props = defineProps({
    value: { type: String, default: '' },
    init: { type: Object },
    height: { type: [String, Number] },
    plugins: { type: [String, Array] },
    toolbar: { type: [String, Array] },
    menubar: { type: [String, Array] },
  });
  const appStore = useAppStore();

  const skinName = computed(() => {
    return appStore.getDarkMode === 'light' ? 'oxide' : 'oxide-dark';
  });
  const langName = computed(() => {
    const lang = useLocale().getLocale.value;
    return ['zh_CN', 'en'].includes(lang) ? lang : 'zh_CN';
  });
  const initOptions = computed(() => {
    const publicPath = import.meta.env.VITE_PUBLIC_PATH || '/';
    return {
      selector: `#${unref(tinymceId)}`,
      resize: false,
      branding: false,
      menubar: props.menubar ? props.menubar : false,
      body_class: 'panel-body',
      end_container_on_empty_block: true,
      powerpaste_word_import: 'clean',
      fontsize_formats: '12px 14px 16px 18px 24px 36px 48px 56px 72px',
      font_formats:
        'Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats;微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif',
      code_dialog_height: 450,
      code_dialog_width: 1000,
      advlist_bullet_styles: 'square',
      advlist_number_styles: 'default',
      imagetools_cors_hosts: ['www.tinymce.com', 'codepen.io'],
      default_link_target: '_blank',
      link_title: false,
      object_resizing: true,
      paste_data_images: true, // 允许粘贴图像
      quickbars_insert_toolbar: false,
      nonbreaking_force_tab: true,
      convert_urls: false,
      toolbar_mode: 'sliding',
      language_url: publicPath + 'resource/tinymce/langs/' + langName.value + '.js',
      language: langName.value,
      skin: skinName.value,
      skin_url: publicPath + 'resource/tinymce/skins/ui/' + skinName.value,
      content_css: publicPath + 'resource/tinymce/skins/ui/' + skinName.value + '/content.min.css',
      toolbar: props.toolbar || toolbar,
      plugins: props.plugins || plugins,
      ...props.init,
      deprecation_warnings: false,
    };
  });
  const editor = computed(() => (window as any)?.tinymce.get(state.tinymceId));

  watch(
    () => props.value,
    newValue => {
      if (newValue != state.dataValue) {
        state.dataValue = newValue;
      }
    },
    { immediate: true, deep: true },
  );
  watch(
    () => state.dataValue,
    newValue => {
      emit('input', newValue);
    },
  );
  watch(
    () => [props.init, props.toolbar, props.plugins, langName.value, skinName.value, props.menubar],
    () => initEditor(),
  );

  function initEditor() {
    state.showEditor = false;
    destroy();
    nextTick(() => {
      state.showEditor = true;
      setTimeout(() => {
        tinymce.init(unref(initOptions) as any);
      }, 30);
    });
  }
  function destroy() {
    if (tinymce !== null) {
      tinymce?.remove?.(unref(initOptions).selector!);
    }
  }
  function setContent(val) {
    if (!val) return;
    setTimeout(() => {
      tinymce.get(state.tinymceId)?.setContent(val);
    }, 200);
  }

  onMounted(() => {
    initEditor();
  });
  onBeforeUnmount(() => {
    destroy();
  });
  onDeactivated(() => {
    destroy();
  });

  defineExpose({ editor, setContent });
</script>
<style lang="less">
  .tinymce-container {
    position: relative;
    line-height: normal;
  }
  .tinymce-container {
    :deep(.mce-fullscreen) {
      z-index: 10000;
    }
  }
  .tinymce-textarea {
    visibility: hidden;
    z-index: -1;
  }
  .tox-tinymce-aux {
    z-index: 10001 !important;
  }
</style>
