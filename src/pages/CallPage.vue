<template>
  <q-page padding>
    <CallTable
      :title="$t('pagetitle.calls.overview')"
      :cols="columns"
      unique-row-key="id"
      :load-paginated-data="loadData"
      :default-pagination="defaultPagination"
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
        <q-chip :label="props.value.text" :color="props.value.bgColor" :text-color="props.value.textColor" />
      </template>
    </CallTable>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Column, useGenericTable } from 'src/components/GenericDataTable'
import { fetchJson } from 'src/fetch'
import { PaginatedResponse, PaginationHandler, PaginationProps } from 'src/components/models'

const { t, d } = useI18n({ useScope: 'global' })

// Expected row response type from the server
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
  priority: Column<CallResponse, (row: CallResponse) => { text: string, bgColor: string, textColor: string }>
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
    field: (row) => priorities(row.priority),
    sortable: true
  }
}))

const loadData: PaginationHandler<CallResponse> = async (limit, cursor, sorting, filter) => {
  let args: Record<string, string> = { limit: limit.toString() }
  if (typeof cursor === 'object') {
    // Sets either 'before' or 'after'
    args = { ...args, ...cursor }
  } else if (cursor === 'lastpage') {
    throw Error('Not yet implemented!')
  } // else it's 'firstpage', which is the default and doesn't need any args

  if (sorting) {
    args.sortBy = sorting.sortBy
    args.desc = sorting.descending ? '1' : '0'
  }

  if (filter) {
    args.filter = filter
  }

  return fetchJson<PaginatedResponse<CallResponse>>('calls', 'GET', true, args)
}

const defaultPagination: PaginationProps<CallResponse> = {
  sortBy: 'created_at',
  descending: true,
  fallbackSorting: {
    sortBy: 'created_at',
    descending: true
  }
}

const CallTable = useGenericTable<CallResponse, Columns>()

const priorities = (priority: number) => {
  switch (priority) {
    case 1: return { text: t('general.priorities.lowest'), bgColor: 'green', textColor: 'white' }
    case 2: return { text: t('general.priorities.low'), bgColor: 'green', textColor: 'white' }
    case 3: return { text: t('general.priorities.medium'), bgColor: 'yellow', textColor: 'black' }
    case 4: return { text: t('general.priorities.high'), bgColor: 'orange', textColor: 'black' }
    case 5: return { text: t('general.priorities.highest'), bgColor: 'red', textColor: 'white' }
  }
  console.warn(`Undefined priority: ${priority}`)
  return { text: t('general.priorities.high'), bgColor: 'grey', textColor: 'white' }
}
</script>
