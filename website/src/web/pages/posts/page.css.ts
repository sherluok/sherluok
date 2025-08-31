import { style } from '@vanilla-extract/css';
import { vars } from '^/web/vars.css';

const root = style({
  display: 'flex',
  flexDirection: 'column',
  rowGap: 8,
  color: 'currentcolor',
  textDecoration: 'none',
  // ':hover': {
  //   textDecoration: 'underline',
  // },
  marginBottom: 32,
});

export const post = {
  container: root,
  time: style({
    font: `500 14px/28px ${vars.fontBody}`,
    color: vars.textColorSecondary,
  }),
  title: style({
    font: `700 24px/28px ${vars.fontBody}`,
    color: vars.textColor,
    selectors: {
      [`${root}:hover &`]: {
        textDecoration: 'underline',
      },
    },
  }),
  preview: style({
    font: `400 16px/28px ${vars.fontBody}`,
    color: vars.textColorSecondary,
    selectors: {
      [`${root}:hover &`]: {
        textDecoration: 'underline',
      },
    },
  }),
};
