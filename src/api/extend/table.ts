import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/extend/TableExample',
}

// 获取城市信息列表
export function getCityList(id) {
  return defHttp.get({ url: Api.Prefix + `/CityList/${id}` });
}
// 新建项目
export function createTable(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 删除项目
export function delTable(id) {
  return defHttp.delete({ url: Api.Prefix + `/${id}` });
}
// 获取延伸扩展列表
export function getIndustryList(data) {
  return defHttp.get({ url: Api.Prefix + `/IndustryList`, data });
}
// 获取普通表格示例信息
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}` });
}
// 获取表格数据列表
export function getTableList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取表格分组列表
export function getTableListAll(data) {
  return defHttp.get({ url: Api.Prefix + `/All`, data });
}
// 行编辑
export function updateTableRow(data) {
  return defHttp.put({ url: Api.Prefix + `/${data.id}/Actions/RowsEdit`, data });
}
// 获取批注
export function getPostilList(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}/Actions/Postil` });
}
// 发送批注
export function sendPostil(id, data) {
  return defHttp.post({ url: Api.Prefix + `/${id}/Postil`, data });
}
// 删除批注
export function delPostil(id, index) {
  return defHttp.delete({ url: Api.Prefix + `/${id}/Postil/${index}` });
}
// 更新项目
export function updateTable(data) {
  return defHttp.put({ url: Api.Prefix + `/${data.id}`, data });
}
// 更新标记
export function updateSign(id, data) {
  return defHttp.put({ url: Api.Prefix + `/UpdateSign/${id}`, data });
}
// 列表（树形表格）
export function getTableListByType(data) {
  return defHttp.get({ url: Api.Prefix + `/ControlSample/${data.typeId}`, data });
}
