import { createVar, keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

const angle = createVar({
  syntax: '<angle>',
  initialValue: '0deg',
  inherits: false,
});

const rotate = keyframes({
  'to': {
    vars: {
      [angle]: '360deg',
    },
  },
});

const checkboxContainer = style({
  display: 'flex',
  alignItems: 'flex-start',
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
      border: 'none',
      outline: 'none',
      ':focus-visible': {
        outlineOffset: '1px',
        outline: '3px solid oklch(62% 42% 250 / 50%)',
      },
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

export const button = recipe({
  base: {
    margin: 0,
    paddingInline: 16,
    paddingLeft: 8,
    paddingBlock: 0,
    border: 'none',
    outline: 'none',
    userSelect: 'none',
    height: 24,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 4,
    font: '500 12px/16px Inter',
    borderRadius: 3,
    ':focus-visible': {
      outlineOffset: '1px',
      outline: '3px solid oklch(62% 42% 250 / 50%)',
    },
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
    pending: {
      false: {},
      true: {
        // https://ibelick.com/blog/create-animated-gradient-borders-with-css
        // https://css-tip.com/border-gradient/
        position: 'relative',
        overflow: 'clip',
        '::before': {
          content: '',
          position: 'absolute',
          overflow: 'clip',
          inset: 0,
          borderRadius: 'inherit',
          padding: 2,
          background: `conic-gradient(from ${angle}, white, transparent, white)`,
          mask: 'conic-gradient(#000 0 0) content-box exclude, conic-gradient(#000 0 0)',
          animation: `1s ${rotate} linear infinite`,
          // Fix junk pixel when animating, dont know why it works...
          // https://stackoverflow.com/questions/54718832/pixel-jump-on-css-rotate-animation
          // https://stackoverflow.com/questions/9983520/webkit-animation-is-leaving-junk-pixels-behind-on-the-screen
          backfaceVisibility: 'hidden',
        },
      },
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
        ':hover': {
          background: 'oklch(from white l c h / 24%)',
        },
        ':active': {
          background: 'oklch(from white l c h / 16%)',
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
        ':hover': {
          background: 'oklch(72% 42% 250)',
        },
        ':active': {
          background: 'oklch(62% 42% 250)',
        },
      },
    },
  ],
  defaultVariants: {
    disabled: false,
    size: 'medium',
    color: 'secondary',
  }
});

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
    ':hover': {
      boxShadow: 'inset 0 0 0 1px oklch(from white l c h / 24%)',
    },
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

export const segmented = {
  control: recipe({
    base: {
      margin: 0,
      padding: 2,
      border: 'none',
      outline: 'none',
      userSelect: 'none',
      height: 22,
      // boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'stretch',
      columnGap: 2,
      borderRadius: 4,
      font: '500 12px/16px Inter',
      background: 'oklch(from white 24% c h)',
      boxShadow: 'inset 0 0 0 1px oklch(from white 20% c h)',
      ':focus-visible': {
        outlineOffset: '1px',
        outline: '3px solid oklch(62% 42% 250 / 50%)',
      },
    },
    variants: {
      disabled: {
        false: {},
        true: {},
      },
      readOnly: {
        false: {},
        true: {},
      },
      size: {
        small: {
          fontWeight: 500,
        },
        medium: {
          fontWeight: 500,
        },
        large: {
          fontWeight: 600,
        },
      },
    },
  }),
  item: recipe({
    base: {
      paddingInline: 12,
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      font: '500 12px/16px Inter',
    },
    variants: {
      active: {
        false: {
          color: 'oklch(from white 72% c h)',
          ':hover': {
            color: 'oklch(from white 100% c h)',
          },
        },
        true: {
          color: 'oklch(from white 100% c h)',
          background: 'oklch(from white 40% c h)',
          boxShadow: [
            'inset 0 0 0 1px oklch(from white l c h / 12%)',
            '0 0 0 1px oklch(from white 12% c h)',
          ].join(','),
        },
      },
    },
  }),
};
