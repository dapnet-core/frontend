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
        <template v-slot:body-cell-subscribers="props">
          <q-td :props="props">
            <q-chip v-for="(item, key) in props.value" :key="key" icon="mdi-wifi" :label="item" color="grey" text-color="white" />
            <q-chip v-for="(item, key) in props.row.subscriber_groups" :key="key" icon="mdi-wifi-strength-4" :label="item" color="grey" text-color="white" />
          </q-td>
        </template>
        <template v-slot:body-cell-priority="props">
          <q-td :props="props">
            <q-chip :label="priorities(props.value).text" :color="priorities(props.value).color" />
          </q-td>
        </template>
      </q-table>

      <q-btn color="primary" label="Dialog Test" @click="dialog = true"/>
      <FormDialog
        title="Test"
        :steps="{kek: {icon: 'mdi-wifi-off', title: 'STEP Phil'}, kek32: {icon: 'mdi-wifi', title: 'STEP Marvin'}}"
        finish-btn-text="Finish"
        show-exit-btn
        v-model="dialog"
      >
        <template #step-kek>
          <div class="q-pa-md" style="max-width: 400px">
            <q-input
              filled
              v-model="name"
              label="Your name *"
              hint="Name and surname"
              :rules="[ val => val && val.length > 0 || 'Please type something']"
            />

            <q-input
              filled
              type="number"
              v-model="age"
              label="Your age *"
              :rules="[
                val => val !== null && val !== '' || 'Please type your age',
                val => val > 0 && val < 100 || 'Please type a real age'
              ]"
            />

            <q-toggle v-model="accept" label="I accept the license and terms" />
            </div>
        </template>
        <template #step-kek32>
          Lol
        </template>
      </FormDialog>

      <Map height="500px" :center="[6, 50]"
          :markers="markers">
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
import Map, { Marker } from 'components/MapComponent.vue'
import icon from 'assets/markers/marker-transmitter-personal-online.png'
import { computed, ref } from 'vue'
import { QTableColumn } from 'quasar'
import { useI18n } from 'vue-i18n'
import FormDialog from 'src/components/FormDialog.vue'

const { t, d } = useI18n({ useScope: 'global' })

const dialog = ref(false)
const name = ref('')
const age = ref<null | number>(null)
const accept = ref(false)

function onSubmit () {
  console.log('onSubmit')
}

function onReset () {
  console.log('onReset')
}

const markers = ref<Marker[]>([{ coordinates: [6, 51], icon }, { coordinates: [6, 50], icon }])

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
  created_at: '2022-06-10T11:41:29Z',
  created_by: 'Valentin',
  subscribers: ['Test', 'Test2'],
  subscriber_groups: ['Test3'],
  priority: 3
},
{
  id: 1,
  created_at: '2022-08-10T14:46:59Z',
  created_by: 'Yolomeus',
  subscribers: [],
  subscriber_groups: ['Test4', 'Test5'],
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
