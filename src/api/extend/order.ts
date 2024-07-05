import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/extend/CrmOrder',
}

// 获取订单列表
export function getOrderList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 删除订单
export function delOrder(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 获取订单列表-订单商品
export function getOrderEntryList(id) {
  return defHttp.get({ url: Api.Prefix + `/OrderEntry/${id}/Items` });
}
// 获取订单列表-收款计划
export function getOrderPlanList(id) {
  return defHttp.get({ url: Api.Prefix + `/${id}/CollectionPlan` });
}
// 获取客户列表
export function getCustomerList(keyword?) {
  return defHttp.get({ url: Api.Prefix + `/Customer`, data: { keyword } });
}
// 获取客户列表
export function getGoodsList(data) {
  return defHttp.get({ url: Api.Prefix + `/Goods`, data });
}
