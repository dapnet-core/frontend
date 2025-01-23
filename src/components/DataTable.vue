<!-- For documentation, consult the GenericDataTable file -->

<template>
  <q-table
    :title="title"
    :rows="rows"
    :columns="mapCols(cols)"
    color="primary"
    :loading="loading"
    :row-key="props.uniqueRowKey"
    :no-data-label="error ? $t('table.error', {error}) : $t('table.noData')"
    wrap-cells
    :grid="$q.screen.lt.md"
    :filter="filter"
    v-model:pagination="pagination"
    @request="handleRequest"
    ref="tableRef"
  >
    <!-- Filter all passed slots on 'cell-{name}', then use this to pass it through to QTable.
         The extra step of stripping 'cell-' just to append it later is necessary so the slot is correctly identified by vue -->
    <template v-for="(name, key) in cellSlots" :key="key" #[`body-cell-${name}`]="slotData">
      <q-td :props="slotData">
        <slot :name="`cell-${name}`" v-bind="slotData" />
      </q-td>
    </template>
    <!-- If the display becomes small, this table will switch to "grid mode" and rows
         will be stacked in cards, see https://quasar.dev/vue-components/table#grid-style
         This template overwrites these cards and injects our custom cell slots into it -->
    <!-- @vue-ignore: "gridItemProps has any type". See API for typing -->
    <template #item="gridItemProps">
      <div class="q-table__grid-item col-xs-12 col-sm-6 col-md-4 col-lg-3">
        <div :class="`q-table__grid-item-card q-table__card${$q.dark.isActive ? ' q-table__card--dark q-dark' : ''}`">
          <!-- @vue-ignore: [col, value] has any type -->
          <div v-for="([col, value], key) in _getNoneEmptyCols(gridItemProps.colsMap, gridItemProps.row)" :key="key" class="q-table__grid-item-row">
            <div class="q-table__grid-item-title">
              {{ col.label }}
            </div>
            <div class="q-table__grid-item-value">
              <slot :name="`cell-${col.name}`" v-bind="{col, value, ...gridItemProps}">
                <!-- Fallback if no slot for this column is set -->
                {{ col.format ? col.format(value, gridItemProps.row): value }}
              </slot>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- TODO: Maybe put these into the toolbar on mobile -->
    <template #top-right>
      <q-input borderless dense debounce="200" v-model="filter" :label="$t('table.search')" clearable>
        <template #append v-if="!filter">
          <!-- Only show icon if 'filter' is empty; Otherwise, the clear icon is shown -->
          <q-icon name="mdi-magnify" />
        </template>
        <template #after v-if="actions && actions.length > 0">
          <q-btn-group>
            <q-btn
              v-for="({icon, color, handler, tooltip}, key) in actions" :key="key"
              dense :icon="icon" :color="color" @click="handler"
            >
              <q-tooltip v-if="tooltip">
                {{ tooltip }}
              </q-tooltip>
            </q-btn>
          </q-btn-group>
        </template>
      </q-input>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import type { QTableColumn, QTableProps } from 'quasar';
import { QTable } from 'quasar'
import { errorToString } from 'src/misc'
import { ref, onMounted, useSlots, computed, watch } from 'vue'
import type { PaginationHandler, PaginationProps } from 'src/api/pagination'

// TODO: Import 'Props' from 'components/GenericDataTable' once https://github.com/vuejs/core/issues/4294 is resolved
const props = defineProps<{
  title: string
  cols: Record<string, Omit<QTableColumn, 'name'>>
  loadDataFunction?:() => Promise<readonly unknown[]>
  loadPaginatedData?: PaginationHandler<Record<string, unknown>>
  defaultPagination? : PaginationProps<Record<string, unknown>>
  uniqueRowKey: string
  actions?: {icon: string, tooltip?: string, handler: () => void, color: string}[]
  enableViewChangeEvent?: boolean
}>()

const emit = defineEmits<{
  // Note: Keep in sync with definition in $emits in GenericDataTable
  (e: 'onViewChange', addedIDs: unknown[], removedIDs: unknown[], pre: readonly unknown[], post: readonly unknown[]): void
}>()
const tableRef = ref<QTable | null>(null)

const rows = ref<readonly unknown[]>([])
const filter = ref('')
const loading = ref(false)
const error = ref<string | undefined>(undefined)
const pagination = ref<PaginationProps<Record<string, unknown>>>({
  // IMPORTANT: Page starts at 1
  page: 1,
  rowsPerPage: 20,
  ...props.defaultPagination
})

/**
 * This function will iterate through all columns and only return those that have a truthy row[col.field] value
 */
function _getNoneEmptyCols<T extends Record<string, unknown>> (cols: Record<string, QTableColumn<T>>, row: T) {
  return Object.entries(cols).reduce((ret, [, col]) => {
    const value = (typeof col.field === 'string') ? row[col.field] : col.field(row)
    if (
      value &&
      ((Array.isArray(value) && value.length) || !Array.isArray(value)) // Reject empty arrays
    ) {
      ret.push([col, value])
    }
    return ret
  }, [] as [QTableColumn, T][])
}

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
    // SAFETY: See invariant at the top of this function
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
    await _requestPaginatedData(pagination.value.rowsPerPage!, undefined, undefined, pagination.value.sortBy, pagination.value.descending, filter.value).catch(_handleError)
  } else if (props.loadDataFunction) { // Request all data and do client-side pagination
    await props.loadDataFunction().then((data) => { rows.value = data }).catch(_handleError)
  }

  loading.value = false
})

const handleRequest: QTableProps['onRequest'] = (args) => {
  // eslint-disable-next-line prefer-const
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

if (props.enableViewChangeEvent) {
  // Since we access a property of the ref, we have to wrap it inside a function call
  watch(() => tableRef.value?.computedRows, (post, pre) => {
    if (!post) return // Should never be called

    // Transforms our array of rows into an array of unique IDs of those rows
    // 'post' are the rows as of now, and 'pre' are the rows before the change
    const postKeys = post.map((val) => val[props.uniqueRowKey])
    const preKeys = pre ? pre.map((val) => val[props.uniqueRowKey]) : []

    // Calculate difference between both sets
    const added = postKeys.filter(x => !preKeys.includes(x))
    const removed = preKeys.filter(x => !postKeys.includes(x))

    // Emit an event of changed datasets
    if (added.length > 0 || removed.length > 0) emit('onViewChange', added, removed, pre || [], post)
  })
}

</script>
