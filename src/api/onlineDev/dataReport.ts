import { defHttp } from '/@/utils/http/axios';
import { useGlobSetting } from '/@/hooks/setting';

enum Api {
  Prefix = '/Data',
}

const { reportServer } = useGlobSetting();

// 获取报表列表
export function getDataReportList(data) {
  return defHttp.get({ url: reportServer + Api.Prefix, data });
}
// 获取报表下拉列表
export function getDataReportSelector() {
  return defHttp.get({ url: reportServer + Api.Prefix + '/Selector' });
}
// 删除报表
export function delDataReport(id) {
  return defHttp.delete({ url: reportServer + Api.Prefix + '/' + id });
}
// 复制报表
export function copy(id) {
  return defHttp.post({ url: reportServer + Api.Prefix + `/${id}/Actions/Copy` });
}
// 启用禁用报表
export function release(id) {
  return defHttp.put({ url: reportServer + Api.Prefix + `/${id}/Actions/State` });
}
// 获取信息
export function getDataReportInfo(id) {
  return defHttp.get({ url: reportServer + Api.Prefix + `/${id}` });
}
