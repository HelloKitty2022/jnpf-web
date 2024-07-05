import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/permission/Group',
}

// 获取分组列表
export function getGroupList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取分组下拉框列表
export function getGroupSelector() {
  return defHttp.get({ url: Api.Prefix + `/Selector` });
}
// 新建分组
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改分组
export function update(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取分组
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除分组
export function delGroup(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 获取选中角色基本信息
export function getGroupByCondition(data) {
  return defHttp.post({ url: Api.Prefix + `/GroupCondition`, data });
}
