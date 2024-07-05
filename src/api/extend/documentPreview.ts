import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/extend/DocumentPreview',
}

// 获取文档列表
export function getDocumentPreviewList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 文件在线预览
export function previewFile(fileId, type) {
  return defHttp.get({ url: Api.Prefix + `/${fileId}/Preview?previewType=${type}` });
}
