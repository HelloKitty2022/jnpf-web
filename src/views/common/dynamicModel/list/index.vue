<template>
  <div class="jnpf-content-wrapper">
    <div class="jnpf-content-wrapper-left" v-if="columnData.type === 2">
      <BasicLeftTree v-bind="getLeftTreeBindValue" ref="leftTreeRef" @reload="getTreeView()" @select="handleLeftTreeSelect" />
    </div>
    <div class="jnpf-content-wrapper-center">
      <div class="jnpf-content-wrapper-search-box" v-if="columnData.searchList?.length">
        <BasicForm
          @register="registerSearchForm"
          :schemas="searchSchemas"
          @advanced-change="redoHeight"
          @submit="handleSearchSubmit"
          @reset="handleSearchReset"
          class="search-form">
        </BasicForm>
      </div>
      <div class="jnpf-content-wrapper-content">
        <BasicTable @register="registerTable" v-bind="getTableBindValue" ref="tableRef" @columns-change="handleColumnChange">
          <template #tableTitle>
            <a-button
              v-for="item in state.headerBtnsList"
              :key="item.value"
              :type="item.value === 'add' ? 'primary' : 'link'"
              :preIcon="item.icon"
              @click="headBtnsHandle(item.value)">
              {{ item.label }}
            </a-button>
          </template>
          <template #toolbar v-if="columnData.hasSuperQuery && config.webType != '4'">
            <a-tooltip placement="top">
              <template #title>
                <span>{{ t('common.superQuery') }}</span>
              </template>
              <filter-outlined @click="openSuperQuery(true, { columnOptions: state.columnOptions })" />
            </a-tooltip>
          </template>
          <template #expandedRowRender="{ record }" v-if="[1, 2].includes(columnData.type) && getChildTableStyle === 2 && childColumnList.length">
            <a-tabs size="small">
              <a-tab-pane :key="cIndex" :tab="child.label" :label="child.label" v-for="(child, cIndex) in childColumnList">
                <BasicTable @register="registerChildTable" :ellipsis="!!columnData.showOverflow" :data-source="record[child.prop]" :columns="child.children">
                  <template #bodyCell="{ column, record: childRecord }">
                    <template v-if="column.jnpfKey === 'relationForm'">
                      <p class="link-text" @click="toDetail(column.modelId, childRecord[`${column.dataIndex}_id`])">{{ childRecord[column.dataIndex] }}</p>
                    </template>
                    <template v-if="column.jnpfKey === 'inputNumber'">
                      <jnpf-input-number
                        v-model:value="childRecord[column.dataIndex]"
                        :precision="column.precision"
                        :thousands="column.thousands"
                        disabled
                        detailed />
                    </template>
                    <template v-if="column.jnpfKey === 'calculate'">
                      <jnpf-calculate
                        v-model:value="childRecord[column.dataIndex]"
                        :isStorage="column.isStorage"
                        :precision="column.precision"
                        :thousands="column.thousands"
                        detailed />
                    </template>
                    <template v-if="column.jnpfKey === 'sign'">
                      <jnpf-sign v-model:value="childRecord[column.dataIndex]" detailed />
                    </template>
                    <template v-if="column.jnpfKey === 'signature'">
                      <jnpf-signature v-model:value="childRecord[column.dataIndex]" detailed />
                    </template>
                    <template v-if="column.jnpfKey === 'rate'">
                      <jnpf-rate v-model:value="childRecord[column.dataIndex]" :count="column.count" :allowHalf="column.allowHalf" disabled />
                    </template>
                    <template v-if="column.jnpfKey === 'slider'">
                      <jnpf-slider v-model:value="childRecord[column.dataIndex]" :min="column.min" :max="column.max" :step="column.step" disabled />
                    </template>
                    <template v-if="column.jnpfKey === 'uploadImg'">
                      <jnpf-upload-img v-model:value="childRecord[column.dataIndex]" disabled detailed simple v-if="childRecord[column.dataIndex]?.length" />
                    </template>
                    <template v-if="column.jnpfKey === 'uploadFile'">
                      <jnpf-upload-file v-model:value="childRecord[column.dataIndex]" disabled detailed simple v-if="childRecord[column.dataIndex]?.length" />
                    </template>
                    <template v-if="column.jnpfKey === 'input'">
                      <jnpf-input
                        v-model:value="childRecord[column.dataIndex]"
                        :useMask="column.useMask"
                        :maskConfig="column.maskConfig"
                        :showOverflow="columnData.showOverflow"
                        detailed />
                    </template>
                  </template>
                </BasicTable>
              </a-tab-pane>
            </a-tabs>
          </template>
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.flag === 'INDEX'">
              <div class="edit-row-action" v-if="columnData.type === 4 && !config.enableFlow">
                <span class="edit-row-index">{{ index + 1 }}</span>
                <i class="ym-custom ym-custom-arrow-expand" @click="handleRowForm(record)"></i>
              </div>
              <span v-else>{{ index + 1 }}</span>
            </template>
            <template v-if="columnData.type === 4">
              <template v-if="record.rowEdit">
                <template v-if="column.jnpfKey === 'inputNumber'">
                  <jnpf-input-number
                    v-model:value="record[column.prop]"
                    :placeholder="column.placeholder"
                    :min="column.min"
                    :max="column.max"
                    :step="column.step"
                    :controls="column.controls"
                    :addonBefore="column.addonBefore"
                    :addonAfter="column.addonAfter"
                    :precision="column.precision"
                    :thousands="column.thousands"
                    :disabled="column.disabled" />
                </template>
                <template v-else-if="column.jnpfKey === 'calculate'">
                  <jnpf-calculate
                    v-model:value="record[column.prop]"
                    :isStorage="column.isStorage"
                    :precision="column.precision"
                    :thousands="column.thousands"
                    detailed />
                </template>
                <template v-else-if="column.jnpfKey === 'rate'">
                  <jnpf-rate v-model:value="record[column.prop]" :count="column.count" :allowHalf="column.allowHalf" :disabled="column.disabled" />
                </template>
                <template v-else-if="column.jnpfKey === 'slider'">
                  <jnpf-slider v-model:value="record[column.prop]" :min="column.min" :max="column.max" :step="column.step" :disabled="column.disabled" />
                </template>
                <template v-else-if="column.jnpfKey === 'uploadImg'">
                  <jnpf-upload-img
                    v-model:value="record[column.prop]"
                    :fileSize="column.fileSize"
                    :sizeUnit="column.sizeUnit"
                    :limit="column.limit"
                    :pathType="column.pathType"
                    :isAccount="column.isAccount"
                    :folder="column.folder"
                    :tipText="column.tipText"
                    :disabled="column.disabled" />
                </template>
                <template v-else-if="column.jnpfKey === 'uploadFile'">
                  <jnpf-upload-file
                    v-model:value="record[column.prop]"
                    :accept="column.accept"
                    :fileSize="column.fileSize"
                    :sizeUnit="column.sizeUnit"
                    :buttonText="column.buttonText"
                    :limit="column.limit"
                    :pathType="column.pathType"
                    :isAccount="column.isAccount"
                    :folder="column.folder"
                    :tipText="column.tipText"
                    :disabled="column.disabled" />
                </template>
                <template v-else-if="column.jnpfKey === 'switch'">
                  <jnpf-switch v-model:value="record[column.prop]" :disabled="column.disabled" />
                </template>
                <template v-else-if="column.jnpfKey === 'timePicker'">
                  <jnpf-time-picker
                    v-model:value="record[column.prop]"
                    :format="column.format"
                    :startTime="column.startTime"
                    :endTime="column.endTime"
                    :placeholder="column.placeholder"
                    :allowClear="column.clearable"
                    :disabled="column.disabled" />
                </template>
                <template v-else-if="column.jnpfKey === 'datePicker'">
                  <jnpf-date-picker
                    v-model:value="record[column.prop]"
                    :format="column.format"
                    :startTime="column.startTime"
                    :endTime="column.endTime"
                    :allowClear="column.clearable"
                    :placeholder="column.placeholder"
                    :disabled="column.disabled" />
                </template>
                <template v-else-if="column.jnpfKey === 'organizeSelect'">
                  <jnpf-organize-select
                    v-model:value="record[column.prop]"
                    :placeholder="column.placeholder"
                    :multiple="column.multiple"
                    :allowClear="column.clearable"
                    :disabled="column.disabled"
                    :selectType="column.selectType"
                    :ableIds="column.ableIds" />
                </template>
                <template v-else-if="column.jnpfKey === 'depSelect'">
                  <jnpf-dep-select
                    v-model:value="record[column.prop]"
                    :placeholder="column.placeholder"
                    :multiple="column.multiple"
                    :allowClear="column.clearable"
                    :disabled="column.disabled"
                    :selectType="column.selectType"
                    :ableIds="column.ableIds" />
                </template>
                <template v-else-if="column.jnpfKey === 'roleSelect'">
                  <jnpf-role-select
                    v-model:value="record[column.prop]"
                    :placeholder="column.placeholder"
                    :multiple="column.multiple"
                    :allowClear="column.clearable"
                    :disabled="column.disabled"
                    :selectType="column.selectType"
                    :ableIds="column.ableIds" />
                </template>
                <template v-else-if="column.jnpfKey === 'groupSelect'">
                  <jnpf-group-select
                    v-model:value="record[column.prop]"
                    :placeholder="column.placeholder"
                    :multiple="column.multiple"
                    :allowClear="column.clearable"
                    :disabled="column.disabled"
                    :selectType="column.selectType"
                    :ableIds="column.ableIds" />
                </template>
                <template v-else-if="column.jnpfKey === 'posSelect'">
                  <jnpf-pos-select
                    v-model:value="record[column.prop]"
                    :placeholder="column.placeholder"
                    :multiple="column.multiple"
                    :allowClear="column.clearable"
                    :disabled="column.disabled"
                    :selectType="column.selectType"
                    :ableIds="column.ableIds" />
                </template>
                <template v-else-if="column.jnpfKey === 'userSelect'">
                  <jnpf-user-select
                    v-model:value="record[column.prop]"
                    :placeholder="column.placeholder"
                    :multiple="column.multiple"
                    :allowClear="column.clearable"
                    :disabled="column.disabled"
                    :selectType="['all', 'custom'].includes(column.selectType) ? column.selectType : 'all'"
                    :ableIds="column.ableIds" />
                </template>
                <template v-else-if="column.jnpfKey === 'usersSelect'">
                  <jnpf-users-select
                    v-model:value="record[column.prop]"
                    :placeholder="column.placeholder"
                    :multiple="column.multiple"
                    :allowClear="column.clearable"
                    :disabled="column.disabled"
                    :selectType="column.selectType"
                    :ableIds="column.ableIds" />
                </template>
                <template v-else-if="column.jnpfKey === 'areaSelect'">
                  <jnpf-area-select
                    v-model:value="record[column.prop]"
                    :level="column.level"
                    :placeholder="column.placeholder"
                    :multiple="column.multiple"
                    :allowClear="column.clearable"
                    :disabled="column.disabled" />
                </template>
                <template v-else-if="['select', 'radio', 'checkbox'].includes(column.jnpfKey)">
                  <jnpf-select
                    v-model:value="record[column.prop]"
                    :placeholder="column.placeholder"
                    :multiple="column.multiple || column.jnpfKey === 'checkbox'"
                    :allowClear="column.clearable || ['radio', 'checkbox'].includes(column.jnpfKey)"
                    :showSearch="column.filterable"
                    :disabled="column.disabled"
                    :options="column.options"
                    :fieldNames="column.props" />
                </template>
                <template v-else-if="column.jnpfKey === 'cascader'">
                  <jnpf-cascader
                    v-model:value="record[column.prop]"
                    :placeholder="column.placeholder"
                    :multiple="column.multiple"
                    :allowClear="column.clearable"
                    :showSearch="column.filterable"
                    :disabled="column.disabled"
                    :options="column.options"
                    :fieldNames="column.props"
                    :showAllLevels="column.showAllLevels" />
                </template>
                <template v-else-if="column.jnpfKey === 'treeSelect'">
                  <jnpf-tree-select
                    v-model:value="record[column.prop]"
                    :placeholder="column.placeholder"
                    :multiple="column.multiple"
                    :allowClear="column.clearable"
                    :showSearch="column.filterable"
                    :disabled="column.disabled"
                    :options="column.options"
                    :fieldNames="column.props" />
                </template>
                <template v-else-if="column.jnpfKey === 'relationForm'">
                  <jnpf-relation-form
                    v-model:value="record[column.prop]"
                    :placeholder="column.placeholder"
                    :allowClear="column.clearable"
                    :disabled="column.disabled"
                    :modelId="column.modelId"
                    :columnOptions="column.columnOptions"
                    :relationField="column.relationField"
                    :hasPage="column.hasPage"
                    :pageSize="column.pageSize"
                    :popupType="column.popupType"
                    :popupTitle="column.popupTitle"
                    :popupWidth="column.popupWidth" />
                </template>
                <template v-else-if="column.jnpfKey === 'popupSelect' || column.jnpfKey === 'popupTableSelect'">
                  <jnpf-popup-select
                    v-model:value="record[column.prop]"
                    :placeholder="column.placeholder"
                    :multiple="column.multiple"
                    :allowClear="column.clearable"
                    :disabled="column.disabled"
                    :interfaceId="column.interfaceId"
                    :templateJson="column.templateJson"
                    :columnOptions="column.columnOptions"
                    :propsValue="column.propsValue"
                    :relationField="column.relationField"
                    :hasPage="column.hasPage"
                    :pageSize="column.pageSize"
                    :popupType="column.popupType"
                    :popupTitle="column.popupTitle"
                    :popupWidth="column.popupWidth" />
                </template>
                <template v-else-if="column.jnpfKey === 'autoComplete'">
                  <jnpf-auto-complete
                    v-model:value="record[column.prop]"
                    :placeholder="column.placeholder"
                    :allowClear="column.clearable"
                    :disabled="column.disabled"
                    :interfaceId="column.interfaceId"
                    :relationField="column.relationField"
                    :templateJson="column.templateJson"
                    :total="column.total" />
                </template>
                <template v-else-if="['input', 'textarea'].includes(column.jnpfKey)">
                  <jnpf-input
                    v-model:value="record[column.prop]"
                    :placeholder="column.placeholder"
                    :allowClear="column.clearable"
                    :disabled="column.disabled"
                    :readonly="column.readonly"
                    :prefixIcon="column.prefixIcon"
                    :suffixIcon="column.suffixIcon"
                    :addonBefore="column.addonBefore"
                    :addonAfter="column.addonAfter"
                    :maxlength="column.maxlength"
                    :showCount="column.showCount"
                    :showPassword="column.showPassword" />
                </template>
                <template v-else-if="column.jnpfKey === 'location'">
                  <jnpf-location
                    v-model:value="record[column.prop]"
                    :autoLocation="column.autoLocation"
                    :enableLocationScope="column.enableLocationScope"
                    :adjustmentScope="column.adjustmentScope"
                    :enableDesktopLocation="column.enableDesktopLocation"
                    :locationScope="column.locationScope"
                    :clearable="column.clearable"
                    :disabled="column.disabled" />
                </template>
                <template v-else-if="column.jnpfKey === 'sign'">
                  <jnpf-sign v-model:value="record[column.prop]" :disabled="column.disabled" />
                </template>
                <template v-else-if="column.jnpfKey === 'signature'">
                  <jnpf-signature v-model:value="record[column.prop]" :disabled="column.disabled" />
                </template>
                <template v-else-if="systemComponentsList.includes(column.jnpfKey)">
                  {{ record[column.prop + '_name'] || record[column.prop] }}
                </template>
                <template v-else>
                  {{ record[column.prop] }}
                </template>
              </template>
              <template v-else>
                <template v-if="column.jnpfKey === 'inputNumber'">
                  <jnpf-input-number
                    v-model:value="record[column.prop + '_name']"
                    :precision="column.precision"
                    :thousands="column.thousands"
                    disabled
                    detailed />
                </template>
                <template v-else-if="column.jnpfKey === 'calculate'">
                  <jnpf-calculate
                    v-model:value="record[column.prop + '_name']"
                    :isStorage="column.isStorage"
                    :precision="column.precision"
                    :thousands="column.thousands"
                    detailed />
                </template>
                <template v-else-if="column.jnpfKey === 'sign'">
                  <jnpf-sign v-model:value="record[column.prop + '_name']" detailed />
                </template>
                <template v-else-if="column.jnpfKey === 'signature'">
                  <jnpf-signature v-model:value="record[column.prop + '_name']" detailed />
                </template>
                <template v-else-if="column.jnpfKey === 'rate'">
                  <jnpf-rate v-model:value="record[column.prop + '_name']" :count="column.count" :allowHalf="column.allowHalf" disabled />
                </template>
                <template v-else-if="column.jnpfKey === 'slider'">
                  <jnpf-slider v-model:value="record[column.prop + '_name']" :min="column.min" :max="column.max" :step="column.step" disabled />
                </template>
                <template v-else-if="column.jnpfKey === 'uploadImg'">
                  <jnpf-upload-img v-model:value="record[column.prop + '_name']" disabled detailed simple v-if="record[column.prop]?.length" />
                </template>
                <template v-else-if="column.jnpfKey === 'uploadFile'">
                  <jnpf-upload-file v-model:value="record[column.prop + '_name']" disabled detailed simple v-if="record[column.prop]?.length" />
                </template>
                <template v-else-if="column.jnpfKey === 'input'">
                  <jnpf-input
                    v-model:value="record[column.prop + '_name']"
                    :useMask="column.useMask"
                    :maskConfig="column.maskConfig"
                    :showOverflow="columnData.showOverflow"
                    detailed />
                </template>
                <template v-else-if="column.jnpfKey === 'relationForm'">
                  <p class="link-text" @click="toDetail(column.modelId, record[`${column.prop}_id`])">
                    {{ record[column.prop + '_name'] || record[column.prop] }}
                  </p>
                </template>
                <template v-else>
                  {{ record[column.prop + '_name'] || record[column.prop] }}
                </template>
              </template>
            </template>
            <template v-else>
              <template v-for="(item, index) in childColumnList" v-if="getChildTableStyle !== 2 && childColumnList.length">
                <template v-if="column.id?.includes('-') && item.children && item.children[0] && column.key === item.children[0]?.dataIndex">
                  <ChildTableColumn
                    :data="record[item.prop]"
                    :head="item.children"
                    @toggleExpand="toggleExpand(record, `${item.prop}Expand`)"
                    @toDetail="toDetail"
                    :expand="record[`${item.prop}Expand`]"
                    :showOverflow="columnData.showOverflow"
                    :key="index" />
                </template>
              </template>
              <template v-if="!(record.top || column.id?.includes('-'))">
                <template v-if="column.jnpfKey === 'relationForm'">
                  <p class="link-text" @click="toDetail(column.modelId, record[`${column.prop}_id`])">{{ record[column.prop] }}</p>
                </template>
                <template v-if="column.jnpfKey === 'inputNumber'">
                  <jnpf-input-number v-model:value="record[column.prop]" :precision="column.precision" :thousands="column.thousands" disabled detailed />
                </template>
                <template v-if="column.jnpfKey === 'calculate'">
                  <jnpf-calculate
                    v-model:value="record[column.prop]"
                    :isStorage="column.isStorage"
                    :precision="column.precision"
                    :thousands="column.thousands"
                    detailed />
                </template>
                <template v-if="column.jnpfKey === 'sign'">
                  <jnpf-sign v-model:value="record[column.prop]" detailed />
                </template>
                <template v-if="column.jnpfKey === 'signature'">
                  <jnpf-signature v-model:value="record[column.prop]" detailed />
                </template>
                <template v-if="column.jnpfKey === 'rate'">
                  <jnpf-rate v-model:value="record[column.prop]" :count="column.count" :allowHalf="column.allowHalf" disabled />
                </template>
                <template v-if="column.jnpfKey === 'slider'">
                  <jnpf-slider v-model:value="record[column.prop]" :min="column.min" :max="column.max" :step="column.step" disabled />
                </template>
                <template v-if="column.jnpfKey === 'uploadImg'">
                  <jnpf-upload-img v-model:value="record[column.prop]" disabled detailed simple v-if="record[column.prop]?.length" />
                </template>
                <template v-if="column.jnpfKey === 'uploadFile'">
                  <jnpf-upload-file v-model:value="record[column.prop]" disabled detailed simple v-if="record[column.prop]?.length" />
                </template>
                <template v-if="column.jnpfKey === 'input'">
                  <jnpf-input
                    v-model:value="record[column.prop]"
                    :useMask="column.useMask"
                    :maskConfig="column.maskConfig"
                    :showOverflow="columnData.showOverflow"
                    detailed />
                </template>
              </template>
            </template>
            <template v-if="column.key === 'flowState' && config.enableFlow == 1 && (!record.top || columnData.type == 5)">
              <a-tag color="processing" v-if="record.flowState == 1">等待审核</a-tag>
              <a-tag color="success" v-else-if="record.flowState == 2">审核通过</a-tag>
              <a-tag color="error" v-else-if="record.flowState == 3">审核退回</a-tag>
              <a-tag v-else-if="record.flowState == 4 || record.flowState == 7">流程撤回</a-tag>
              <a-tag v-else-if="record.flowState == 5">审核终止</a-tag>
              <a-tag color="error" v-else-if="record.flowState == 6">已被挂起</a-tag>
              <a-tag color="warning" v-else>等待提交</a-tag>
            </template>
            <template v-if="column.key === 'action' && (!record.top || columnData.type == 5)">
              <TableAction :actions="getTableActions(record, index)" :dropDownActions="getDropDownActions(record, index)" />
            </template>
          </template>
          <template #summary v-if="columnData.showSummary && [1, 2, 4].includes(columnData.type)">
            <a-table-summary fixed>
              <a-table-summary-row>
                <template v-if="getHasBatchBtn">
                  <a-table-summary-cell :index="0" :col-span="2">合计</a-table-summary-cell>
                  <a-table-summary-cell :index="1" :col-span="0"></a-table-summary-cell>
                  <a-table-summary-cell v-for="(item, index) in getColumnSum" :key="index" :index="index + 2" :align="getSummaryCellAlign(index)">
                    {{ item }}
                  </a-table-summary-cell>
                  <a-table-summary-cell :index="getColumnSum.length + 2"></a-table-summary-cell>
                </template>
                <template v-else>
                  <a-table-summary-cell :index="0">合计</a-table-summary-cell>
                  <a-table-summary-cell v-for="(item, index) in getColumnSum" :key="index" :index="index + 1" :align="getSummaryCellAlign(index)">
                    {{ item }}
                  </a-table-summary-cell>
                  <a-table-summary-cell :index="getColumnSum.length + 1"></a-table-summary-cell>
                </template>
              </a-table-summary-row>
            </a-table-summary>
          </template>
        </BasicTable>
      </div>
    </div>
    <Form ref="formRef" @reload="reload" />
    <Detail ref="detailRef" />
    <CandidateModal @register="registerCandidate" @confirm="submitCandidate" />
    <FlowParser @register="registerFlowParser" @reload="reload" />
    <ExportModal @register="registerExportModal" @download="handleDownload" />
    <ImportModal @register="registerImportModal" @reload="reload" />
    <SuperQueryModal @register="registerSuperQueryModal" @superQuery="handleSuperQuery" />
    <CustomForm ref="customFormRef" @reload="reload" />
    <PrintSelect @register="registerPrintSelect" @change="handleShowBrowse" />
    <PrintBrowse @register="registerPrintBrowse" />
    <SelectFlowModal @register="registerSelectFlowModal" @change="selectFlow" />
  </div>
