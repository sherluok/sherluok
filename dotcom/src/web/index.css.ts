import { globalStyle } from '@vanilla-extract/css';
import { Inter } from './media/fonts/inter.css';
import { JetBrainsMono } from './media/fonts/jetbrains-mono.css';

globalStyle('html', {
  fontFamily: `${Inter}, system-ui`,
  color: `light-dark(black, white)`,
  backgroundColor: `light-dark(white, oklch(20% 0% 48))`,
  '@media': {
    '(prefers-color-scheme: dark)': {
      colorScheme: 'dark',
    },
  },
});

globalStyle('html', {
  fontFamily: `${Inter}, sans-serif, system-ui`,
  backgroundColor: `light-dark(white, oklch(20% 0% 48))`,
  color: `light-dark(black, white)`,
});

globalStyle('body', {
  margin: 0,
});

globalStyle('code', {
  fontFamily: `${JetBrainsMono}, monospace, system-ui`,
});
