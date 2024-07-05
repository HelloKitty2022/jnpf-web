import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/extend/BigData',
}

// 获取数据列表（分页）
export function getBigDataList(data) {
  return defHttp.get({ url: Api.Prefix, data });
}
// 预览数据库表
export function createBigData() {
  return defHttp.post({ url: Api.Prefix });
}
