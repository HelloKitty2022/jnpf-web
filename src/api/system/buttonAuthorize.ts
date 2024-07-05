import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/ModuleButton',
}

// 获取按钮权限列表
export function getButtonAuthorizeList(data) {
  return defHttp.get({ url: Api.Prefix + '/' + data.id + '/List', data });
}
// 获取按钮权限下拉列表
export function getButtonAuthorizeSelector(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id + '/Selector' });
}
// 添加按钮
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 更新按钮
export function update(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取按钮信息
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除按钮
export function del(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
