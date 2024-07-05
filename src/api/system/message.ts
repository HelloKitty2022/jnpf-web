import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/message',
  NoticePrefix = '/api/message/Notice',
}

// 获取系统公告列表
export function getNoticeList(data) {
  return defHttp.post({ url: Api.NoticePrefix + '/List', data });
}
// 新建公告
export function create(data) {
  return defHttp.post({ url: Api.NoticePrefix, data });
}
// 修改公告
export function update(data) {
  return defHttp.put({ url: Api.NoticePrefix + '/' + data.id, data });
}
// 获取公告详情
export function getInfo(id) {
  return defHttp.get({ url: Api.NoticePrefix + '/' + id });
}
// 删除公告
export function delNotice(id) {
  return defHttp.delete({ url: Api.NoticePrefix + '/' + id });
}
// 发布公告
export function release(id) {
  return defHttp.put({ url: Api.NoticePrefix + `/${id}/Actions/Release` });
}

// 获取消息中心列表
export function getMessageList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 全部已读
export function readAllMsg(data) {
  return defHttp.post({ url: Api.Prefix + `/Actions/ReadAll`, data });
}
// 查看消息内容
export function readInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/ReadInfo/${id}` });
}
// 删除消息
export function delMsgRecord(data) {
  return defHttp.delete({ url: Api.Prefix + '/Record', data });
}

// 获取IM对话列表
export function getIMReply() {
  return defHttp.get({ url: Api.Prefix + '/imreply' });
}
// 删除聊天记录
export function deleteChatRecord(id) {
  return defHttp.delete({ url: Api.Prefix + `/imreply/deleteChatRecord/${id}` });
}
// 移除聊天记录
export function removeChatRecord(id) {
  return defHttp.delete({ url: Api.Prefix + `/imreply/relocation/${id}` });
}
