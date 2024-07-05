import { defHttp } from '/@/utils/http/axios';
import { omit } from 'lodash-es';

enum Api {
  Prefix = '/api/system/DataModel',
}

// 获取数据库表列表
export function getDataModelList(data) {
  return defHttp.get({ url: Api.Prefix + `/${data.linkId}/Tables`, data: omit(data, ['linkId']) });
}
// 获取数据库表列表+视图
export function getDataModelListAll(data) {
  return defHttp.get({ url: Api.Prefix + `/${data.linkId}/TableAll`, data: omit(data, ['linkId']) });
}
// 预览数据库表
export function previewDataModel(data) {
  return defHttp.get({ url: Api.Prefix + `/${data.linkId}/Table/${data.table}/Preview`, data: omit(data, ['linkId', 'table']) });
}
// 新建数据库表
export function createDataModel(linkId, data) {
  return defHttp.post({ url: Api.Prefix + `/${linkId}/Table`, data });
}
// 修改数据库表
export function updateDataModel(linkId, data) {
  return defHttp.put({ url: Api.Prefix + `/${linkId}/Table`, data });
}
// 获取数据库表
export function getDataModelInfo(linkId, table) {
  return defHttp.get({ url: Api.Prefix + `/${linkId}/Table/${table}` });
}
// 删除数据库表
export function delDataModel(linkId, table) {
  return defHttp.delete({ url: Api.Prefix + `/${linkId}/Table/${table}` });
}
// 获取数据库表
export function getDataModelFieldList(linkId, table, type = '0') {
  return defHttp.get({ url: Api.Prefix + `/${linkId}/Tables/${table}/Fields?type=${type}` });
}
//  新增字段
export function addTableFields(linkId, data) {
  return defHttp.put({ url: Api.Prefix + `/${linkId}/addFields`, data });
}
//  导出数据库表
export function exportTable(linkId, table) {
  return defHttp.get({ url: Api.Prefix + `/${linkId}/Table/${table}/Actions/Export` });
}
