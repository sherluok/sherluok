type I18NItem = {
  en: string;
  zh?: string;
};

export const i18n = Object.freeze({
  brandName: {
    en: 'SherLuoK',
    zh: '傻罗克',
  },
  navItemPosts: {
    en: 'Posts',
    zh: '文章',
  },
  navItemPhoto: {
    en: 'Photo',
    zh: '摄影',
  },
  navItemMusic: {
    en: 'Music',
    zh: '音乐',
  },
  navItemTools: {
    en: 'Tools',
    zh: '工具',
  },
} satisfies {
  [key: string]: I18NItem;
});
