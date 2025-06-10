import { createVar, globalStyle } from '@vanilla-extract/css';

export const vars = {
  textColor: createVar('color'),
  backgroundColor: createVar('backgroundColor'),
  backgroundImage: createVar('backgroundImage'),
  textColorSecondary: createVar(),
};

globalStyle('html', {
  '@media': {
    '(prefers-color-scheme: light)': {
      vars: {
        [vars.backgroundColor]: 'oklch(88% 16% 0deg)',
        [vars.backgroundImage]: 'none',
        [vars.textColor]: 'hsl(0 0% 8%)',
      },
    },
    '(prefers-color-scheme: dark)': {
      vars: {
        [vars.backgroundColor]: 'oklch(16% 0% 0deg)',
        [vars.backgroundImage]: 'none',
        [vars.textColor]: 'oklch(96% 0% 0deg)',
        [vars.textColorSecondary]: 'oklch(72% 0% 0deg)',
      },
    },
  },
});
