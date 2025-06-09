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
        [vars.textColor]: 'hsl(0 0% 8%)',
        [vars.backgroundColor]: 'oklch(88% 16% 0deg)',
        [vars.backgroundImage]: 'none',
      },
    },
    '(prefers-color-scheme: dark)': {
      vars: {
        [vars.textColor]: 'oklch(96% 0% 0deg)',
        [vars.backgroundColor]: 'oklch(16% 0% 0deg)',
        [vars.backgroundImage]: 'none',
        [vars.textColorSecondary]: 'oklch(80% 0% 0deg)',
      },
    },
  },
});
