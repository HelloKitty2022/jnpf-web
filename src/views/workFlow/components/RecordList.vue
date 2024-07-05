<template>
  <BasicTable @register="registerTable" :columns="getColumns" :dataSource="getList">
    <template #bodyCell="{ column, record }">
      <template v-if="opType == '4' && column.key === 'nodeName'">
        <span class="recordList-nodeName" @click="handleNodeDetail(record)">{{ record.nodeName }}</span>
      </template>
      <template v-if="column.key === 'handleStatus'">
        <div class="handle-action" :title="record.statusText">
          <span class="spot" :style="{ background: colorList[record.handleStatus || 0] }"></span>{{ record.statusText }}
        </div>
      </template>
      <template v-if="column.key === 'signImg' && record.signImg">
        <Image :width="80" :src="record.signImg" :preview="false" class="cursor-pointer" @click="handlePreview(record.signImg)" />
      </template>
      <template v-if="column.key === 'fileList'">
        <jnpf-upload-file v-model:value="record.fileJson" type="workFlow" detailed simple />
      </template>
      <template v-if="column.key === 'action'">
        <span class="recordList-nodeName" @click="handleNodeLog(record)" v-if="record.isLog">查看日志</span>
      </template>
    </template>
  </BasicTable>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { Image } from 'ant-design-vue';
  import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
  import { createImgPreview } from '/@/components/Preview/index';

  const props = defineProps({
    list: { type: Array, default: [] },
    endTime: { type: Number, default: 0 },
    opType: { default: '' },
  });
  const emit = defineEmits(['viewDetail', 'viewLog']);

  const colorList = [
    'rgba(242,68,68,0.39)',
    'rgba(35,162,5,0.39)',
    'rgba(0,0,255,0.39)',
    'rgba(21,21,157,0.39)',
    'rgba(186,33,33,0.39)',
    'rgba(25,185,185,0.39)',
    'rgba(50,191,61,0.39)',
    'rgba(49,151,214,0.39)',
    'rgba(185,123,6,0.39)',
    'rgba(45,94,186,0.39)',
    'rgba(50,191,61,0.39)',
    'rgba(255,0,0,0.39)',
    'rgba(0,128,0,0.39)',
    'rgba(172,214,58,0.39)',
  ];
  const statusList = ['退回', '同意', '发起', '撤回', '终止', '指派', '后加签', '转办', '变更', '复活', '前加签', '挂起', '恢复', '转向'];
  const [registerTable] = useTable({
    showTableSetting: false,
    pagination: false,
  });

  const getList = computed<any[]>(() => {
    const list = (props.list as any[]).map(o => {
      const operator = o.handleStatus == 5 || o.handleStatus == 6 || o.handleStatus == 7 || o.handleStatus == 10 ? '：' + o.operatorId : '';
      o.statusText = statusList[o.handleStatus || 0] + operator;
      o.fileJson = o.fileList ? JSON.parse(o.fileList) : [];
      return o;
    });
    return list;
  });
  const getColumns = computed(() => {
    const columns: BasicColumn[] = [
      { title: '节点名称', dataIndex: 'nodeName', width: 200 },
      { title: '操作人员', dataIndex: 'userName', width: 120 },
      { title: '接收时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
      { title: '操作时间', dataIndex: 'handleTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
      { title: '执行动作', dataIndex: 'handleStatus', width: 200 },
      { title: '签名', dataIndex: 'signImg', width: 100, align: 'center', ellipsis: false },
      { title: '附件', dataIndex: 'fileList', width: 200 },
      { title: '备注', dataIndex: 'handleOpinion', width: 200 },
    ];
    const action = { title: '事件日志', dataIndex: 'action', width: 100 };
    return props.opType == '4' ? [...columns, action] : columns;
  });

  function handlePreview(img) {
    createImgPreview({ imageList: [img] });
  }
  function handleNodeDetail(record) {
    const data = {
      id: record.taskId,
      taskNodeId: record.taskNodeId,
      opType: 0,
      status: record.status,
      title: record.nodeName,
    };
    emit('viewDetail', data);
  }
  function handleNodeLog(record) {
    emit('viewLog', record);
  }
</script>
<style lang="less">
  .recordList-nodeName {
    color: @primary-color;
    cursor: pointer;
  }
  .handle-action {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    .spot {
      display: inline-block;
      width: 7px;
      height: 7px;
      margin-right: 5px;
      margin-bottom: 2px;
      border-radius: 50%;
    }
  }
</style>
