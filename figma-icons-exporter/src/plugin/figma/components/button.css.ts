import { recipe } from '@vanilla-extract/recipes';

export const button = recipe({
  base: {
    margin: 0,
    paddingInline: 16,
    paddingLeft: 8,
    paddingBlock: 0,
    border: 'none',
    outline: 'none',
    height: 24,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 4,
    font: '500 12px/16px Inter',
    borderRadius: 3,
  },
  variants: {
    disabled: {
      false: {},
      true: {
        pointerEvents: 'none',
        background: 'oklch(from white l c h / 8%)',
        boxShadow: 'inset 0 0 0 1px oklch(from white l c h / 6%)',
        color: 'oklch(from white l c h / 48%)',
      },
    },
    size: {
      small: {
        paddingInline: 12,
        paddingLeft: 6,
        height: 20,
        fontWeight: 500,
      },
      medium: {
        paddingInline: 16,
        paddingLeft: 8,
        height: 24,
        fontWeight: 500,
      },
      large: {
        paddingInline: 20,
        paddingLeft: 10,
        height: 32,
        fontWeight: 600,
      },
    },
    color: {
      secondary: {},
      primary: {},
    },
  },
  compoundVariants: [
    {
      variants: {
        disabled: false,
        color: 'secondary',
      },
      style: {
        background: 'oklch(from white l c h / 16%)',
        boxShadow: 'inset 0 0 0 1px oklch(from white l c h / 12%)',
        ':focus': {
          boxShadow: 'inset 0 0 0 2px oklch(62% 42% 250)',
        },
      },
    },
    {
      variants: {
        disabled: false,
        color: 'primary',
      },
      style: {
        background: 'oklch(62% 42% 250)',
        boxShadow: 'none',
      },
    },
  ],
  defaultVariants: {
    disabled: false,
    size: 'medium',
    color: 'secondary',
  }
});
