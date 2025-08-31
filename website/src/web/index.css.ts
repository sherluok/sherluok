import { globalStyle } from '@vanilla-extract/css';
import { vars } from '^/web/vars.css';

globalStyle('html', {
  colorScheme: 'light',
  '@media': {
    '(prefers-color-scheme: dark)': {
      colorScheme: 'dark',
    },
  },
});

globalStyle('html', {
  backgroundColor: `light-dark(white, black)`,
  color: `light-dark(black, white)`,
});

globalStyle('body', {
  fontFamily: vars.fontBody,
  margin: 0,
});

globalStyle('code', {
  fontFamily: vars.fontCode,
});
