<template>
  <p v-if="scale.total === 0" class="text-sm text-muted">{{ t('results.noAnswers') }}</p>

  <div v-else>
    <div class="flex flex-wrap items-end gap-x-8 gap-y-3">
      <div>
        <p class="text-xs text-muted">{{ averageLabel ?? t('results.average') }}</p>
        <p class="text-title-sm font-bold text-heading">{{ scale.average }}</p>
      </div>
      <div>
        <p class="text-xs text-muted">{{ t('results.range') }}</p>
        <p class="text-lg font-semibold text-heading">{{ scale.min }} – {{ scale.max }}</p>
      </div>
      <div>
        <p class="text-xs text-muted">{{ t('results.answers') }}</p>
        <p class="text-lg font-semibold text-heading">{{ scale.total }}</p>
      </div>
    </div>

    <div class="mt-6 flex items-end gap-1.5 sm:gap-2.5" :style="{ height: '140px' }">
      <div
        v-for="step in scale.distribution"
        :key="step.label"
        class="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
      >
        <span class="text-[11px] tabular-nums text-muted">{{ step.value }}</span>
        <div
          class="w-full rounded-t-md transition-all"
          :style="{
            height: `${Math.max(3, (step.value / max) * 100)}%`,
            backgroundColor: color,
            opacity: step.value === 0 ? 0.25 : 1,
          }"
          :title="`${step.label}: ${step.value} (${step.percent}%)`"
        />
        <span class="w-full truncate text-center text-[11px] text-muted" :title="step.label">{{ step.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ScaleSummary } from '@/data/types'

const props = withDefaults(
  defineProps<{
    scale: ScaleSummary
    color?: string
    /** Rótulo da média — "Média" na escala, "Valor médio" no número. */
    averageLabel?: string
  }>(),
  { color: '#465fff' }
)

const { t } = useI18n()

const max = computed(() => Math.max(...props.scale.distribution.map((d) => d.value), 1))
</script>
