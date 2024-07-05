import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/System',
}

// 获取应用列表
export function getSystemList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 新建应用
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改应用
export function update(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取应用
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除应用
export function delSystem(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
