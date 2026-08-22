<template>
  <PageHeader :title="t('dashboard.title')" :subtitle="t('dashboard.subtitle')">
    <template #action>
      <RouterLink
        to="/app/formularios?novo=1"
        class="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"
      >
        <IconBase name="plus" :size="16" />
        {{ t('forms.new') }}
      </RouterLink>
    </template>
  </PageHeader>

  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <KpiCard
      :title="t('dashboard.kpi.month')"
      :value="formatNumber(month, locale)"
      icon="inbox"
      accent="brand"
      :hint="t('dashboard.kpi.monthHint', { total: store.responses.length })"
    />
    <KpiCard
      :title="t('dashboard.kpi.completion')"
      :value="`${Math.round(rate * 100)}%`"
      icon="check-circle"
      accent="success"
      :hint="t('dashboard.kpi.completionHint')"
    />
    <KpiCard
      :title="t('dashboard.kpi.time')"
      :value="formatSeconds(avg)"
      icon="clock"
      accent="warning"
      :hint="t('dashboard.kpi.timeHint')"
    />
    <KpiCard
      :title="t('dashboard.kpi.nps')"
      :value="nps.total ? nps.score : '—'"
      icon="gauge"
      accent="info"
      :hint="t('dashboard.kpi.npsHint', { count: nps.total }, nps.total)"
    />
  </div>

  <div class="mt-6 grid gap-6 xl:grid-cols-3">
    <div class="surface-card min-w-0 rounded-2xl border p-5 shadow-theme-sm md:p-6 xl:col-span-2">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-heading">{{ t('dashboard.charts.perDay') }}</h2>
        <span class="text-xs text-muted">{{ t('dashboard.charts.lastDays', { count: 30 }) }}</span>
      </div>
      <div class="mt-4">
        <ApexChart type="area" :height="300" :series="chartSeries" :options="chartOptions" />
      </div>
    </div>

    <div class="surface-card min-w-0 rounded-2xl border p-5 shadow-theme-sm md:p-6">
      <h2 class="text-base font-semibold text-heading">{{ t('dashboard.sources') }}</h2>
      <p class="mt-1 text-xs text-muted">{{ t('dashboard.sourcesHint') }}</p>
      <ul class="mt-5 flex flex-col gap-4">
        <li v-for="slice in sources" :key="slice.label" class="min-w-0">
          <div class="flex items-center justify-between gap-3 text-sm">
            <span class="min-w-0 truncate text-body">{{ t(`sources.${slice.label}`) }}</span>
            <span class="shrink-0 tabular-nums text-muted">{{ slice.percent }}%</span>
          </div>
          <div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div class="h-full rounded-full bg-brand-500" :style="{ width: `${slice.percent}%` }" />
          </div>
        </li>
      </ul>
    </div>
  </div>

  <div class="mt-6 grid gap-6 xl:grid-cols-2">
    <div class="surface-card min-w-0 rounded-2xl border p-5 shadow-theme-sm md:p-6">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-heading">{{ t('dashboard.topForms') }}</h2>
        <RouterLink to="/app/formularios" class="text-sm font-medium text-brand-600 dark:text-brand-400">
          {{ t('common.viewAll') }}
        </RouterLink>
      </div>
      <EmptyState
        v-if="top.length === 0"
        icon="clipboard-list"
        :title="t('dashboard.emptyTitle')"
        :description="t('dashboard.emptyDesc')"
      />
      <ul v-else class="mt-5 flex flex-col gap-4">
        <li v-for="row in top" :key="row.survey.id" class="flex min-w-0 items-center gap-3">
          <div class="min-w-0 flex-1">
            <RouterLink
              :to="`/app/formularios/${row.survey.id}/respostas`"
              class="block truncate text-sm font-medium text-heading hover:text-brand-600"
            >
              {{ row.survey.title }}
            </RouterLink>
            <div class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                class="h-full rounded-full"
                :style="{
                  width: `${(row.responses / Math.max(1, top[0].responses)) * 100}%`,
                  backgroundColor: row.survey.color,
                }"
              />
            </div>
          </div>
          <span class="shrink-0 text-sm font-semibold tabular-nums text-heading">{{ row.responses }}</span>
        </li>
      </ul>
    </div>

    <div class="surface-card min-w-0 rounded-2xl border p-5 shadow-theme-sm md:p-6">
      <h2 class="text-base font-semibold text-heading">{{ t('dashboard.latest') }}</h2>
      <EmptyState
        v-if="latest.length === 0"
        icon="inbox"
        :title="t('dashboard.emptyTitle')"
        :description="t('dashboard.emptyDesc')"
      />
      <ul v-else class="mt-5 flex flex-col gap-4">
        <li v-for="response in latest" :key="response.id" class="flex min-w-0 items-start gap-3">
          <span
            class="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-muted dark:bg-gray-800"
          >
            <IconBase name="inbox" :size="15" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-heading">
              {{ surveyById(store.surveys, response.surveyId)?.title ?? '—' }}
            </p>
            <p class="truncate text-xs text-muted">
              {{ contactById(store.contacts, response.contactId)?.name ?? t('results.anonymous') }} ·
              {{ formatDateTime(response.at, locale) }}
            </p>
          </div>
          <div class="hidden shrink-0 sm:block">
            <SourceBadge :source="response.source" />
          </div>
        </li>
      </ul>
    </div>
  </div>

  <div class="surface-card mt-6 min-w-0 rounded-2xl border p-5 shadow-theme-sm md:p-6">
    <h2 class="text-base font-semibold text-heading">{{ t('dashboard.statusTitle') }}</h2>
    <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="survey in store.surveys"
        :key="survey.id"
        :to="`/app/formularios/${survey.id}`"
        class="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-themed px-4 py-3 transition hover:border-brand-300"
      >
        <span class="min-w-0 truncate text-sm font-medium text-body">{{ survey.title }}</span>
        <span class="shrink-0">
          <SurveyStatus :status="survey.status" />
        </span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/app/PageHeader.vue'
