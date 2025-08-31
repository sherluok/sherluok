import { style } from '@vanilla-extract/css';
import { vars } from '^/web/vars.css';

export const page = {
  main: style({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  title: style({
    font: `600 16px/48px ${vars.fontBody}`,
    color: 'oklch(80% 0% 0deg)',
  }),
  icon: style({
    fontSize: 48,
    color: 'oklch(80% 0% 0deg)',
  }),
  link: style({
    font: `600 14px/40px ${vars.fontBody}`,
    textDecoration: 'underline',
    textDecorationColor: `rgb(from currentcolor r g b / 50%)`,
    color: 'oklch(80% 36% 260deg)',
  }),
};
