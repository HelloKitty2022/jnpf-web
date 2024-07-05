import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/DictionaryData',
  TypePrefix = '/api/system/DictionaryType',
}

// 获取数据字典分类
export function getDictionaryType() {
  return defHttp.get({ url: Api.TypePrefix });
}
// 获取字典分类下拉框列表
export function getDictionaryTypeSelector(id = '0') {
  return defHttp.get({ url: Api.TypePrefix + `/Selector/${id || '0'}` });
}
// 添加数据字典分类
export function createDictionaryType(data) {
  return defHttp.post({ url: Api.TypePrefix, data });
}
// 修改数据字典分类
export function updateDictionaryType(data) {
  return defHttp.put({ url: Api.TypePrefix + '/' + data.id, data });
}
// 获取数据字典分类信息
export function getDictionaryTypeInfo(id) {
  return defHttp.get({ url: Api.TypePrefix + '/' + id });
}
// 删除数据字典分类
export function delDictionaryType(id) {
  return defHttp.delete({ url: Api.TypePrefix + '/' + id });
}

// 获取数据字典分类
export function getDictionaryDataList(params) {
  return defHttp.get({ url: Api.Prefix + '/' + params.typeId, params });
}
// 获取数据字典列表(分类+内容)
export function getDictionaryAll() {
  return defHttp.get({ url: Api.Prefix + '/All' });
}
// 获取字典分类下拉框(项目上级)
export function getDictionaryDataTypeSelector(typeId, isTree, id = '0') {
  return defHttp.get({ url: Api.Prefix + `/${typeId}/Selector/${id || '0'}`, params: { isTree } });
}
// 获取字典数据下拉框列表
export function getDictionaryDataSelector(typeId) {
  return defHttp.get({ url: Api.Prefix + `/${typeId}/Data/Selector` });
}
// 添加数据字典
export function createDictionaryData(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改数据字典
export function updateDictionaryData(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取数据字典信息
export function getDictionaryDataInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}/Info` });
}
// 删除数据字典信息
export function delDictionaryData(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 导出数据字典数据
export function exportData(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}/Actions/Export` });
}
