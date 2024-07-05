import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/permission/Users/Current',
}

// 更新当前用户头像
export function updateAvatar(name) {
  return defHttp.put({ url: Api.Prefix + `/Avatar/${name}` });
}
// 获取当前用户个人资料
export function getUserSettingInfo() {
  return defHttp.get({ url: Api.Prefix + `/BaseInfo` });
}
// 更新当前用户个人资料
export function updateUserInfo(data) {
  return defHttp.put({ url: Api.Prefix + `/BaseInfo`, data });
}
// 修改当前用户密码
export function updatePassword(data) {
  return defHttp.post({ url: Api.Prefix + `/Actions/ModifyPassword`, data });
}
// 更新当前用户系统主题
export function updateTheme(data) {
  return defHttp.put({ url: Api.Prefix + `/SystemTheme`, data });
}
// 更新当前用户系统语言
export function updateLanguage(data) {
  return defHttp.put({ url: Api.Prefix + `/SystemLanguage`, data });
}
// 获取我的下属
export function getSubordinate(id = '0') {
  return defHttp.get({ url: Api.Prefix + `/Subordinate/${id}` });
}
// 获取当前用户系统权限
export function getAuthorizeList() {
  return defHttp.get({ url: Api.Prefix + `/Authorize` });
}
// 获取系统日志
export function getLogList(data) {
  return defHttp.get({ url: Api.Prefix + `/SystemLog`, data });
}
// 获取当前用户所有组织
export function getUserOrganizes() {
  return defHttp.get({ url: Api.Prefix + `/getUserOrganizes` });
}
// 获取当前用户所有岗位
export function getUserPositions() {
  return defHttp.get({ url: Api.Prefix + `/getUserPositions` });
}
// 获取当前用户所有角色
export function getUserRoles(data) {
  return defHttp.get({ url: Api.Prefix + `/getUserRoles`, data });
}
// 设置主要组织、主要岗位、切换系统
export function setMajor(data) {
  return defHttp.put({ url: Api.Prefix + `/major`, data });
}
// 获取系统日志
export function getSignList() {
  return defHttp.get({ url: Api.Prefix + `/SignImg` });
}
// 新建个性签名
export function createSign(data) {
  return defHttp.post({ url: Api.Prefix + `/SignImg`, data });
}
// 删除个性签名
export function deleteSign(id) {
  return defHttp.delete({ url: Api.Prefix + `/${id}/SignImg` });
}
// 设置默认签名
export function updateDefaultSign(id) {
  return defHttp.put({ url: Api.Prefix + `/${id}/SignImg` });
}
