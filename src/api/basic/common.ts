import { defHttp } from '/@/utils/http/axios';
import { ContentTypeEnum } from '/@/enums/httpEnum';

enum Api {
  PreviewFile = '/api/file/Uploader/Preview',
  Merge = '/api/file/merge',
  AMap = '/api/system/Location',
}

// 获取下载文件链接
export function getDownloadUrl(type: string, fileName: string = '') {
  return defHttp.get({ url: `/api/file/Download/${type}/${fileName}` });
}
// 获取全部下载文件链接（打包下载）
export function getPackDownloadUrl(type: string, data) {
  return defHttp.post({ url: `/api/file/PackDownload/${type}`, data });
}
// 预览文件
export function previewFile(data) {
  return defHttp.get({ url: Api.PreviewFile, data });
}
// 分片组装
export function chunkMerge(data) {
  return defHttp.post({ url: Api.Merge, data, headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED } });
}
// 下载导入示例模板
export function getTemplateDownload(url) {
  return defHttp.get({ url: `/api/${url}/TemplateDownload` });
}
// 下载导入示例模板
export function getImportPreview(url, data) {
  return defHttp.get({ url: `/api/${url}/ImportPreview`, data });
}
// 导入数据
export function importData(url, data) {
  return defHttp.post({ url: `/api/${url}/ImportData`, data });
}
// 导入数据
export function getImportExceptionData(url, data) {
  return defHttp.post({ url: `/api/${url}/ImportExceptionData`, data });
}
// 查询附近数据
export function getAroundList(data) {
  return defHttp.get({ url: Api.AMap + '/around', data });
}
// 根据关键字查询附近数据
export function getTextList(data) {
  return defHttp.get({ url: Api.AMap + '/text', data });
}
// 输入提示
export function getInputTips(data) {
  return defHttp.get({ url: Api.AMap + '/inputtips', data });
}
// 导入
export function upload(url, data) {
  return defHttp.post({ url: url, data, headers: { 'Content-Type': ContentTypeEnum.FORM_DATA } });
}
