import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/CommonWords',
}

// 获取审批常用语列表(带分页)
export function getCommonWordsList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取审批常用语下拉框列表
export function getCommonWordsSelector() {
  return defHttp.get({ url: Api.Prefix + `/Selector` });
}
// 新建审批常用语
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改审批常用语
export function update(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取审批常用语
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除审批常用语
export function delCommonWords(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
