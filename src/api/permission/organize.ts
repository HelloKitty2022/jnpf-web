import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/permission/Organize',
  TratorPrefix = '/api/permission/organizeAdminIsTrator',
  DepartmentPrefix = '/api/permission/Organize/Department',
}

// 获取组织/公司列表
export function getOrganizeList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取组织/公司下拉框列表
export function getOrganizeSelector(id = '0') {
  return defHttp.get({ url: Api.Prefix + `/Selector/${id || '0'}` });
}
// 获取组织/公司下拉框列表(带权限)
export function getOrganizeSelectorByAuth(id = '0') {
  return defHttp.get({ url: Api.Prefix + `/SelectorByAuth/${id || '0'}` });
}
// 获取组织/公司树形
export function getOrganizeTree() {
  return defHttp.get({ url: Api.Prefix + `/Tree` });
}
// 新建组织/公司
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改组织/公司
export function update(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取组织/公司
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除组织/公司
export function delOrganize(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 获取分级管理
export function getOrganizeTrator(organizeId) {
  return defHttp.get({ url: Api.TratorPrefix + '/' + organizeId });
}
// 更新分级管理
export function setOrganizeTrator(data) {
  return defHttp.put({ url: Api.TratorPrefix + '/' + data.organizeId, data });
}
// 通过部门id获取部门树形
export function getOrgByOrganizeCondition(data) {
  return defHttp.post({ url: Api.Prefix + `/OrganizeCondition`, data });
}
// 获取部门下拉框列表(公司+部门)
export function getDepartmentSelector(id = '0') {
  return defHttp.get({ url: Api.DepartmentPrefix + `/Selector/${id || '0'}` });
}
// 获取部门下拉框列表(公司+部门) ---带权限
export function getDepartmentSelectorByAuth(id = '0') {
  return defHttp.get({ url: Api.DepartmentPrefix + `/SelectorByAuth/${id || '0'}` });
}
// 新建组织/公司
export function createDepartment(data) {
  return defHttp.post({ url: Api.DepartmentPrefix, data });
}
// 修改部门
export function updateDepartment(data) {
  return defHttp.put({ url: Api.DepartmentPrefix + '/' + data.id, data });
}
// 获取部门
export function getDepartmentInfo(id) {
  return defHttp.get({ url: Api.DepartmentPrefix + '/' + id });
}
