import { globalStyle, GlobalStyleRule, style } from '@vanilla-extract/css';
import { vars } from '^/web/vars.css';

export const post = {
  header: style({
    gridColumn: '2 / 3',
    display: 'flex',
    flexDirection: 'column',
    rowGap: 8,
    marginBottom: 32,
  }),
  title: style({
    font: `900 40px/50px ${vars.fontBody}`,
    color: vars.textColor,
  }),
  metadata: style({
    font: `400 16px/28px ${vars.fontBody}`,
    color: vars.textColorSecondary,
  }),
  author: style({
    textDecoration: 'underline',
    textDecorationColor: `rgb(from currentcolor r g b / 50%)`,
  }),
  article: style({
    gridColumn: '2 / 3',
    font: `400 16px/28px ${vars.fontBody}`,
    color: vars.textColor,
  }),
  toc: style({
    gridColumn: '3 / 4',
    // background: 'red',
    display: 'flex',
    flexDirection: 'column',
    rowGap: 8,
    paddingBlock: 32,
    paddingInline: 32,
    position: 'sticky',
    top: 0,
    height: '99dvh',
    boxSizing: 'border-box',
  }),
  tocItem: style({
    font: `400 15px/24px ${vars.fontBody}`,
    textDecoration: 'underline',
    textDecorationColor: `rgb(from currentcolor r g b / 50%)`,
    color: 'currentcolor',
    ':hover': {
      color: 'oklch(70% 37% 262deg)',
    },
  }),
};

function mdxStyle(subSelector: string, rule: GlobalStyleRule) {
  globalStyle(`${post.article} ${subSelector}`, rule);
}

mdxStyle(`a`, {
  textDecoration: 'underline',
  textDecorationColor: `rgb(from currentcolor r g b / 50%)`,
  color: 'oklch(80% 36% 260deg)',
  font: 'inherit',
});

mdxStyle(`pre`, {
  background: 'oklch(100% 0% 262deg / 4%)',
  paddingInline: 16,
  paddingBlock: 12,
});

mdxStyle(`code`, {
  fontFamily: vars.fontCode,
});

mdxStyle(`pre code`, {
  fontSize: '14px',
  lineHeight: '20px',
});

mdxStyle(`p code`, {
  fontSize: '14px',
  lineHeight: '28px',
  background: 'oklch(100% 0% 262deg / 12%)',
  paddingInline: 4,
});
