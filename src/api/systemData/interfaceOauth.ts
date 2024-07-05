import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/InterfaceOauth',
}

// 获取接口认证列表(分页)
export function getInterfaceOauthList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 创建接口认证
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改接口认证
export function update(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 删除接口认证数据
export function delInterfaceOauth(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 获取详情
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 获取秘钥
export function getAppSecret() {
  return defHttp.get({ url: Api.Prefix + '/getAppSecret' });
}
// 保存认证接口列表
export function saveInterfaceList(data) {
  return defHttp.post({ url: Api.Prefix + '/saveInterfaceList', data });
}
// 获取认证接口列表
export function getInterfaceList(id) {
  return defHttp.get({ url: Api.Prefix + '/getInterfaceList/' + id });
}
// 获取接口日志列表
export function getLogList(data) {
  return defHttp.get({ url: Api.Prefix + '/dataInterfaceLog/' + data.id, data });
}
//保存授权用户
export function saveUserList(data) {
  return defHttp.post({ url: Api.Prefix + '/SaveUserList', data });
}
