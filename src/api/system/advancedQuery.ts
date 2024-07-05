import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/AdvancedQuery',
}

// 获取方案列表
export function getAdvancedQueryList(moduleId) {
  return defHttp.get({ url: Api.Prefix + `/${moduleId}/List` });
}
// 新建方案
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改方案
export function update(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取方案
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除方案
export function delAdvancedQuery(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
