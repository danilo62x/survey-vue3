<template>
  <EmptyState
    v-if="!survey"
    icon="chart"
    :title="t('builder.notFoundTitle')"
    :description="t('builder.notFoundDesc')"
  >
    <template #action>
      <RouterLink
        to="/app/formularios"
        class="inline-flex h-10 items-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white"
      >
        {{ t('builder.backToForms') }}
      </RouterLink>
    </template>
  </EmptyState>

  <template v-else>
    <PageHeader :title="t('results.title')" :subtitle="survey.title" :crumbs="crumbs">
      <template #action>
        <div class="flex flex-wrap items-center gap-2">
          <RouterLink
            :to="`/app/formularios/${survey.id}`"
            class="inline-flex h-10 items-center gap-2 rounded-lg border border-themed px-4 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <IconBase name="edit" :size="16" />
            {{ t('forms.edit') }}
          </RouterLink>
          <button
            type="button"
            :disabled="filtered.length === 0"
            class="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
            @click="exportCsv"
          >
            <IconBase name="download" :size="16" />
            {{ t('results.export') }}
          </button>
        </div>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        :title="t('results.kpi.total')"
        :value="responses.length"
        icon="inbox"
        accent="brand"
        :hint="t('results.kpi.totalHint', { views: survey.views })"
      />
      <KpiCard
        :title="t('results.kpi.completion')"
        :value="`${Math.round(completionRate(responses) * 100)}%`"
        icon="check-circle"
        accent="success"
        :hint="t('results.kpi.completionHint', { count: completedCount }, completedCount)"
      />
      <KpiCard
        :title="t('results.kpi.time')"
        :value="responses.length ? formatSeconds(averageSeconds(responses)) : '—'"
        icon="clock"
        accent="warning"
        :hint="t('results.kpi.timeHint')"
      />
      <KpiCard
        :title="t('results.kpi.nps')"
        :value="nps ? nps.score : '—'"
        icon="gauge"
        accent="info"
        :hint="nps ? t('results.kpi.npsHint', { count: nps.total }, nps.total) : t('results.kpi.npsNone')"
      />
    </div>

    <div class="mt-6">
      <Tabs v-model="tab" :tabs="tabItems">
        <!-- Resumo -->
        <template v-if="tab === 0">
          <div v-if="responses.length === 0" class="surface-card rounded-2xl border">
            <EmptyState icon="inbox" :title="t('results.emptyTitle')" :description="t('results.emptyDesc')" />
          </div>
          <div v-else class="flex flex-col gap-5">
            <QuestionSummaryCard
              v-for="(summary, index) in summaries"
              :key="summary.question.id"
              :summary="summary"
              :index="index"
              :color="survey.color"
            />
          </div>
        </template>

        <!-- Individuais -->
        <div v-else>
          <FilterBar v-model:search="term" :search-placeholder="t('results.searchPlaceholder')">
            <FilterSelect :label="t('results.source')" :value="source" @update:value="onSourceChange">
              <option value="all">{{ t('common.all') }}</option>
              <option v-for="s in SOURCES" :key="s" :value="s">{{ t(`sources.${s}`) }}</option>
            </FilterSelect>
            <FilterSelect :label="t('results.status')" :value="onlyCompleted" @update:value="onCompletedChange">
              <option value="all">{{ t('common.all') }}</option>
              <option value="yes">{{ t('results.completed') }}</option>
              <option value="no">{{ t('results.partial') }}</option>
            </FilterSelect>
          </FilterBar>

          <div v-if="filtered.length === 0" class="surface-card rounded-2xl border">
            <EmptyState
              icon="inbox"
              :title="t('results.emptyFilterTitle')"
              :description="t('results.emptyFilterDesc')"
            >
              <template #action>
                <button
                  type="button"
                  class="inline-flex h-10 items-center rounded-lg border border-themed px-4 text-sm font-medium text-body"
                  @click="clearFilters"
                >
                  {{ t('common.clearFilters') }}
                </button>
              </template>
            </EmptyState>
          </div>

          <template v-else>
            <div class="surface-card overflow-hidden rounded-2xl border">
              <div class="overflow-x-auto">
                <table class="w-full min-w-[48rem] text-left text-sm">
                  <thead>
                    <tr class="border-b border-themed">
                      <th class="px-5 py-3 font-medium text-muted">#</th>
                      <th class="px-5 py-3 font-medium text-muted">{{ t('results.respondent') }}</th>
                      <th class="px-5 py-3 font-medium text-muted">{{ t('results.date') }}</th>
                      <th class="px-5 py-3 font-medium text-muted">{{ t('results.source') }}</th>
                      <th class="px-5 py-3 text-right font-medium text-muted">{{ t('results.duration') }}</th>
                      <th class="px-5 py-3 font-medium text-muted">{{ t('results.status') }}</th>
                      <th class="px-5 py-3 text-right font-medium text-muted">{{ t('common.actions') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="response in pageRows"
                      :key="response.id"
                      class="border-b border-themed last:border-0 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <td class="px-5 py-3 tabular-nums text-muted">{{ response.id }}</td>
                      <td class="max-w-[16rem] px-5 py-3">
                        <div class="flex min-w-0 items-center gap-2.5">
                          <template v-if="contactOf(response)">
                            <Avatar
                              :src="contactOf(response)!.avatar"
                              :name="contactOf(response)!.name"
                              size="xs"
                            />
                            <span class="min-w-0">
                              <span class="block truncate text-sm text-heading">{{ contactOf(response)!.name }}</span>
                              <span class="block truncate text-xs text-muted">{{ contactOf(response)!.email }}</span>
                            </span>
                          </template>
                          <span v-else class="text-muted">{{ t('results.anonymous') }}</span>
                        </div>
                      </td>
                      <td class="px-5 py-3 text-muted">{{ formatDateTime(response.at, locale) }}</td>
                      <td class="px-5 py-3">
                        <SourceBadge :source="response.source" />
                      </td>
                      <td class="px-5 py-3 text-right tabular-nums text-body">
                        {{ formatSeconds(response.durationSec) }}
                      </td>
                      <td class="px-5 py-3">
                        <Badge :color="response.completed ? 'success' : 'warning'" dot>
                          {{ t(response.completed ? 'results.completed' : 'results.partial') }}
                        </Badge>
                      </td>
                      <td class="px-5 py-3 text-right">
                        <button
                          type="button"
                          class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-themed px-3 text-xs font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
                          @click="selected = response"
                        >
                          <IconBase name="eye" :size="14" />
                          {{ t('results.view') }}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="mt-5">
              <Pagination :page="page" :total-pages="totalPages" @change="(p: number) => (page = p)" />
            </div>
          </template>
        </div>
      </Tabs>
    </div>

    <ResponseDrawer
      :open="selected !== null"
      :survey="survey"
      :response="selected"
      :contacts="store.contacts"
      @close="selected = null"
    />
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/app/PageHeader.vue'
import IconBase from '@/components/ui/IconBase.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Tabs from '@/components/ui/Tabs.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Badge from '@/components/ui/Badge.vue'
import Pagination from '@/components/ui/Pagination.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import KpiCard from '@/components/sv/KpiCard.vue'
import QuestionSummaryCard from '@/components/sv/QuestionSummaryCard.vue'
import ResponseDrawer from '@/components/sv/ResponseDrawer.vue'
import SourceBadge from '@/components/sv/SourceBadge.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useSurveyStore } from '@/stores/survey'
import { useUiStore } from '@/stores/ui'
import { formatDateTime } from '@/lib/format'
import {
  answerToText,
  averageSeconds,
  buildCsv,
  completionRate,
  contactById,
  downloadCsv,
  formatSeconds,
  responsesOf,
  summarizeSurvey,
  surveyNps,
} from '@/data/query'
import type { Response, ResponseSource } from '@/data/types'

const PAGE_SIZE = 10
const SOURCES: ResponseSource[] = ['link', 'email', 'qr', 'incorporado']

const { t, locale } = useI18n()
const route = useRoute()

const store = useSurveyStore()
const ui = useUiStore()

const survey = computed(() => store.surveys.find((s) => s.id === Number(route.params.id)))
usePageTitle(() => (survey.value ? `${survey.value.title} — ${t('results.title')}` : t('results.title')))

const tab = ref(0)
const page = ref(1)
const source = ref<'all' | ResponseSource>('all')
const onlyCompleted = ref<'all' | 'yes' | 'no'>('all')
const term = ref('')
const selected = ref<Response | null>(null)

const responses = computed(() => (survey.value ? responsesOf(store.responses, survey.value.id) : []))
const summaries = computed(() => (survey.value ? summarizeSurvey(survey.value, responses.value) : []))
const nps = computed(() => (survey.value ? surveyNps(survey.value, responses.value) : null))
const completedCount = computed(() => responses.value.filter((r) => r.completed).length)

const crumbs = computed(() => [
  { label: t('appNav.forms'), href: '/app/formularios', icon: 'clipboard-list' },
  { label: survey.value?.title ?? '', href: `/app/formularios/${survey.value?.id}` },
  { label: t('results.title') },
])

const tabItems = computed(() => [
  { label: t('results.tabs.summary'), icon: 'pie-chart' },
  { label: t('results.tabs.individual'), icon: 'list' },
])

const filtered = computed(() => {
  const needle = term.value.trim().toLowerCase()
  return responses.value
    .filter((r) => (source.value === 'all' ? true : r.source === source.value))
    .filter((r) =>
      onlyCompleted.value === 'all' ? true : onlyCompleted.value === 'yes' ? r.completed : !r.completed
    )
    .filter((r) => {
      if (!needle) return true
      const contact = contactById(store.contacts, r.contactId)
      const haystack = [
        contact?.name ?? '',
        contact?.email ?? '',
        ...r.answers.map((a) => answerToText(a.value)),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    })
    .sort((a, b) => b.at.localeCompare(a.at))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const pageRows = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

const contactOf = (response: Response) => contactById(store.contacts, response.contactId)

function onSourceChange(value: string) {
  source.value = value as 'all' | ResponseSource
  page.value = 1
}

function onCompletedChange(value: string) {
  onlyCompleted.value = value as 'all' | 'yes' | 'no'
  page.value = 1
}

function clearFilters() {
  term.value = ''
  source.value = 'all'
  onlyCompleted.value = 'all'
}

/** Gera o CSV no próprio navegador (Blob + URL.createObjectURL). */
function exportCsv() {
  if (!survey.value) return
  const csv = buildCsv(
    survey.value,
    filtered.value,
    store.contacts,
    {
      id: t('results.csv.id'),
      at: t('results.csv.at'),
      duration: t('results.csv.duration'),
      completed: t('results.csv.completed'),
      source: t('results.csv.source'),
      contact: t('results.csv.contact'),
    },
    t('common.yes'),
    t('common.no')
  )
  downloadCsv(`${survey.value.slug}-respostas.csv`, csv)
  ui.notifySuccess(t('results.exported', { count: filtered.value.length }, filtered.value.length))
}
</script>
