import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

export const select = {
  container: recipe({
    base: {
      margin: 0,
      border: 'none',
      outline: 'none',
      boxSizing: 'border-box',
      display: 'grid',
      alignItems: 'center',
      gridTemplateColumns: 'minmax(0, 1fr) auto',
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
          height: 20,
          paddingLeft: 6,
          paddingRight: 12,
          columnGap: 4,
          fontWeight: 500,
        },
        medium: {
          height: 24,
          columnGap: 8,
          paddingLeft: 12,
          paddingRight: 8,
          fontWeight: 500,
        },
        large: {
          height: 32,
          paddingLeft: 10,
          paddingRight: 20,
          columnGap: 4,
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
  }),
  body: style({
    userSelect: 'none',
    font: '400 12px/16px Inter',
    color: 'white',
  }),
  placeholder: style({
    userSelect: 'none',
    font: '400 12px/16px Inter',
    color: 'oklch(from white l c h / 60%)',
  }),
  indicator: {
    container: style({
      width: '1em',
      height: '1em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'oklch(from white l c h / 48%)',
      marginInline: 0,
    }),
    svg: style({
      maxWidth: '1em',
      maxHeight: '1em',
    }),
  },
};
