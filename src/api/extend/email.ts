import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/extend/Email',
}

// 获取邮件列表(收件箱、标星件、草稿箱、已发送)
export function getEmailList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取邮箱配置
export function getConfigInfo() {
  return defHttp.get({ url: Api.Prefix + '/Config' });
}
// 更新邮件配置
export function saveConfig(data) {
  return defHttp.put({ url: Api.Prefix + '/Config', data });
}
// 邮箱配置-测试连接
export function checkMail(data) {
  return defHttp.post({ url: Api.Prefix + '/Config/Actions/CheckMail', data });
}
// 发邮件
export function saveSent(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 存草稿
export function saveDraft(data) {
  return defHttp.post({ url: Api.Prefix + `/Actions/SaveDraft`, data });
}
// 获取邮件信息
export function getEmailInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}` });
}
// 删除邮件
export function delEmail(id) {
  return defHttp.delete({ url: Api.Prefix + `/${id}` });
}
// 设置已读邮件
export function setRead(id) {
  return defHttp.put({ url: Api.Prefix + `/${id}/Actions/Read` });
}
// 设置未读邮件
export function setUnread(id) {
  return defHttp.put({ url: Api.Prefix + `/${id}/Actions/Unread` });
}
// 设置标星邮件
export function setStar(id) {
  return defHttp.put({ url: Api.Prefix + `/${id}/Actions/Star` });
}
// 设置取消标星
export function setUnStar(id) {
  return defHttp.put({ url: Api.Prefix + `/${id}/Actions/Unstar` });
}
// 收邮件
export function receive() {
  return defHttp.post({ url: Api.Prefix + `/Receive` });
}
