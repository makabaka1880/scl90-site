import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import zh from './locales/zh.json';

const getBrowserLocale = (): string => {
    if (typeof navigator === 'undefined') return 'en';
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith('zh')) return 'zh';
    return 'en';
};

const getLocale = (): string => {
    if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('scl90-locale');
        if (stored && ['en', 'zh'].includes(stored)) {
            return stored;
        }
    }
    return getBrowserLocale();
};

export const i18n = createI18n({
    legacy: false,
    locale: getLocale(),
    fallbackLocale: 'en',
    messages: {
        en,
        zh
    }
});

export const setLocale = (locale: string) => {
    i18n.global.locale.value = locale as "en" | "zh"; // WTF
    localStorage.setItem('scl90-locale', locale);
};
