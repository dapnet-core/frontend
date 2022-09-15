<template>
  <q-table
    :title="title"
    :rows="rows"
    :columns="Array.isArray(cols) ? cols : mapCols(cols)"
    color="primary"
    :loading="loading"
    :row-key="props.uniqueRowKey"
    :no-data-label="error ? $t('table.error', {error}) : $t('table.noData')"
    :filter="filter"
  >
    <!-- Filter all passed slots on 'cell-{name}', then use this to pass it through to QTable.
         The extra step of stripping 'cell-' just to append it later is necessary so the slot is correctly identified -->
    <template v-for="(name, key) in cellSlots" :key="key" #[`body-cell-${name}`]="slotData">
      <q-td :props="slotData">
        <slot :name="`cell-${name}`" v-bind="slotData"></slot>
      </q-td>
    </template>
    <template v-slot:top-right>
      <q-input borderless dense debounce="250" v-model="filter" :placeholder="$t('table.search')">
        <template v-slot:append>
          <q-icon name="mdi-magnify" />
        </template>
      </q-input>
      </template>
  </q-table>
</template>

<script setup lang="ts">
import { QTableColumn } from 'quasar'
import { ref, onMounted, useSlots, computed } from 'vue'

// TODO: Import 'Props' from 'components/GenericDataTable' once https://github.com/vuejs/core/issues/4294 is resolved
const props = defineProps<{
  title: string
  // Array is used for normal use, Record for generic use
  cols: QTableColumn[] | Record<string, Omit<QTableColumn, 'name'>>
  // TODO: Add support for (and encourage) server-side pagination
  loadDataFunction:() => Promise<readonly unknown[]>
  uniqueRowKey: string
}>()

const rows = ref<readonly unknown[] | undefined>()
const filter = ref('')
const loading = ref(false)
const error = ref<string | undefined>(undefined)

onMounted(async () => {
  loading.value = true
  await props.loadDataFunction().then(data => { rows.value = data }).catch(error => { error.value = error })
  loading.value = false
})

const cellSlots = computed(() => {
  return Object.keys(useSlots()).filter(
    (val) => val.startsWith('cell-')
  ).map(
    (val) => val.substring(5)
  )
})

function mapCols (obj: Record<string, Omit<QTableColumn, 'name'>>): QTableColumn[] {
  return Object.entries(obj).map(([name, col]) => {
    const t = col as QTableColumn
    t.name = name
    return t
  })
}
</script>
