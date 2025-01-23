<!-- This file is just mockup right now, a place to test components -->

<template>
  <q-page padding class="row justify-evenly">
    <div class="column full-width">
      <q-table
        title="DataTableTest"
        :rows="rows"
        :columns="columns"
        row-key="id"
      >
        <template #body-cell-subscribers="props">
          <q-td :props="props">
            <q-chip v-for="(item, key) in props.value" :key="key" icon="mdi-wifi" :label="item" color="grey" text-color="white" />
            <q-chip v-for="(item, key) in props.row.subscriber_groups" :key="key" icon="mdi-wifi-strength-4" :label="item" color="grey" text-color="white" />
          </q-td>
        </template>
        <template #body-cell-priority="props">
          <q-td :props="props">
            <q-chip :label="priorities(props.value).text" :color="priorities(props.value).color" />
          </q-td>
        </template>
      </q-table>

      <Map
        height="500px" :center="[6, 50]"
        :markers="markers"
      >
        <template #marker-info="{ marker, index }">
          Position {{ marker.coordinates }}
          <br>
          Usage: WIDERANGE
          <br>
          Transmission Power (W): 1
          <br>
          Height (m): 15
          <br>
          Timeslot: 0123456789ABCDEF
          <br>
          Owner: me
          <br>
          Index: {{ index }}
        </template>
      </Map>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import type { Marker } from 'components/MapComponent.vue';
import Map from 'components/MapComponent.vue'
import icon from 'assets/markers/marker-transmitter-personal-online.png'
import { computed, ref } from 'vue'
import type { QTableColumn } from 'quasar'
import { useI18n } from 'vue-i18n'

const { t, d } = useI18n({ useScope: 'global' })

const markers = ref<Marker[]>([{ coordinates: [6, 51], icon }, { coordinates: [6, 50], icon }])

const columns = computed<QTableColumn[]>(() => [
  {
    name: 'created_on',
    label: t('general.created_on'),
    align: 'left',
    field: 'created_on',
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
    name: 'subscribers',
    align: 'center',
    label: t('general.subscribers'),
    field: 'subscribers'
  },
  {
    name: 'priority',
    label: t('general.priority'),
    align: 'center',
    field: 'priority',
    sortable: true
  }
])

const rows = [{
  id: 0,
  created_on: '2022-06-10T11:41:29Z',
  created_by: 'Valentin',
  subscribers: ['Test', 'Test2'],
  subscriber_groups: ['Test3'],
  priority: 3
},
{
  id: 1,
  created_on: '2022-08-10T14:46:59Z',
  created_by: 'Yolomeus',
  subscribers: [],
  subscriber_groups: ['Test4', 'Test5'],
  priority: 5
},
{
  id: 1,
  created_on: '2022-08-10T14:46:59Z',
  created_by: 'Erwin Lindemann',
  subscribers: ['Lottogewinner'],
  subscriber_groups: ['Test6', 'Test7'],
  priority: 5
}
]

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
