import { defHttp } from '/@/utils/http/axios';

enum Api {
  Prefix = '/api/blade-visual/visual',
}

// 获取大屏下拉框
export function getDataVSelector() {
  return defHttp.get({ url: Api.Prefix + '/Selector' });
}
