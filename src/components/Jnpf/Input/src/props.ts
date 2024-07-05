export const inputProps = {
  showPassword: { type: Boolean, default: false },
  prefixIcon: { type: String, default: '' },
  suffixIcon: { type: String, default: '' },
  detailed: { type: Boolean, default: false },
  showOverflow: { type: Boolean, default: false },
  useScan: { type: Boolean, default: false },
  useMask: { type: Boolean, default: false },
  maskConfig: {
    type: Object,
    default: () => ({}),
  },
  value: String,
};
export const textareaProps = {
  rows: { default: 3 },
  value: String,
};
