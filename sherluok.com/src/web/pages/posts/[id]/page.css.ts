import { style } from '@vanilla-extract/css';
import { Inter } from '^/web/media/fonts/inter.css';
import { vars } from '^/web/vars.css';

export const post = {
  container: style({
    display: 'flex',
    flexDirection: 'column',
    rowGap: 8,
    marginBottom: 32,
  }),
  title: style({
    font: `900 40px/50px ${Inter}, sans-serif, system-ui`,
    color: vars.textColor,
  }),
  metadata: style({
    font: `400 16px/28px ${Inter}, sans-serif, system-ui`,
    color: vars.textColorSecondary,
  }),
  article: style({
    font: `400 16px/28px ${Inter}, sans-serif, system-ui`,
    color: vars.textColor,
  }),
};
