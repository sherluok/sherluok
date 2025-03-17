import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

const checkboxContainer = style({
  display: 'flex',
  alignItems: 'center',
  columnGap: 8,
});

export const checkbox = {
  container: checkboxContainer,
  button: recipe({
    base: {
      width: 14,
      height: 14,
      fontSize: 8,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    variants: {
      component: {
        checkbox: {
          borderRadius: 3,
        },
        radio: {
          borderRadius: 999,
        },
      },
      disabled: {
        false: {
        },
        true: {
        },
      },
      checked: {
        false: {
          color: 'transparent',
          background: 'oklch(from white l c h / 16%)',
          boxShadow: 'inset 0 0 0 1px oklch(from white l c h / 12%)',
          selectors: {
            [`${checkboxContainer}:hover &`]: {
              background: 'oklch(from white l c h / 24%)',
              boxShadow: 'inset 0 0 0 1px oklch(from white l c h / 16%)',
            },
            ['&:focus']: {
              boxShadow: 'inset 0 0 0 2px oklch(62% 42% 250)',
            },
          },
        },
        true: {
          color: 'white',
          background: 'oklch(62% 42% 250)',
          selectors: {
            [`${checkboxContainer}:hover &`]: {
              background: 'oklch(70% 50% 250)',
            },
          },
        },
      },
    },
  }),
  label: recipe({
    base: {
      font: '500 12px/16px Inter',
      userSelect: 'none',
    },
    variants: {
      disabled: {
        false: {

        },
        true: {

        },
      },
    },
  }),
};
