export interface imgItem {
  name: string;
  fileId: string;
  url: string;
  thumbUrl: string;
}
export interface fileItem extends imgItem {
  fileSize: number | string;
  fileExtension?: string;
  fileVersionId?: string;
}

export const units = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
};
const uploadBaseProps = {
  disabled: { type: Boolean, default: false },
  detailed: { type: Boolean, default: false },
  sizeUnit: { type: String, default: 'MB' },
  fileSize: { type: Number, default: 10 },
  limit: { type: Number, default: 0 },
  tipText: { type: String, default: '' },
  showTip: { type: Boolean, default: false },
  simple: { type: Boolean, default: false },
  showUploadList: { type: Boolean, default: true },
  pathType: { type: String, default: 'defaultPath' },
  isAccount: { type: Number, default: 0 },
  folder: { type: String, default: '' },
};

export const uploadImgProps = {
  ...uploadBaseProps,
  value: { type: Array as PropType<imgItem[]> },
  type: { type: String, default: 'annexpic' },
  accept: { type: String, default: 'image/*' },
  buttonText: { type: String, default: '' },
};
export const uploadFileProps = {
  ...uploadBaseProps,
  value: { type: Array as PropType<fileItem[]>, default: [] },
  type: { type: String, default: 'annex' },
  accept: { type: String, default: '*' },
  buttonText: { type: String, default: '点击上传' },
  showIcon: { type: Boolean, default: true },
  showView: { type: Boolean, default: true },
  showDownload: { type: Boolean, default: true },
};
export const uploadImgSingleProps = {
  value: { type: String, default: '' },
  tipText: { type: String, default: '' },
  subTipText: { type: String, default: '' },
  type: { type: String, default: 'annexpic' },
  accept: { type: String, default: 'image/*' },
  disabled: { type: Boolean, default: false },
  sizeUnit: { type: String, default: 'MB' },
  fileSize: { type: Number, default: 10 },
};
