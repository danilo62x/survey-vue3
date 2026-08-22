<template>
  <p v-if="total === 0" class="text-sm text-muted">{{ t('results.noAnswers') }}</p>

  <div v-else-if="variant === 'stacked'">
    <div class="flex h-4 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
      <span
        v-for="(slice, i) in positive"
        :key="slice.label"
        :title="`${slice.label}: ${slice.value}`"
        :style="{ width: `${(slice.value / total) * 100}%`, backgroundColor: PALETTE[i % PALETTE.length] }"
      />
    </div>
    <ul class="mt-4 grid gap-2 sm:grid-cols-2">
      <li v-for="(slice, i) in slices" :key="slice.label" class="flex min-w-0 items-center gap-2 text-sm">
        <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: PALETTE[i % PALETTE.length] }" />
        <span class="min-w-0 flex-1 truncate text-body" :title="slice.label">{{ slice.label }}</span>
        <span class="shrink-0 tabular-nums text-muted">{{ slice.value }} · {{ slice.percent }}%</span>
      </li>
    </ul>
  </div>

  <ul v-else class="flex flex-col gap-3">
    <li v-for="slice in slices" :key="slice.label" class="min-w-0">
      <div class="flex items-baseline justify-between gap-3 text-sm">
        <span class="min-w-0 truncate text-body" :title="slice.label">{{ slice.label }}</span>
        <span class="shrink-0 tabular-nums text-muted">{{ slice.value }} · {{ slice.percent }}%</span>
      </div>
      <div class="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div class="h-full rounded-full" :style="{ width: `${(slice.value / max) * 100}%`, backgroundColor: color }" />
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Slice } from '@/data/types'

const PALETTE = ['#465fff', '#12b76a', '#f79009', '#f04438', '#0ba5ec', '#7592ff', '#039855', '#dc6803']

const props = withDefaults(
  defineProps<{
    slices: Slice[]
    /** `stacked` desenha uma barra única com todas as opções — usado na múltipla escolha. */
    variant?: 'bar' | 'stacked'
    color?: string
  }>(),
  { variant: 'bar', color: '#465fff' }
)

const { t } = useI18n()

const total = computed(() => props.slices.reduce((sum, s) => sum + s.value, 0))
const positive = computed(() => props.slices.filter((s) => s.value > 0))
const max = computed(() => Math.max(...props.slices.map((s) => s.value), 1))
</script>
