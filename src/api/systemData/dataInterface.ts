import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/DataInterface',
}

// 获取接口列表(分页)
export function getDataInterfaceList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取接口列表下拉框
export function getDataInterfaceSelector() {
  return defHttp.get({ url: Api.Prefix + `/Selector` });
}
// 新建接口
export function createDataInterface(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改接口
export function updateDataInterface(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取接口
export function getDataInterfaceInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除接口
export function delDataInterface(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 获取接口数据
export function getDataInterfaceRes(id, data = {}) {
  return defHttp.post({ url: Api.Prefix + `/${id}/Actions/Preview`, data });
}
// 获取数据接口参数
export function getDataInterfaceParam(id) {
  return defHttp.get({ url: Api.Prefix + `/GetParam/${id}` });
}
// 导出数据接口数据
export function exportData(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}/Actions/Export` });
}
// 获取数据接口调用日志列表
export function getDataInterfaceLog(id, data) {
  return defHttp.get({ url: Api.Prefix + `Log/${id}`, data });
}
// 获取接口列表数据
export function getDataInterfaceDataSelect(data) {
  return defHttp.post({ url: Api.Prefix + `/${data.interfaceId}/Actions/List`, data });
}
// 获取多条接口详情数据
export function getDataInterfaceDataInfoByIds(id, data) {
  return defHttp.post({ url: Api.Prefix + `/${id}/Actions/InfoByIds`, data });
}
// 获取接口列表(工作流选择时调用，带分页)
export function getDataInterfaceSelectorList(data) {
  return defHttp.get({ url: Api.Prefix + `/getList`, data });
}
// 获取接口字段
export function getDataInterfaceFields(id, data) {
  return defHttp.post({ url: Api.Prefix + `/${id}/Actions/GetFields`, data });
}
// 复制接口数据
export function copy(id) {
  return defHttp.post({ url: Api.Prefix + `/${id}/Actions/Copy` });
}
