import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/ModuleDataAuthorizeScheme',
  FieldPrefix = '/api/system/ModuleDataAuthorize',
}

// 获取方案管理列表
export function getDataAuthorizeSchemeList(data) {
  return defHttp.get({ url: Api.Prefix + `/${data.moduleId}/List` });
}
// 新建方案
export function createScheme(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 更新方案
export function updateScheme(data) {
  return defHttp.put({ url: Api.Prefix + `/${data.id}`, data });
}
// 获取方案
export function getSchemeInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}` });
}
// 删除方案
export function delScheme(id) {
  return defHttp.delete({ url: Api.Prefix + `/${id}` });
}
// 获取字段列表
export function getDataAuthorizeList(data) {
  return defHttp.get({ url: Api.FieldPrefix + `/${data.moduleId}/List` });
}
// 新建字段
export function createField(data) {
  return defHttp.post({ url: Api.FieldPrefix, data });
}
// 更新字段
export function updateField(data) {
  return defHttp.put({ url: Api.FieldPrefix + `/${data.id}`, data });
}
// 获取字段
export function getFieldInfo(id) {
  return defHttp.get({ url: Api.FieldPrefix + `/${id}` });
}
// 删除字段
export function delField(id) {
  return defHttp.delete({ url: Api.FieldPrefix + `/${id}` });
}