</template>

<script lang="ts" setup>
  import { getModelList, exportModel, delModel, batchDelete, getConfigData, createModel, updateModel, getModelInfo } from '/@/api/onlineDev/visualDev';
  import { create as createFlowForm, update as updateFlowForm } from '/@/api/workFlow/workFlowForm';
  import { getCandidates } from '/@/api/workFlow/flowBefore';
  import { getDataInterfaceRes } from '/@/api/systemData/dataInterface';
  import { getOrgByOrganizeCondition } from '/@/api/permission/organize';
  import { ref, reactive, onMounted, toRefs, computed, unref, nextTick, toRaw, provide } from 'vue';
  import { getFlowList } from '/@/api/workFlow/flowEngine';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useOrganizeStore } from '/@/store/modules/organize';
  import { useUserStore } from '/@/store/modules/user';
  import { useBaseStore } from '/@/store/modules/base';
  import { useModal } from '/@/components/Modal';
  import { usePopup } from '/@/components/Popup';
  import { BasicLeftTree, TreeActionType } from '/@/components/Tree';
  import { BasicForm, useForm } from '/@/components/Form';
  import { BasicTable, useTable, TableAction, ActionItem, TableActionType, SorterResult } from '/@/components/Table';
  import Form from './Form.vue';
  import CustomForm from './CustomForm.vue';
  import Detail from './detail/index.vue';
  import ChildTableColumn from './ChildTableColumn.vue';
  import FlowParser from '/@/views/workFlow/components/FlowParser.vue';
  import CandidateModal from '/@/views/workFlow/components/modal/CandidateModal.vue';
  import { ExportModal, ImportModal, SuperQueryModal, SelectFlowModal } from '/@/components/CommonModal';
  import { downloadByUrl } from '/@/utils/file/download';
  import { useRoute } from 'vue-router';
  import { getScriptFunc, onlineUtils, getDateTimeUnit, getTimeUnit, thousandsFormat, getParamList } from '/@/utils/jnpf';
  import { FilterOutlined } from '@ant-design/icons-vue';
  import { getSearchFormSchemas } from '/@/components/FormGenerator/src/helper/transform';
  import { dyOptionsList, systemComponentsList } from '/@/components/FormGenerator/src/helper/config';
  import { JnpfRelationForm } from '/@/components/Jnpf';
  import { cloneDeep } from 'lodash-es';
  import PrintSelect from '/@/components/PrintDesign/printSelect/index.vue';
  import PrintBrowse from '/@/components/PrintDesign/printBrowse/index.vue';
  import dayjs from 'dayjs';
  import { usePermission } from '/@/hooks/web/usePermission';

  interface State {
    flowList: any[];
    config: any;
    columnData: any;
    formConf: any;
    headerBtnsList: any[];
    columnBtnsList: any[];
    customBtnsList: any[];
    columnOptions: any[];
    treeFieldNames: any;
    leftTreeData: any[];
    leftTreeLoading: boolean;
    treeActiveId: string;
    treeActiveNodePath: any;
    columns: any[];
    complexColumns: any[];
    childColumnList: any[];
    exportList: any[];
    cacheList: any[];
    currFlow: any;
    isCustomCopy: boolean;
    candidateType: number;
    countersignOver: boolean;
    currRow: any;
    workFlowFormData: any;
    expandObj: any;
    columnSettingList: any[];
    searchSchemas: any[];
    treeRelationObj: any;
    treeQueryJson: any;
    leftTreeActiveInfo: any;
    customRow: any;
    customCell: any;
  }

  const props = defineProps(['config', 'modelId', 'isPreview']);
  const route = useRoute();
  const { hasBtnP } = usePermission();
  const { createMessage, createConfirm } = useMessage();
  const { t } = useI18n();
  const organizeStore = useOrganizeStore();
  const userStore = useUserStore();
  const baseStore = useBaseStore();
  const [registerFlowParser, { openPopup: openFlowParser }] = usePopup();
  const [registerExportModal, { openModal: openExportModal, closeModal: closeExportModal, setModalProps: setExportModalProps }] = useModal();
  const [registerImportModal, { openModal: openImportModal }] = useModal();
  const [registerSuperQueryModal, { openModal: openSuperQuery }] = useModal();
  const [registerCandidate, { openModal: openCandidateModal, closeModal: closeCandidateModal }] = useModal();
  const [registerPrintSelect, { openModal: openPrintSelect }] = useModal();
  const [registerPrintBrowse, { openModal: openPrintBrowse }] = useModal();
  const [registerSelectFlowModal, { openModal: openSelectFlowModal }] = useModal();
  const leftTreeRef = ref<Nullable<TreeActionType>>(null);
  const formRef = ref<any>(null);
  const customFormRef = ref<any>(null);
  const tableRef = ref<Nullable<TableActionType>>(null);
  const detailRef = ref<any>(null);
  const searchInfo = reactive({
    modelId: '',
    menuId: '',
    queryJson: '',
    superQueryJson: '',
  });
  const state = reactive<State>({
    flowList: [],
    config: {},
    columnData: {},
    formConf: {},
    headerBtnsList: [],
    columnBtnsList: [],
    customBtnsList: [],
    columnOptions: [],
    treeFieldNames: {
      children: 'children',
      title: 'fullName',
      key: 'id',
      isLeaf: 'isLeaf',
    },
    leftTreeData: [],
    leftTreeLoading: false,
    treeActiveId: '',
    treeActiveNodePath: [],
    columns: [],
    complexColumns: [], // 复杂表头
    childColumnList: [],
    exportList: [],
    cacheList: [],
    currFlow: {},
    isCustomCopy: false,
    candidateType: 1,
    countersignOver: false,
    currRow: {},
    workFlowFormData: {},
    expandObj: {},
    columnSettingList: [],
    searchSchemas: [],
    treeRelationObj: null,
    treeQueryJson: {},
    leftTreeActiveInfo: {},
    customRow: null,
    customCell: null,
  });
  const { columnData, childColumnList, searchSchemas } = toRefs(state);
  const [registerSearchForm, { updateSchema, resetFields, submit: searchFormSubmit }] = useForm({
    baseColProps: { span: 6 },
    showActionButtonGroup: true,
    showAdvancedButton: true,
    compact: true,
  });
  const [
    registerTable,
    {
      reload,
      setLoading,
      insertTableDataRecord,
      updateTableDataRecord,
      deleteTableDataRecord,
      getFetchParams,
      getSelectRowKeys,
      redoHeight,
      clearSelectedRowKeys,
    },
  ] = useTable({
    api: getModelList,
    immediate: false,
    clickToRowSelect: false,
    afterFetch: data => {
      // 行内编辑
      if (state.columnData.type === 4) {
        const list = data.map(o => ({ ...o, rowEdit: false }));
        state.cacheList = cloneDeep(list);
        nextTick(() => {
          if (state.columnData.funcs?.afterOnload) setTableLoadFunc();
        });
        return list;
      }
      let list = data.map(o => ({
        ...o,
        ...state.expandObj,
      }));
      state.cacheList = cloneDeep(list);
      // 分组表格
      if (state.columnData.type === 3) {
        list.map(o => {
          if (o.children && o.children.length) {
            o.children = o.children.map(e => ({
              ...e,
              ...state.expandObj,
            }));
          }
        });
      }
      nextTick(() => {
        if (state.columnData.funcs?.afterOnload) setTableLoadFunc();
      });
      return list;
    },
  });
  const [registerChildTable] = useTable({
    pagination: false,
    canResize: false,
    showTableSetting: false,
  });

  provide('getLeftTreeActiveInfo', () => state.leftTreeActiveInfo);

  const getHasBatchBtn = computed(() => state.headerBtnsList.some(o => ['batchRemove', 'batchPrint', 'download'].includes(o.value)));
  const getLeftTreeBindValue = computed(() => {
    const key = +new Date();
    const data: any = {
      title: state.columnData.treeTitle,
      showSearch: state.columnData.hasTreeQuery && state.columnData.treeSyncType == 0,
      fieldNames: state.treeFieldNames,
      defaultExpandAll: state.columnData.treeSyncType == 0,
      treeData: state.leftTreeData,
      loading: state.leftTreeLoading,
      key,
    };
    if (state.columnData.treeSyncType == 1) data.loadData = onLoadData;
    return data;
  });
  const getPagination = computed(() => {
    if ([3, 5].includes(state.columnData.type) || !state.columnData.hasPage) return false;
    return { pageSize: state.columnData.pageSize };
  });
  const getChildTableStyle = computed(() => (state.columnData.type == 3 || state.columnData.type == 5 ? 1 : state.columnData.childTableStyle));
  const getColumns = computed(() => (unref(getChildTableStyle) == 2 || state.columnData.type == 4 ? state.columns : state.complexColumns));
  const getTableBindValue = computed(() => {
    let columns = unref(getColumns);
    if (state.config.enableFlow) {
      const boo = columns.some(o => o.dataIndex === 'flowState');
      if (!boo) columns.push({ title: '状态', dataIndex: 'flowState', width: 100 });
    }
    const defaultSortConfig = (state.columnData.defaultSortConfig || []).map(o => (o.sort === 'desc' ? '-' : '') + o.field);
    const data: any = {
      pagination: unref(getPagination),
      searchInfo: unref(searchInfo),
      defSort: { sidx: defaultSortConfig.join(',') },
      sortFn: (sortInfo: SorterResult | SorterResult[]) => {
        if (Array.isArray(sortInfo)) {
          const sortList = sortInfo.map(o => (o.order === 'descend' ? '-' : '') + o.field);
          return { sidx: sortList.join(',') };
        } else {
          const { field, order } = sortInfo;
          if (field && order) {
            // 排序字段
            return { sidx: (order === 'descend' ? '-' : '') + field };
          } else {
            return {};
          }
        }
      },
      columns,
      clearSelectOnPageChange: true,
      ellipsis: !!state.columnData.showOverflow,
      isTreeTable: [3, 5].includes(state.columnData.type),
      bordered: (unref(getChildTableStyle) != 2 && !!state.childColumnList?.length) || !!state.columnData.complexHeaderList?.length,
    };
    if (unref(getHasBatchBtn)) {
      const rowSelection: any = { type: 'checkbox' };
      if (state.columnData.type === 3) rowSelection.getCheckboxProps = record => ({ disabled: !!record.top });
      data.rowSelection = rowSelection;
    }
    if (state.columnData.columnBtnsList?.length || state.columnData.customBtnsList?.length) {
      let customWidth = (state.columnData.customBtnsList || []).length ? 50 : 0;
      if (state.columnData.type == 4 && state.config.enableFlow) customWidth += 50;
      let columnBtnsLen = (state.columnData.columnBtnsList || []).length;
      const actionWidth = columnBtnsLen ? columnBtnsLen * 50 + customWidth : customWidth + 20;
      data.actionColumn = {
        width: actionWidth,
        title: '操作',
        dataIndex: 'action',
        fixed: 'right',
      };
    }
    if (state.customRow) data.customRow = state.customRow;
    return data;
  });
  const getSummaryColumn = computed(() => {
    let defaultColumns = unref(getColumns);
    // 处理列固定
    if (state.columnSettingList?.length) {
      for (let i = 0; i < defaultColumns.length; i++) {
        inner: for (let j = 0; j < state.columnSettingList.length; j++) {
          if (defaultColumns[i].dataIndex === state.columnSettingList[j].dataIndex) {
            defaultColumns[i].fixed = state.columnSettingList[j].fixed;
            defaultColumns[i].visible = state.columnSettingList[j].visible;
            break inner;
          }
        }
      }
      defaultColumns = defaultColumns.filter(o => o.visible);
    }
    let columns: any[] = [];
    for (let i = 0; i < defaultColumns.length; i++) {
      const e = defaultColumns[i];
      if (e.jnpfKey === 'table' || e.jnpfKey === 'complexHeader') {
        if (e.children?.length) columns.push(...e.children);
      } else {
        columns.push(e);
      }
      if (e.fixed && e.children?.length) {
        for (let j = 0; j < e.children.length; j++) {
          e.children[j].fixed = e.fixed;
        }
      }
    }
    const leftFixedList = columns.filter(o => o.fixed === 'left');
    const rightFixedList = columns.filter(o => o.fixed === 'right');
    const noFixedList = columns.filter(o => o.fixed !== 'left' && o.fixed !== 'right');
    return [...leftFixedList, ...noFixedList, ...rightFixedList];
  });
  // 列表合计
  const getColumnSum = computed(() => {
    const sums: any[] = [];
    const isSummary = key => state.columnData.summaryField.includes(key);
    const useThousands = key => unref(getSummaryColumn).some(o => o.__vModel__ === key && o.thousands);
    unref(getSummaryColumn).forEach((column, index) => {
      let sumVal = state.cacheList.reduce((sum, d) => sum + getCmpValOfRow(d, column.prop), 0);
      if (!isSummary(column.prop)) sumVal = '';
      sumVal = Number.isNaN(sumVal) ? '' : sumVal;
      const realVal = sumVal && !Number.isInteger(sumVal) ? Number(sumVal).toFixed(2) : sumVal;
      sums[index] = useThousands(column.prop) ? thousandsFormat(realVal) : realVal;
    });
    if ([1, 2].includes(state.columnData.type) && unref(getChildTableStyle) === 2 && state.childColumnList.length) sums.unshift('');
    return sums;
  });

  function getCmpValOfRow(row, key) {
    const isSummary = key => state.columnData.summaryField.includes(key);
    if (!state.columnData.summaryField.length || !isSummary(key)) return 0;
    const target = row[key];
    if (!target) return 0;
    const data = isNaN(target) ? 0 : Number(target);
    return data;
  }
  function getSummaryCellAlign(index) {
    if (!unref(getSummaryColumn).length) return;
    return unref(getSummaryColumn)[index]?.align || 'left';
  }
  function getTableActions(record, index): ActionItem[] {
    const list = state.columnBtnsList.map(o => {
      const item: ActionItem = {
        label: o.label,
        onClick: columnBtnsHandle.bind(null, o.value, record),
      };
      if (o.value === 'remove') item.color = 'error';
      if (state.config.enableFlow) {
        if (o.value === 'edit') item.disabled = [1, 2, 4, 5, 6].includes(record.flowState);
        if (o.value === 'remove') item.disabled = [1, 2, 3, 5, 6].includes(record.flowState);
        if (o.value === 'detail') item.disabled = !record.flowState;
      }
      return item;
    });
    if (record.rowEdit) {
      let editBtnList: ActionItem[] = [
        { label: '保存', onClick: saveForRowEdit.bind(null, record, '1') },
        { label: '取消', color: 'error', onClick: cancelRowEdit.bind(null, record, index) },
      ];
      if (state.config.enableFlow) {
        editBtnList.push({ label: '提交', onClick: submitForRowEdit.bind(null, record) });
      }
      return editBtnList;
    }
    return list;
  }
  function getDropDownActions(record, index): ActionItem[] {
    return state.customBtnsList.map(o => ({
      label: o.label,
      onClick: customBtnsHandle.bind(null, o, record, index),
    }));
  }
  // 获取子流程list
  function getFlowOptions() {
    getFlowList(props.config.flowId, '1').then(res => {
      state.flowList = res.data;
    });
  }
  function selectFlow(item) {
    state.currFlow = item;
    if (state.columnData.type === 4) {
      const flowTemplateJson = item.flowTemplateJson ? JSON.parse(item.flowTemplateJson) : {};
      state.isCustomCopy = (flowTemplateJson.properties && flowTemplateJson.properties.isCustomCopy) || false;
      addHandleForRowEdit();
      return;
    }
    const data = {
      id: '',
      flowId: item.id,
      opType: '-1',
      modelId: props.modelId,
      isPreview: props.isPreview,
    };
    openFlowParser(true, data);
  }
  function handleLeftTreeSelect(id, _node, nodePath) {
    if (props.isPreview) return;
    if (state.treeActiveId == id) return;
    state.treeActiveId = id;
    state.treeActiveNodePath = nodePath;
    let queryJson: any = {};
    let leftTreeActiveInfo: any = {};
    const isMultiple = !state.treeRelationObj ? false : state.treeRelationObj.searchMultiple;
    if (state.treeRelationObj?.jnpfKey && ['organizeSelect', 'cascader', 'areaSelect'].includes(state.treeRelationObj.jnpfKey)) {
      let currValue = [];
      if (state.columnData.treeDataSource === 'formField' && state.treeRelationObj.jnpfKey === 'organizeSelect') {
        currValue = state.treeActiveNodePath[state.treeActiveNodePath.length - 1].organizeIds;
      } else {
        currValue = state.treeActiveNodePath.map(o => o[state.treeFieldNames.key]);
      }
      queryJson = { [state.columnData.treeRelation]: isMultiple ? [currValue] : currValue };
      leftTreeActiveInfo = { [state.columnData.treeRelation]: state.treeRelationObj.multiple ? [currValue] : currValue };
    } else {
      queryJson = { [state.columnData.treeRelation]: isMultiple ? [state.treeActiveId] : state.treeActiveId };
      leftTreeActiveInfo = { [state.columnData.treeRelation]: state.treeRelationObj.multiple ? [state.treeActiveId] : state.treeActiveId };
    }
    state.treeQueryJson = queryJson;
    state.leftTreeActiveInfo = leftTreeActiveInfo;
    state.columnData.searchList?.length ? resetFields() : handleSearchSubmit({});
  }
  // 行内编辑新增
  function addHandleForRowEdit() {
    let item = { rowEdit: true, id: 'jnpfAdd' };
    const userInfo = userStore.getUserInfo;
    const currDate = new Date();
    for (let i = 0; i < state.columnData.columnList.length; i++) {
      let e = state.columnData.columnList[i];
      const config = e.__config__;
      if (config.defaultCurrent) {
        if (config.jnpfKey === 'datePicker') {
          config.defaultValue = dayjs(currDate).startOf(getDateTimeUnit(e.format)).valueOf();
        }
        if (config.jnpfKey === 'timePicker') {
          config.defaultValue = dayjs(currDate).format(e.format || 'HH:mm:ss');
        }
        if (config.jnpfKey === 'organizeSelect' && userInfo.organizeIdList?.length) {
          config.defaultValue = e.multiple ? [userInfo.organizeIdList] : userInfo.organizeIdList;
        }
        if (config.jnpfKey === 'depSelect' && userInfo.departmentId) {
          config.defaultValue = e.multiple ? [userInfo.departmentId] : userInfo.departmentId;
        }
        if (config.jnpfKey === 'userSelect' && userInfo.userId) {
          config.defaultValue = e.multiple ? [userInfo.userId] : userInfo.userId;
        }
        if (config.jnpfKey === 'usersSelect' && userInfo.userId) {
          config.defaultValue = e.multiple ? [userInfo.userId + '--user'] : userInfo.userId + '--user';
        }
        if (config.jnpfKey === 'posSelect' && userInfo.positionIds?.length) {
          config.defaultValue = e.multiple ? userInfo.positionIds.map(o => o.id) : userInfo.positionIds[0].id;
        }
        if (config.jnpfKey === 'roleSelect' && userInfo.roleIds?.length) {
          config.defaultValue = e.multiple ? userInfo.roleIds : userInfo.roleIds[0];
        }
        if (config.jnpfKey === 'groupSelect' && userInfo.groupIds?.length) {
          config.defaultValue = e.multiple ? userInfo.groupIds : userInfo.groupIds[0];
        }
        if (config.jnpfKey === 'sign' && userInfo.signImg) {
          config.defaultValue = userInfo.signImg;
        }
      }
      if (!config.isSubTable) item[e.__vModel__] = config.defaultValue;
    }
    insertTableDataRecord(cloneDeep(item), 0);
  }
  // 新增
  function addHandle() {
    // 带流程新增
    if (state.config.enableFlow == 1) {
      if (!state.flowList.length) return createMessage.error('流程不存在');
      if (state.flowList.length === 1) return selectFlow(state.flowList[0]);
      openSelectFlowModal(true, { flowList: state.flowList });
      return;
    }
    // 行内编辑新增
    if (state.columnData.type === 4) return addHandleForRowEdit();
    const data = {
      id: '',
      formConf: state.formConf,
      modelId: props.modelId,
      isPreview: props.isPreview,
      useFormPermission: state.columnData.useFormPermission,
      showMoreBtn: ![3, 5].includes(state.columnData.type),
      menuId: searchInfo.menuId,
      allList: state.cacheList,
    };
    formRef.value?.init(data);
  }
  // 顶部按钮点击事件
  function headBtnsHandle(key) {
    // 新建
    if (key === 'add') return addHandle();
    // 导出
    if (key == 'download') return openExportModal(true, { columnList: state.exportList, selectIds: getSelectRowKeys() });
    // 导入
    if (key == 'upload') return openImportModal(true, { modelId: props.modelId, enableFlow: state.config.enableFlow, flowList: state.flowList });
    if (props.isPreview) return;
    // 批量删除
    if (key === 'batchRemove') handleBatchRemove();
    // 批量打印
    if (key === 'batchPrint') handleBatchPrint();
  }
  // 导出
  function handleDownload(data) {
    if (props.isPreview) {
      setExportModalProps({ confirmLoading: false });
      createMessage.warning('功能预览不支持数据导出');
      return;
    }
    let query = { ...getFetchParams(), ...data };
    exportModel(props.modelId, query)
      .then(res => {
        setExportModalProps({ confirmLoading: false });
        if (!res.data.url) return;
        downloadByUrl({ url: res.data.url });
        closeExportModal();
      })
      .catch(() => {
        setExportModalProps({ confirmLoading: false });
      });
  }
  // 批量删除
  function handleBatchRemove() {
    const ids = getSelectRowKeys();
    if (!ids.length) return createMessage.error('请选择一条数据');
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: '您确定要删除这些数据吗, 是否继续?',
      onOk: () => {
        batchDelete(props.modelId, ids).then(res => {
          createMessage.success(res.msg);
          clearSelectedRowKeys();
          reload();
        });
      },
    });
  }
  // 批量打印
  function handleBatchPrint() {
    if (state.config.isPreview) return createMessage.warning('功能预览不支持打印');
    if (!state.columnData.printIds?.length) return createMessage.error('未配置打印模板');
    const ids = getSelectRowKeys();
    if (!ids.length) return createMessage.error('请选择一条数据');
    if (state.columnData.printIds?.length === 1) return handleShowBrowse(state.columnData.printIds[0]);
    openPrintSelect(true, state.columnData.printIds);
  }
  function handleShowBrowse(id) {
    openPrintBrowse(true, { id, batchIds: getSelectRowKeys().join() });
  }
  // 行按钮点击事件
  function columnBtnsHandle(key, record) {
    if (key === 'edit') return updateHandle(record);
    if (key === 'detail') return goDetail(record);
    if (key == 'remove') handleDelete(record.id);
  }
  // 编辑
  function updateHandle(record) {
    // 行内编辑
    if (state.columnData.type === 4) return editForRowEdit(record);
    if (state.config.enableFlow == 1) {
      let data = {
        id: record.id,
        flowId: record.flowId || state.flowList[0].id,
        opType: '-1',
        modelId: props.modelId,
        isPreview: props.isPreview,
      };
      openFlowParser(true, data);
    } else {
      const data = {
        id: record.id,
        formConf: state.formConf,
        modelId: props.modelId,
        isPreview: props.isPreview,
        useFormPermission: state.columnData.useFormPermission,
        showMoreBtn: ![3, 5].includes(state.columnData.type),
        menuId: searchInfo.menuId,
        allList: state.cacheList,
      };
      formRef.value?.init(data);
    }
  }
  // 行内编辑
  function editForRowEdit(record) {
    record.rowEdit = true;
    if (state.config.enableFlow != 1) return;
    const flowId = record.flowId || state.flowList[0].id;
    if (!flowId) return;
    const list = state.flowList.filter(o => o.id === flowId);
    state.currFlow = !list.length ? state.flowList[0] : list[0];
    const flowTemplateJson = state.currFlow.flowTemplateJson ? JSON.parse(state.currFlow.flowTemplateJson) : {};
    state.isCustomCopy = (flowTemplateJson.properties && flowTemplateJson.properties.isCustomCopy) || false;
  }
  function cancelRowEdit(record, index) {
    const id = !record.id || record.id === 'jnpfAdd' ? '' : record.id;
    if (!id) return deleteTableDataRecord('jnpfAdd');
    record.rowEdit = false;
    const item = cloneDeep(state.cacheList[index]);
    updateTableDataRecord(item.id, item);
  }
  // 行内编辑保存
  function saveForRowEdit(record, status = '1', candidateData: any = null) {
    if (props.isPreview) return createMessage.warning('功能预览不支持数据保存');
    const id = !record.id || record.id === 'jnpfAdd' ? '' : record.id;
    if (state.config.enableFlow == 1) {
      let query = {
        id,
        status: status || '1',
        candidateType: state.candidateType,
        countersignOver: state.countersignOver,
        formData: record,
        flowId: state.currFlow.id,
        flowUrgent: 1,
      };
      if (candidateData) query = { ...query, ...candidateData };
      const formMethod = query.id ? updateFlowForm : createFlowForm;
      formMethod(query).then(res => {
        createMessage.success(res.msg);
        closeCandidateModal();
        reload({ page: 1 });
      });
    } else {
      const query = { id, data: JSON.stringify(record) };
      const formMethod = query.id ? updateModel : createModel;
      formMethod(props.modelId, query).then(res => {
        createMessage.success(res.msg);
        reload({ page: 1 });
      });
    }
  }
  // 行内编辑提交审核
  function submitForRowEdit(record) {
    if (props.isPreview) return createMessage.warning('功能预览不支持数据保存');
    record.id = !record.id || record.id === 'jnpfAdd' ? '' : record.id;
    state.currRow = record;
    state.workFlowFormData = {
      id: record.id,
      formData: record,
      flowId: state.currFlow.id,
    };
    getCandidates(0, state.workFlowFormData).then(res => {
      const data = res.data;
      state.candidateType = data.type;
      state.countersignOver = !!data.countersignOver;
      if (data.type == 3 && !state.isCustomCopy) {
        createConfirm({
          iconType: 'warning',
          title: '提示',
          content: '您确定要提交当前流程吗, 是否继续?',
          onOk: () => {
            saveForRowEdit(record, '0');
          },
        });
        return;
      }
      let branchList = [];
      let candidateList = [];
      if (data.type == 1) {
        branchList = res.data.list.filter(o => o.isBranchFlow);
        candidateList = res.data.list.filter(o => !o.isBranchFlow && o.isCandidates);
      }
      if (data.type == 2) {
        candidateList = res.data.list.filter(o => o.isCandidates);
      }
      openCandidateModal(true, {
        branchList,
        candidateList,
        isCustomCopy: state.isCustomCopy,
        taskId: state.config.taskId,
        formData: state.workFlowFormData,
      });
    });
  }
  // 选择候选人
  function submitCandidate(data) {
    saveForRowEdit(state.currRow, '0', data);
  }
  // 查看详情
  function goDetail(record) {
    if (state.config.enableFlow == 1) {
      const data = {
        id: record.id,
        flowId: record.flowId || state.flowList[0].id,
        opType: 0,
        modelId: props.modelId,
        isPreview: props.isPreview,
      };
      openFlowParser(true, data);
    } else {
      const data = {
        id: record.id,
        formConf: state.formConf,
        modelId: props.modelId,
        menuId: searchInfo.menuId,
        useFormPermission: state.columnData.useFormPermission,
      };
      detailRef.value?.init(data);
    }
  }
  function handleDelete(id) {
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: t('common.delTip'),
      onOk: () => {
        delModel(props.modelId, id).then(res => {
          createMessage.success(res.msg);
          reload();
        });
      },
    });
  }
  // 行自定义按钮点击事件
  function customBtnsHandle(item, record, index) {
    if (item.event.btnType == 1) handlePopup(item.event, record);
    if (item.event.btnType == 2) handleScriptFunc(item.event, record, index);
    if (item.event.btnType == 3) handleInterface(item.event, record);
  }
  function handlePopup(item, record) {
    const data = {
      ...item,
      recordModelId: props.modelId,
      record: toRaw(record),
      isPreview: props.isPreview,
      webType: state.config.webType,
    };
    customFormRef.value?.init(data);
  }
  function handleScriptFunc(item, record, index) {
    const parameter = { data: record, index, refresh: reload, onlineUtils };
    const func: any = getScriptFunc(item.func);
    if (!func) return;
    func(parameter);
  }
  function handleInterface(item, record) {
    const handlerData = () => {
      getModelInfo(props.modelId, record.id).then(res => {
        const dataForm = res.data || {};
        if (!dataForm.data) return;
        const data = { ...JSON.parse(dataForm.data), id: record.id };
        handlerInterface(data);
      });
    };
    const handlerInterface = data => {
      const query = { paramList: getParamList(item.templateJson, { ...data, id: record.id }) || [] };
      getDataInterfaceRes(item.interfaceId, query).then(res => {
        createMessage.success(res.msg);
        if (item.isRefresh) reload();
      });
    };
    const handleFun = () => {
      state.config.webType == '4' ? handlerInterface(record) : handlerData();
    };
    if (!item.useConfirm) return handleFun();
    createConfirm({
      iconType: 'warning',
      title: t('common.tipTitle'),
      content: item.confirmTitle || '确认执行此操作?',
      onOk: () => {
        handleFun();
      },
    });
  }
  function init() {
    state.config = {
      modelId: props.modelId,
      isPreview: props.isPreview,
      ...props.config,
    };
    searchInfo.modelId = props.modelId;
    searchInfo.menuId = route.meta.modelId as string;
    if (props.isPreview) searchInfo.menuId = '270579315303777093';
    if (!state.config.columnData || (state.config.webType != '4' && !state.config.formData)) return;
    state.columnData = JSON.parse(state.config.columnData);
    if (state.columnData.type === 3) {
      state.columnData.columnList = state.columnData.columnList.filter(o => o.prop != state.columnData.groupField);
    }
    if (state.config.enableFlow == 1 && state.config.flowId) getFlowOptions();
    state.formConf = state.config.formData ? JSON.parse(state.config.formData) : {};
    const customBtnsList = state.columnData.customBtnsList || [];
    const columnBtnsList = state.columnData.columnBtnsList || [];
    getHeaderBtnsList(state.columnData.btnsList || []);
    getColumnBtnsList(columnBtnsList, customBtnsList);
    state.columnOptions = state.columnData.columnOptions || [];
    if (!unref(getPagination)) (searchInfo as any).pageSize = 1000000;
    setLoading(true);
    if (state.columnData.funcs.rowStyle) {
      state.customRow = (record, index) => {
        const data = { row: record, rowIndex: index };
        const func: any = getScriptFunc(state.columnData.funcs.rowStyle);
        const style: any = func ? func(data) : null;
        if (!style) return {};
        return { style };
      };
    }
    if (state.columnData.funcs.cellStyle) {
      state.customCell = (record, rowIndex, column) => {
        const data = { row: record, rowIndex, column, columnIndex: column.key };
        const func: any = getScriptFunc(state.columnData.funcs.cellStyle);
        const style: any = func ? func(data) : null;
        if (!style) return {};
        return { style };
      };
    }
    getSearchSchemas();
    getColumnList();
    if (state.columnData.type == 4) buildOptions();
    if (props.isPreview) return setLoading(false);
    if (state.columnData.type === 2) {
      state.treeFieldNames.key = state.columnData.treePropsValue || 'id';
      state.treeFieldNames.title = state.columnData.treePropsLabel || 'fullName';
      state.treeFieldNames.children = state.columnData.treePropsChildren || 'children';
      getTreeView();
    } else {
      nextTick(() => {
        state.columnData.searchList?.length ? searchFormSubmit() : reload({ page: 1 });
      });
    }
  }
  async function getTreeView() {
    state.leftTreeLoading = true;
    state.leftTreeActiveInfo = {};
    state.treeQueryJson = {};
    state.leftTreeData = [];
    state.treeActiveId = '';
    state.treeActiveNodePath = [];
    let leftTreeData: any[] = [];
    if (state.columnData.treeDataSource === 'dictionary') {
      if (!state.columnData.treeDictionary) return (state.leftTreeLoading = false);
      leftTreeData = await baseStore.getDicDataSelector(state.columnData.treeDictionary);
    }
    if (state.columnData.treeDataSource === 'organize') {
      leftTreeData = await organizeStore.getOrganizeTree();
    }
    if (state.columnData.treeDataSource === 'api') {
      if (!state.columnData.treePropsUrl) return (state.leftTreeLoading = false);
      const query = { paramList: getParamList(state.columnData.treeTemplateJson) || [] };
      const res = await getDataInterfaceRes(state.columnData.treePropsUrl, query);
      leftTreeData = Array.isArray(res.data) ? res.data : [];
    }
    if (state.columnData.treeDataSource === 'formField') {
      const treeRelationObj: any = state.treeRelationObj;
      const jnpfKey = treeRelationObj?.__config__?.jnpfKey || '';
      if (state.columnData.treeRelation && ['organizeSelect', 'depSelect'].includes(jnpfKey)) {
        if (treeRelationObj.selectType === 'all') leftTreeData = await organizeStore.getOrganizeTree();
        if (treeRelationObj.selectType === 'custom' && treeRelationObj.ableIds?.length) {
          const departIds = jnpfKey === 'organizeSelect' ? treeRelationObj.ableIds.map(o => o[o.length - 1]) : treeRelationObj.ableIds;
          const res = await getOrgByOrganizeCondition({ departIds });
          leftTreeData = res.data.list;
        }
      }
    }
    state.leftTreeData = leftTreeData;
    state.leftTreeLoading = false;
    nextTick(() => {
      state.columnData.searchList?.length ? searchFormSubmit() : reload({ page: 1 });
    });
  }
  function getHeaderBtnsList(btnsList) {
    if (props.isPreview || !state.columnData.useBtnPermission) return (state.headerBtnsList = btnsList);
    // 过滤权限
    let btns: any[] = [];
    for (let i = 0; i < btnsList.length; i++) {
      if (hasBtnP('btn_' + btnsList[i].value)) btns.push(btnsList[i]);
    }
    state.headerBtnsList = btns;
  }
  function getColumnBtnsList(columnBtnsList, customBtnsList) {
    if (props.isPreview || !state.columnData.useBtnPermission) {
      state.columnBtnsList = columnBtnsList;
      state.customBtnsList = customBtnsList;
    } else {
      let btns: any[] = [];
      let customBtns: any[] = [];
      // 过滤权限
      const permissionList = userStore.getPermissionList;
      const list = permissionList.filter(o => o.modelId === searchInfo.menuId);
      const perBtnList = list[0] && list[0].button ? list[0].button : [];
      for (let i = 0; i < columnBtnsList.length; i++) {
        inner: for (let j = 0; j < perBtnList.length; j++) {
          if ('btn_' + columnBtnsList[i].value === perBtnList[j].enCode) {
            btns.push(columnBtnsList[i]);
            break inner;
          }
        }
      }
      for (let i = 0; i < customBtnsList.length; i++) {
        inner: for (let j = 0; j < perBtnList.length; j++) {
          if (customBtnsList[i].value === perBtnList[j].enCode) {
            customBtns.push(customBtnsList[i]);
            break inner;
          }
        }
      }
      state.columnBtnsList = btns;
      state.customBtnsList = customBtns;
    }
  }
  function getSearchSchemas() {
    if (state.columnData.treeRelation) {
      for (let i = 0; i < state.columnData.columnOptions.length; i++) {
        const e = state.columnData.columnOptions[i];
        if (e.id === state.columnData.treeRelation) {
          state.treeRelationObj = { ...e, searchMultiple: false, jnpfKey: e.__config__.jnpfKey };
          break;
        }
      }
    }
    const schemas = getSearchFormSchemas(state.columnData.searchList);
    schemas.forEach(cur => {
      const config = cur.__config__;
      if (dyOptionsList.includes(config.jnpfKey)) {
        if (config.dataType === 'dictionary' && config.dictionaryType) {
          baseStore.getDicDataSelector(config.dictionaryType).then(res => {
            updateSchema([{ field: cur.field, componentProps: { options: res } }]);
          });
        }
        if (config.dataType === 'dynamic' && config.propsUrl) {
          const query = { paramList: config.templateJson || [] };
          getDataInterfaceRes(config.propsUrl, query).then(res => {
            const data = Array.isArray(res.data) ? res.data : [];
            updateSchema([{ field: cur.field, componentProps: { options: data } }]);
          });
        }
      }
      if ((Array.isArray(cur.value) && cur.value.length) || cur.value || cur.value === 0 || cur.value === false) cur.defaultValue = cur.value;
    });
    state.searchSchemas = schemas;
  }
  function getColumnList() {
    let columnList: any[] = [];
    if (props.isPreview || !state.columnData.useColumnPermission) {
      columnList = state.columnData.columnList;
    } else {
      // 过滤权限
      const permissionList = userStore.getPermissionList;
      const list = permissionList.filter(o => o.modelId === searchInfo.menuId);
      const perColumnList = list[0] && list[0].column ? list[0].column : [];
      for (let i = 0; i < state.columnData.columnList.length; i++) {
        inner: for (let j = 0; j < perColumnList.length; j++) {
          if (state.columnData.columnList[i].prop === perColumnList[j].enCode) {
            columnList.push(state.columnData.columnList[i]);
            break inner;
          }
        }
      }
    }
    let columns = columnList.map(o => ({
      ...o,
      title: o.label,
      dataIndex: o.prop,
      align: o.align,
      fixed: o.fixed == 'none' ? false : o.fixed,
      sorter: o.sortable ? { multiple: 1 } : o.sortable,
      width: o.width || 100,
      customCell: state.customCell || null,
    }));
    if (state.columnData.type !== 3 && state.columnData.type !== 5) columns = getComplexColumns(columns);
    state.columns = columns.filter(o => o.prop.indexOf('-') < 0);
    if (state.columnData.type == 4) buildRowRelation();
    getChildComplexColumns(columns);
  }
  function getComplexColumns(columns) {
    let complexHeaderList: any[] = state.columnData.complexHeaderList || [];
    if (!complexHeaderList.length) return columns;
    let childColumns: any[] = [];
    let firstChildColumns: string[] = [];
    for (let i = 0; i < complexHeaderList.length; i++) {
      const e = complexHeaderList[i];
      e.title = e.fullName;
      e.align = e.align;
      e.dataIndex = e.id;
      e.prop = e.id;
      e.children = [];
      e.jnpfKey = 'complexHeader';
      if (e.childColumns?.length) {
        childColumns.push(...e.childColumns);
        for (let k = 0; k < e.childColumns.length; k++) {
          const item = e.childColumns[k];
          for (let j = 0; j < columns.length; j++) {
            const o = columns[j];
            if (o.prop == item && o.fixed !== 'left' && o.fixed !== 'right') e.children.push({ ...o });
          }
        }
      }
      if (e.children.length) firstChildColumns.push(e.children[0].prop);
    }
    complexHeaderList = complexHeaderList.filter(o => o.children.length);
    let list: any[] = [];
    for (let i = 0; i < columns.length; i++) {
      const e = columns[i];
      if (!childColumns.includes(e.prop)) {
        list.push(e);
      } else {
        if (firstChildColumns.includes(e.prop)) {
          const item = complexHeaderList.find(o => o.childColumns.includes(e.prop));
          list.push(item);
        }
      }
    }
    return list;
  }
  function getChildComplexColumns(columnList) {
    let list: any[] = [];
    for (let i = 0; i < columnList.length; i++) {
      const e = columnList[i];
      if (!e.prop.includes('-')) {
        list.push(e);
      } else {
        let prop = e.prop.split('-')[0];
        let vModel = e.prop.split('-')[1];
        let label = e.label.split('-')[0];
        let childLabel = e.label.replace(label + '-', '');
        let newItem = {
          align: 'center',
          jnpfKey: 'table',
          prop,
          label,
          title: label,
          dataIndex: prop,
          children: [],
          customCell: state.customCell || null,
        };
        e.dataIndex = vModel;
        e.title = childLabel;
        if (!state.expandObj.hasOwnProperty(`${prop}Expand`)) state.expandObj[`${prop}Expand`] = false;
        if (!list.some(o => o.prop === prop)) list.push(newItem);
        for (let i = 0; i < list.length; i++) {
          if (list[i].prop === prop) {
            list[i].children.push(e);
            break;
          }
        }
      }
    }
    if (unref(getChildTableStyle) != 2) getMergeList(list);
    getExportList(list);
    state.complexColumns = list;
    state.childColumnList = list.filter(o => o.jnpfKey === 'table');
    // 子表分组展示宽度取100
    if (unref(getChildTableStyle) !== 2) {
      for (let i = 0; i < state.childColumnList.length; i++) {
        const e = state.childColumnList[i];
        if (e.children?.length) e.children = e.children.map(o => ({ ...o, width: 100 }));
      }
    }
  }
  function getMergeList(list) {
    list.forEach(item => {
      if (item.jnpfKey === 'table' && item.children && item.children.length) {
        item.children.forEach((child, index) => {
          if (index == 0) {
            child.customCell = (record, rowIndex, column) => ({
              ...(state.customCell ? state.customCell(record, rowIndex, column) : {}),
              ...{
                rowspan: 1,
                colspan: item.children.length,
                class: 'child-table-box',
              },
            });
          } else {
            child.customCell = () => ({
              rowspan: 0,
              colspan: 0,
            });
          }
        });
      }
    });
  }
  function getExportList(list) {
    let exportList: any[] = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].jnpfKey === 'table') {
        if (state.columnData.type != 4) exportList.push(...list[i].children);
      } else if (list[i].jnpfKey === 'complexHeader') {
        exportList.push(...list[i].children);
      } else {
        exportList.push(list[i]);
      }
    }
    state.exportList = exportList;
  }
  function setTableLoadFunc() {
    const parameter = { data: state.cacheList, tableRef: tableRef.value, onlineUtils };
    const func: any = getScriptFunc(state.columnData.funcs.afterOnload);
    if (!func) return;
    func(parameter);
  }
  function toggleExpand(row, field) {
    row[field] = !row[field];
  }
  // 关联表单查看详情
  function toDetail(modelId, id) {
    if (!id) return;
    getConfigData(modelId).then(res => {
      if (!res.data || !res.data.formData) return;
      const formConf = JSON.parse(res.data.formData);
      formConf.popupType = 'general';
      const data = { id, formConf, modelId };
      detailRef.value?.init(data);
    });
  }
  function handleColumnChange(data) {
    state.columnSettingList = data;
  }
  // 左侧树异步加载
  function onLoadData(node) {
    return new Promise((resolve: (value?: unknown) => void) => {
      if (!state.columnData.treeSyncInterfaceId) return resolve();
      if (state.columnData.treeSyncTemplateJson?.length) {
        for (let i = 0; i < state.columnData.treeSyncTemplateJson.length; i++) {
          const e = state.columnData.treeSyncTemplateJson[i];
          e.defaultValue = node[e.relationField] || '';
        }
      }
      const query = { paramList: getParamList(state.columnData.treeSyncTemplateJson) || [] };
      getDataInterfaceRes(state.columnData.treeSyncInterfaceId, query).then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        leftTreeRef.value?.updateNodeByKey(node.eventKey, { children: data, isLeaf: !data.length });
        resolve();
      });
    });
  }
  // 高级查询
  function handleSuperQuery(superQueryJson) {
    if (props.isPreview) return;
    searchInfo.superQueryJson = superQueryJson;
    reload({ page: 1 });
  }
  function handleSearchSubmit(data) {
    clearSelectedRowKeys();
    let obj = {};
    for (let [key, value] of Object.entries(data)) {
      if (value || value === 0 || value === false) {
        if (Array.isArray(value)) {
          if (value.length) obj[key] = value;
        } else {
          obj[key] = value;
        }
      }
    }
    obj = { ...obj, ...(state.treeQueryJson || {}) };
    searchInfo.queryJson = JSON.stringify(obj) === '{}' ? '' : JSON.stringify(obj);
    reload({ page: 1 });
  }
  function handleSearchReset() {
    searchFormSubmit();
  }
  function handleRowForm(record) {
    let fields: any[] = [];
    for (let i = 0; i < unref(getColumns).length; i++) {
      const e = unref(getColumns)[i];
      if (e.children?.length) {
        for (let j = 0; j < e.children.length; j++) {
          const o = e.children[j];
          o.__config__.span = 24;
          o.__config__.label = o.label;
          fields.push(toRaw(o));
        }
      } else {
        e.__config__.span = 24;
        e.__config__.label = e.label;
        fields.push(toRaw(e));
      }
    }
    fields = fields.map(o => {
      if (o.__config__?.templateJson && o.__config__?.templateJson.length) {
        o.__config__.templateJson = o.__config__.templateJson.map(o => ({ ...o, relationField: '' }));
      }
      if (o.templateJson && o.templateJson.length) {
        o.templateJson = o.templateJson.map(o => ({ ...o, relationField: '' }));
      }
      return o;
    });
    const formConf = { ...state.formConf, fields, popupType: 'general' };
    const data = {
      id: record.id,
      formConf,
      modelId: props.modelId,
      isPreview: props.isPreview,
      useFormPermission: state.columnData.useFormPermission,
      showMoreBtn: false,
      menuId: searchInfo.menuId,
      allList: state.cacheList,
      formData: record,
    };
    formRef.value?.init(data);
  }
  // 行内编辑获取选项
  function buildOptions() {
    const loop = list => {
      for (let i = 0; i < list.length; i++) {
        const cur = list[i];
        if (cur.children?.length) loop(cur.children);
        const config = cur.__config__;
        if (!config) continue;
        if (dyOptionsList.includes(config.jnpfKey)) {
          if (config.dataType === 'dictionary' && config.dictionaryType) {
            cur.options = [];
            baseStore.getDicDataSelector(config.dictionaryType).then(res => {
              cur.options = res;
            });
          }
          if (config.dataType === 'dynamic' && config.propsUrl) {
            cur.options = [];
            const query = { paramList: config.templateJson || [] };
            getDataInterfaceRes(config.propsUrl, query).then(res => {
              cur.options = Array.isArray(res.data) ? res.data : [];
            });
          }
        }
      }
    };
    loop(state.columns);
  }
  function buildRowRelation() {
    const loop = list => {
      for (let i = 0; i < list.length; i++) {
        let cur = list[i];
        if (cur.children?.length) loop(cur.children);
        const config = cur?.__config__;
        if (!config) continue;
        if (config.jnpfKey === 'datePicker') {
          if (config.startTimeRule) {
            if (config.startTimeType == 1) cur.startTime = config.startTimeValue;
            if (config.startTimeType == 3) cur.startTime = new Date().getTime();
            if (config.startTimeType == 4 || config.startTimeType == 5) {
              const type = getTimeUnit(config.startTimeTarget);
              const method = config.startTimeType == 4 ? 'subtract' : 'add';
              const startTime = dayjs()[method](config.startTimeValue, type);
              let realStartTime = startTime.startOf('day').valueOf();
              if (config.startTimeTarget == 4) realStartTime = startTime.startOf('minute').valueOf();
              if (config.startTimeTarget == 5) realStartTime = startTime.startOf('second').valueOf();
              if (config.startTimeTarget == 6) realStartTime = startTime.valueOf();
              cur.startTime = realStartTime;
            }
          }
          if (config.endTimeRule) {
            if (config.endTimeType == 1) cur.endTime = config.endTimeValue;
            if (config.endTimeType == 3) cur.endTime = new Date().getTime();
            if (config.endTimeType == 4 || config.endTimeType == 5) {
              const type = getTimeUnit(config.endTimeTarget);
              const method = config.endTimeType == 4 ? 'subtract' : 'add';
              const endTime = dayjs()[method](config.endTimeValue, type);
              let realEndTime = endTime.endOf('day').valueOf();
              if (config.endTimeTarget == 4) realEndTime = endTime.endOf('minute').valueOf();
              if (config.endTimeTarget == 5) realEndTime = endTime.endOf('second').valueOf();
              if (config.endTimeTarget == 6) realEndTime = endTime.valueOf();
              cur.endTime = realEndTime;
            }
          }
        }
        if (config.jnpfKey === 'timePicker') {
          if (config.startTimeRule) {
            if (config.startTimeType == 1) cur.startTime = config.startTimeValue || null;
            if (config.startTimeType == 3) cur.startTime = dayjs().format(cur.format);
            if (config.startTimeType == 4 || config.startTimeType == 5) {
              const type = getTimeUnit(config.startTimeTarget + 3);
              const method = config.startTimeType == 4 ? 'subtract' : 'add';
              const startTime = dayjs()[method](config.startTimeValue, type).format(cur.format);
              cur.startTime = startTime;
            }
          }
          if (config.endTimeRule) {
            if (config.endTimeType == 1) cur.endTime = config.endTimeValue || null;
            if (config.endTimeType == 3) cur.endTime = dayjs().format(cur.format);
            if (config.endTimeType == 4 || config.endTimeType == 5) {
              const type = getTimeUnit(config.endTimeTarget + 3);
              const method = config.endTimeType == 4 ? 'subtract' : 'add';
              const endTime = dayjs()[method](config.endTimeValue, type).format(cur.format);
              cur.endTime = endTime;
            }
          }
        }
      }
    };
    loop(state.columns);
  }

  onMounted(() => {
    init();
  });
</script>
