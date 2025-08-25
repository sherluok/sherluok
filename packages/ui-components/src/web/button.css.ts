import { recipe } from '@vanilla-extract/recipes';

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
          background: 'conic-gradient(from var(--angle), white, transparent, white)',
          mask: 'conic-gradient(#000 0 0) content-box exclude, conic-gradient(#000 0 0)',
          animation: `1s rotate linear infinite`,
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
