<template>
  <q-page padding>
    <TransmitterTable
      :title="$t('pagetitle.transmitter.overview')"
      :cols="columns"
      unique-row-key="_id"
      :load-data-function="loadData"
      :actions="actions"
    >
      <template #cell-enabled="props">
        <q-icon v-if="props.value" color="positive" name="mdi-toggle-switch" size="2em"/>
        <q-icon v-else color="negative" name="mdi-toggle-switch-off" size="2em"/>
      </template>
      <template #cell-connected="props">
        <q-icon v-if="props.value" color="positive" name="mdi-cloud-check-variant" size="1.5em"/>
        <q-icon v-else color="negative" name="mdi-cloud-off-outline" size="1.5em"/>
      </template>
      <template #cell-onAir="props">
        <q-icon v-if="props.value" color="positive" name="mdi-wifi" size="1.5em"/>
        <q-icon v-else color="negative" name="mdi-wifi-off" size="1.5em"/>
      </template>
      <template #cell-node="props">
        <q-chip
          v-if="props.value"
          :label="props.value" size="1em"
          color="grey" text-color="white"
        />
      </template>
      <template #cell-usage="props">
        <q-icon v-if="props.value === 'personal'" name="mdi-router-wireless" size="1.75em">
          <q-tooltip>{{$t('transmitters.usage.personal')}}</q-tooltip>
        </q-icon>
        <q-icon v-else-if="props.value === 'widerange'" name="mdi-antenna" size="1.75em">
          <q-tooltip>{{$t('transmitters.usage.widerange')}}</q-tooltip>
        </q-icon>
        <!-- This case should never happen -->
        <q-icon v-else color="negative" name="mdi-help" size="1.75em">
          <q-tooltip>{{props.value}}</q-tooltip>
        </q-icon>
      </template>
      <template #cell-owner="props">
        <q-chip
          v-for="(item, key) in props.value" :key="key"
          :label="item" size="1em"
          color="grey" text-color="white"
        />
      </template>
      <template #cell-group="props">
        <q-chip
          v-for="(item, key) in props.value" :key="key"
          :label="item" size="1em"
          color="grey" text-color="white"
        />
      </template>
      <template #cell-emergencyPower="props">
        <q-icon v-if="props.value?.available" color="positive" name="mdi-battery-high" size="1.5em">
          <q-tooltip>
            Emergency power for {{props.value.duration}} seconds
          </q-tooltip>
        </q-icon>
        <q-icon v-else color="negative" name="mdi-power-plug-off-outline" size="1.5em">
          <q-tooltip>No emergency power available</q-tooltip>
        </q-icon>
      </template>
      <template #cell-actions="props">
        <q-btn-group unelevated>
          <q-btn color="info" icon="mdi-pencil-outline" dense size="1em" @click="handleEdit(props.value)">
            <q-tooltip>{{$t('table.actionbuttons.edit')}}</q-tooltip>
          </q-btn>
          <q-btn color="negative" icon="mdi-delete-outline" dense size="1em" @click="handleDelete(props.value)">
            <q-tooltip>{{$t('table.actionbuttons.delete')}}</q-tooltip>
          </q-btn>
          <!-- TODO: Missing mail in row type -->
          <!-- <q-btn color="secondary" icon="mdi-email-fast-outline" :href="`mailto:${props.row.mail}`"/> -->
        </q-btn-group>
      </template>
    </TransmitterTable>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Column, useGenericTable } from 'src/components/GenericDataTable'
import { TransmitterRowType, Transmitters } from 'src/api/api_routes'
import { getJson } from 'src/api/fetch'
import { ExtractComputed } from 'src/misc'

const { t, d } = useI18n({ useScope: 'global' })

// Shorthand, T being the data type of the field function
type FCol<T> = Column<TransmitterRowType, (row: TransmitterRowType) => T, T>

const columns = computed(() => ({
  name: {
    label: t('general.name'),
    align: 'left',
    field: '_id',
    sortable: true
  } as Column<TransmitterRowType, '_id'>,
  enabled: {
    label: t('general.enabled'),
    align: 'center',
    field: 'enabled',
    sortable: true
  } as Column<TransmitterRowType, 'enabled'>,
  // TODO: The next five colums get their data from the 'telemetry' endpoint; They are stubs and should be consolidated
  connected: {
    label: t('transmitters.status.connected'),
    align: 'center',
    field: (row) => row.status.online,
    sortable: true
  } as FCol<boolean>,
  onAir: {
    label: t('transmitters.status.onair'),
    align: 'center',
    field: (row) => false,
    sortable: true
  } as FCol<boolean>,
  lastSeen: {
    label: t('transmitters.status.lastseen'),
    align: 'center',
    field: (row) => row.status.last_seen,
    format: (val) => val ? (new Date(val).getTime() - Date.now()) + ' msec ago' : '',
    sortable: true
  } as FCol<string | undefined>,
  node: {
    label: t('transmitters.status.node'),
    align: 'center',
    field: (row) => row.status.node,
    sortable: true
  } as FCol<string | undefined>,
  software: {
    label: t('transmitters.status.software'),
    align: 'left',
    field: (row) => {
      const software = row.status.software
      if (!software) return ''
      return `${software.name} - ${software.version}`
    },
    sortable: true
  } as FCol<string>,
  usage: {
    label: t('transmitters.usage.title'),
    align: 'center',
    field: 'usage',
    sortable: true
  } as Column<TransmitterRowType, 'usage'>,
  frequency: {
    label: t('transmitters.frequency'),
    align: 'left',
    format: (val) => val ? `${val / 1000000} MHz` : '-',
    field: 'frequency',
    sortable: true
  } as Column<TransmitterRowType, 'frequency'>,
  owner: {
    label: t('general.owner'),
    align: 'center',
    field: 'owners'
  } as Column<TransmitterRowType, 'owners'>,
  group: {
    label: t('general.transmitter_groups'),
    align: 'center',
    field: 'groups'
  } as Column<TransmitterRowType, 'groups'>,
  emergencyPower: {
    label: t('transmitters.emergency_power.title'),
    align: 'center',
    field: 'emergency_power'
  } as Column<TransmitterRowType, 'emergency_power'>,
  actions: {
    label: t('general.actions'),
    align: 'center',
    field: '_id'
  } as Column<TransmitterRowType, '_id'>
}))

const TransmitterTable = useGenericTable<TransmitterRowType, ExtractComputed<typeof columns>>()

const actions = computed(() => ([
  { color: 'primary', icon: 'mdi-plus', tooltip: t('transmitters.overview.actions.newtransmitter'), handler: handleAdd }
]))

function loadData () {
  return getJson<Transmitters>('transmitters').then((resp) => resp.rows)
}

function handleDelete (id: string) {
  console.log('Delete ' + id)
}

function handleEdit (id: string) {
  console.log('Edit ' + id)
}

function handleAdd () {
  console.log('Add')
}
</script>
