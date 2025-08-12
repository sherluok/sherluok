import { createVar, globalStyle, keyframes, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

export const borderRadius = createVar();
export const baseBackground = createVar();
export const primaryForeground = createVar();
export const secondaryForeground = createVar();
export const placeholderTextColor = createVar();
export const disabledForeground = createVar();
export const inputBackground = createVar();
export const inputBackgroundHover = createVar();
export const inputBackgroundDisabled = createVar();
export const inputBoxShadow = createVar();
export const inputBoxShadowHover = createVar();
export const inputBoxShadowDisabled = createVar();
export const controlBackground = createVar();
export const controlBackgroundHover = createVar();
export const controlBackgroundDisabled = createVar();
export const controlBoxShadow = createVar();
export const controlBoxShadowHover = createVar();
export const controlBoxShadowDisabled = createVar();
export const accentBackground = createVar();
export const accentBackgroundHover = createVar();
export const focusRing = createVar();

// https://www.figma.com/plugin-docs/css-variables/

globalStyle('html', {
  color: primaryForeground,
  background: baseBackground,
  vars: {
    [borderRadius]: '3px',
  },
  '@media': {
    '(prefers-color-scheme: light)': {
      colorScheme: 'light',
      vars: {
        [baseBackground]: 'var(--figma-color-bg, oklch(from white 92% c h))',
        [primaryForeground]: 'oklch(from white 0% c h)',
        [secondaryForeground]: 'oklch(from white 24% c h)',
        [placeholderTextColor]: 'oklch(from white 48% c h)',
        [disabledForeground]: 'oklch(from white 64% c h)',

        [inputBackground]: 'oklch(from white 98% c h)',
        [inputBackgroundHover]: 'oklch(from white 24% c h)',
        [inputBackgroundDisabled]: 'oklch(from white 26% c h)',

        [inputBoxShadow]: 'inset 0 0 0 1px oklch(from white 86% c h)',
        [inputBoxShadowHover]: 'inset 0 0 0 1px oklch(from white 44% c h)',
        [inputBoxShadowDisabled]: 'inset 0 0 0 1px oklch(from white 38% c h)',

        [controlBackground]: 'oklch(from white 88% c h)',
        [controlBackgroundHover]: 'oklch(from white 44% c h)',
        [controlBackgroundDisabled]: 'oklch(from white 36% c h)',

        [controlBoxShadow]: 'inset 0 0 0 1px oklch(from white 80% c h)',
        [controlBoxShadowHover]: 'inset 0 0 0 1px oklch(from white 52% c h)',
        [controlBoxShadowDisabled]: 'inset 0 0 0 1px oklch(from white 48% c h)',

        [accentBackground]: 'oklch(62% 42% 250)',
        [accentBackgroundHover]: 'oklch(70% 42% 250)',

        [focusRing]: '3px solid oklch(62% 42% 250 / 50%)',
      },
    },
    '(prefers-color-scheme: dark)': {
      colorScheme: 'dark',
      vars: {
        [baseBackground]: 'var(--figma-color-bg, oklch(from white 29% c h))',
        [primaryForeground]: 'oklch(from white 100% c h)',
        [secondaryForeground]: 'oklch(from white 72% c h)',
        [placeholderTextColor]: 'oklch(from white 56% c h)',
        [disabledForeground]: 'oklch(from white 48% c h)',

        [inputBackground]: 'oklch(from white 24% c h)',
        [inputBackgroundHover]: 'oklch(from white 24% c h)',
        [inputBackgroundDisabled]: 'oklch(from white 26% c h)',

        [inputBoxShadow]: 'inset 0 0 0 1px oklch(from white 38% c h)',
        [inputBoxShadowHover]: 'inset 0 0 0 1px oklch(from white 44% c h)',
        [inputBoxShadowDisabled]: 'inset 0 0 0 1px oklch(from white 38% c h)',

        [controlBackground]: 'oklch(from white 40% c h)',
        [controlBackgroundHover]: 'oklch(from white 44% c h)',
        [controlBackgroundDisabled]: 'oklch(from white 36% c h)',

        [controlBoxShadow]: 'inset 0 0 0 1px oklch(from white 48% c h)',
        [controlBoxShadowHover]: 'inset 0 0 0 1px oklch(from white 52% c h)',
        [controlBoxShadowDisabled]: 'inset 0 0 0 1px oklch(from white 48% c h)',

        [accentBackground]: 'oklch(62% 42% 250)',
        [accentBackgroundHover]: 'oklch(70% 42% 250)',

        [focusRing]: '3px solid oklch(62% 42% 250 / 50%)',
      },
    },
  },
});

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
        outlineOffset: 1,
        outline: focusRing,
      },
    },
    variants: {
      component: {
        checkbox: {
          borderRadius,
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
          background: controlBackground,
          boxShadow: controlBoxShadow,
          selectors: {
            [`${checkboxContainer}:hover &`]: {
              background: controlBackgroundHover,
              boxShadow: controlBoxShadowHover,
            },
          },
        },
        true: {
          color: 'white',
          background: accentBackground,
          selectors: {
            [`${checkboxContainer}:hover &`]: {
              background: accentBackgroundHover,
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
    borderRadius,
    ':focus-visible': {
      outlineOffset: 1,
      outline: focusRing,
    },
  },
  variants: {
    disabled: {
      false: {
      },
      true: {
        pointerEvents: 'none',
        background: controlBackground,
        boxShadow: controlBoxShadow,
        color: disabledForeground,
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
        color: primaryForeground,
        background: controlBackground,
        boxShadow: controlBoxShadow,
        ':hover': {
          background: controlBackgroundHover,
          boxShadow: controlBoxShadowHover,
        },
        ':active': {
          background: controlBackground,
          boxShadow: controlBoxShadow,
        },
      },
    },
    {
      variants: {
        disabled: false,
        color: 'primary',
      },
      style: {
        boxShadow: 'none',
        color: primaryForeground,
        background: accentBackground,
        ':hover': {
          background: accentBackgroundHover,
        },
        ':active': {
          background: accentBackground,
        },
      },
    },
  ],
});

export const input = recipe({
  base: {
    margin: 0,
    minWidth: '8em',
    border: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    font: '400 12px/16px Inter',
    borderRadius,
    background: inputBackground,
    boxShadow: inputBoxShadow,
    color: primaryForeground,
    ':hover': {
      background: inputBackgroundHover,
      boxShadow: inputBoxShadowHover,
    },
    ':focus-visible': {
      boxShadow: `inset 0 0 0 2px ${accentBackground}`,
    },
    '::placeholder': {
      color: placeholderTextColor,
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
        background: inputBackgroundDisabled,
        boxShadow: inputBoxShadowDisabled,
        color: disabledForeground,
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
      borderRadius,
      background: controlBackground,
      boxShadow: controlBoxShadow,
      ':hover': {
        background: controlBackgroundHover,
        boxShadow: controlBoxShadowHover,
      },
      ':focus-visible': {
        outlineOffset: 1,
        outline: focusRing,
      },
    },
    variants: {
      disabled: {
        false: {},
        true: {
          pointerEvents: 'none',
          background: controlBackgroundDisabled,
          boxShadow: controlBoxShadowDisabled,
          color: disabledForeground,
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
    },
  }),
  body: style({
    userSelect: 'none',
    font: '400 12px/16px Inter',
    color: primaryForeground,
  }),
  placeholder: style({
    userSelect: 'none',
    font: '400 12px/16px Inter',
    color: placeholderTextColor,
  }),
  indicator: {
    container: style({
      width: '1em',
      height: '1em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: secondaryForeground,
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
      padding: 1,
      border: 'none',
      outline: 'none',
      userSelect: 'none',
      height: 24,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'stretch',
      columnGap: 0,
      borderRadius: `calc(${borderRadius} + 1px)`,
      font: '500 12px/16px Inter',
      background: inputBackground,
      boxShadow: `inset 0 0 0 1px oklch(from ${inputBackground} calc(l - .12) c h)`,
      ':focus-visible': {
        outlineOffset: 1,
        outline: focusRing,
      },
    },
    variants: {
      disabled: {
        false: {},
        true: {
          background: inputBackgroundDisabled,
          boxShadow: `inset 0 0 0 1px oklch(from ${inputBackgroundDisabled} calc(l - .12) c h)`,
        },
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
      borderRadius,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      font: '500 12px/16px Inter',
    },
    variants: {
      active: {
        false: {
          color: secondaryForeground,
          ':hover': {
            color: primaryForeground,
          },
        },
        true: {
          color: primaryForeground,
          background: controlBackground,
          boxShadow: [
            controlBoxShadow,
            `0 0 0 1px oklch(from ${inputBackground} calc(l - .12) c h)`,
          ].join(','),
        },
      },
    },
  }),
};
