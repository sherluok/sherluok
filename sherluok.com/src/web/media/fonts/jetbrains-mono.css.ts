// @font-face {
//   font-family: "JetBrains Mono";
//   font-style: normal;
//   font-weight: 100 900;
//   font-display: swap;
//   src: url("./jetbrains-mono-normal.ttf") format(truetype) tech(variations);
// }

// @font-face {
//   font-family: "JetBrains Mono";
//   font-style: italic;
//   font-weight: 100 900;
//   font-display: swap;
//   src: url("./jetbrains-mono-italic.ttf") format(truetype) tech(variations);
// }

import { globalFontFace } from '@vanilla-extract/css';
import { default as italic } from './jetbrains-mono-italic.ttf?resource';
import { default as normal } from './jetbrains-mono-normal.ttf?resource';

export const JetBrainsMono = 'JetBrains Mono';

globalFontFace(JetBrainsMono, [
  {
    src: `url("${normal}") format(truetype) tech(variations);`,
    fontStyle: 'normal',
    fontWeight: '100 800',
    fontDisplay: 'swap',
  },
  {
    src: `url("${italic}") format(truetype) tech(variations);`,
    fontStyle: 'italic',
    fontWeight: '100 800',
    fontDisplay: 'swap',
  },
]);
