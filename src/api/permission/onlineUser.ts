import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/OnlineUser',
}

// 获取在线用户列表
export function getOnlineUser(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 批量强制下线
export function batchDelOnlineUser(ids) {
  return defHttp.delete({ url: Api.Prefix, data: { ids } });
}
// 强制下线
export function deleteOnlineUser(id) {
  return defHttp.delete({ url: Api.Prefix + `/${id}` });
}
