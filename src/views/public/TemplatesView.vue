<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
    <header class="max-w-2xl">
      <p class="text-sm font-semibold tracking-wider text-brand-500 uppercase">{{ t('templates.eyebrow') }}</p>
      <h1 class="mt-2 text-title-sm font-bold text-heading sm:text-title-md">{{ t('templates.publicTitle') }}</h1>
      <p class="mt-3 text-muted">{{ t('templates.publicSubtitle') }}</p>
    </header>

    <div class="mt-8 max-w-md">
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

    <EmptyState
      v-if="filtered.length === 0"
      icon="layers"
      :title="t('templates.emptyTitle')"
      :description="t('templates.emptyDesc')"
    >
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

    <div v-else class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="template in filtered" :key="template.id" :id="template.slug">
        <TemplateCard :template="template" :action-label="t('templates.preview')" @action="preview = template" />
      </div>
    </div>

    <section
      class="mt-14 overflow-hidden rounded-3xl border border-themed bg-brand-500 px-6 py-10 text-center sm:px-10"
    >
      <h2 class="text-title-sm font-bold text-white">{{ t('templates.ctaTitle') }}</h2>
      <p class="mx-auto mt-3 max-w-xl text-sm text-white/80">{{ t('templates.ctaDesc') }}</p>
      <RouterLink
        to="/registro"
        class="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-medium text-brand-600 transition hover:bg-brand-50"
      >
        <IconBase name="plus" :size="18" />
        {{ t('templates.ctaButton') }}
      </RouterLink>
    </section>

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
        <RouterLink
          to="/registro"
          class="flex h-10 items-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          {{ t('templates.useTemplate') }}
        </RouterLink>
      </template>
    </ModalBase>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useSurveyStore } from '@/stores/survey'
import type { TemplateModel } from '@/data/types'
import IconBase from '@/components/ui/IconBase.vue'
import ModalBase from '@/components/ui/ModalBase.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import TemplateCard from '@/components/sv/TemplateCard.vue'
import QuestionRenderer from '@/components/sv/QuestionRenderer.vue'
import { ordered } from '@/data/query'

const { t } = useI18n()
usePageTitle(() => t('templates.publicTitle'))
const route = useRoute()
const store = useSurveyStore()

const term = ref('')
const preview = ref<TemplateModel | null>(null)

// Vindo da home com #slug, o modelo já abre em prévia.
watch(
  () => route.hash,
  (hash) => {
    const slug = hash.replace('#', '')
    if (!slug) return
    const found = store.templates.find((tpl) => tpl.slug === slug)
    if (found) preview.value = found
  },
  { immediate: true }
)

const filtered = computed(() =>
  store.templates.filter((tpl) => {
    const haystack = `${tpl.name} ${tpl.objective}`.toLowerCase()
    return haystack.includes(term.value.trim().toLowerCase())
  })
)
</script>
