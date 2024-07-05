import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/message/SendMessageConfig',
}

// 获取发送配置列表(分页)
export function getSendConfigList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 新建发送配置
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改发送配置
export function update(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取发送配置
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除发送配置
export function delSendConfig(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 复制发送配置
export function copy(id) {
  return defHttp.post({ url: Api.Prefix + `/${id}/Actions/Copy` });
}
// 测试发送配置获取配置信息
export function getTestSendConfig(id) {
  return defHttp.post({ url: Api.Prefix + `/getTestConfig/${id}` });
}
// 测试发送配置
export function testSendConfig(data) {
  return defHttp.post({ url: Api.Prefix + `/testSendConfig`, data });
}
// 发送配置下拉列表
export function getSendConfigSelect(data) {
  return defHttp.get({ url: Api.Prefix + `/getSendConfigList`, data });
}
