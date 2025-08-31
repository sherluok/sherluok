import { style } from '@vanilla-extract/css';

export const page = {
  left: style({
    justifySelf: 'end',
    gridColumn: '1 / 2',
  }),
  center: style({
    gridColumn: '2 / 3',
    minHeight: 'calc(100dvh - 128px - 64px)',
  }),
  right: style({
    gridColumn: '3 / 4',
  }),
  map: style({
    width: 320,
  }),
};
