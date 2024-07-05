import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/BillRule',
}

// 获取单据规则列表(带分页)
export function getBillRuleList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取单据规则下拉框列表
export function getBillRuleSelector(data) {
  return defHttp.get({ url: Api.Prefix + `/Selector`, data });
}
// 新建单据规则
export function createBillRule(data) {
  return defHttp.post({ url: Api.Prefix, data });
}
// 修改单据规则
export function updateBillRule(data) {
  return defHttp.put({ url: Api.Prefix + '/' + data.id, data });
}
// 获取单据规则
export function getBillRuleInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除单据规则
export function delBillRule(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 生成单据单号
export function getBillNumber(enCode) {
  return defHttp.get({ url: Api.Prefix + `/BillNumber/${enCode}` });
}
// 导出
export function exportTpl(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}/Actions/Export` });
}
