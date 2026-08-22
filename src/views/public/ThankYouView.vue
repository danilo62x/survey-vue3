<template>
  <div class="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:py-20">
    <div class="surface-card rounded-3xl border p-6 text-center shadow-theme-lg sm:p-10">
      <span
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success-50 text-success-600 dark:bg-success-500/15"
      >
        <IconBase name="check-circle" :size="32" />
      </span>
      <h1 class="mt-6 text-title-sm font-bold text-heading">{{ t('thanks.title') }}</h1>
      <p class="mx-auto mt-3 max-w-xl text-sm text-muted sm:text-base">
        {{ survey ? survey.thankYou : t('thanks.generic') }}
      </p>

      <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
          @click="answerAgain"
        >
          <IconBase name="refresh-cw" :size="16" />
          {{ t('thanks.again') }}
        </button>
        <RouterLink
          to="/"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-themed px-5 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <IconBase name="globe" :size="16" />
          {{ t('thanks.home') }}
        </RouterLink>
      </div>
    </div>

    <section v-if="rows.length > 0" class="surface-card mt-6 rounded-3xl border p-6 sm:p-8">
      <h2 class="text-base font-semibold text-heading">{{ t('thanks.summary') }}</h2>
      <p class="mt-1 text-sm text-muted">{{ t('thanks.summaryDesc') }}</p>
      <dl class="mt-6 flex flex-col gap-4">
        <div
          v-for="(question, index) in rows"
          :key="question.id"
          class="min-w-0 border-b border-themed pb-4 last:border-0 last:pb-0"
        >
          <dt class="text-sm font-medium break-words text-heading">{{ index + 1 }}. {{ question.title }}</dt>
          <dd class="mt-1 text-sm break-words text-muted">{{ answerToText(answered[question.id]) }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useSurveyStore } from '@/stores/survey'
import { useFillingStore } from '@/stores/filling'
import { answerToText, ordered, surveyBySlug } from '@/data/query'
import IconBase from '@/components/ui/IconBase.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const store = useSurveyStore()
const filling = useFillingStore()

const slug = computed(() => String(route.params.slug ?? ''))
const survey = computed(() => surveyBySlug(store.surveys, slug.value))

usePageTitle(() => t('thanks.title'))

const answered = computed(() =>
  survey.value && filling.slug === survey.value.slug ? filling.submittedAnswers : {}
)

const rows = computed(() =>
  survey.value ? ordered(survey.value.questions).filter((q) => answered.value[q.id] !== undefined) : []
)

function answerAgain() {
  filling.restart()
  router.push(`/f/${slug.value}`)
}
</script>
