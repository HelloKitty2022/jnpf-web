import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/extend/ProjectGantt',
}

//获取项目管理列表
export function getProjectList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 添加项目
export function createProject(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改项目
export function updateProject(data) {
  return defHttp.put({ url: Api.Prefix + `/${data.id}`, data });
}
// 删除项目/任务
export function delProject(id) {
  return defHttp.delete({ url: Api.Prefix + `/${id}` });
}
// 获取项目信息
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}` });
}
// 获取项目任务列表
export function getTaskList(data) {
  return defHttp.get({ url: Api.Prefix + `/${data.projectId}/Task`, data });
}
// 获取项目任务树形（新建任务）
export function getTaskSelector(projectId, id = 0) {
  return defHttp.get({ url: Api.Prefix + `/${projectId}/Task/Selector/${id}` });
}
// 获取项目任务信息
export function getTaskInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/Task/${id}` });
}
// 添加项目任务
export function createTask(data) {
  return defHttp.post({ url: Api.Prefix + `/Task`, data });
}
// 修改项目任务
export function updateTask(data) {
  return defHttp.put({ url: Api.Prefix + `/Task/${data.id}`, data });
}
