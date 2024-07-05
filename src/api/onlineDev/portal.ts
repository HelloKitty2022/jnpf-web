import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/visualdev/Portal',
  AtlasPrefix = '/api/system/atlas',
  DashboardPrefix = '/api/visualdev/Dashboard',
  SchedulePrefix = '/api/system/Schedule',
  portalPrefix = '/api/system/PortalManage',
}

// 获取门户列表
export function getPortalList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取门户信息
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}` });
}
// 删除门户
export function delPortal(id) {
  return defHttp.delete({ url: Api.Prefix + `/${id}` });
}
// 修改门户
export function updatePortal(data) {
  return defHttp.put({ url: Api.Prefix + `/${data.id}`, data });
}
// 新建门户
export function createPortal(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 复制门户
export function copyPortal(id) {
  return defHttp.post({ url: Api.Prefix + `/${id}/Actions/Copy` });
}
// 导出门户
export function exportPortal(id) {
  return defHttp.post({ url: Api.Prefix + `/${id}/Actions/Export` });
}
// 获取门户下拉框列表
export function getPortalSelector(type?, systemId?) {
  return defHttp.get({ url: Api.Prefix + '/Selector?platform=Web', data: { type, systemId } });
}
// 切换用户门户默认显示
export function setDefaultPortal(id) {
  return defHttp.put({ url: Api.Prefix + `/${id}/Actions/SetDefault?platform=Web` });
}
// 获取门户展示数据(权限)
export function getAuthPortal(id, data) {
  return defHttp.get({ url: Api.Prefix + `/${id}/auth`, data });
}
// 获取全国省市区
export function getAtlas() {
  return defHttp.get({ url: Api.AtlasPrefix });
}
// 获取地图json
export function getMapData(data) {
  return defHttp.get({ url: Api.AtlasPrefix + '/geojson', data });
}
// 用户拖拽后更新
export function UpdateCustomPortal(id, data) {
  return defHttp.put({ url: Api.Prefix + `/Custom/Save/${id}`, data });
}
// 获取我的待办
export function getFlowTodoCount(data) {
  return defHttp.post({ url: Api.DashboardPrefix + '/FlowTodoCount', data });
}
// 获取通知公告
export function getNoticeList(data) {
  return defHttp.post({ url: Api.DashboardPrefix + '/Notice', data });
}
// 获取未读邮件
export function getEmailList() {
  return defHttp.get({ url: Api.DashboardPrefix + '/Email' });
}
// 获取待办事项
export function getFlowTodoList() {
  return defHttp.get({ url: Api.DashboardPrefix + '/FlowTodo' });
}
// 获取我的待办事项
export function getMyFlowTodoList(data) {
  return defHttp.get({ url: Api.DashboardPrefix + '/MyFlowTodo', data });
}
// 获取日程安排列表
export function getScheduleList(data) {
  return defHttp.get({ url: Api.SchedulePrefix, data });
}
// 新建日程安排
export function createSchedule(data) {
  return defHttp.post({ url: Api.SchedulePrefix, data });
}
// 更新日程安排
export function updateSchedule(data, type) {
  return defHttp.put({ url: Api.SchedulePrefix + `/${data.id}/${type}`, data });
}
// 删除日程安排
export function delSchedule(id, type) {
  return defHttp.delete({ url: Api.SchedulePrefix + `/${id}/${type}` });
}
// 获取日程安排信息
export function getScheduleInfo(id) {
  return defHttp.get({ url: Api.SchedulePrefix + `/${id}` });
}
// 查看日程详情
export function getScheduleDetail(groupId, id) {
  return defHttp.get({ url: Api.SchedulePrefix + `/detail?groupId=${groupId}&id=${id}` });
}
//发布
export function release(id, data) {
  return defHttp.put({ url: Api.Prefix + `/Actions/release/${id}`, data });
}
// 获取门户管理列表
export function getPortalManageList(data) {
  return defHttp.get({ url: Api.portalPrefix + `/list/${data.systemId}`, data });
}
// 获取门户名称列表
export function getPortalManageSelector(data) {
  return defHttp.get({ url: Api.Prefix + `/manage/Selector/${data.systemId}`, data });
}
// 获取门户管理详情
export function getPortalManageInfo(id) {
  return defHttp.get({ url: Api.portalPrefix + `/${id}` });
}
// 新建门户管理
export function createPortalManage(data) {
  return defHttp.post({ url: Api.portalPrefix, data });
}
// 编辑门户管理
export function updatePortalManage(data) {
  return defHttp.put({ url: Api.portalPrefix + `/${data.id}`, data });
}
// 删除门户管理
export function delPortalManage(id) {
  return defHttp.delete({ url: Api.portalPrefix + `/${id}` });
}

// 获取应用列表(发布过滤)
export function getSystemListFilter(data, id) {
  return defHttp.get({ url: Api.Prefix + `/systemFilter/${id}`, data });
}
