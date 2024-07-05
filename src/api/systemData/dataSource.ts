import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/DataSource',
  SyncPrefix = '/api/system/DataSync',
}

// 获取数据连接列表
export function getDataSourceList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取数据连接下拉框列表
export function getDataSourceSelector(type = '') {
  const data = type ? { type } : {};
  return defHttp.get({ url: Api.Prefix + `/Selector`, data });
}
// 新建数据连接
export function createDataSource(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改数据连接
export function updateDataSource(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取数据连接
export function getDataSourceInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除数据连接
export function delDataSource(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 测试数据连接
export function testDbConnection(data) {
  return defHttp.post({ url: Api.Prefix + '/Actions/Test', data });
}
// 同步校验
export function dataSync(data) {
  return defHttp.post({ url: Api.SyncPrefix, data });
}
// 同步数据
export function execute(data) {
  return defHttp.post({ url: Api.SyncPrefix + '/Actions/Execute', data });
}
// 批量同步数据
export function batchExecute(data) {
  return defHttp.post({ url: Api.SyncPrefix + '/Actions/batchExecute', data });
}
// 校验数据库连接
export function checkDbLink(data) {
  return defHttp.post({ url: Api.SyncPrefix + '/Actions/checkDbLink', data });
}
