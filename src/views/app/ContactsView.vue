<template>
  <PageHeader :title="t('contacts.title')" :subtitle="t('contacts.subtitle', { count: store.contacts.length }, store.contacts.length)" />

  <FilterBar v-model:search="term" :search-placeholder="t('contacts.searchPlaceholder')">
    <FilterSelect :label="t('contacts.tag')" :value="tag" @update:value="onTagChange">
      <option value="all">{{ t('common.all') }}</option>
      <option v-for="item in tags" :key="item" :value="item">{{ item }}</option>
    </FilterSelect>
  </FilterBar>

  <div v-if="filtered.length === 0" class="surface-card rounded-2xl border">
    <EmptyState icon="users" :title="t('contacts.emptyTitle')" :description="t('contacts.emptyDesc')">
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
        <table class="w-full min-w-[52rem] text-left text-sm">
          <thead>
            <tr class="border-b border-themed">
              <th class="px-5 py-3 font-medium text-muted">{{ t('contacts.person') }}</th>
              <th class="px-5 py-3 font-medium text-muted">{{ t('contacts.tags') }}</th>
              <th class="px-5 py-3 font-medium text-muted">{{ t('contacts.origin') }}</th>
              <th class="px-5 py-3 text-right font-medium text-muted">{{ t('contacts.responses') }}</th>
              <th class="px-5 py-3 text-center font-medium text-muted">{{ t('contacts.score') }}</th>
              <th class="px-5 py-3 font-medium text-muted">{{ t('contacts.lastAt') }}</th>
              <th class="px-5 py-3 text-right font-medium text-muted">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in pageRows"
              :key="row.contact.id"
              class="border-b border-themed last:border-0 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <td class="max-w-[18rem] px-5 py-3">
                <div class="flex min-w-0 items-center gap-3">
                  <Avatar :src="row.contact.avatar" :name="row.contact.name" size="sm" />
                  <div class="min-w-0">
                    <p class="truncate font-medium text-heading">{{ row.contact.name }}</p>
                    <p class="truncate text-xs text-muted">{{ row.contact.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3">
                <div class="flex flex-wrap gap-1.5">
                  <span v-if="row.contact.tags.length === 0" class="text-xs text-muted">—</span>
                  <Badge v-for="item in row.contact.tags" :key="item" color="gray">{{ item }}</Badge>
                </div>
              </td>
              <td class="px-5 py-3">
                <SourceBadge :source="row.source" />
              </td>
              <td class="px-5 py-3 text-right tabular-nums text-body">{{ row.responses }}</td>
              <td class="px-5 py-3 text-center">
                <Badge :color="scoreTone(row.score)">{{ row.score === null ? '—' : row.score }}</Badge>
              </td>
              <td class="px-5 py-3 text-muted">{{ row.lastAt ? formatDate(row.lastAt, locale) : '—' }}</td>
              <td class="px-5 py-3">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    :title="t('contacts.editTags')"
                    :aria-label="t('contacts.editTags')"
                    class="flex h-9 w-9 items-center justify-center rounded-lg border border-themed text-muted transition hover:text-heading"
                    @click="openEdit(row.contact)"
                  >
                    <IconBase name="tag" :size="15" />
                  </button>
                  <a
                    :href="`mailto:${row.contact.email}`"
                    :title="t('contacts.sendEmail')"
                    :aria-label="t('contacts.sendEmail')"
                    class="flex h-9 w-9 items-center justify-center rounded-lg border border-themed text-muted transition hover:text-heading"
                  >
                    <IconBase name="mail" :size="15" />
                  </a>
                  <button
                    type="button"
                    :title="t('common.remove')"
                    :aria-label="t('common.remove')"
                    class="flex h-9 w-9 items-center justify-center rounded-lg border border-themed text-muted transition hover:text-error-500"
                    @click="onRemove(row.contact.id)"
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

    <div class="mt-5">
      <Pagination :page="page" :total-pages="totalPages" @change="(p: number) => (page = p)" />
    </div>
  </template>

  <ModalBase :open="editing !== null" :title="t('contacts.editTags')" :subtitle="editing?.name" @close="editing = null">
    <label class="mb-1.5 block text-sm font-medium text-heading" for="tags">{{ t('contacts.tags') }}</label>
    <input
      id="tags"
      v-model="tagDraft"
      :placeholder="t('contacts.tagsPlaceholder')"
      class="focus-ring w-full rounded-lg border border-themed bg-transparent px-3.5 py-2.5 text-sm text-body"
    />
    <p class="mt-1.5 text-xs text-muted">{{ t('contacts.tagsHint') }}</p>

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
        class="h-10 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"
        @click="saveTags"
      >
        {{ t('common.save') }}
      </button>
    </template>
  </ModalBase>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/app/PageHeader.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ModalBase from '@/components/ui/ModalBase.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Badge from '@/components/ui/Badge.vue'
import IconBase from '@/components/ui/IconBase.vue'
import Pagination from '@/components/ui/Pagination.vue'
import SourceBadge from '@/components/sv/SourceBadge.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useSurveyStore } from '@/stores/survey'
import { useUiStore } from '@/stores/ui'
import { formatDate } from '@/lib/format'
import { allTags, ordered } from '@/data/query'
import type { Contact, ResponseSource } from '@/data/types'

const PAGE_SIZE = 10

const { t, locale } = useI18n()
usePageTitle(() => t('contacts.title'))

const store = useSurveyStore()
const ui = useUiStore()

const term = ref('')
const tag = ref('all')
const page = ref(1)
const editing = ref<Contact | null>(null)
const tagDraft = ref('')

const tags = computed(() => allTags(store.contacts))

/** Origem e nota (NPS) vêm das respostas — nada disso é gravado no contato. */
const enriched = computed(() =>
  store.contacts.map((contact) => {
    const rows = store.responses
      .filter((r) => r.contactId === contact.id)
      .sort((a, b) => b.at.localeCompare(a.at))
    let score: number | null = null
    for (const response of rows) {
      const survey = store.surveys.find((s) => s.id === response.surveyId)
      if (!survey) continue
      const question = ordered(survey.questions).find((q) => q.type === 'nps')
      if (!question) continue
      const answer = response.answers.find((a) => a.questionId === question.id)
      if (typeof answer?.value === 'number') {
        score = answer.value
        break
      }
    }
    return {
      contact,
      responses: rows.length,
      lastAt: rows[0]?.at ?? contact.lastAt,
      source: (rows[0]?.source ?? 'link') as ResponseSource,
      score,
    }
  })
)

const filtered = computed(() =>
  enriched.value
    .filter((row) => {
      const haystack = `${row.contact.name} ${row.contact.email}`.toLowerCase()
      return haystack.includes(term.value.trim().toLowerCase())
    })
    .filter((row) => (tag.value === 'all' ? true : row.contact.tags.includes(tag.value)))
    .sort((a, b) => (b.lastAt || '').localeCompare(a.lastAt || ''))
)

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const pageRows = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

function onTagChange(value: string) {
  tag.value = value
  page.value = 1
}

function clearFilters() {
  term.value = ''
  tag.value = 'all'
}

function openEdit(contact: Contact) {
  editing.value = contact
  tagDraft.value = contact.tags.join(', ')
}

function saveTags() {
  if (!editing.value) return
  const parsed = tagDraft.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  store.updateContact(editing.value.id, { tags: [...new Set(parsed)] })
  editing.value = null
  ui.notifySuccess(t('contacts.saved'))
}

function onRemove(id: number) {
  store.removeContact(id)
  ui.notifySuccess(t('contacts.removed'))
}

const scoreTone = (score: number | null) => {
  if (score === null) return 'gray' as const
  if (score >= 9) return 'success' as const
  if (score >= 7) return 'warning' as const
  return 'error' as const
}
</script>
