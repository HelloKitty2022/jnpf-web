<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()" :loading="loading">{{ t('common.addText') }}</a-button>
          </template>
        </BasicTable>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { getBigDataList, createBigData } from '/@/api/extend/bigData';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';

  defineOptions({ name: 'extend-bigData' });

  const { createMessage, createConfirm } = useMessage();
  const { t } = useI18n();
  const loading = ref(false);

  const columns: BasicColumn[] = [
    {
      title: '编码',
      dataIndex: 'enCode',
    },
    {
      title: '名称',
      dataIndex: 'fullName',
    },
    {
      title: '创建时间',
      dataIndex: 'creatorTime',
      format: 'date|YYYY-MM-DD HH:mm:ss',
    },
  ];
  const [registerTable, { reload }] = useTable({
    api: getBigDataList,
    columns,
    useSearchForm: true,
    formConfig: {
      schemas: [
        {
          field: 'keyword',
          label: t('common.keyword'),
          component: 'Input',
          componentProps: {
            placeholder: t('common.enterKeyword'),
            submitOnPressEnter: true,
          },
        },
      ],
    },
  });
  function addOrUpdateHandle() {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '您确定要创建10000条数据吗, 是否继续?',
      onOk: () => {
        loading.value = true;
        createBigData()
          .then(res => {
            createMessage.success(res.msg);
            loading.value = false;
            reload();
          })
          .catch(() => {
            loading.value = false;
          });
      },
    });
  }
</script>
