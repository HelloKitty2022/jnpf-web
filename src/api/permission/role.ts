import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/permission/Role',
}

// 获取角色列表
export function getRoleList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取角色下拉框列表
export function getRoleSelector() {
  return defHttp.get({ url: Api.Prefix + `/Selector` });
}
// 获取角色下拉框列表(带权限)
export function getRoleSelectorByPermission() {
  return defHttp.get({ url: Api.Prefix + `/SelectorByPermission` });
}
// 新建角色
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改角色
export function update(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取角色
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除角色
export function delRole(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 通过组织id获取角色列表
export function getRoleByOrganize(organizeIds) {
  return defHttp.post({ url: Api.Prefix + `/getListByOrgIds`, data: { organizeIds } });
}
// 获取选中角色基本信息
export function getRoleByCondition(data) {
  return defHttp.post({ url: Api.Prefix + `/RoleCondition`, data });
}
