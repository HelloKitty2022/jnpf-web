import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/extend/Employee',
}

// 获取职员列表
export function getEmployeeList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 删除职员
export function delEmployee(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 导出Excel
export function exportExcel(data) {
  return defHttp.get({ url: Api.Prefix + `/ExportData`, data });
}
// 导入模板下载
export function templateDownload() {
  return defHttp.get({ url: Api.Prefix + `/TemplateDownload` });
}
// 导入
export function importData(data) {
  return defHttp.post({ url: Api.Prefix + `/ImportData`, data });
}
// 导入预览
export function importPreview(data) {
  return defHttp.get({ url: Api.Prefix + `/ImportPreview`, data });
}
