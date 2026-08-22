<template>
  <PageHeader :title="t('templates.libraryTitle')" :subtitle="t('templates.librarySubtitle')" />

  <div class="mb-6 max-w-md">
    <div class="relative">
      <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">
        <IconBase name="search" :size="16" />
      </span>
      <input
        v-model="term"
        :placeholder="t('templates.searchPlaceholder')"
        class="focus-ring surface-card w-full rounded-xl border py-2.5 pr-3 pl-9 text-sm text-body"
      />
    </div>
  </div>

  <div v-if="filtered.length === 0" class="surface-card rounded-2xl border">
    <EmptyState icon="layers" :title="t('templates.emptyTitle')" :description="t('templates.emptyDesc')">
      <template #action>
        <button
          type="button"
          class="inline-flex h-10 items-center rounded-lg border border-themed px-4 text-sm font-medium text-body"
          @click="term = ''"
        >
          {{ t('common.clearFilters') }}
        </button>
      </template>
    </EmptyState>
  </div>

  <div v-else class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
    <div v-for="template in filtered" :key="template.id" class="flex flex-col gap-2">
      <TemplateCard :template="template" :action-label="t('templates.use')" @action="use(template)" />
      <button
        type="button"
        class="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-themed text-xs font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
        @click="preview = template"
      >
        <IconBase name="eye" :size="14" />
        {{ t('templates.preview') }}
      </button>
    </div>
  </div>

  <ModalBase
    :open="preview !== null"
    :title="preview?.name"
    :subtitle="preview?.objective"
    size="xl"
    @close="preview = null"
  >
    <div v-if="preview" class="flex max-h-[60vh] flex-col gap-8 overflow-y-auto pr-1">
      <div
        v-for="(question, index) in ordered(preview.questions)"
        :key="question.id"
        class="min-w-0 border-b border-themed pb-6 last:border-0 last:pb-0"
      >
        <p class="mb-2 text-xs text-muted">
          {{ t('results.questionNumber', { index: index + 1 }) }} · {{ t(`questionTypes.${question.type}`) }}
        </p>
        <QuestionRenderer :question="question" :value="undefined" :color="preview.color" preview />
      </div>
    </div>

    <template #footer="{ close }">
      <button
        type="button"
        class="h-10 rounded-lg border border-themed px-4 text-sm font-medium text-body"
        @click="close()"
      >
        {{ t('common.close') }}
      </button>
      <button
        type="button"
        class="h-10 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"
        @click="useFromPreview"
      >
        {{ t('templates.use') }}
      </button>
    </template>
  </ModalBase>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/app/PageHeader.vue'
import IconBase from '@/components/ui/IconBase.vue'
import ModalBase from '@/components/ui/ModalBase.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import TemplateCard from '@/components/sv/TemplateCard.vue'
import QuestionRenderer from '@/components/sv/QuestionRenderer.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useSurveyStore } from '@/stores/survey'
import { useUiStore } from '@/stores/ui'
import { ordered } from '@/data/query'
import type { TemplateModel } from '@/data/types'

const { t } = useI18n()
usePageTitle(() => t('templates.libraryTitle'))
const router = useRouter()

const store = useSurveyStore()
const ui = useUiStore()

const preview = ref<TemplateModel | null>(null)
const term = ref('')

const filtered = computed(() =>
  store.templates.filter((tpl) =>
    `${tpl.name} ${tpl.objective}`.toLowerCase().includes(term.value.trim().toLowerCase())
  )
)

function use(template: TemplateModel) {
  const created = store.createFromTemplate(template.id)
  if (created) {
    ui.notifySuccess(t('templates.created', { name: template.name }))
    router.push(`/app/formularios/${created.id}`)
  }
}

function useFromPreview() {
  if (preview.value) use(preview.value)
  preview.value = null
}
</script>
