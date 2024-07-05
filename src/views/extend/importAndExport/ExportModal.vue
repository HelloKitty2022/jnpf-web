<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="导出数据" @ok="handleSubmit" destroyOnClose class="export-modal">
    <template #insertFooter>
      <div class="footer-tip">提示:系统将导出列表中选中的数据</div>
    </template>
    <a-form :colon="false" labelAlign="left" :labelCol="{ style: { width: '90px' } }">
      <a-form-item>
        <a-radio-group v-model:value="dataType">
          <a-radio :value="0">当前页面数据</a-radio>
          <a-radio :value="1">全部页面数据</a-radio>
        </a-radio-group>
      </a-form-item>
      <div class="export-line">
        <p class="export-label">列表数据<span>请选择导出字段</span></p>
      </div>
      <a-checkbox :indeterminate="isIndeterminate" v-model:checked="checkAll" @change="handleCheckAllChange">全选</a-checkbox>
      <a-checkbox-group v-model:value="checkedList" class="options-list" @change="handleCheckedChange">
        <a-checkbox v-for="item in columnList" :key="item.id" :value="item.id" class="options-item">
          {{ item.fullName }}
        </a-checkbox>
      </a-checkbox-group>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { exportExcel } from '/@/api/extend/employee';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { downloadByUrl } from '/@/utils/file/download';

  const [registerModal, { closeModal, changeOkLoading }] = useModalInner(init);
  const { createMessage } = useMessage();
  const dataType = ref(0);
  const isIndeterminate = ref(false);
  const checkAll = ref(false);
  const columnList = ref<any[]>([
    { fullName: '工号', id: 'enCode' },
    { fullName: '姓名', id: 'fullName' },
    { fullName: '性别', id: 'gender' },
    { fullName: '部门', id: 'departmentName' },
    { fullName: '岗位', id: 'positionName' },
    { fullName: '用工性质', id: 'workingNature' },
    { fullName: '身份证号', id: 'idNumber' },
    { fullName: '联系电话', id: 'telephone' },
    { fullName: '出生年月', id: 'birthday' },
    { fullName: '参加工作', id: 'attendWorkTime' },
    { fullName: '最高学历', id: 'education' },
    { fullName: '所学专业', id: 'major' },
    { fullName: '毕业院校', id: 'graduationAcademy' },
    { fullName: '毕业时间', id: 'graduationTime' },
    { fullName: '创建时间', id: 'creatorTime' },
  ]);
  const checkedList = ref<string[]>([]);
  const defaultCheckedList = ref<string[]>([]);
  const listQuery = ref({});

  function init(data) {
    dataType.value = 0;
    checkedList.value = columnList.value.map(o => o.id);
    handleCheckedChange(checkedList.value);
    listQuery.value = data.listQuery;
  }
  function handleCheckAllChange(e) {
    const val = e.target.checked;
    checkedList.value = val ? columnList.value.map(o => o.id) : defaultCheckedList.value;
    isIndeterminate.value = val ? false : !!defaultCheckedList.value.length;
  }
  function handleCheckedChange(val) {
    const checkedCount = val.length;
    checkAll.value = checkedCount === columnList.value.length;
    isIndeterminate.value = !!checkedCount && checkedCount < columnList.value.length;
  }
  function handleSubmit() {
    if (!checkedList.value.length) return createMessage.warning('请至少选择一个导出字段');
    changeOkLoading(true);
    let query = {
      ...listQuery.value,
      dataType: dataType.value,
      selectKey: checkedList.value.join(','),
    };
    exportExcel(query)
      .then(res => {
        changeOkLoading(false);
        if (!res.data.url) return;
        downloadByUrl({ url: res.data.url });
        closeModal();
      })
      .catch(() => {
        changeOkLoading(false);
      });
  }
</script>
