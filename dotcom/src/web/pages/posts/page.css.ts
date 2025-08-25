import { style } from '@vanilla-extract/css';
import { vars } from '^/web/vars.css';

export const post = {
  container: style({
    display: 'flex',
    flexDirection: 'column',
    rowGap: 8,
    color: 'currentcolor',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
    marginBottom: 32,
  }),
  time: style({
    font: `400 14px/20px ${vars.fontBody}`,
    color: vars.textColorSecondary,
  }),
  title: style({
    font: `700 24px/28px ${vars.fontBody}`,
    color: vars.textColor,
  }),
  preview: style({
    font: `400 16px/28px ${vars.fontBody}`,
    color: vars.textColorSecondary,
  }),
};
