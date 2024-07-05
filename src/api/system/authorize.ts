import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/ModuleDataAuthorizeLink',
}

//获取表名
export function getVisualTables(menuId, type) {
  return defHttp.get({ url: Api.Prefix + '/getVisualTables/' + menuId + '/' + type });
}
//据表名获取数据表字段
export function getTableInfoByTableName(data) {
  return defHttp.get({ url: Api.Prefix + `/${data.linkId}/Tables/${data.tableName}/Fields/${data.menuType}/${data.dataType}`, data });
}
//保存编辑数据连接
export function update(data) {
  return defHttp.post({ url: Api.Prefix + '/saveLinkData', data });
}
//数据连接信息
export function getInfo(menuId, type) {
  return defHttp.get({ url: Api.Prefix + '/getInfo/' + menuId + '/' + type });
}
