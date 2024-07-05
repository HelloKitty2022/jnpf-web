import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/DataInterfaceVariate',
}
// 获取变量列表
export function getList(data) {
  return defHttp.get({ url: Api.Prefix + `/${data.id}`, data });
}
// 新增变量
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改变量
export function update(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取变量
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}/Info` });
}
// 删除变量
export function del(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 复制变量
export function copy(id) {
  return defHttp.post({ url: Api.Prefix + `/${id}/Actions/Copy` });
}
// 导出变量
export function exportData(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}/Actions/Export` });
}
// 获取变量
export function getVariateSelector() {
  return defHttp.get({ url: Api.Prefix + `/Selector` });
}
