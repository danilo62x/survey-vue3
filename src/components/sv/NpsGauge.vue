<template>
  <div class="flex flex-col items-center">
    <svg viewBox="0 0 180 104" :class="size === 'sm' ? 'w-40' : 'w-56'" role="img" :aria-label="t('results.nps')">
      <path
        d="M20 92 A70 70 0 0 1 160 92"
        fill="none"
        stroke-width="14"
        stroke-linecap="round"
        class="stroke-gray-200 dark:stroke-gray-700"
      />
      <path
        d="M20 92 A70 70 0 0 1 160 92"
        fill="none"
        :stroke="tone"
        stroke-width="14"
        stroke-linecap="round"
        :stroke-dasharray="`${arc(nps.score)} ${CIRCUMFERENCE}`"
      />
      <text x="90" y="80" text-anchor="middle" class="fill-current text-heading" font-size="30" font-weight="700">
        {{ nps.score }}
      </text>
      <text x="90" y="98" text-anchor="middle" class="fill-current text-muted" font-size="11">
        {{ t('results.npsScore') }}
      </text>
    </svg>

    <div class="mt-3 grid w-full grid-cols-3 gap-2 text-center">
      <div class="rounded-lg bg-success-50 px-2 py-2 dark:bg-success-500/10">
        <p class="text-sm font-bold text-success-600">{{ pct(nps.promoters) }}%</p>
        <p class="text-[11px] text-muted">{{ t('results.promoters') }}</p>
      </div>
      <div class="rounded-lg bg-warning-50 px-2 py-2 dark:bg-warning-500/10">
        <p class="text-sm font-bold text-warning-600">{{ pct(nps.passives) }}%</p>
        <p class="text-[11px] text-muted">{{ t('results.passives') }}</p>
      </div>
      <div class="rounded-lg bg-error-50 px-2 py-2 dark:bg-error-500/10">
        <p class="text-sm font-bold text-error-600">{{ pct(nps.detractors) }}%</p>
        <p class="text-[11px] text-muted">{{ t('results.detractors') }}</p>
      </div>
    </div>

    <p class="mt-3 text-center text-xs text-muted">
      {{ t('results.npsFormula', { promoters: pct(nps.promoters), detractors: pct(nps.detractors) }) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { NpsBreakdown } from '@/data/types'

const props = withDefaults(
  defineProps<{
    nps: NpsBreakdown
    size?: 'sm' | 'md'
  }>(),
  { size: 'md' }
)

const { t } = useI18n()

const RADIUS = 70
const CIRCUMFERENCE = Math.PI * RADIUS

function arc(value: number) {
  // O medidor vai de -100 a +100 em meia circunferência.
  const clamped = Math.max(-100, Math.min(100, value))
  return ((clamped + 100) / 200) * CIRCUMFERENCE
}

const tone = computed(() => (props.nps.score >= 50 ? '#12b76a' : props.nps.score >= 0 ? '#f79009' : '#f04438'))

const pct = (n: number) => (props.nps.total ? Math.round((n / props.nps.total) * 1000) / 10 : 0)
</script>
