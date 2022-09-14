<template>
  <q-table
    :title="title"
    :rows="rows"
    :columns="cols"
    color="primary"
    :loading="state.loading"
    :row-key="props.rowKey"
    :no-data-label="state.error ? $t('table.error', {error: state.error}) : $t('table.noData')"
  >
    <template v-for="(_, name) in $slots" #[`body-cell-${name}`]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { QTableColumn } from 'quasar'
import { ref, onMounted } from 'vue'

// Import 'Props' from 'components/GenericDataTable' once https://github.com/vuejs/core/issues/4294 is fixed
const props = defineProps<{
  title: string
  cols: QTableColumn[]
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
</script>
