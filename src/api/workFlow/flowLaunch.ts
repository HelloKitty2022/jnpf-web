import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/workflow/Engine/FlowLaunch',
}

// 获取流程发起列表
export function getFlowLaunchList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 删除流程发起
export function delFlowLaunch(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 撤回流程发起
export function revoke(id, data) {
  return defHttp.put({ url: Api.Prefix + `/${id}/Actions/Withdraw`, data });
}
// 撤回流程发起
export function press(id) {
  return defHttp.post({ url: Api.Prefix + `/Press/${id}` });
}
