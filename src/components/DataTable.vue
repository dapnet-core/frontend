<template>
  <q-table
    :title="title"
    :rows="rows"
    :columns="mapCols(cols)"
    color="primary"
    :loading="loading"
    :row-key="props.uniqueRowKey"
    :no-data-label="error ? $t('table.error', {error}) : $t('table.noData')"
    :filter="filter"
    v-model:pagination="pagination"
    @request="handleRequest"
  >
    <!-- Filter all passed slots on 'cell-{name}', then use this to pass it through to QTable.
         The extra step of stripping 'cell-' just to append it later is necessary so the slot is correctly identified by vue -->
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
import { QTableColumn, QTableProps } from 'quasar'
import { errorToString } from 'src/misc'
import { ref, onMounted, useSlots, computed } from 'vue'
import { PaginationHandler, PaginationProps } from 'src/api/pagination'

// TODO: Import 'Props' from 'components/GenericDataTable' once https://github.com/vuejs/core/issues/4294 is resolved
const props = defineProps<{
  title: string
  cols: Record<string, Omit<QTableColumn, 'name'>>
  loadDataFunction?:() => Promise<readonly unknown[]>
  loadPaginatedData?: PaginationHandler<Record<string, unknown>>
  defaultPagination? : PaginationProps<Record<string, unknown>>
  uniqueRowKey: string
}>()

const rows = ref<readonly unknown[] | undefined>()
const filter = ref('')
const loading = ref(false)
const error = ref<string | undefined>(undefined)
const pagination = ref<PaginationProps<Record<string, unknown>>>({
  // IMPORTANT: Page starts at 1
  page: 1,
  rowsPerPage: 20,
  ...props.defaultPagination
})

function _handleError (e: unknown) {
  error.value = errorToString(e, true)
}

/**
 * Invariants:
 * - 'limit' > 0
 * - 'props.loadPaginatedData' defined
 * - 'after' and 'before' not set at the same time
 * - 'descending' set if 'sortBy' is truthy
 */
async function _requestPaginatedData (limit: number, before: string | undefined, after: string | undefined, sortBy: string | undefined, descending: boolean | undefined, filter: string | undefined) {
  if (!props.loadPaginatedData || limit <= 0 || (after && before) || (sortBy && descending === undefined)) throw Error('Invariant violation')
  const resp = await props.loadPaginatedData(
    limit,
    after ? { after } : (before ? { before } : 'firstpage'),
    // SAVETY: See invariant at the top of this function
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    sortBy ? { sortBy, descending: descending! } : undefined,
    filter
  )

  pagination.value.rowsNumber = resp.metadata.total_count
  pagination.value.after = resp.metadata.after ? resp.metadata.after : undefined
  pagination.value.before = resp.metadata.before ? resp.metadata.before : undefined
  rows.value = resp.entries
}

onMounted(async () => {
  loading.value = true

  if (props.loadPaginatedData) { // Use server-side pagination
    // SAFETY: A default value is provided before mount
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await _requestPaginatedData(pagination.value.rowsPerPage!, undefined, undefined, pagination.value.sortBy, pagination.value.descending, filter.value).catch(_handleError)
  } else if (props.loadDataFunction) { // Request all data and do client-side pagination
    await props.loadDataFunction().then((data) => { rows.value = data }).catch(_handleError)
  }

  loading.value = false
})

const handleRequest: QTableProps['onRequest'] = (args) => {
  let { page, rowsPerPage, sortBy, descending } = args.pagination
  const filter = args.filter
  const currentPage = pagination.value.page

  if (!sortBy && pagination.value.fallbackSorting) {
    sortBy = pagination.value.fallbackSorting.sortBy
    descending = pagination.value.fallbackSorting.descending
  }

  // If the sorting column changes the cursor becomes invalid
  const validCursor = sortBy === pagination.value.sortBy

  loading.value = true

  _requestPaginatedData(
    rowsPerPage,
    (validCursor && currentPage && page < currentPage) ? (currentPage - page > 1 ? 'firstpage' : pagination.value.before) : undefined,
    (validCursor && currentPage && page > currentPage) ? (page - currentPage > 1 ? 'lastpage' : pagination.value.after) : undefined,
    sortBy, descending, filter
  ).then(() => {
    // Update local pagination
    pagination.value.page = validCursor ? page : 1
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending
  }).catch(_handleError).finally(() => { loading.value = false })
}

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
