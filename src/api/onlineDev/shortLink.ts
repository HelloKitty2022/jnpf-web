import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/visualdev/ShortLink',
}

// 获取外链信息
export function getShortLinkInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}` });
}
// 保存外链信息
export function updateShortLink(data) {
  return defHttp.put({ url: Api.Prefix, data });
}
// 获取外链信息(渲染列表)
export function getConfig(id, encryption = '') {
  return defHttp.get({ url: Api.Prefix + `/getConfig/${id}` + (encryption ? '?encryption=' + encryption : '') });
}
// 校验外链密码
export function checkPwd(data) {
  return defHttp.post({ url: Api.Prefix + `/checkPwd`, data });
}
// 获取外链列表表单配置JSON
export function getConfigData(modelId, encryption = '') {
  return defHttp.get({ url: Api.Prefix + `/${modelId}/Config` + (encryption ? '?encryption=' + encryption : '') });
}
// 获取外链数据列表
export function getModelList(data) {
  return defHttp.post({ url: Api.Prefix + `/${data.modelId}/ListLink` + (data.encryption ? '?encryption=' + data.encryption : ''), data });
}
// 新建外链数据
export function createModel(modelId, data, encryption = '') {
  return defHttp.post({ url: Api.Prefix + `/${modelId}` + (encryption ? '?encryption=' + encryption : ''), data });
}
// 获取外链数据详情
export function getDataChange(modelId, id, encryption = '') {
  return defHttp.get({ url: Api.Prefix + `/${modelId}/${id}/DataChange` + (encryption ? '?encryption=' + encryption : '') });
}
