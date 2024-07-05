import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/printDev',
  PrefixLog = '/api/system/printLog',
}

// 获取打印模板列表(分页)
export function getPrintDevList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取打印模板列表下拉框
export function getPrintDevSelector(type) {
  return defHttp.get({ url: Api.Prefix + `/Selector`, data: { type } });
}
// 获取打印模板列表下拉框
export function getPrintDevByIds(data) {
  return defHttp.post({ url: Api.Prefix + `/getListOptions`, data });
}
// 新建打印模板
export function createPrintDev(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改打印模板
export function updatePrintDev(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取打印模板
export function getPrintDevInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除打印模板
export function delPrintDev(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 复制打印模板
export function copy(id) {
  return defHttp.post({ url: Api.Prefix + `/${id}/Actions/Copy` });
}
// 导出数据打印模板数据
export function exportData(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}/Actions/Export` });
}
// 获取打印模板表单字段
export function getFields(data) {
  return defHttp.post({ url: Api.Prefix + `/Fields`, data });
}
// 获取数据和打印模板
export function getData(data) {
  return defHttp.get({ url: Api.Prefix + `/Data`, data });
}
// 批量打印获取数据和打印模板
export function getBatchData(data) {
  return defHttp.get({ url: Api.Prefix + `/BatchData`, data });
}
// 获取打印日志列表
export function getPrintLogList(data) {
  return defHttp.get({ url: Api.PrefixLog + `/${data.id}`, data });
}
// 插入打印日志
export function createPrintLog(data) {
  return defHttp.post({ url: Api.PrefixLog + `/save`, data });
}
