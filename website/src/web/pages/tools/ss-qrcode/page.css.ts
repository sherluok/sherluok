import { style } from '@vanilla-extract/css';
import { vars } from '^/web/vars.css';

export const form = style({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  columnGap: 8,
  rowGap: 16,
  paddingBlock: 32,
});

export const field = style({
  gridColumn: '1 / -1',
  display: 'grid',
  gridTemplateColumns: 'subgrid',
});

export const label = style({
  justifySelf: 'end',
});

export const input = style({
  background: 'light-dark(oklch(50% 10% 262deg / 8%), oklch(100% 10% 262deg / 8%))',
  border: 'none',
  outline: 'none',
  borderRadius: 3,
  paddingInline: 8,
  paddingBlock: 4,
  font: `400 14px/16px ${vars.fontBody}`,
  boxShadow: 'inset 0 0 0 1px oklch(50% 10% 262deg / 16%)',
  ':focus': {
    boxShadow: [
      '0 0 0 2px oklch(60% 40% 260deg)',
    ].join(','),
  },
});

export const uri = style({
  marginBlock: 8,
  paddingInlineStart: 12,
  paddingInlineEnd: 4,
  paddingBlock: 4,
  background: 'light-dark(oklch(50% 10% 262deg / 8%), oklch(100% 10% 262deg / 8%))',
  borderRadius: 4,
  font: `400 14px/16px ${vars.fontCode}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const copyBtn = style({
  fontSize: 16,
  width: 28,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 3,
  cursor: 'pointer',
  color: 'oklch(64% 10% 262deg)',
  ':hover': {
    // background: 'light-dark(oklch(50% 10% 262deg / 12%), oklch(100% 10% 262deg / 12%))',
    color: 'oklch(32% 16% 262deg)',
  },
});

export const fieldset = style({
  borderWidth: 1,
  borderColor: 'light-dark(oklch(50% 10% 262deg / 24%), oklch(100% 10% 262deg / 24%))',
  borderRadius: 5,
});
