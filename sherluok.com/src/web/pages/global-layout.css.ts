import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { Inter } from '^/web/media/fonts/inter.css';
import { vars } from '^/web/vars.css';

export const globalLayout = {
  container: style({
    display: 'grid',
    gridTemplateColumns: '1fr 44rem 1fr',
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
    minHeight: '100dvh',
  }),
  footer: style({
    gridColumn: '1 / -1',
    marginTop: 64,
    padding: 32,
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
      font: `600 16px/28px ${Inter}, sans-serif, system-ui`,
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
      font: `600 16px/28px ${Inter}, sans-serif, system-ui`,
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
    gap: 20,
    paddingInline: 32,
  }),
  externalLinkItem: style({
    fontSize: 20,
    textDecoration: 'none',
    color: 'currentcolor',
  }),
};
