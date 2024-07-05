<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="添加批注" showOkBtn okText="发送" @ok="handleSubmit">
    <BasicForm @register="registerForm" :hideRequiredMark="true" />
    <timeline class="!pt-5px">
      <timeline-item v-for="(item, index) in activities" :key="index">
        <div class="timeline-content">
          <p class="text">{{ item.text }}</p>
          <p class="time">
            <span>{{ item.userId }} 提交于 {{ item.creatorTime }}</span>
            <span class="del" @click="handleDel(index)"> <i class="icon-ym icon-ym-delete"></i>删除</span>
          </p>
        </div>
      </timeline-item>
    </timeline>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { toRefs, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm, FormSchema } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getPostilList, sendPostil, delPostil } from '/@/api/extend/table';
  import { Timeline, TimelineItem } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  interface State {
    id: string;
    activities: any[];
  }

  const state = reactive<State>({
    id: '',
    activities: [],
  });
  const { activities } = toRefs(state);
  const schemas: FormSchema[] = [
    {
      field: 'text',
      label: ' ',
      component: 'Textarea',
      componentProps: { placeholder: '请输入', rows: 3 },
      rules: [{ required: true, trigger: 'blur', message: '必填' }],
    },
  ];
  const emit = defineEmits(['register', 'reload']);
  const { t } = useI18n();
  const { createMessage, createConfirm } = useMessage();
  const [registerForm, { validate, resetFields, updateSchema }] = useForm({ labelWidth: 0, schemas: schemas });
  const [registerModal, { changeLoading, changeOkLoading }] = useModalInner(init);

  function init(data) {
    resetFields();
    state.id = data.id;
    if (data.industryTypeList) updateSchema({ field: 'projectType', componentProps: { options: data.industryTypeList } });
    if (state.id) {
      changeLoading(true);
      getPostilList(state.id).then(res => {
        state.activities = res.data.postilJson ? JSON.parse(res.data.postilJson) : [];
        changeLoading(false);
      });
    }
  }
  async function handleSubmit() {
    const values = await validate();
    if (!values) return;
    changeOkLoading(true);
    sendPostil(state.id, values)
      .then(res => {
        createMessage.success(res.msg);
        changeOkLoading(false);
        init({ id: state.id });
        emit('reload');
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
  function handleDel(index) {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: t('common.tipTitle'),
      onOk: () => {
        delPostil(state.id, index).then(res => {
          state.activities.splice(index, 1);
          createMessage.success(res.msg);
          emit('reload');
        });
      },
    });
  }
</script>
<style lang="less" scoped>
  .timeline-content {
    p {
      padding: 0;
      margin: 0;
    }

    .text {
      line-height: 20px;
      margin-bottom: 10px;
      color: @text-color-label;
      font-size: 14px;
    }

    .time {
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      opacity: 0.6;
      height: 26px;

      .del {
        display: none;
        color: rgb(255 91 91);
        cursor: pointer;

        i {
          margin-right: 5px;
        }
      }
    }

    &:hover {
      .del {
        display: block;
      }
    }
  }
</style>
