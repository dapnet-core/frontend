import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'
import { Quasar, QuasarLanguage } from 'quasar'
import { errorToString } from 'src/misc'

// TODO: Lazy-load languages
import messages from 'src/i18n'

export type MessageLanguage = keyof typeof messages
export const MessageLanguages = Object.keys(messages) as [MessageLanguage]
// Type-define 'en' as the master schema for the resource
export type MessageSchema = typeof messages['en']

/**
 * Function to dynamically load Quasar language packs, see
 * https://quasar.dev/options/quasar-language-packs
 */
async function loadLangPack (lang: MessageLanguage, fileName: string = lang): Promise<QuasarLanguage> {
  try {
    return (await import(`../../node_modules/quasar/lang/${fileName}.mjs`)).default
  } catch (err) {
    console.error(`Failed to load Quasar language pack for locale "${lang}": ${errorToString(err)}`)
    throw err
  }
}

const quasarLangPacks: { [k in MessageLanguage]: QuasarLanguage} = {
  de: await loadLangPack('de'),
  en: await loadLangPack('en', 'en-US'),
  es: await loadLangPack('es'),
  fr: await loadLangPack('fr'),
  it: await loadLangPack('it'),
  nl: await loadLangPack('nl'),
  pl: await loadLangPack('pl'),
  pt: await loadLangPack('pt'),
  sv: await loadLangPack('sv')
}

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-interface */
declare module 'vue-i18n' {
  // define the locale messages schema
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
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-interface */

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

const i18n = createI18n({
  locale: getUserLocale(),
  fallbackLocale: 'en',
  legacy: false,
  messages,
  // TODO: Auto-generate DatetimeFormats
  datetimeFormats: {
    en: {
      numeric: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }
    },
    de: {
      numeric: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }
    },
    es: {
      numeric: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }
    },
    fr: {
      numeric: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }
    },
    it: {
      numeric: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }
    },
    nl: {
      numeric: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }
    },
    pl: {
      numeric: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }
    },
    sv: {
      numeric: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }
    }
  }
})

export default boot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n)
})

export function setGlobalLocale (lang: MessageLanguage) {
  // 'i18n.global.locale' is a ref; TS doesn't know this for some reason
  i18n.global.locale.value = lang
  Quasar.lang.set(quasarLangPacks[lang])
}
