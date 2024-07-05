import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/Area',
}

// 获取行政区划列表
export function getAreaList(data) {
  return defHttp.get({ url: Api.Prefix + `/${data.nodeId}`, data });
}
// 获取行政区划下拉框列表
export function getAreaSelector(id, currId = '0') {
  return defHttp.get({ url: Api.Prefix + `/${id}/Selector/${currId}` });
}
// 获取行政区划数据详情
export function getAreaByIds(idsList) {
  return defHttp.post({ url: Api.Prefix + `/GetAreaByIds`, data: { idsList } });
}
// 新建行政区划
export function createArea(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改行政区划
export function updateArea(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取行政区划
export function getAreaInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}/Info` });
}
// 删除行政区划
export function delArea(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
