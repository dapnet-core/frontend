<template>
  <q-layout view="hHh LpR fff">

    <q-header elevated class="text-white bg-primary">
      <q-toolbar>
        <q-btn dense flat round icon="mdi-menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <!-- TODO: Make responsive or remove/replace -->
          <q-img src="~assets/dapnet-logo.png" height="56px" fit="contain" position="0% 50%" />
        </q-toolbar-title>

        <q-space />

        <!-- TODO: Make dropdown wider on large screens so 2 languages fit per line -->
        <q-btn-dropdown flat :label="store.language">
          <q-list>
            <q-item clickable v-close-popup v-for="(item, key) in MessageLanguages" :key="key" @click="store.changeLanguage(item)">
              <q-item-section>{{ $t(`footer.language.${item}`) }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn dense flat icon="mdi-brightness-6" @click="store.toggleTheme" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list padding>
        <q-item v-if="store.loggedIn" >
          <q-item-section top avatar>
            <q-avatar v-if="store.auth?.avatar">
              <img :src="store.auth?.avatar">
            </q-avatar>
            <q-avatar v-else color="primary" text-color="white">
              {{ store.auth?.username[0] }}
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ store.auth?.username }}</q-item-label>
          </q-item-section>
        </q-item>
        <Item icon="mdi-send" :title="$t('navigation.calls.new')" to="/calls/new" v-if="store.loggedIn" />
        <Item icon="mdi-cast" :title="$t('navigation.subscribers.my')" to="/subscribers/my" :count="count?.my?.subscribers" v-if="store.loggedIn && count?.my?.subscribers"/>
        <Item icon="mdi-wifi" :title="$t('navigation.transmitters.my')" to="/transmitters/my" :count="count?.my?.transmitters" v-if="store.loggedIn && count?.my?.transmitters"/>
        <Item icon="mdi-message-text" :title="$t('navigation.rubrics.my')" to="/rubrics/my" :count="count?.my?.rubrics" v-if="store.loggedIn && count?.my?.rubrics"/>
        <Item icon="mdi-cloud" :title="$t('navigation.nodes.my')" to="/nodes/my" :count="count?.my?.nodes" v-if="store.loggedIn && count?.my?.nodes"/>
        <q-separator v-if="store.loggedIn" />
        <Item icon="mdi-map" :title="$t('navigation.transmitters.map')" to="/transmitters/map" />
        <Item icon="mdi-email" :title="$t('navigation.calls.all')" to="/calls" :count="count?.calls" />
        <Item icon="mdi-cast" :title="$t('navigation.subscribers.all')" to="/subscribers" :count="count?.subscribers"/>
        <Item icon="mdi-wifi" :title="$t('navigation.transmitters.all')" to="/transmitters" :count="count?.transmitters"/>
        <Item icon="mdi-message-text" :title="$t('navigation.rubrics.all')" to="/rubrics" :count="count?.rubrics"/>
        <Item icon="mdi-account-box" :title="$t('navigation.users.all')" to="/users" :count="count?.users"/>
        <Item icon="mdi-cloud" :title="$t('navigation.nodes.all')" to="/nodes" :count="count?.nodes" />
        <q-separator />
        <Item icon="mdi-information" :title="$t('navigation.help.wiki')" href="https://hampager.de/dokuwiki/doku.php" target="_blank"/>
        <Item icon="mdi-comment-question" :title="$t('navigation.help.support')" href="https://support.hampager.de/" target="_blank"/>
        <q-separator />
        <Item icon="mdi-cog" :title="$t('navigation.settings')" to="/settings" v-if="store.loggedIn" />
        <Item icon="mdi-logout" :title="$t('navigation.logout')" v-if="store.loggedIn" @click="store.auth = undefined"/>
        <Item icon="mdi-login" :title="$t('navigation.login')" v-if="!store.loggedIn" @click="store.auth = {username: 'Testtyp', token: '', permissions: []}" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <!-- TODO: Make responsive -->
      <q-toolbar class="q-px-xl">
        <q-btn flat :label="$t('footer.contact.contact')" href="https://www.afu.rwth-aachen.de/ueber-uns/kontakt" target="_blank"/>
        <q-btn flat :label="$t('footer.contact.impress')" to="/impress" />
        <q-btn flat :label="$t('footer.contact.privacy')" to="/privacy" />

        <q-space />

        <q-btn flat round v-for="(item, key) in footerLinks" :key="key" :icon="item.icon" :href="item.link" target="_blank">
          <q-tooltip>{{ item.tooltip }}</q-tooltip>
        </q-btn>

        <q-space />

        <span>
          {{ $t('footer.version.frontend', {version}) }}
          <q-tooltip>{{ branch }} / {{commit}}</q-tooltip>
        </span>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script setup lang="ts">
import { computed, Ref, ref } from 'vue'
import { globalStore } from 'stores/global-store'
import { MessageLanguages } from 'boot/i18n'
import { useI18n } from 'vue-i18n'
import Item from 'components/AppSidebarComponent.vue'

const store = globalStore()
const { t } = useI18n()

const version = process.env.version
const commit = process.env.commitHash
const branch = process.env.branchName

const leftDrawerOpen = ref(false)
const footerLinks = computed(() => [
  { icon: 'mdi-github', link: 'https://github.com/dapnet-core', tooltip: t('footer.support.github') },
  { icon: 'mdi-web', link: 'https://www.afu.rwth-aachen.de', tooltip: t('footer.support.rwth-amateur-radio') },
  { icon: 'mdi-twitter', link: 'https://twitter.com/RWTHAmateurfunk', tooltip: 'Twitter' },
  { icon: 'mdi-facebook', link: 'https://www.facebook.com/DL0UA', tooltip: 'Facebook' }
])
interface Count {
  calls: number
  subscribers: number
  transmitters: number
  rubrics: number
  users: number
  nodes: number
  my?: {
    subscribers: number
    transmitters: number
    rubrics: number
    nodes: number
  }
}
const count : Ref<Count | undefined> = ref({
  calls: 10,
  subscribers: 50,
  transmitters: 0,
  rubrics: 0,
  users: 0,
  nodes: 0,
  my: {
    subscribers: 50,
    transmitters: 0,
    rubrics: 0,
    nodes: 0
  }
})

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped lang="scss">
  .bg-gradient{
    background: $primary;
    background: linear-gradient(to bottom right, $primary, $secondary);
  }
</style>
