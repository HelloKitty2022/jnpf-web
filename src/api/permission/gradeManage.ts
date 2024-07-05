import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/permission/organizeAdminIsTrator',
}

// 获取分级管理员列表
export function getGradeManageList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取分级管理员下拉框列表
export function getSelectorOrgList(userId) {
  return defHttp.get({ url: Api.Prefix + `/Selector?userId=${userId}` });
}
// 新建分级管理员
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 删除分级管理员
export function delGradeManage(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
