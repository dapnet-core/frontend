<template>
  <q-table
    :title="title"
    :rows="rows"
    :columns="Array.isArray(cols) ? cols : mapCols(cols)"
    color="primary"
    :loading="state.loading"
    :row-key="props.rowKey"
    :no-data-label="state.error ? $t('table.error', {error: state.error}) : $t('table.noData')"
  >
    <template v-for="(name, key) in cellSlots" :key="key" #[`body-cell-${name}`]="slotData">
      <q-td :props="slotData">
        <slot :name="`cell-${name}`" v-bind="slotData || {}"></slot>
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { QTableColumn } from 'quasar'
import { ref, onMounted, useSlots, computed } from 'vue'

// Import 'Props' from 'components/GenericDataTable' once https://github.com/vuejs/core/issues/4294 is fixed
const props = defineProps<{
  title: string
  cols: QTableColumn[] | Record<string, Omit<QTableColumn, 'name'>>
  loadDataFunction:() => Promise<readonly unknown[]>
  rowKey: string
}>()
const rows = ref<readonly unknown[] | undefined>()
const state = ref<{loading: boolean, error?: string}>({ loading: false })

onMounted(async () => {
  state.value.loading = true
  await props.loadDataFunction().then(data => { rows.value = data }).catch(error => { state.value.error = error })
  state.value.loading = false
})

const cellSlots = computed(() => {
  return Object.keys(useSlots()).filter(
    (val) => val.startsWith('cell-')
  ).map(
    (val) => val.substring(5)
  )
})

function mapCols (obj: Record<string, Omit<QTableColumn, 'name'>>): QTableColumn[] {
  return Object.entries(obj).map(([name, val]) => {
    const t = val as QTableColumn
    t.name = name
    return t
  })
}
</script>
