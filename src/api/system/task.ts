import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/scheduletask',
}

// 获取任务调度列表
export function getTaskList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 新建任务调度
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改任务调度
export function update(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取任务调度信息
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/Info/' + id });
}
// 删除任务调度
export function delTask(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 获取任务调度日志列表
export function getTaskLogList(data) {
  return defHttp.get({ url: Api.Prefix + '/' + data.id + '/TaskLog', data });
}
// 获取本地任务下拉列表
export function getTaskMethodsList() {
  return defHttp.get({ url: Api.Prefix + '/TaskMethods' });
}