import KpiCard from '@/components/sv/KpiCard.vue'
import SourceBadge from '@/components/sv/SourceBadge.vue'
import SurveyStatus from '@/components/sv/SurveyStatus.vue'
import ApexChart from '@/components/ui/ApexChart.vue'
import IconBase from '@/components/ui/IconBase.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useSurveyStore } from '@/stores/survey'
import { formatDateTime, formatNumber } from '@/lib/format'
import {
  averageSeconds,
  completionRate,
  contactById,
  formatSeconds,
  latestResponses,
  npsFrom,
  ordered,
  responsesPerDay,
  responsesThisMonth,
  sourceBreakdown,
  surveyById,
  topSurveys,
} from '@/data/query'

const { t, locale } = useI18n()
usePageTitle(() => t('appNav.dashboard'))

const store = useSurveyStore()

const month = computed(() => responsesThisMonth(store.responses))
const rate = computed(() => completionRate(store.responses))
const avg = computed(() => averageSeconds(store.responses))

// NPS calculado a partir das respostas — nunca gravado.
const nps = computed(() => {
  const values: number[] = []
  for (const survey of store.surveys) {
    const question = ordered(survey.questions).find((q) => q.type === 'nps')
    if (!question) continue
    for (const response of store.responses) {
      if (response.surveyId !== survey.id) continue
      const answer = response.answers.find((a) => a.questionId === question.id)
      if (typeof answer?.value === 'number') values.push(answer.value)
    }
  }
  return npsFrom(values)
})

const series = computed(() => responsesPerDay(store.responses, 30))
const top = computed(() => topSurveys(store.surveys, store.responses, 5))
const latest = computed(() => latestResponses(store.responses, 6))
const sources = computed(() => sourceBreakdown(store.responses))

const dayLabel = (iso: string) => {
  const d = new Date(`${iso}T12:00:00`)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

const chartSeries = computed(() => [
  { name: t('dashboard.charts.responsesSeries'), data: series.value.map((p) => p.value) },
])

const chartOptions = computed(() => ({
  xaxis: { categories: series.value.map((p) => dayLabel(p.label)), tickAmount: 8 },
  yaxis: { labels: { formatter: (v: number) => String(Math.round(v)) } },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
}))
</script>
