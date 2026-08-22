<template>
  <div class="surface-card overflow-hidden rounded-xl border">
    <div v-if="searchable" class="flex items-center gap-2 border-b border-themed p-4">
      <div class="relative w-full max-w-xs">
        <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">
          <IconBase name="search" :size="16" />
        </span>
        <input
          v-model="globalFilter"
          :placeholder="t('common.search')"
          class="focus-ring w-full rounded-lg border border-themed bg-transparent py-2 pr-3 pl-9 text-sm text-body"
        />
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr v-for="hg in table.getHeaderGroups()" :key="hg.id" class="border-b border-themed">
            <th v-for="header in hg.headers" :key="header.id" class="px-5 py-3 font-medium text-muted">
              <button
                v-if="!header.isPlaceholder"
                type="button"
                class="flex items-center gap-1"
                :class="header.column.getCanSort() ? 'cursor-pointer select-none' : 'cursor-default'"
                @click="header.column.getToggleSortingHandler()?.($event)"
              >
                <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                <IconBase v-if="header.column.getIsSorted() === 'asc'" name="arrow-up" :size="14" />
                <IconBase v-else-if="header.column.getIsSorted() === 'desc'" name="arrow-down" :size="14" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="table.getRowModel().rows.length === 0">
            <td :colspan="columns.length" class="px-5 py-10 text-center text-muted">
              {{ t('common.noResults') }}
            </td>
          </tr>
          <tr
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="border-b border-themed last:border-0 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="px-5 py-3 text-body">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-themed p-4 text-sm text-muted">
      <span>
        {{ table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 }}–{{
          Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )
        }}
        / {{ table.getFilteredRowModel().rows.length }}
      </span>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="focus-ring rounded-lg border border-themed px-3 py-1.5 disabled:opacity-40"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          {{ t('common.previous') }}
        </button>
        <button
          type="button"
          class="focus-ring rounded-lg border border-themed px-3 py-1.5 disabled:opacity-40"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          {{ t('common.next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/vue-table'
import IconBase from '@/components/ui/IconBase.vue'

const props = withDefaults(
  defineProps<{
    columns: ColumnDef<T, any>[]
    data: T[]
    pageSize?: number
    searchable?: boolean
  }>(),
  { pageSize: 10, searchable: true }
)

const { t } = useI18n()
const sorting = ref<SortingState>([])
const globalFilter = ref('')

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  state: {
    get sorting() {
      return sorting.value
    },
    get globalFilter() {
      return globalFilter.value
    },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
  onGlobalFilterChange: (updater) => {
    globalFilter.value = typeof updater === 'function' ? updater(globalFilter.value) : updater
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageSize: props.pageSize } },
})
</script>
