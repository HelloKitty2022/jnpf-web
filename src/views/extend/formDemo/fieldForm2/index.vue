<template>
  <div class="jnpf-content-wrapper jnpf-content-wrapper-form">
    <div class="jnpf-content-wrapper-form-body px-10px">
      <ScrollContainer>
        <div class="my-10px">
          <a-alert message="下拉框、多选框、单选框、树形选择" type="warning" :show-icon="false" />
        </div>
        <a-form ref="formRef" :colon="false" :model="dataForm" :labelCol="{ style: { width: '110px' } }">
          <a-form-item label="当前状态">
            <a-switch v-model:checked="dataForm.EnabledMark" />
          </a-form-item>
          <a-form-item label="请假类别">
            <a-radio-group v-model:value="dataForm.LeaveType">
              <a-radio v-for="item in radioOptions" :key="item" :value="item">{{ item }} </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="运输工具">
            <a-radio-group v-model:value="dataForm.Conveyance">
              <a-radio v-for="item in radioOptions1" :key="item" :value="item">
                <i :class="'icon-ym icon-ym-extend-' + item" style="font-size: 18px"></i>
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="传统节日">
            <a-checkbox-group v-model:value="dataForm.Festival">
              <a-checkbox v-for="item in checkboxOptions" :value="item">{{ item }}</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item label="角色类型">
            <jnpf-select v-model:value="dataForm.RoleType" :options="options" />
          </a-form-item>
          <a-form-item label="树形下拉框">
            <jnpf-tree-select v-model:value="dataForm.parentId" :options="treeData" allowClear @change="getValue" />
          </a-form-item>
          <a-form-item label="级联选择器">
            <jnpf-cascader v-model:value="dataForm.cascader" placeholder="请选择" :options="options1" allowClear />
          </a-form-item>
        </a-form>
      </ScrollContainer>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, toRefs, ref, onMounted } from 'vue';
  import { ScrollContainer } from '/@/components/Container';
  import type { FormInstance } from 'ant-design-vue';
  import { useBaseStore } from '/@/store/modules/base';
  import { getPositionSelector } from '/@/api/permission/position';

  defineOptions({ name: 'extend-formDemo-verifyForm2' });

  interface State {
    dataForm: any;
    radioOptions: any[];
    radioOptions1: any[];
    checkboxOptions: any[];
    options: any[];
    treeData: any[];
    options1: any[];
  }

  const state = reactive<State>({
    dataForm: {
      EnabledMark: true,
      LeaveType: '年假',
      Conveyance: 'car',
      Festival: ['春节', '清明节'],
      RoleType: '',
      Position: '',
      cascader: [],
      options1: [],
    },
    radioOptions: ['事假', '病假', '婚假', '产假', '丧假', '年假', '调休', '其他'],
    radioOptions1: ['bicycle', 'motorcycle', 'plane', 'truck', 'subway', 'car', 'bus', 'rocket', 'train', 'ambulance'],
    checkboxOptions: ['春节', '清明节', '七夕节', '五一节', '端午节', '中秋节', '重阳节', '除夕', '元旦'],
    options: [],
    treeData: [],
    options1: [
      {
        id: 'zhinan',
        fullName: '指南',
        children: [
          {
            id: 'shejiyuanze',
            fullName: '设计原则',
            children: [
              {
                id: 'yizhi',
                fullName: '一致',
              },
              {
                id: 'fankui',
                fullName: '反馈',
              },
              {
                id: 'xiaolv',
                fullName: '效率',
              },
              {
                id: 'kekong',
                fullName: '可控',
              },
            ],
          },
          {
            id: 'daohang',
            fullName: '导航',
            children: [
              {
                id: 'cexiangdaohang',
                fullName: '侧向导航',
              },
              {
                id: 'dingbudaohang',
                fullName: '顶部导航',
              },
            ],
          },
        ],
      },
      {
        id: 'zujian',
        fullName: '组件',
        children: [
          {
            id: 'basic',
            fullName: 'Basic',
            children: [
              {
                id: 'layout',
                fullName: 'Layout 布局',
              },
              {
                id: 'color',
                fullName: 'Color 色彩',
              },
              {
                id: 'typography',
                fullName: 'Typography 字体',
              },
              {
                id: 'icon',
                fullName: 'Icon 图标',
              },
              {
                id: 'button',
                fullName: 'Button 按钮',
              },
            ],
          },
          {
            id: 'form',
            fullName: 'Form',
            children: [
              {
                id: 'radio',
                fullName: 'Radio 单选框',
              },
              {
                id: 'checkbox',
                fullName: 'Checkbox 多选框',
              },
              {
                id: 'input',
                fullName: 'Input 输入框',
              },
              {
                id: 'input-number',
                fullName: 'InputNumber 计数器',
              },
              {
                id: 'select',
                fullName: 'Select 选择器',
              },
              {
                id: 'cascader',
                fullName: 'Cascader 级联选择器',
              },
              {
                id: 'switch',
                fullName: 'Switch 开关',
              },
              {
                id: 'slider',
                fullName: 'Slider 滑块',
              },
              {
                id: 'time-picker',
                fullName: 'TimePicker 时间选择器',
              },
              {
                id: 'date-picker',
                fullName: 'DatePicker 日期选择器',
              },
              {
                id: 'datetime-picker',
                fullName: 'DateTimePicker 日期时间选择器',
              },
              {
                id: 'upload',
                fullName: 'Upload 上传',
              },
              {
                id: 'rate',
                fullName: 'Rate 评分',
              },
              {
                id: 'form',
                fullName: 'Form 表单',
              },
            ],
          },
          {
            id: 'data',
            fullName: 'Data',
            children: [
              {
                id: 'table',
                fullName: 'Table 表格',
              },
              {
                id: 'tag',
                fullName: 'Tag 标签',
              },
              {
                id: 'progress',
                fullName: 'Progress 进度条',
              },
              {
                id: 'tree',
                fullName: 'Tree 树形控件',
              },
              {
                id: 'pagination',
                fullName: 'Pagination 分页',
              },
              {
                id: 'badge',
                fullName: 'Badge 标记',
              },
            ],
          },
          {
            id: 'notice',
            fullName: 'Notice',
            children: [
              {
                id: 'alert',
                fullName: 'Alert 警告',
              },
              {
                id: 'loading',
                fullName: 'Loading 加载',
              },
              {
                id: 'message',
                fullName: 'Message 消息提示',
              },
              {
                id: 'message-box',
                fullName: 'MessageBox 弹框',
              },
              {
                id: 'notification',
                fullName: 'Notification 通知',
              },
            ],
          },
          {
            id: 'navigation',
            fullName: 'Navigation',
            children: [
              {
                id: 'menu',
                fullName: 'NavMenu 导航菜单',
              },
              {
                id: 'tabs',
                fullName: 'Tabs 标签页',
              },
              {
                id: 'breadcrumb',
                fullName: 'Breadcrumb 面包屑',
              },
              {
                id: 'dropdown',
                fullName: 'Dropdown 下拉菜单',
              },
              {
                id: 'steps',
                fullName: 'Steps 步骤条',
              },
            ],
          },
          {
            id: 'others',
            fullName: 'Others',
            children: [
              {
                id: 'dialog',
                fullName: 'Dialog 对话框',
              },
              {
                id: 'tooltip',
                fullName: 'Tooltip 文字提示',
              },
              {
                id: 'popover',
                fullName: 'Popover 弹出框',
              },
              {
                id: 'card',
                fullName: 'Card 卡片',
              },
              {
                id: 'carousel',
                fullName: 'Carousel 走马灯',
              },
              {
                id: 'collapse',
                fullName: 'Collapse 折叠面板',
              },
            ],
          },
        ],
      },
      {
        id: 'ziyuan',
        fullName: '资源',
        children: [
          {
            id: 'axure',
            fullName: 'Axure Components',
          },
          {
            id: 'sketch',
            fullName: 'Sketch Templates',
          },
          {
            id: 'jiaohu',
            fullName: '组件交互文档',
          },
        ],
      },
    ],
  });
  const { dataForm, radioOptions, radioOptions1, checkboxOptions, options, treeData, options1 } = toRefs(state);
  const formRef = ref<FormInstance>();
  const baseStore = useBaseStore();

  async function init() {
    state.options = (await baseStore.getDictionaryData('RoleType')) as any[];
    getPositionSelector().then(res => {
      state.treeData = res.data.list;
    });
  }
  function getValue(value) {
    state.dataForm.Position = value;
  }

  onMounted(() => {
    init();
  });
</script>
