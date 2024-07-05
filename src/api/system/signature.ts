import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/Signature',
}

// 获取签章列表(带分页)
export function getSignatureList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取签章下拉框列表
export function getSignatureSelector() {
  return defHttp.get({ url: Api.Prefix + `/Selector` });
}
// 新建签章
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改签章
export function update(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取签章
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除签章
export function delSignature(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 通过id获取签章下拉框列表
export function getListByIds(ids) {
  return defHttp.post({ url: Api.Prefix + `/ListByIds`, data: { ids } });
}
