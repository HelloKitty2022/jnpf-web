import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/permission/PermissionGroup',
}

//获取权限列表
export function getList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取权限信息
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}` });
}
// 删除权限
export function del(id) {
  return defHttp.delete({ url: Api.Prefix + `/${id}` });
}
// 修改权限
export function update(data) {
  return defHttp.put({ url: Api.Prefix + `/${data.id}`, data });
}
// 新建权限
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 复制权限
export function copy(id) {
  return defHttp.post({ url: Api.Prefix + `/${id}/Actions/Copy` });
}
//获取权限成员
export function getPermissionMember(id) {
  return defHttp.get({ url: Api.Prefix + `/PermissionMember/${id}` });
}
//保存权限成员
export function savePermissionMember(data) {
  return defHttp.post({ url: Api.Prefix + `/PermissionMember/${data.id}`, data });
}
//获取权限组下拉
export function getPermissionSelector() {
  return defHttp.get({ url: Api.Prefix + `/Selector` });
}
// 查看权限组
export function getPermissionGroup(data) {
  return defHttp.get({ url: Api.Prefix + `/getPermissionGroup`, data });
}
// 通过权限组id获取相关权限
export function getPermissionInfo(data) {
  return defHttp.get({ url: Api.Prefix + `/getPermission`, data });
}
