import NextI18Next from 'next-i18next';
import { config } from '@client/config';

const i18n = new NextI18Next({
  // defaultNS: 'lang',
  defaultLanguage: [config.i18n.defaultLang],
  otherLanguages: [config.i18n.EN, config.i18n.VN],
  localePath: `${process.env.NODE_ENV !== 'production' ? 'src' : 'dist'}/client/static/locales`,
});

const appWithTranslation = i18n.appWithTranslation;

const changeLanguage = (lang: string) => {
  i18n.i18n.changeLanguage(lang);
};

const translate = (key: string) => {
  return i18n.i18n.t(key);
};

const withNamespaces = i18n.withNamespaces;

export {
  i18n,
  appWithTranslation,
  translate,
  changeLanguage,
  withNamespaces,
};
