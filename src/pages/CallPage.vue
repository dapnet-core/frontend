<template>
  <q-page padding>
    <CallTable
      :title="$t('pagetitle.calls.overview')"
      :cols="columns"
      row-key="id"
      :load-data-function="async () => { return testData }"
    >
      <template #recipients="props">
        <q-td :props="props">
          <q-chip v-for="(item, key) in props.row.recipients.subscribers"       :key="key" icon="mdi-wifi"            :label="item" color="grey" text-color="white" />
          <q-chip v-for="(item, key) in props.row.recipients.subscriber_groups" :key="key" icon="mdi-wifi-strength-4" :label="item" color="grey" text-color="white" />
        </q-td>
      </template>
      <template #distribution="props">
        <q-td :props="props">
          <q-chip v-for="(item, key) in props.row.distribution.transmitters"       :key="key" icon="mdi-account"       :label="item" color="grey" text-color="white" />
          <q-chip v-for="(item, key) in props.row.distribution.transmitter_groups" :key="key" icon="mdi-account-group" :label="item" color="grey" text-color="white" />
        </q-td>
      </template>
      <template #priority="props">
        <q-td :props="props">
          <q-chip :label="priorities(props.value).text" :color="priorities(props.value).color" />
        </q-td>
      </template>
    </CallTable>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QTableColumn } from 'quasar'
import { useI18n } from 'vue-i18n'
import { fetchJson } from 'src/fetch'
import _testData from 'src/test.json'
import { useGenericTable } from 'src/components/GenericDataTable'

const { t, d } = useI18n({ useScope: 'global' })

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
}

const testData = _testData as CallResponse[]
const CallTable = useGenericTable<CallResponse>()

const columns = computed<QTableColumn<CallResponse>[]>(() => [
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
    name: 'recipients',
    align: 'center',
    label: t('general.subscribers'),
    field: 'recipients'
  },
  {
    name: 'distribution',
    align: 'center',
    label: t('general.transmitters'),
    field: 'distribution'
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
</script>
