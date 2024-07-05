import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/permission/Position',
}

// 获取岗位列表(分页)
export function getPositionList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取岗位下拉框列表（公司+部门+岗位）
export function getPositionSelector() {
  return defHttp.get({ url: Api.Prefix + `/Selector` });
}
// 获取全部岗位管理信息列表
export function getPositionListAll() {
  return defHttp.get({ url: Api.Prefix + `/All` });
}
// 新建岗位
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改岗位
export function update(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取岗位
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除岗位
export function delPosition(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 通过组织id获取岗位列表
export function getPositionByOrganize(organizeIds) {
  return defHttp.post({ url: Api.Prefix + `/getListByOrgIds`, data: { organizeIds } });
}
// 通过部门id,岗位id获取岗位树形
export function getPositionByCondition(data) {
  return defHttp.post({ url: Api.Prefix + `/PositionCondition`, data });
}
