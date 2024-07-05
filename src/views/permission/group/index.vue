<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable">
          <template #tableTitle>
            <a-button type="primary" preIcon="icon-ym icon-ym-btn-add" @click="addOrUpdateHandle()">{{ t('common.addText') }}</a-button>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'enabledMark'">
              <a-tag :color="record.enabledMark == 1 ? 'success' : 'error'">{{ record.enabledMark == 1 ? '启用' : '禁用' }}</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <TableAction :actions="getTableActions(record)" :dropDownActions="getDropDownActions(record)" />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
    <Form @register="registerForm" @reload="reload" />
    <Member @register="registerMember" />
    <PermissionPopup @register="registerPermission" />
  </div>
</template>
<script lang="ts" setup>
  import { getGroupList, delGroup } from '/@/api/permission/group';
  import { BasicTable, useTable, TableAction, BasicColumn, FormProps, ActionItem } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { useOrganizeStore } from '/@/store/modules/organize';
  import Form from './Form.vue';
  import Member from '../role/GlobalMember.vue';
  import { usePopup } from '/@/components/Popup';
  import PermissionPopup from '../organize/Permission.vue';
  import { onMounted } from 'vue';
  import { useBaseStore } from '/@/store/modules/base';

  defineOptions({ name: 'permission-group' });

  const { createMessage } = useMessage();
  const { t } = useI18n();
  const baseStore = useBaseStore();
  const organizeStore = useOrganizeStore();
  const [registerMember, { openModal: openMemberModal }] = useModal();
  const [registerForm, { openModal: openFormModal }] = useModal();
  const [registerPermission, { openPopup: openPermissionPopup }] = usePopup();

  const columns: BasicColumn[] = [
    { title: '分组名称', dataIndex: 'fullName', width: 200 },
    { title: '分组编码', dataIndex: 'enCode', width: 150 },
    { title: '分组类型', dataIndex: 'type', width: 90 },
    { title: '说明', dataIndex: 'description' },
    { title: '创建时间', dataIndex: 'creatorTime', width: 150, format: 'date|YYYY-MM-DD HH:mm:ss' },
    { title: '排序', dataIndex: 'sortCode', width: 70, align: 'center' },
    { title: '状态', dataIndex: 'enabledMark', width: 70, align: 'center' },
  ];
  const [registerTable, { reload, getForm }] = useTable({
    api: getGroupList,
    columns,
    useSearchForm: true,
    formConfig: getFormConfig(),
    actionColumn: {
      width: 150,
      title: '操作',
      dataIndex: 'action',
    },
  });

  function getFormConfig(): Partial<FormProps> {
    return {
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
        {
          field: 'type',
          label: '类型',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
          },
        },
        {
          field: 'enabledMark',
          label: '状态',
          component: 'Select',
          componentProps: {
            placeholder: '请选择',
            options: [
              { fullName: '启用', id: 1 },
              { fullName: '禁用', id: 0 },
            ],
          },
        },
      ],
    };
  }
  function getTableActions(record): ActionItem[] {
    return [
      {
        label: t('common.editText'),
        onClick: addOrUpdateHandle.bind(null, record.id),
      },
      {
        label: t('common.delText'),
        color: 'error',
        modelConfirm: {
          onOk: handleDelete.bind(null, record.id),
        },
      },
    ];
  }
  function getDropDownActions(record): ActionItem[] {
    if (!record.enabledMark) return [];
    return [
      {
        label: '组内成员',
        onClick: viewMember.bind(null, record),
      },
      {
        label: '查看权限',
        onClick: handlePermission.bind(null, record.id, record.fullName),
      },
    ];
  }
  function handlePermission(id, fullName) {
    openPermissionPopup(true, { id, fullName, objectType: 'group' });
  }
  function addOrUpdateHandle(id = '') {
    openFormModal(true, { id });
  }
  function handleDelete(id) {
    delGroup(id).then(res => {
      createMessage.success(res.msg);
      organizeStore.resetState();
      reload();
    });
  }
  function viewMember(record) {
    const { id, fullName } = record;
    openMemberModal(true, { id, fullName, type: 'Group' });
  }
  async function getTypeOptions() {
    const typeRes = await baseStore.getDictionaryData('groupType');
    getForm().updateSchema({ field: 'type', componentProps: { options: typeRes } });
  }

  onMounted(() => {
    getTypeOptions();
  });
</script>
