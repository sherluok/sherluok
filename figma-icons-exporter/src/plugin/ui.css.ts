import { globalStyle, style } from '@vanilla-extract/css';

globalStyle('html', {
  fontFamily: 'Inter, sans-serif',
  fontSize: 16,
  '@media': {
    '(prefers-color-scheme: dark)': {
      colorScheme: 'dark',
      background: '#2c2c2c',
    },
  },
});

globalStyle('body', {
  margin: 0,
  padding: 0,
});

export const nodeNamePickerCombo = style({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  alignItems: 'stretch',
  columnGap: 8,
});

export const icon = {
  container: style({
    width: '1em',
    height: '1em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  svg: style({
    maxWidth: '1em',
    maxHeight: '1em',
  }),
};

export const group = {
  container: style({
    borderTop: '1px solid hsl(from white h s l / 12%)',
    display: 'flex',
    flexDirection: 'column',
    paddingInline: 20,
    paddingBlock: 16,
    rowGap: 16,
  }),
  header: style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),
  title: style({
    font: '700 12px/16px Inter',
  }),
};

export const targets = {
  grid: style({
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    alignItems: 'center',
    columnGap: 8,
    rowGap: 6,
  }),
  checkbox: style({
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'subgrid',
    columnGap: 8,
  }),
  button: style({
    gridColumn: '1 / 2',
    margin: 0,
  }),
  label: style({
    gridColumn: '2 / 3',
    font: '500 12px/16px Inter',
  }),
  desciption: style({
    gridColumn: '2 / 3',
    font: '300 11px/16px Inter',
    color: 'oklch(from white l c h / 48%)',
    userSelect: 'none',
  }),
  content: style({
    gridColumn: '2 / 3',
    font: '400 12px/16px Inter',
    display: 'flex',
    flexDirection: 'column',
    rowGap: 6,
  }),
};

export const desciption = style({
  font: '300 11px/16px Inter',
  color: 'oklch(from white l c h / 48%)',
  userSelect: 'none',
});
