import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/visualdev/Integrate',
  TaskPrefix = '/api/visualdev/IntegrateTask',
  WebhookPrefix = '/api/visualdev/Hooks',
}

// 获取集成助手列表
export function getIntegrateList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取集成助手信息
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}` });
}
// 删除集成助手
export function delIntegrate(id) {
  return defHttp.delete({ url: Api.Prefix + `/${id}` });
}
// 修改集成助手
export function update(data) {
  return defHttp.put({ url: Api.Prefix + `/${data.id}`, data });
}
// 新建集成助手
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 复制集成助手
export function copy(id) {
  return defHttp.post({ url: Api.Prefix + `/${id}/Actions/Copy` });
}
// 导出集成助手
export function exportData(id) {
  return defHttp.post({ url: Api.Prefix + `/${id}/Actions/Export` });
}
// 更新用户状态
export function updateState(id) {
  return defHttp.put({ url: Api.Prefix + `/${id}/Actions/State` });
}
// 获取执行列表
export function getQueueList(data) {
  return defHttp.get({ url: Api.TaskPrefix + '/queueList', data });
}
// 获取日志列表
export function getTaskList(data) {
  return defHttp.get({ url: Api.TaskPrefix, data });
}
// 删除日志
export function delTask(id) {
  return defHttp.delete({ url: Api.TaskPrefix + `/${id}` });
}
// 重试日志
export function retryTask(id) {
  return defHttp.put({ url: Api.TaskPrefix + `/${id}/retry` });
}
// 日志详情
export function getTaskInfo(id) {
  return defHttp.get({ url: Api.TaskPrefix + `/${id}` });
}
// 节点重试
export function nodeRetryTask(data) {
  return defHttp.get({ url: Api.TaskPrefix + `/${data.id}/nodeRetry`, data });
}
// 获取webhookUrl
export function getWebhookUrl(id) {
  return defHttp.get({ url: Api.WebhookPrefix + `/getUrl`, data: { id } });
}
// 获取webhook字段
export function getWebhookParams(randomStr) {
  return defHttp.get({ url: Api.WebhookPrefix + `/getParams/${randomStr}` });
}
// webhook开启接收请求
export function webhookStart(id, randomStr) {
  return defHttp.get({ url: Api.WebhookPrefix + `/${id}/start/${randomStr}` });
}
