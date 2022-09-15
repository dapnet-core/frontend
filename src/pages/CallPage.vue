<template>
  <q-page padding>
    <CallTable
      :title="$t('pagetitle.calls.overview')"
      :cols="columns"
      unique-row-key="id"
      :load-data-function="async () => { await sleep(1000); return testData }"
    >
      <template #cell-subscribers="props">
        <q-chip v-for="(item, key) in props.value.subscribers"        :key="key" icon="mdi-wifi"            :label="item" color="grey" text-color="white" />
        <q-chip v-for="(item, key) in props.value.subscriber_groups"  :key="key" icon="mdi-wifi-strength-4" :label="item" color="grey" text-color="white" />
      </template>
      <template #cell-transmitters="props">
        <q-chip v-for="(item, key) in props.value.transmitters"       :key="key" icon="mdi-account"         :label="item" color="grey" text-color="white" />
        <q-chip v-for="(item, key) in props.value.transmitter_groups" :key="key" icon="mdi-account-group"   :label="item" color="grey" text-color="white" />
      </template>
      <template #cell-priority="props">
        <q-chip :label="priorities(props.value).text" :color="priorities(props.value).color" />
      </template>
      <template #test>
        I don't render
      </template>
    </CallTable>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchJson } from 'src/fetch'
import { Column, useGenericTable } from 'src/components/GenericDataTable'

const { t, d } = useI18n({ useScope: 'global' })

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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
  id: string // UUID V1
  local: boolean
  origin: string
  priority: number
  recipients: {
    subscriber_groups: string[]
    subscribers: string[]
  }
}

// TODO: Should be able to infer field type if https://github.com/microsoft/TypeScript/issues/24085 is resolved
type Columns = {
  created_at: Column<CallResponse, 'created_at'>
  created_by: Column<CallResponse, 'created_by'>
  message: Column<CallResponse, 'data'>
  subscribers: Column<CallResponse, 'recipients'>
  transmitters: Column<CallResponse, 'distribution'>
  origin: Column<CallResponse, 'origin'>
  priority: Column<CallResponse, 'priority'>
}

const columns = computed<Columns>(() => ({
  created_at: {
    label: t('general.created_at'),
    align: 'left',
    field: 'created_at',
    format: (val) => d(val, 'numeric'),
    sortable: true
  },
  created_by: {
    label: t('calls.overview.from'),
    align: 'left',
    field: 'created_by',
    sortable: true
  },
  message: {
    label: t('general.message'),
    align: 'left',
    field: 'data'
  },
  subscribers: {
    align: 'center',
    label: t('general.subscribers'),
    field: 'recipients'
  },
  transmitters: {
    align: 'center',
    label: t('general.transmitters'),
    field: 'distribution'
  },
  origin: {
    label: t('calls.overview.origin'),
    align: 'center',
    field: 'origin',
    sortable: true
  },
  priority: {
    label: t('general.priority'),
    align: 'center',
    field: 'priority',
    sortable: true
  }
}))

const testData = [
  { created_at: '2022-06-10T11:41:29Z', created_by: 'valentin', data: 'VALENTIN: Hello', distribution: { transmitter_groups: ['dl.nw.koeln.aachen'], transmitters: ['db0sda'] }, expires_at: '2018-12-31T23:00:00Z', id: '44b0482a-e8b2-11ec-9cdc-0242ac120005', local: false, origin: 'db0sda-dc2', priority: 5, recipients: { subscriber_groups: ['imaginary', 'real'], subscribers: ['dh3wr', 'imaginary'] } },
  { created_at: '2022-06-10T11:41:20Z', created_by: 'valentin', data: 'VALENTIN: Hello V2', distribution: { transmitter_groups: [], transmitters: ['db0sda'] }, expires_at: '2018-12-31T23:00:00Z', id: '3f009e5c-e8b2-11ec-98e8-0242ac120005', local: false, origin: 'db0sda-dc2', priority: 3, recipients: { subscriber_groups: [], subscribers: ['dh3wr'] } },
  { created_at: '2022-06-10T08:30:31Z', created_by: 'valentin', data: 'VALENTIN: Hello World', distribution: { transmitter_groups: ['dl.nw.koeln.aachen'], transmitters: [] }, expires_at: '2018-12-31T23:00:00Z', id: '9720ac0a-e897-11ec-b9fd-0242ac120005', local: false, origin: 'db0sda-dc2', priority: 1, recipients: { subscriber_groups: ['imaginary'], subscribers: [] } },
  { created_at: '2022-06-10T08:30:32Z', created_by: 'ඞ', data: 'ඞ: Illegal priority', distribution: { transmitter_groups: [], transmitters: [] }, expires_at: '2018-12-31T23:00:00Z', id: '722f68f6-34d1-11ed-a261-0242ac120002', local: false, origin: 'db0sda-dc3', priority: 7, recipients: { subscriber_groups: [], subscribers: [] } }
] as CallResponse[]
const CallTable = useGenericTable<CallResponse, Columns>()

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
