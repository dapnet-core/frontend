<!-- TODO: Make dialog? -->

<template>
  <q-page padding>
    <q-linear-progress indeterminate v-if="state.loading" />
    <q-form
      autofocus
      @submit="onSubmit"
      class="q-gutter-md"
    >
      <q-input
        filled
        v-model="username"
        :label="$t('login.username')"
        lazy-rules
        :rules="[ val => val && val.length > 0 || $t('formvalidation.isrequired', { fieldname: $t('login.username') })]"
      />

      <q-input
        filled
        type="password"
        v-model="password"
        :label="$t('login.password')"
        lazy-rules
        :rules="[ val => val && val.length > 0 || $t('formvalidation.isrequired', { fieldname: $t('login.password') })]"
      />

      <q-btn :label="$t('navigation.login')" type="submit" color="primary" />

      <q-banner v-if="state.error" class="text-white bg-negative" rounded>
        {{ $t('rest.errors.permissions') }}
      </q-banner>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { Login } from 'src/api/api_routes'
import { postJson } from 'src/api/fetch'
import { errorToString } from 'src/misc'
import { globalStore } from 'src/stores/global-store'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const store = globalStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const state = ref<{loading: boolean, error?: string}>({ loading: false })

const onSubmit = () => {
  state.value.loading = true

  // Fix username and password since they are reactive (and could have changed when the callback runs)
  const u = username.value
  const p = password.value

  postJson<Login>('auth/users/login', { username: u, password: p }, false).then((res) => {
    store.auth = {
      username: u,
      // FIXME: Will break if Unicode is used in either username or password
      // Node.js provides the `Buffer` class which sadly cannot be used in browsers
      token: btoa(`${u}:${p}`),
      permissions: res.permissions
    }

    router.back()
  }).catch((err) => {
    state.value.error = errorToString(err, true)
  }).finally(() => {
    state.value.loading = false
  })
}
</script>
