<template>
  <q-layout view="hHh LpR fff">

    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="mdi-menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <!-- TODO: Make responsive -->
          <q-img src="~assets/dapnet-logo.png" height="56px" fit="contain" position="0% 50%"/>
        </q-toolbar-title>

        <q-space />

        <q-btn flat label="Lang" />
        <q-btn flat label="Theme" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list padding>
        <q-item>
          <q-item-section top avatar>
            <q-avatar>
              <img src="~assets/moth-drum.gif">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>Username</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-send" />
          </q-item-section>

          <q-item-section>
            Send call
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-map" />
          </q-item-section>

          <q-item-section>
            Map
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-email" />
          </q-item-section>

          <q-item-section>
            All calls
          </q-item-section>

          <q-item-section side>
            <q-badge color="primary" label="10k" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-cast" />
          </q-item-section>

          <q-item-section>
            All Subscribers
          </q-item-section>

          <q-item-section side>
            <q-badge color="primary" label="10k" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-wifi" />
          </q-item-section>

          <q-item-section>
            All Transmitters
          </q-item-section>

          <q-item-section side>
            <q-badge color="primary" label="10k" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-message-text" />
          </q-item-section>

          <q-item-section>
            All Rubics
          </q-item-section>

          <q-item-section side>
            <q-badge color="primary" label="10k" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-account-box" />
          </q-item-section>

          <q-item-section>
            All Users
          </q-item-section>

          <q-item-section side>
            <q-badge color="primary" label="10" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-cloud" />
          </q-item-section>

          <q-item-section>
            All Nodes
          </q-item-section>

          <q-item-section side>
            <q-badge color="primary" label="10" />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-information" />
          </q-item-section>

          <q-item-section>
            Documentation
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-comment-question" />
          </q-item-section>

          <q-item-section>
            Support
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-cog" />
          </q-item-section>

          <q-item-section>
            Settings
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="mdi-logout" />
          </q-item-section>

          <q-item-section>
            Logout
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar class="q-px-xl">

        <q-btn flat label="Privacy" />
        <q-btn flat label="Impress" />

        <q-space />

        <q-btn flat round icon="mdi-github" />
        <q-btn flat round icon="mdi-web" />
        <q-btn flat round icon="mdi-facebook" />
        <q-btn flat round icon="mdi-twitter" />

        <q-space />

        Version 4.0.0-alpha
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
