import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/flowForm/Form',
}

// 获取表单列表(分页)
export function getFormList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 新建表单
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改表单
export function update(data) {
  return defHttp.put({ url: Api.Prefix, data });
}
// 获取表单
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除表单
export function delForm(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 发布/回滚
export function release(id, isRelease = 1) {
  return defHttp.post({ url: Api.Prefix + `/Release/${id}?isRelease=${isRelease}` });
}
// 复制表单
export function copy(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}/Actions/Copy` });
}
// 导出
export function exportData(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}/Actions/Export` });
}
// 根据表单id获取表单字段
export function getFormField(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}/getField` });
}
// 表单下拉列表
export function getFormSelect(data) {
  return defHttp.get({ url: Api.Prefix + `/select`, data });
}
// 通过表单id获取流程id
export function getFlowByFormId(id) {
  return defHttp.get({ url: Api.Prefix + `/getFormById/${id}` });
}
