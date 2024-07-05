import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/message/MessageMonitor',
}

// 获取消息监控列表
export function getMsgMonitorList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取详情
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/detail/' + id });
}
// 批量删除
export function delMsgMonitor(data) {
  return defHttp.delete({ url: Api.Prefix + '/batchRemove', data });
}
// 一键清空
export function emptyMsgMonitor() {
  return defHttp.delete({ url: Api.Prefix + '/empty' });
}
