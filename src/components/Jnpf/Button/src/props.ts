export const buttonProps = {
  align: { type: String, default: 'left' },
  buttonText: { type: String, default: '' },
  onClick: { type: Function as PropType<(...args) => any>, default: null },
};
