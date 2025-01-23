import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import type { QuasarLanguage } from 'quasar';
import { Quasar } from 'quasar'
import { errorToString } from 'src/misc'

// TODO: Lazy-load translations; This import will import all languages, even if only one is going to be used
import messages from 'src/i18n'

export type MessageLanguage = keyof typeof messages
export const MessageLanguages = Object.keys(messages) as [MessageLanguage]
// Type-define 'en' as the master schema for the resource
export type MessageSchema = typeof messages['en']

/**
 * Defines how to load a quasar language pack. Wrapped in function calls to not resolve the promise early
 * https://quasar.dev/options/quasar-language-packs
 */
const quasarLangPacks: { [k in MessageLanguage]: () => Promise<QuasarLanguage>} = {
  de: async () => (await import('quasar/lang/de')).default,
  en: async () => (await import('quasar/lang/en-US')).default,
  es: async () => (await import('quasar/lang/es')).default,
  fr: async () => (await import('quasar/lang/fr')).default,
  it: async () => (await import('quasar/lang/it')).default,
  nl: async () => (await import('quasar/lang/nl')).default,
  pl: async () => (await import('quasar/lang/pl')).default,
  pt: async () => (await import('quasar/lang/pt')).default,
  sv: async () => (await import('quasar/lang/sv')).default
}

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
declare module 'vue-i18n' {
  // define the locale messages schema
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {
    numeric: {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }
  }

  // define the number format schema
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineNumberFormat {}
}

/**
 * Get the user's locale and process it; If we don't have language support for it, 'en' is returned
 */
export function getUserLocale (): MessageLanguage {
  let userLocale = Quasar.lang.getLocale()
  if (userLocale) {
    // Remove region suffix, e.g. 'en-US' => 'en'
    if (userLocale.includes('-')) userLocale = userLocale.split('-')[0]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (MessageLanguages.includes(userLocale as any)) return userLocale as MessageLanguage
  }
  return 'en'
}

const numeric = {
  numeric: {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  } as { // Explicit type annotation to prevent type errors; Not sure why I need those...
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  }
}

const i18n = createI18n({
  locale: getUserLocale(),
  fallbackLocale: 'en',
  legacy: false,
  // Explicit type conversation makes sure typing is working as intended
  // Otherwise, due to our translations being incomplete, a type error is
  // emitted, which cripples type inference of global i18n instance
  messages: messages as unknown as {[k in MessageLanguage]: MessageSchema},
  datetimeFormats: {
    en: numeric,
    de: numeric,
    es: numeric,
    fr: numeric,
    it: numeric,
    nl: numeric,
    pl: numeric,
    sv: numeric
  }
})

export default defineBoot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n)
})

export function setGlobalLocale (lang: MessageLanguage) {
  i18n.global.locale.value = lang
  // This is cached by vite. Its transpiled into a simple import statement, which if called a second time won't make another request to the server
  quasarLangPacks[lang]()
    .then(pack => Quasar.lang.set(pack))
    .catch(err => console.error(`Failed to load Quasar language pack for locale "${lang}": ${errorToString(err)}`))
}
