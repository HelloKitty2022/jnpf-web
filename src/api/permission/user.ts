import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/permission/Users',
}

// 获取用户列表
export function getUserList(params) {
  return defHttp.get({ url: Api.Prefix, params });
}
// 获取所有用户列表
export function getUserListAll() {
  return defHttp.get({ url: Api.Prefix + '/All' });
}
// 获取用户下拉框列表(公司+部门+用户)
export function getUserSelector() {
  return defHttp.get({ url: Api.Prefix + '/Selector' });
}
// 新建用户
export function createUser(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改用户
export function updateUser(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取用户信息
export function getUserInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除用户
export function delUser(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 修改用户密码
export function resetUserPassword(data) {
  return defHttp.post({ url: Api.Prefix + `/${data.id}/Actions/ResetPassword`, data });
}
// 更新用户状态
export function updateUserState(id) {
  return defHttp.put({ url: Api.Prefix + `/${id}/Actions/State` });
}
// 解除锁定
export function unlockUser(id) {
  return defHttp.put({ url: Api.Prefix + `/${id}/Actions/unlock` });
}
// IM通讯获取用户
export function getImUser(data) {
  return defHttp.get({ url: Api.Prefix + '/ImUser', data });
}
// 获取用户下拉框列表
export function getImUserSelector(organizeId, data = {}) {
  return defHttp.post({ url: Api.Prefix + `/ImUser/Selector/${organizeId}`, data });
}
// 获取用户基本信息
export function getUserInfoList(ids) {
  return defHttp.post({ url: Api.Prefix + `/getUserList`, data: { ids } });
}
// 获取我的下属
export function getSubordinates(keyword) {
  const data = { keyword };
  return defHttp.post({ url: Api.Prefix + `/getSubordinates`, data });
}
// 获取当前组织用户
export function getOrganization(data) {
  return defHttp.get({ url: Api.Prefix + `/getOrganization`, data });
}
// 通过岗位id获取用户树
export function getUsersByPositionId(data) {
  return defHttp.get({ url: Api.Prefix + `/GetUsersByPositionId`, data });
}
// 通过角色id获取用户列表
export function getUsersByRoleId(data) {
  return defHttp.get({ url: Api.Prefix + `/getUsersByRoleId`, data });
}
// 通过角色id获取组织下的用户列表
export function getUsersByRoleOrgId(data) {
  return defHttp.get({ url: Api.Prefix + `/GetUsersByRoleOrgId`, data });
}
// 通过部门id,岗位id,角色id,分组id,用户id获取用户列表(带分页)
export function getUsersByUserCondition(data) {
  return defHttp.post({ url: Api.Prefix + `/UserCondition`, data });
}
// 导出用户Excel
export function exportExcel(data) {
  return defHttp.get({ url: Api.Prefix + `/ExportData`, data });
}
// 用户导入模板下载
export function templateDownload() {
  return defHttp.get({ url: Api.Prefix + `/TemplateDownload` });
}
// 导入
export function importData(data) {
  return defHttp.post({ url: Api.Prefix + `/ImportData`, data });
}
// 导入预览
export function importPreview(data) {
  return defHttp.get({ url: Api.Prefix + `/ImportPreview`, data });
}
// 导出错误数据
export function exportExceptionData(data) {
  return defHttp.post({ url: Api.Prefix + `/ExportExceptionData`, data });
}
// 获取用户下拉框列表
export function getListByAuthorize(organizeId, keyword) {
  return defHttp.post({ url: Api.Prefix + `/GetListByAuthorize/${organizeId}`, data: { keyword } });
}
// 获取选中组织、岗位、角色、用户基本信息
export function getSelectedList(ids) {
  return defHttp.post({ url: Api.Prefix + `/getSelectedList`, data: { ids } });
}
// 获取选中组织、岗位、角色、用户基本信息
export function getSelectedUserList(data) {
  return defHttp.post({ url: Api.Prefix + `/getSelectedUserList`, data });
}
// 获取离职交接数据
export function getWorkByUser(data) {
  return defHttp.get({ url: Api.Prefix + `/getWorkByUser`, data });
}
// 工作交接
export function workHandover(data) {
  return defHttp.post({ url: Api.Prefix + `/workHandover`, data });
}
