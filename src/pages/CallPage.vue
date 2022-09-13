<template>
  <q-page padding>
    <q-table
        :title="$t('pagetitle.calls.overview')"
        :rows="data"
        :columns="columns"
        color="primary"
        :loading="state.loading"
        row-key="id"
        :no-data-label="state.error ? $t('table.error', {error: state.error}) : $t('table.noData')"
    >
      <template v-slot:body-cell-subscribers="props">
        <q-td :props="props">
          <q-chip v-for="(item, key) in props.row.recipients.subscribers"       :key="key" icon="mdi-wifi"            :label="item" color="grey" text-color="white" />
          <q-chip v-for="(item, key) in props.row.recipients.subscriber_groups" :key="key" icon="mdi-wifi-strength-4" :label="item" color="grey" text-color="white" />
        </q-td>
      </template>
      <template v-slot:body-cell-transmitters="props">
        <q-td :props="props">
          <q-chip v-for="(item, key) in props.row.distribution.transmitters"       :key="key" icon="mdi-account"       :label="item" color="grey" text-color="white" />
          <q-chip v-for="(item, key) in props.row.distribution.transmitter_groups" :key="key" icon="mdi-account-group" :label="item" color="grey" text-color="white" />
        </q-td>
      </template>
      <template v-slot:body-cell-priority="props">
        <q-td :props="props">
          <q-chip :label="priorities(props.value).text" :color="priorities(props.value).color" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { QTableColumn } from 'quasar'
import { useI18n } from 'vue-i18n'
import { fetchJson } from 'src/fetch'

const { t, d } = useI18n({ useScope: 'global' })

const columns = computed<QTableColumn[]>(() => [
  {
    name: 'created_at',
    label: t('general.created_at'),
    align: 'left',
    field: 'created_at',
    format: (val: string) => d(val, 'numeric'),
    sortable: true
  },
  {
    name: 'created_by',
    label: t('calls.overview.from'),
    align: 'left',
    field: 'created_by',
    sortable: true
  },
  {
    name: 'data',
    label: t('general.message'),
    align: 'left',
    field: 'data'
  },
  {
    name: 'subscribers',
    align: 'center',
    label: t('general.subscribers'),
    field: 'subscribers'
  },
  {
    name: 'transmitters',
    align: 'center',
    label: t('general.transmitters'),
    field: 'transmitters'
  },
  {
    name: 'origin',
    label: t('calls.overview.origin'),
    align: 'center',
    field: 'origin',
    sortable: true
  },
  {
    name: 'priority',
    label: t('general.priority'),
    align: 'center',
    field: 'priority',
    sortable: true
  }
])

const priorities = computed(() => (priority: number) => {
  switch (priority) {
    case 1: return { text: t('general.priorities.lowest'), color: 'green' }
    case 2: return { text: t('general.priorities.low'), color: 'green' }
    case 3: return { text: t('general.priorities.medium'), color: 'yellow' }
    case 4: return { text: t('general.priorities.high'), color: 'orange' }
    case 5: return { text: t('general.priorities.highest'), color: 'red' }
  }
  console.warn(`Undefined priority: ${priority}`)
  return { text: t('general.priorities.high'), color: 'grey' }
})

// Expected response from the server
type CallResponse = {
  created_at: string // DateTime
  created_by: string
  data: string
  distribution: {
    transmitter_groups: string[]
    transmitters: string[]
  }
  expires_at: string // DateTime
  id: string // UUID
  local: boolean
  origin: string
  priority: number
  recipients: {
    subscriber_groups: string[]
    subscribers: string[]
  }
}[]

const data = ref<CallResponse>([])
const state = ref<{loading: boolean, error?: string}>({ loading: false })

onMounted(() => {
  state.value.loading = true
  fetchJson<CallResponse>('calls').then(json => {
    data.value = json
    state.value.loading = false
  }).catch(error => {
    console.log(error)
    state.value = { loading: false, error }
  })
})
</script>
