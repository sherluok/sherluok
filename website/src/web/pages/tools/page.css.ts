import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '^/web/vars.css';

export const page = {
  toolList: style({
    display: 'flex',
    flexDirection: 'column',
    rowGap: 16,
  }),
  toolItem: style({
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    gridTemplateAreas: `
      "icon title"
      "icon description"
    `,
    columnGap: 16,
    alignItems: 'center',
    textDecoration: 'none',
  }),
  itemIcon: style({
    gridArea: 'icon',
    width: 32,
    height: 32,
  }),
  itemTitle: style({
    gridArea: 'title',
    font: `600 16px/28px ${vars.fontBody}`,
    color: vars.textColor,
  }),
  itemDescription: style({
    gridArea: 'description',
    font: `400 14px/20px ${vars.fontBody}`,
    color: vars.textColor,
  }),
};

globalStyle(`${page.toolItem}:hover ${page.itemTitle}, ${page.toolItem}:hover ${page.itemDescription}`, {
  textDecoration: 'underline',
  textDecorationColor: `rgb(from currentcolor r g b / 50%)`,
});

globalStyle(`${page.toolItem}:hover ${page.itemTitle}`, {
  color: 'oklch(80% 36% 260deg)',
});
