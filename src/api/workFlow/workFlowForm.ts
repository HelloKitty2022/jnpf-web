import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/workflow/Engine/FlowTask',
}

// 新建表单
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 更新表单
export function update(data) {
  return defHttp.put({ url: Api.Prefix + `/${data.id}`, data });
}
