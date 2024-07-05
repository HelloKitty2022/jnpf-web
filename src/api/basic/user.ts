import { defHttp } from '/@/utils/http/axios';
import { LoginParams } from './model/userModel';
import { ContentTypeEnum } from '/@/enums/httpEnum';
import { getJnpfAppId } from '/@/utils/jnpf';

enum Api {
  Prefix = '/api/oauth',
  Login = '/api/oauth/Login',
  Logout = '/api/oauth/Logout',
  GetUserInfo = '/api/oauth/CurrentUser',
  Unlock = '/api/oauth/LockScreen',
}

// 用户登录
export function loginApi(params: LoginParams) {
  return defHttp.post({ url: Api.Login, params, headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED } });
}
// 获取当前用户信息
export function getUserInfo() {
  const systemCode = getJnpfAppId() ? getJnpfAppId().replace('JNPF_APP_', '') : '';
  return defHttp.get({ url: Api.GetUserInfo, data: { systemCode } });
}
// 退出登陆
export function doLogout() {
  return defHttp.get({ url: Api.Logout });
}
// 锁屏解锁登录
export function unlock(data: LoginParams) {
  return defHttp.post({ url: Api.Unlock, data });
}
// 获取系统默认配置
export function getConfig(account) {
  return defHttp.get({ url: Api.Prefix + `/getConfig/${account}` });
}
// 修改密码信息发送
export function updatePasswordMessage() {
  return defHttp.post({ url: Api.Prefix + '/updatePasswordMessage' });
}
// 获取登录配置
export function getLoginConfig() {
  return defHttp.get({ url: Api.Prefix + `/getLoginConfig` });
}
// 获取登录票据
export function getTicket() {
  return defHttp.get({ url: Api.Prefix + `/getTicket` });
}
// 根据票据获取登录状态
export function getTicketStatus(ticket) {
  return defHttp.get({ url: Api.Prefix + `/getTicketStatus/${ticket}` });
}
// 第三方登录回调列表后点击登录
export function socialsLogin(params) {
  return defHttp.post({ url: Api.Prefix + `/Login/socials`, params, headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED } });
}
// 扫码登陆获取凭证
export function getCodeCertificate() {
  return defHttp.get({ url: Api.Prefix + `/codeCertificate` });
}
// 扫码登陆获取凭证状态
export function getCodeCertificateStatus(ticket) {
  return defHttp.get({ url: Api.Prefix + `/codeCertificateStatus/${ticket}` });
}
// 扫码登陆设置凭证状态
export function setCodeCertificateStatus(ticket, status) {
  return defHttp.get({ url: Api.Prefix + `/setCodeCertificateStatus/${ticket}/${status}` });
}
