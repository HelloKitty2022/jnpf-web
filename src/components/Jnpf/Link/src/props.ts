export const linkProps = {
  content: { type: String, default: '' },
  href: { type: String, default: '' },
  target: { type: String, default: '_self' },
  onClick: { type: Function as PropType<(...args) => any>, default: null },
  textStyle: {
    type: Object,
    default: () => ({
      'text-align': 'left',
    }),
  },
};
