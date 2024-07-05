import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/workflow/Engine/FlowMonitor',
}

// 获取列表
export function getFlowMonitorList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 批量删除流程监控
export function delMonitorList(data) {
  return defHttp.delete({ url: Api.Prefix, data });
}
//事件日志
export function getLogList(data) {
  return defHttp.get({ url: Api.Prefix + `/${data.id}/EventLog` });
}
