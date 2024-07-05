import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/workflow/Engine/FlowBefore',
}

// 获取待我审核
export function getFlowBeforeList(data) {
  return defHttp.get({ url: Api.Prefix + `/List/${data.category}`, data });
}
// 获取待我审批信息
export function getFlowBeforeInfo(id, data) {
  return defHttp.get({ url: Api.Prefix + `/${id}`, data });
}
// 待我审核审核
export function audit(id, data) {
  return defHttp.post({ url: Api.Prefix + `/Audit/${id}`, data });
}
// 待我审核退回
export function saveAudit(id, data) {
  return defHttp.post({ url: Api.Prefix + `/SaveAudit/${id}`, data });
}
// 待我审核退回
export function reject(id, data) {
  return defHttp.post({ url: Api.Prefix + `/Reject/${id}`, data });
}
// 撤回审核
export function recall(id, data) {
  return defHttp.post({ url: Api.Prefix + `/Recall/${id}`, data });
}
// 终止审核
export function cancel(id, data) {
  return defHttp.post({ url: Api.Prefix + `/Cancel/${id}`, data });
}
// 待我审核转审
export function transfer(id, data) {
  return defHttp.post({ url: Api.Prefix + `/Transfer/${id}`, data });
}
// 流程监控指派
export function assign(id, data) {
  return defHttp.post({ url: Api.Prefix + `/Assign/${id}`, data });
}
// 获取流程复活和变更节点下拉数据
export function getResurgenceList(id) {
  return defHttp.get({ url: Api.Prefix + `/Selector/${id}` });
}
// 流程复活和变更提交
export function resurgence(data) {
  return defHttp.post({ url: Api.Prefix + `/Change`, data });
}
// 获取审批汇总
export function getRecordList(id, data) {
  return defHttp.get({ url: Api.Prefix + `/RecordList/${id}`, data });
}
// 判断是否有候选人
export function getCandidates(id, data) {
  return defHttp.post({ url: Api.Prefix + `/Candidates/${id}`, data });
}
// 获取候选人列表（分页）
export function getCandidateUser(id, data) {
  return defHttp.post({ url: Api.Prefix + `/CandidateUser/${id}`, data });
}
// 批量通过、退回、转审  batchType 0-通过 1-退回 2-转审
export function batchOperation(data) {
  return defHttp.post({ url: Api.Prefix + `/BatchOperation`, data });
}
// 获取批量审批候选人
export function getBatchCandidate(data) {
  return defHttp.get({ url: Api.Prefix + `/BatchCandidate`, data });
}
// 获取审批汇总
export function getBatchFlowSelector() {
  return defHttp.get({ url: Api.Prefix + `/BatchFlowSelector` });
}
// 获取批量审批流程（小id）
export function getBatchFlowJsonList(id) {
  return defHttp.get({ url: Api.Prefix + `/BatchFlowJsonList/${id}` });
}
// 获取流程节点列表
export function getNodeSelector(id) {
  return defHttp.get({ url: Api.Prefix + `/NodeSelector/${id}` });
}
// 判断是否有查看权限(消息通知用)
export function checkInfo(taskOperatorId) {
  return defHttp.get({ url: Api.Prefix + `/${taskOperatorId}/Info` });
}
// 获取退回下拉接口
export function getRejectList(id) {
  return defHttp.get({ url: Api.Prefix + `/RejectList/${id}` });
}
// 加签
export function freeApprover(id, data) {
  return defHttp.post({ url: Api.Prefix + `/freeApprover/${id}`, data });
}
// 获取挂起类型
export function getSuspendType(id) {
  return defHttp.get({ url: Api.Prefix + `/Suspend/${id}` });
}
// 挂起流程
export function suspend(data) {
  return defHttp.post({ url: Api.Prefix + `/Suspend/${data.id}`, data });
}
// 恢复流程
export function restore(id) {
  return defHttp.post({ url: Api.Prefix + `/Restore/${id}` });
}
// 查看子流程
export function getSubFlowInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/SubFlowInfo/${id}` });
}
