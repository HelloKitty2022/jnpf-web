import { defHttp } from '/@/utils/http/axios';
import { ContentTypeEnum } from '/@/enums/httpEnum';

enum Api {
  Prefix = '/api/extend/Document',
}

// 获取知识管理列表（全部文档）
export function getAllList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 添加文件夹
export function create(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改文件名/文件夹名
export function update(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 删除文件/文件夹
export function delDocument(id) {
  return defHttp.delete({ url: Api.Prefix + `/${id}` });
}
// 获取知识管理列表（文件夹树）
export function getFolderTree(id = '0') {
  return defHttp.get({ url: Api.Prefix + `/FolderTree/${id}` });
}
// 获取文件/文件夹信息
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}` });
}
// 移动文件/文件夹
export function moveTo(id, toId) {
  return defHttp.put({ url: Api.Prefix + `/${id}/Actions/MoveTo/${toId}` });
}
// 取消分享文件/文件夹
export function shareCancel(id) {
  return defHttp.delete({ url: Api.Prefix + `/${id}/Actions/Share` });
}
// 分享文件/文件夹
export function createShare(id, userId) {
  return defHttp.post({ url: Api.Prefix + `/${id}/Actions/Share`, data: { userId } });
}
// 知识管理（我的共享列表）
export function getShareOutList(data) {
  return defHttp.get({ url: Api.Prefix + '/Share', data });
}
// 获取知识管理列表（共享给我）
export function getShareTomeList(data) {
  return defHttp.get({ url: Api.Prefix + '/ShareTome', data });
}
// 获取知识管理列表（共享人员）
export function getShareUserList(documentId) {
  return defHttp.get({ url: Api.Prefix + `/ShareUser/${documentId}` });
}
// 获取知识管理列表（回收站）
export function getTrashList(data) {
  return defHttp.get({ url: Api.Prefix + '/Trash', data });
}
// 回收站（彻底删除）
export function trashDelete(id) {
  return defHttp.delete({ url: Api.Prefix + `/Trash/${id}` });
}
// 回收站（还原文件）
export function trashRecovery(id) {
  return defHttp.post({ url: Api.Prefix + `/Trash/${id}/Actions/Recovery` });
}
// 下载文件
export function download(id) {
  return defHttp.post({ url: Api.Prefix + `/Download/${id}` });
}
// 分片组装
export function documentMerge(data) {
  return defHttp.post({ url: Api.Prefix + `/merge`, data, headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED } });
}
