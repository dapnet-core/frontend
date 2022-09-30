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
import { loadPaginatedData, PaginationProps } from 'src/api/pagination'
import { CallRowType, Calls } from 'src/api/api_routes'
import { ExtractComputed } from 'src/misc'

const { t, d } = useI18n({ useScope: 'global' })

const columns = computed(() => ({
  created_at: {
    label: t('general.created_at'),
    align: 'left',
    field: 'created_at',
    format: (val) => d(val, 'numeric'),
    sortable: true
  } as Column<CallRowType, 'created_at'>,
  created_by: {
    label: t('calls.overview.from'),
    align: 'left',
    field: 'created_by',
    sortable: true
  } as Column<CallRowType, 'created_by'>,
  message: {
    label: t('general.message'),
    align: 'left',
    field: 'data'
  } as Column<CallRowType, 'data'>,
  subscribers: {
    align: 'center',
    label: t('general.subscribers'),
    field: 'recipients'
  } as Column<CallRowType, 'recipients'>,
  transmitters: {
    align: 'center',
    label: t('general.transmitters'),
    field: 'distribution'
  } as Column<CallRowType, 'distribution'>,
  origin: {
    label: t('calls.overview.origin'),
    align: 'center',
    field: 'origin',
    sortable: true
  } as Column<CallRowType, 'origin'>,
  priority: {
    label: t('general.priority'),
    align: 'center',
    field: (row) => priorities(row.priority),
    sortable: true
  } as Column<CallRowType, (row: CallRowType) => { text: string, bgColor: string, textColor: string }>
}))

const loadData = loadPaginatedData<Calls>('calls')

const defaultPagination: PaginationProps<CallRowType> = {
  sortBy: 'created_at',
  descending: true,
  fallbackSorting: {
    sortBy: 'created_at',
    descending: true
  }
}

const CallTable = useGenericTable<CallRowType, ExtractComputed<typeof columns>>()

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
