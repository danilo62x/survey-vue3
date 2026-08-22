<template>
  <PageHeader :title="t('forms.title')" :subtitle="t('forms.subtitle')">
    <template #action>
      <button
        type="button"
        class="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"
        @click="creating = true"
      >
        <IconBase name="plus" :size="16" />
        {{ t('forms.new') }}
      </button>
    </template>
  </PageHeader>

  <FilterBar v-model:search="term" :search-placeholder="t('forms.searchPlaceholder')">
    <FilterSelect
      :label="t('common.status')"
      :value="status"
      @update:value="(v: string) => (status = v as 'all' | FormStatus)"
    >
      <option value="all">{{ t('common.all') }}</option>
      <option v-for="s in STATUSES" :key="s" :value="s">{{ t(`statuses.${s}`) }}</option>
    </FilterSelect>

    <template #action>
      <div class="flex items-center gap-1 rounded-lg border border-themed p-1">
        <button
          v-for="mode in (['table', 'cards'] as const)"
          :key="mode"
          type="button"
          :aria-label="t(mode === 'table' ? 'forms.viewTable' : 'forms.viewCards')"
          :title="t(mode === 'table' ? 'forms.viewTable' : 'forms.viewCards')"
          :class="`flex h-8 w-8 items-center justify-center rounded-md transition ${
            view === mode ? 'bg-brand-500 text-white' : 'text-muted hover:text-heading'
          }`"
          @click="view = mode"
        >
          <IconBase :name="mode === 'table' ? 'list' : 'grid'" :size="16" />
        </button>
      </div>
    </template>
  </FilterBar>

  <div v-if="filtered.length === 0" class="surface-card rounded-2xl border">
    <EmptyState icon="clipboard-list" :title="t('forms.emptyTitle')" :description="t('forms.emptyDesc')">
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

  <div v-else-if="view === 'cards'" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
    <SurveyCard v-for="row in filtered" :key="row.survey.id" :stats="row" />
  </div>

  <div v-else class="surface-card overflow-hidden rounded-2xl border">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[56rem] text-left text-sm">
        <thead>
          <tr class="border-b border-themed">
            <th class="px-5 py-3 font-medium text-muted">{{ t('forms.form') }}</th>
            <th class="px-5 py-3 font-medium text-muted">{{ t('common.status') }}</th>
            <th class="px-5 py-3 text-right font-medium text-muted">{{ t('forms.responses') }}</th>
            <th class="px-5 py-3 text-right font-medium text-muted">{{ t('forms.completion') }}</th>
            <th class="px-5 py-3 text-right font-medium text-muted">{{ t('forms.avgTime') }}</th>
            <th class="px-5 py-3 text-right font-medium text-muted">{{ t('forms.nps') }}</th>
            <th class="px-5 py-3 font-medium text-muted">{{ t('forms.lastResponse') }}</th>
            <th class="px-5 py-3 text-right font-medium text-muted">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in filtered"
            :key="row.survey.id"
            class="border-b border-themed last:border-0 hover:bg-gray-50 dark:hover:bg-white/5"
          >
            <td class="max-w-xs px-5 py-3">
              <RouterLink
                :to="`/app/formularios/${row.survey.id}`"
                class="block truncate font-medium text-heading hover:text-brand-600"
              >
                {{ row.survey.title }}
              </RouterLink>
              <span class="block truncate text-xs text-muted">/f/{{ row.survey.slug }}</span>
            </td>
            <td class="px-5 py-3">
              <SurveyStatus :status="row.survey.status" />
            </td>
            <td class="px-5 py-3 text-right tabular-nums text-body">{{ row.responses }}</td>
            <td class="px-5 py-3 text-right tabular-nums text-body">{{ Math.round(row.completionRate * 100) }}%</td>
            <td class="px-5 py-3 text-right tabular-nums text-body">
              {{ row.responses ? formatSeconds(row.averageSeconds) : '—' }}
            </td>
            <td class="px-5 py-3 text-right tabular-nums text-body">{{ row.nps === null ? '—' : row.nps }}</td>
            <td class="px-5 py-3 text-muted">{{ row.lastAt ? formatDate(row.lastAt, locale) : '—' }}</td>
            <td class="px-5 py-3">
              <div class="flex items-center justify-end gap-1.5">
                <RouterLink
                  :to="`/app/formularios/${row.survey.id}/respostas`"
                  :class="iconButton"
                  :title="t('forms.results')"
                  :aria-label="t('forms.results')"
                >
                  <IconBase name="chart" :size="15" />
                </RouterLink>
                <button
                  type="button"
                  :class="iconButton"
                  :title="t('forms.copyLink')"
                  :aria-label="t('forms.copyLink')"
                  @click="copyLink(row.survey.slug)"
                >
                  <IconBase name="link" :size="15" />
                </button>
                <button
                  type="button"
                  :class="iconButton"
                  :title="t('forms.duplicate')"
                  :aria-label="t('forms.duplicate')"
                  @click="onDuplicate(row.survey.id)"
                >
                  <IconBase name="copy" :size="15" />
                </button>
                <button
                  v-if="row.survey.status === 'publicado'"
                  type="button"
                  :class="iconButton"
                  :title="t('forms.close')"
                  :aria-label="t('forms.close')"
                  @click="onClose(row.survey.id)"
                >
                  <IconBase name="lock" :size="15" />
                </button>
                <button
                  v-else
                  type="button"
                  :class="iconButton"
                  :title="t('forms.publish')"
                  :aria-label="t('forms.publish')"
                  @click="onPublish(row.survey.id)"
                >
                  <IconBase name="rocket" :size="15" />
                </button>
                <button
                  type="button"
                  :class="`${iconButton} hover:text-error-500`"
                  :title="t('common.remove')"
                  :aria-label="t('common.remove')"
                  @click="removing = row.survey.id"
                >
                  <IconBase name="trash" :size="15" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Novo formulário -->
  <ModalBase :open="creating" :title="t('forms.newTitle')" :subtitle="t('forms.newSubtitle')" @close="creating = false">
    <div class="flex flex-col gap-4">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-heading" for="new-title">
          {{ t('forms.formTitle') }}
        </label>
        <input
          id="new-title"
          v-model="title"
          :placeholder="t('forms.formTitlePlaceholder')"
          class="focus-ring w-full rounded-lg border border-themed bg-transparent px-3.5 py-2.5 text-sm text-body"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-medium text-heading" for="new-template">
          {{ t('forms.startFrom') }}
        </label>
        <select
          id="new-template"
          v-model="templateId"
          class="focus-ring w-full rounded-lg border border-themed bg-transparent px-3.5 py-2.5 text-sm text-body"
        >
          <option value="">{{ t('forms.blank') }}</option>
          <option v-for="template in store.templates" :key="template.id" :value="String(template.id)">
            {{ template.name }}
          </option>
        </select>
        <p class="mt-1.5 text-xs text-muted">{{ t('forms.startFromHint') }}</p>
      </div>
    </div>

    <template #footer="{ close }">
      <button
        type="button"
        class="h-10 rounded-lg border border-themed px-4 text-sm font-medium text-body"
        @click="close()"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        type="button"
        :disabled="!title.trim() && !templateId"
        class="h-10 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
        @click="create"
      >
        {{ t('common.create') }}
      </button>
    </template>
  </ModalBase>

  <!-- Confirmar exclusão -->
  <ModalBase :open="removing !== null" :title="t('forms.removeTitle')" size="sm" @close="removing = null">
    <p class="text-sm text-muted">{{ t('forms.removeDesc') }}</p>

    <template #footer="{ close }">
      <button
        type="button"
        class="h-10 rounded-lg border border-themed px-4 text-sm font-medium text-body"
        @click="close()"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        type="button"
        class="h-10 rounded-lg bg-error-500 px-4 text-sm font-medium text-white transition hover:bg-error-600"
        @click="confirmRemove"
      >
        {{ t('common.remove') }}
      </button>
    </template>
  </ModalBase>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/app/PageHeader.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ModalBase from '@/components/ui/ModalBase.vue'
import IconBase from '@/components/ui/IconBase.vue'
import SurveyStatus from '@/components/sv/SurveyStatus.vue'
import SurveyCard from '@/components/sv/SurveyCard.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useSurveyStore } from '@/stores/survey'
import { useUiStore } from '@/stores/ui'
import { formatDate } from '@/lib/format'
import { formatSeconds, surveyStats } from '@/data/query'
import type { FormStatus } from '@/data/types'

const STATUSES: FormStatus[] = ['rascunho', 'publicado', 'encerrado']

const { t, locale } = useI18n()
usePageTitle(() => t('forms.title'))
const router = useRouter()
const route = useRoute()

const store = useSurveyStore()
const ui = useUiStore()

const term = ref('')
const status = ref<'all' | FormStatus>('all')
const view = ref<'table' | 'cards'>('table')
const creating = ref(false)
const removing = ref<number | null>(null)
const title = ref('')
const templateId = ref('')

onMounted(() => {
  if (route.query.novo === '1') {
    creating.value = true
    const query = { ...route.query }
    delete query.novo
    router.replace({ path: route.path, query })
  }
})

const stats = computed(() => surveyStats(store.surveys, store.responses))

const filtered = computed(() =>
  stats.value.filter((row) => {
    const matchesTerm = `${row.survey.title} ${row.survey.description}`
      .toLowerCase()
      .includes(term.value.trim().toLowerCase())
    const matchesStatus = status.value === 'all' || row.survey.status === status.value
    return matchesTerm && matchesStatus
  })
)

const iconButton =
  'flex h-9 w-9 items-center justify-center rounded-lg border border-themed text-muted transition hover:text-heading'

function clearFilters() {
  term.value = ''
  status.value = 'all'
}

async function copyLink(slug: string) {
  const link = `${window.location.origin}/f/${slug}`
  try {
    await navigator.clipboard.writeText(link)
  } catch {
    // Sem permissão de área de transferência — o aviso ainda confirma a ação.
  }
  ui.notifySuccess(t('forms.linkCopied'))
}

function onDuplicate(id: number) {
  store.duplicateSurvey(id)
  ui.notifySuccess(t('forms.duplicated'))
}

function onClose(id: number) {
  store.closeSurvey(id)
  ui.notifySuccess(t('forms.closed'))
}

function onPublish(id: number) {
  store.publishSurvey(id)
  ui.notifySuccess(t('forms.published'))
}

function confirmRemove() {
  if (removing.value !== null) store.removeSurvey(removing.value)
  removing.value = null
  ui.notifySuccess(t('forms.removed'))
}

function create() {
  const name = title.value.trim()
  if (!name && !templateId.value) return
  const created = templateId.value
    ? store.createFromTemplate(Number(templateId.value), name)
    : store.addSurvey(name, t('forms.newDescription'))
  creating.value = false
  title.value = ''
  templateId.value = ''
  if (created) {
    ui.notifySuccess(t('forms.created'))
    router.push(`/app/formularios/${created.id}`)
  }
}
</script>
