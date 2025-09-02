import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '^/web/vars.css';

export const globalLayout = {
  container: style({
    display: 'grid',
    gridTemplateColumns: '1fr 44rem minmax(20rem, 1fr)',
    alignContent: 'start',
    columnGap: 12,
    color: vars.textColor,
    backgroundColor: vars.backgroundColor,
    backgroundImage: vars.backgroundImage,
  }),
  header: style({
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'subgrid',
    alignItems: 'center',
    height: 64,
    margin: 32,
  }),
  main: style({
    gridColumn: '2 / 3',
    minHeight: 'calc(100dvh - 128px - 64px)',
  }),
  footer: style({
    gridColumn: '1 / -1',
    marginTop: 64,
    padding: 32,
    // background: 'light-dark(black, white)',
    // color: 'light-dark(white, black)',
    display: 'flex',
    justifyContent: 'center',
    color: 'light-dark(oklch(50% 0% 0deg), oklch(50% 0% 0deg))',
    font: `400 14px/16px ${vars.fontBody}`,
  }),
  icon: style({
    fontSize: 16,
    justifySelf: 'end',
    textDecoration: 'none',
    color: 'currentcolor',
  }),
  middle: style({
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
  }),
  title: recipe({
    base: {
      font: `700 16px/28px ${vars.fontBody}`,
      textDecoration: 'none',
      color: 'currentcolor',
    },
    variants: {
      isActive: {
        false: {},
        true: {
          boxShadow: `inset 0 -2px 0 0 currentcolor`,
        },
      },
      isPending: {
        false: {},
        true: {},
      },
      isTransitioning: {
        false: {},
        true: {},
      },
    },
  }),
  menuList: style({
    display: 'flex',
    justifyContent: 'center',
    gap: 32,
  }),
  menuItem: recipe({
    base: {
      font: `600 16px/28px ${vars.fontBody}`,
      textDecoration: 'none',
      color: 'currentcolor',
    },
    variants: {
      isActive: {
        false: {},
        true: {
          boxShadow: `inset 0 -2px 0 0 currentcolor`,
        },
      },
      isPending: {
        false: {},
        true: {},
      },
      isTransitioning: {
        false: {},
        true: {},
      },
    },
  }),
  externalLinkList: style({
    display: 'flex',
    alignItems: 'center',
    columnGap: 12,
    paddingInline: 32,
  }),
  externalLinkItem: style({
    fontSize: 20,
    textDecoration: 'none',
    color: 'currentcolor',
  }),
};
