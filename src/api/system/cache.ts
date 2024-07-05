import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/system/CacheManage',
}

// 获取缓存列表
export function getCacheList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 获取缓存详情
export function getInfo(id) {
  return defHttp.get({ url: Api.Prefix + '/' + id });
}
// 删除缓存
export function delCache(id) {
  return defHttp.delete({ url: Api.Prefix + '/' + id });
}
// 删除全部缓存
export function delAllCache() {
  return defHttp.post({ url: Api.Prefix + '/Actions/ClearAll' });
}
