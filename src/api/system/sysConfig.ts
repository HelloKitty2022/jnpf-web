import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/SysConfig',
  SynPrefix = '/api/system/SynThirdInfo',
}

// 获取系统配置
export function getSysConfig() {
  return defHttp.get({ url: Api.Prefix });
}
// 更新系统配置
export function update(data) {
  return defHttp.put({ url: Api.Prefix, data });
}
// 测试企业微信配置的连接
export function testQy(data, type) {
  return defHttp.post({ url: Api.Prefix + '/' + type + '/testQyWebChatConnect', data });
}
// 测试企业微信配置的连接
export function testDing(data) {
  return defHttp.post({ url: Api.Prefix + '/testDingTalkConnect', data });
}
// 获取系统管理员
export function getAdminList() {
  return defHttp.get({ url: Api.Prefix + '/getAdminList' });
}
// 设置系统管理员
export function setAdminList(data) {
  return defHttp.put({ url: Api.Prefix + '/setAdminList', data });
}
//本地所有组织信息(包含公司和部门)同步到钉钉
export function synAllOrganizeSysToDing(type) {
  return defHttp.get({ url: Api.SynPrefix + '/synAllOrganizeSysToDing?type=' + type });
}
// 本地所有用户信息同步到钉钉
export function synAllUserSysToDing(type) {
  return defHttp.get({ url: Api.SynPrefix + '/synAllUserSysToDing?type=' + type });
}
// 本地所有组织信息(包含公司和部门)同步到企业微信
export function synAllOrganizeSysToQy(type) {
  return defHttp.get({ url: Api.SynPrefix + '/synAllOrganizeSysToQy?type=' + type });
}
// 本地所有用户信息同步到企业微信
export function synAllUserSysToQy(type) {
  return defHttp.get({ url: Api.SynPrefix + '/synAllUserSysToQy?type=' + type });
}
// 获取第三方(如：企业微信、钉钉)的组织与用户同步统计信息
// thirdType: 1-企业微信; 2-钉钉
export function getSynData(type) {
  return defHttp.get({ url: Api.SynPrefix + '/getSynThirdTotal/' + type });
}
