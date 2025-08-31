type I18NItem = {
  en: string;
  zhCN?: string;
};

export const i18n = Object.freeze({
  brandName: {
    en: 'SherLuoK',
    zhCN: '傻罗克',
  },
  navItemPosts: {
    en: 'Posts',
  },
  navItemPhoto: {
    en: 'Photo',
  },
  navItemMusic: {
    en: 'Music',
  },
  navItemTools: {
    en: 'Tools',
  },
} satisfies {
  [key: string]: I18NItem;
});
