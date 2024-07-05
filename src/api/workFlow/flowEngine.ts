import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/workflow/Engine/flowTemplate',
  CommentPrefix = '/api/workflow/Engine/FlowComment',
}

// 获取流程引擎列表(分页)
export function getFlowEngineList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 新建流程引擎
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改流程引擎
export function update(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取流程引擎
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除流程引擎
export function delFlowEngine(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 复制流程引擎
export function copy(id) {
  return defHttp.post({ url: Api.Prefix + `/${id}/Actions/Copy` });
}
// 导出
export function exportData(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}/Actions/Export` });
}
// 发布流程引擎
export function release(id) {
  return defHttp.post({ url: Api.Prefix + `/Release/${id}` });
}
// 停止流程引擎
export function stop(id) {
  return defHttp.post({ url: Api.Prefix + `/Stop/${id}` });
}
// 通过流程enCode获取流程id
export function getFlowIdByCode(enCode) {
  return defHttp.get({ url: Api.Prefix + `/getFlowIdByCode/${enCode}` });
}
// 列表ListAll
export function getFlowEngineListAll() {
  return defHttp.get({ url: Api.Prefix + `/ListAll` });
}
// 列表ListAll(分页)
export function getFlowEnginePageList(data) {
  return defHttp.get({ url: Api.Prefix + `/PageListAll`, data });
}
// 列表流程小idListAll
export function getFlowEnginePageChildList(data) {
  return defHttp.get({ url: Api.Prefix + `/PageChildListAll`, data });
}
// 流程引擎下拉框
export function getFlowEngineSelector(type) {
  return defHttp.get({ url: Api.Prefix + `/Selector`, data: { type } });
}
// 获取流程发起节点表单信息
export function getFlowFormInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}/FormInfo` });
}
// 流程版本列表
export function getFlowJsonList(data) {
  return defHttp.get({ url: Api.Prefix + `/${data.templateId}/FlowJsonList`, data });
}
// 设置主版本
export function setMainVersion(id) {
  return defHttp.post({ url: Api.Prefix + `/${id}/MainVersion` });
}
// 删除流程版本
export function delVersion(id) {
  return defHttp.delete({ url: Api.Prefix + `/${id}/FlowJson` });
}
// 获取多流程流程列表
export function getFlowList(id, type = '') {
  return defHttp.get({ url: Api.Prefix + `/FlowJsonList/${id}`, data: { type } });
}
// 委托可选全部流程
export function getFlowEngineForEntrust(data) {
  return defHttp.get({ url: Api.Prefix + `/getflowAll`, data });
}
// 委托 通过list<flowId>获取流程引擎列表
export function getFlowEngineListByIds(data) {
  return defHttp.post({ url: Api.Prefix + `/getflowList`, data });
}
// 设置流程协管
export function assist(data) {
  return defHttp.post({ url: Api.Prefix + `/assist`, data });
}
// 获取协管列表
export function getAssistList(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}/assistList` });
}
//所属流程列表(树形)
export function getTreeList() {
  return defHttp.get({ url: Api.Prefix + '/TreeList' });
}
// 获取流程评论列表
export function getCommentList(data) {
  return defHttp.get({ url: Api.CommentPrefix, data });
}
// 新建流程评论
export function createComment(data) {
  return defHttp.post({ url: Api.CommentPrefix, data });
}
// 删除流程评论
export function delComment(id) {
  return defHttp.delete({ url: Api.CommentPrefix + '/' + id });
}
