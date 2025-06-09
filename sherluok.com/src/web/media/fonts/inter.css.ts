// @font-face {
//   font-family: Inter;
//   font-style: normal;
//   font-weight: 100 900;
//   font-display: swap;
//   src: url("./inter-normal.woff2") format(woff2) tech(variations);
// }

// @font-face {
//   font-family: Inter;
//   font-style: italic;
//   font-weight: 100 900;
//   font-display: swap;
//   src: url("./inter-italic.woff2") format(woff2) tech(variations);
// }

import { globalFontFace } from '@vanilla-extract/css';
import { default as italic } from './inter-italic.woff2?resource';
import { default as normal } from './inter-normal.woff2?resource';

export const Inter = 'Inter';

globalFontFace(Inter, [
  {
    src: `url("${normal}") format(woff2) tech(variations);`,
    fontStyle: 'normal',
    fontWeight: '100 900',
    fontDisplay: 'swap',
  },
  {
    src: `url("${italic}") format(woff2) tech(variations);`,
    fontStyle: 'italic',
    fontWeight: '100 900',
    fontDisplay: 'swap',
  },
]);
