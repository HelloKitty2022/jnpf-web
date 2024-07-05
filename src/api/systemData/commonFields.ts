import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/CommonFields',
}

// 获取字段列表
export function getCommonFieldsList(data = {}) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 新建字段
export function createCommonFields(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改字段
export function updateCommonFields(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取字段
export function getCommonFieldsInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除字段
export function delCommonFields(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
