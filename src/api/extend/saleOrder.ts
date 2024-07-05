import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/extend/saleOrder',
}

// 获取订单列表
export function getOrderList(data) {
  return defHttp.get({ url: Api.Prefix + '/Product', data });
}
//订单详情
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + `/Product/${id}` });
}
//新建订单
export function createOrder(data) {
  return defHttp.post({ url: Api.Prefix + `/Product`, data });
}
// 编辑订单
export function updateOrder(data) {
  return defHttp.put({ url: Api.Prefix + `/Product/${data.id}`, data });
}
// 删除订单
export function delOrder(id) {
  return defHttp.delete({ url: Api.Prefix + `/Product/${id}` });
}
// 获取客户类别
export function getCustomer(data) {
  return defHttp.get({ url: Api.Prefix + '/Customer', data });
}
// 获取分类
export function getProductClassify() {
  return defHttp.get({ url: Api.Prefix + '/Classify' });
}
// 获取商品列表
export function getGoodsList(data) {
  return defHttp.get({ url: Api.Prefix + '/Goods', data });
}
// 获取商品列表(通过type)
export function getGoodsListByType(type) {
  return defHttp.get({ url: Api.Prefix + `/Goods/getGoodList?type=${type}` });
}
// 获取销售明细
export function getProductEntry(id) {
  return defHttp.get({ url: Api.Prefix + `/Product/ProductEntry/${id}` });
}
// 产品下拉
export function getGoodsSelector(data) {
  return defHttp.get({ url: Api.Prefix + '/Goods/Selector', data });
}
