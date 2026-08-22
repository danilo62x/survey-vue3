<template>
  <section class="surface-card rounded-2xl border p-5 shadow-theme-sm md:p-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex min-w-0 items-start gap-3">
        <span
          class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
          :style="{ backgroundColor: color }"
        >
          <IconBase :name="QUESTION_ICON[summary.question.type]" :size="18" />
        </span>
        <div class="min-w-0">
          <p class="text-xs text-muted">
            {{ t('results.questionNumber', { index: index + 1 }) }} ·
            {{ t(`questionTypes.${summary.question.type}`) }}
          </p>
          <h3 class="mt-0.5 text-base font-semibold break-words text-heading">
            {{ summary.question.title || t('builder.untitledQuestion') }}
          </h3>
        </div>
      </div>
      <div class="shrink-0 text-right">
        <p class="text-sm font-semibold text-heading">{{ summary.answered }}</p>
        <p class="text-xs text-muted">
          {{
            summary.skipped === 0 ? t('results.noSkips') : t('results.skippedCount', { count: summary.skipped }, summary.skipped)
          }}
        </p>
      </div>
    </div>

    <!-- Um gráfico por tipo de pergunta — o resumo escolhe o recorte certo. -->
    <div class="mt-6">
      <ChoiceChart v-if="summary.kind === 'escolha'" :slices="summary.slices" :color="color" />
      <ChoiceChart
        v-else-if="summary.kind === 'multipla'"
        :slices="summary.slices"
        variant="stacked"
        :color="color"
      />
      <ScaleDistribution
        v-else-if="summary.kind === 'escala' && summary.scale"
        :scale="summary.scale"
        :color="color"
      />
      <ScaleDistribution
        v-else-if="summary.kind === 'numero' && summary.scale"
        :scale="summary.scale"
        :color="color"
        :average-label="t('results.averageValue')"
      />
      <NpsGauge v-else-if="summary.kind === 'nps' && summary.nps" :nps="summary.nps" />
      <MatrixHeat v-else-if="summary.kind === 'matriz' && summary.matrix" :matrix="summary.matrix" :color="color" />
      <ChoiceChart v-else-if="summary.kind === 'data'" :slices="summary.slices" :color="color" />
      <TermCloud
        v-else-if="summary.kind === 'texto'"
        :terms="summary.terms"
        :samples="summary.samples"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { QuestionSummary } from '@/data/types'
import IconBase from '@/components/ui/IconBase.vue'
import { QUESTION_ICON } from '@/lib/questionTypes'
import ChoiceChart from './ChoiceChart.vue'
import ScaleDistribution from './ScaleDistribution.vue'
import NpsGauge from './NpsGauge.vue'
import MatrixHeat from './MatrixHeat.vue'
import TermCloud from './TermCloud.vue'

withDefaults(
  defineProps<{
    summary: QuestionSummary
    index: number
    color?: string
  }>(),
  { color: '#465fff' }
)

const { t } = useI18n()
</script>
