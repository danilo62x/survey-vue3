<template>
  <p v-if="matrix.total === 0" class="text-sm text-muted">{{ t('results.noAnswers') }}</p>

  <div v-else class="-mx-1 overflow-x-auto px-1">
    <table class="w-full min-w-[34rem] border-collapse text-sm">
      <thead>
        <tr>
          <th class="w-1/3 px-2 pb-2 text-left text-xs font-medium text-muted">{{ t('results.matrixRow') }}</th>
          <th v-for="column in matrix.columns" :key="column" class="px-2 pb-2 text-center text-xs font-medium text-muted">
            {{ column }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in matrix.rows" :key="row">
          <th scope="row" class="py-1.5 pr-3 text-left text-sm font-medium text-body">
            <span class="block max-w-[14rem] truncate" :title="row">{{ row }}</span>
          </th>
          <td v-for="column in matrix.columns" :key="column" class="p-1">
            <div
              :class="`flex h-12 flex-col items-center justify-center rounded-lg text-xs font-semibold ${
                isStrong(row, column) ? 'text-white' : 'text-body'
              }`"
              :style="{ backgroundColor: cellBg(row, column) }"
              :title="`${row} — ${column}: ${count(row, column)} (${percent(row, column)}%)`"
            >
              <span>{{ count(row, column) }}</span>
              <span :class="`text-[10px] font-normal ${isStrong(row, column) ? 'text-white/80' : 'text-muted'}`">
                {{ percent(row, column) }}%
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { MatrixSummary } from '@/data/types'

const props = withDefaults(
  defineProps<{
    matrix: MatrixSummary
    color?: string
  }>(),
  { color: '#465fff' }
)

const { t } = useI18n()

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)]
}

const rgb = computed(() => hexToRgb(props.color))

const cellOf = (row: string, column: string) => props.matrix.cells.find((c) => c.row === row && c.column === column)

const count = (row: string, column: string) => cellOf(row, column)?.count ?? 0
const percent = (row: string, column: string) => cellOf(row, column)?.percent ?? 0

const intensity = (row: string, column: string) => (props.matrix.max ? count(row, column) / props.matrix.max : 0)

/** Matriz de calor: quanto mais escuro, mais respostas naquela combinação. */
const isStrong = (row: string, column: string) => intensity(row, column) > 0.55

function cellBg(row: string, column: string) {
  const [r, g, b] = rgb.value
  return `rgba(${r}, ${g}, ${b}, ${0.08 + intensity(row, column) * 0.85})`
}
</script>
