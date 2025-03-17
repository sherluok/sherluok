import { recipe } from '@vanilla-extract/recipes';

export const input = recipe({
  base: {
    margin: 0,
    border: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    font: '400 12px/16px Inter',
    borderRadius: 3,
    background: 'oklch(from black l c h / 36%)',
    boxShadow: 'inset 0 0 0 1px oklch(from white l c h / 16%)',
    color: 'white',
    ':focus': {
      boxShadow: 'inset 0 0 0 2px oklch(62% 42% 250)',
    },
    '::placeholder': {
      color: 'oklch(64% 0% 0)',
    },
  },
  variants: {
    component: {
      input: {
        paddingInline: '1em',
        paddingBlock: 0,
        height: 24,
      },
      textarea: {
        paddingInline: '1em',
        paddingBlock: 8,
      },
    },
    disabled: {
      false: {},
      true: {
        pointerEvents: 'none',
        background: 'oklch(from black l c h / 12%)',
        boxShadow: 'inset 0 0 0 1px oklch(from white l c h / 8%)',
        color: 'oklch(from white l c h / 48%)',
      },
    },
    readOnly: {
      false: {
      },
      true: {
      },
    },
    size: {
      small: {
      },
      medium: {
      },
      large: {
      },
    },
  },
});
