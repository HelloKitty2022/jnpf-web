import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/ModuleForm',
}

// 获取列表权限列表
export function getFormAuthorizeList(data) {
  return defHttp.get({ url: Api.Prefix + '/' + data.id + '/Fields', data });
}
// 添加字段
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 批量添加字段
export function batchCreate(data) {
  return defHttp.post({ url: Api.Prefix + '/Actions/Batch', data });
}
// 更新字段
export function update(data) {
  return defHttp.put({ url: Api.Prefix + `/${data.id}`, data });
}
// 获取字段信息
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}` });
}
// 删除字段
export function del(id) {
  return defHttp.delete({ url: Api.Prefix + `/${id}` });
}
