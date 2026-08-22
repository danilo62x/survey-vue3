<template>
  <div v-if="!survey" class="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
    <span
      class="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/15"
    >
      <IconBase name="clipboard-list" :size="30" />
    </span>
    <h1 class="mt-6 text-xl font-semibold text-heading">{{ t('fill.notFoundTitle') }}</h1>
    <p class="mt-2 text-sm text-muted">{{ t('fill.notFoundDesc') }}</p>
    <RouterLink
      to="/"
      class="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-medium text-white"
    >
      <IconBase name="arrow-right" :size="16" />
      {{ t('fill.backHome') }}
    </RouterLink>
  </div>

  <div
    v-else-if="survey.status !== 'publicado'"
    class="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center"
  >
    <span
      class="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-50 text-warning-600 dark:bg-warning-500/15"
    >
      <IconBase :name="survey.status === 'encerrado' ? 'lock' : 'edit'" :size="30" />
    </span>
    <h1 class="mt-6 text-xl font-semibold text-heading">
      {{ t(survey.status === 'encerrado' ? 'fill.closedTitle' : 'fill.draftTitle') }}
    </h1>
    <p class="mt-2 text-sm text-muted">
      {{ t(survey.status === 'encerrado' ? 'fill.closedDesc' : 'fill.draftDesc') }}
    </p>
    <RouterLink
      to="/modelos"
      class="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-medium text-white"
    >
      <IconBase name="layers" :size="16" />
      {{ t('fill.seeTemplates') }}
    </RouterLink>
  </div>

  <div v-else class="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
    <div v-if="intro" class="surface-card overflow-hidden rounded-3xl border shadow-theme-lg">
      <img :src="svImage(survey.coverSeed, 960, 420)" alt="" class="h-40 w-full object-cover sm:h-56" />
      <div class="p-6 sm:p-8">
        <h1 class="text-title-sm font-bold break-words text-heading">{{ survey.title }}</h1>
        <p class="mt-3 text-sm text-muted sm:text-base">{{ survey.description }}</p>

        <dl class="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          <div>
            <dt class="text-xs text-muted">{{ t('fill.questionsCount') }}</dt>
            <dd class="text-sm font-semibold text-heading">{{ questions.length }}</dd>
          </div>
          <div>
            <dt class="text-xs text-muted">{{ t('fill.estimated') }}</dt>
            <dd class="text-sm font-semibold text-heading">
              {{ t('fill.minutes', { count: Math.max(1, Math.round(questions.length * 0.6)) }) }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-muted">{{ t('fill.oneAtATime') }}</dt>
            <dd class="text-sm font-semibold text-heading">{{ t('fill.oneAtATimeValue') }}</dd>
          </div>
        </dl>

        <button
          type="button"
          class="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-medium text-white transition sm:w-auto"
          :style="{ backgroundColor: survey.color }"
          @click="intro = false"
        >
          <IconBase name="play" :size="18" />
          {{ t('fill.start') }}
        </button>
      </div>
    </div>

    <div v-else class="surface-card rounded-3xl border p-6 shadow-theme-lg sm:p-8">
      <div class="mb-8">
        <ProgressBar
          :current="progress.current"
          :total="progress.total"
          :percent="progress.percent"
          :color="survey.color"
        />
      </div>

      <template v-if="question">
        <QuestionRenderer
          :question="question"
          :value="filling.answers[question.id]"
          :error="error"
          :color="survey.color"
          @change="onAnswer"
        />

        <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            :disabled="progress.current <= 1"
            class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-themed px-5 text-sm font-medium text-body transition hover:bg-gray-50 disabled:opacity-40 dark:hover:bg-gray-800"
            @click="handleBack"
          >
            <IconBase name="chevron-left" :size="16" />
            {{ t('common.back') }}
          </button>

          <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            <button
              v-if="!question.required"
              type="button"
              class="inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium text-muted transition hover:text-heading"
              @click="handleSkip"
            >
              {{ t('fill.skip') }}
            </button>
            <button
              type="button"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-medium text-white transition"
              :style="{ backgroundColor: survey.color }"
              @click="handleNext"
            >
              {{ isLast ? t('fill.submit') : t('common.next') }}
              <IconBase :name="isLast ? 'send' : 'arrow-right'" :size="16" />
            </button>
          </div>
        </div>
      </template>

      <div v-else class="py-10 text-center">
        <p class="text-sm text-muted">{{ t('fill.done') }}</p>
        <button
          type="button"
          class="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-medium text-white"
          @click="submitNow"
        >
          <IconBase name="send" :size="16" />
          {{ t('fill.submit') }}
        </button>
      </div>

      <p class="mt-8 border-t border-themed pt-5 text-xs text-muted">{{ t('fill.logicHint') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useSurveyStore } from '@/stores/survey'
import { useFillingStore } from '@/stores/filling'
import { ordered, surveyBySlug, validateAnswer, type FieldError } from '@/data/query'
import { svImage } from '@/data/mock'
import type { AnswerValue } from '@/data/types'
import IconBase from '@/components/ui/IconBase.vue'
import ProgressBar from '@/components/sv/ProgressBar.vue'
import QuestionRenderer from '@/components/sv/QuestionRenderer.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const store = useSurveyStore()
const filling = useFillingStore()

const slug = computed(() => String(route.params.slug ?? ''))
const survey = computed(() => surveyBySlug(store.surveys, slug.value))

usePageTitle(() => survey.value?.title ?? '')

const error = ref<FieldError | null>(null)
const intro = ref(true)
let viewed = false

watch(
  () => survey.value?.id,
  () => {
    const s = survey.value
    if (!s) return
    filling.start(s)
    if (!viewed) {
      viewed = true
      store.registerView(s.id)
    }
    if (filling.slug === s.slug && Object.keys(filling.answers).length > 0) intro.value = false
  },
  { immediate: true }
)

const questions = computed(() => (survey.value ? ordered(survey.value.questions) : []))
const question = computed(() => (survey.value ? questions.value[filling.index] : undefined))
const progress = computed(() =>
  survey.value ? filling.progress(survey.value) : { current: 0, total: 0, percent: 0 }
)
const isLast = computed(() => (survey.value ? filling.isLast(survey.value) : false))

function onAnswer(value: AnswerValue) {
  if (!question.value) return
  filling.setAnswer(question.value.id, value)
  error.value = null
}

function submitNow() {
  const s = survey.value
  if (!s) return
  const { answers, durationSec } = filling.submit(s)
  store.registerResponse({
    surveyId: s.id,
    answers,
    durationSec,
    completed: true,
    source: 'link',
  })
  router.push(`/f/${s.slug}/obrigado`)
}

function handleNext() {
  const s = survey.value
  if (!s) return
  if (!question.value) {
    submitNow()
    return
  }
  const value = filling.answers[question.value.id]
  const err = validateAnswer(question.value, value)
  if (err) {
    error.value = err
    return
  }
  error.value = null
  if (filling.isLast(s)) {
    submitNow()
    return
  }
  filling.goNext(s)
}

function handleSkip() {
  const s = survey.value
  if (!s) return
  error.value = null
  if (filling.isLast(s)) {
    handleNext()
    return
  }
  filling.goNext(s)
}

function handleBack() {
  const s = survey.value
  if (!s) return
  error.value = null
  filling.goBack(s)
}
</script>
