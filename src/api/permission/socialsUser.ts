import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/permission/socials',
}

// 获取用户授权列表
export function getSocialsLoginList(data) {
  return defHttp.get({ url: Api.Prefix + `/login`, data });
}
// 获取用户授权列表
export function getSocialsUserList() {
  return defHttp.get({ url: Api.Prefix });
}
// 获取用户授权列表(用户管理)
export function getSocialsUserListByUser(userId) {
  return defHttp.get({ url: Api.Prefix + `?userId=${userId}` });
}
// 第三方绑定
export function socialsBind(name) {
  return defHttp.get({ url: Api.Prefix + `/render/${name}` });
}
// 解绑
export function deleteSocials(userId, id) {
  return defHttp.delete({ url: Api.Prefix + `/${id}?userId=${userId}` });
}
