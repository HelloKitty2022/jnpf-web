import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/permission/Authority',
}

// 获取岗位/角色/用户权限树形结构及数据
export function getAuthorizeValues(objectId, data) {
  return defHttp.post({ url: Api.Prefix + `/Data/${objectId}/Values`, data });
}
// 更新岗位/角色/用户权限
export function updateAuthorizeList(objectId, data) {
  return defHttp.put({ url: Api.Prefix + `/Data/${objectId}`, data });
}
// 批量设置权限
export function updateBatchAuthorize(data) {
  return defHttp.post({ url: Api.Prefix + `/Data/Batch`, data });
}
// 获取功能权限数据
export function getModelData(id, ObjectType) {
  return defHttp.get({ url: Api.Prefix + `/Model/${id}/${ObjectType}` });
}
// 设置/更新功能权限
export function setModelData(id, data) {
  return defHttp.put({ url: Api.Prefix + `/Model/${id}`, data });
}
// 获取门户权限树形结构及数据
export function getPortalAuthorizeValues(objectId) {
  return defHttp.get({ url: Api.Prefix + `/Portal/${objectId}` });
}
// 更新门户权限
export function updatePortalAuthorizeList(objectId, data) {
  return defHttp.post({ url: Api.Prefix + `/Portal/${objectId}`, data });
}
