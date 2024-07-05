import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/permission/UserRelation',
}

// 获取岗位/角色成员列表
export function getUserRelationList(objectId) {
  return defHttp.get({ url: Api.Prefix + `/${objectId}` });
}
// 添加/更新岗位或角色成员
export function createUserRelation(data) {
  return defHttp.post({ url: Api.Prefix + `/${data.objectId}`, data });
}
