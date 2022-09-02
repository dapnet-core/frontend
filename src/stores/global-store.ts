import { defineStore } from 'pinia'
import { MessageLanguage, setGlobalLocale } from 'boot/i18n'
import { Dark } from 'quasar'

export type Theme = 'dark' | 'light'

interface State {
  auth?: { // If set a user is logged in
    username: string
    avatar?: string // avatar URL
    token: string // some web token used for authorization
    permissions: []
  }
  language: MessageLanguage,
  theme: Theme
}

export const globalStore = defineStore('global', {
  persist: { // Provided by pinia-plugin-persistedstate
    afterRestore: (ctx) => {
      Dark.set(ctx.store.theme === 'dark')
      setGlobalLocale(ctx.store.language)
    }
  },
  state: () : State => ({
    language: 'en',
    theme: 'light',
    auth: undefined // For some reason this is necessary
  }),
  getters: {
    loggedIn: (state) => !!state.auth
  },
  actions: {
    changeTheme (theme: Theme) {
      this.theme = theme
      Dark.set(theme === 'dark')
    },
    toggleTheme () {
      this.theme = (this.theme === 'light') ? 'dark' : 'light'
      Dark.toggle()
    },
    changeLanguage (lang: MessageLanguage) {
      this.language = lang
      setGlobalLocale(lang)
    }
  }
})
