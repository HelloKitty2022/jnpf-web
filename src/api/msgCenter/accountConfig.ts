import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/message/AccountConfig',
}

// 获取配置列表
export function getConfigList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 新建配置
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改配置
export function update(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取配置
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除配置
export function delConfig(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 复制配置
export function copy(id) {
  return defHttp.post({ url: Api.Prefix + `/${id}/Actions/Copy` });
}
// 测试配置
export function testConfig(data) {
  return defHttp.post({ url: Api.Prefix + `/${data.testType}`, data });
}
