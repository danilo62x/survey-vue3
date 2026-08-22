<template>
  <EmptyState
    v-if="!survey"
    icon="clipboard-list"
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
    <PageHeader :title="survey.title" :subtitle="t('builder.subtitle')" :crumbs="crumbs">
      <template #action>
        <div class="flex flex-wrap items-center gap-2">
          <SurveyStatus :status="survey.status" />
          <RouterLink
            :to="`/f/${survey.slug}`"
            class="inline-flex h-10 items-center gap-2 rounded-lg border border-themed px-4 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <IconBase name="eye" :size="16" />
            {{ t('builder.openPublic') }}
          </RouterLink>
          <RouterLink
            :to="`/app/formularios/${survey.id}/respostas`"
            class="inline-flex h-10 items-center gap-2 rounded-lg border border-themed px-4 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <IconBase name="chart" :size="16" />
            {{ t('forms.results') }}
          </RouterLink>
          <button
            v-if="survey.status === 'publicado'"
            type="button"
            class="inline-flex h-10 items-center gap-2 rounded-lg border border-themed px-4 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
            @click="onClose"
          >
            <IconBase name="lock" :size="16" />
            {{ t('forms.close') }}
          </button>
          <button
            v-else
            type="button"
            class="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"
            @click="onPublish"
          >
            <IconBase name="rocket" :size="16" />
            {{ t('forms.publish') }}
          </button>
        </div>
      </template>
    </PageHeader>

    <p class="mb-5 flex items-center gap-2 text-xs text-muted">
      <IconBase name="check-circle" :size="14" class-name="text-success-500" />
      {{ t('builder.autosave') }}
    </p>

    <Tabs v-model="tab" :tabs="tabItems">
      <!-- Perguntas -->
      <div v-if="tab === 0" class="grid gap-6 xl:grid-cols-12">
        <div class="min-w-0 xl:col-span-5">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-base font-semibold text-heading">
              {{ t('builder.questionsCount', { count: questions.length }, questions.length) }}
            </h2>
            <button
              type="button"
              class="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 text-xs font-medium text-white transition hover:bg-brand-600"
              @click="adding = !adding"
            >
              <IconBase :name="adding ? 'x' : 'plus'" :size="14" />
              {{ t(adding ? 'common.close' : 'builder.addQuestion') }}
            </button>
          </div>

          <div v-if="adding" class="surface-card mt-4 grid gap-2 rounded-2xl border p-4 sm:grid-cols-2">
            <button
              v-for="type in QUESTION_TYPES"
              :key="type"
              type="button"
              class="flex min-w-0 items-center gap-2.5 rounded-xl border border-themed px-3 py-2.5 text-left transition hover:border-brand-300"
              @click="addOfType(type)"
            >
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                :style="{ backgroundColor: QUESTION_COLOR[type] }"
              >
                <IconBase :name="QUESTION_ICON[type]" :size="15" />
              </span>
              <span class="min-w-0">
                <span class="block truncate text-sm font-medium text-heading">{{ t(`questionTypes.${type}`) }}</span>
                <span class="block truncate text-[11px] text-muted">{{ t(`questionTypeHints.${type}`) }}</span>
              </span>
            </button>
          </div>

          <p class="mt-4 flex items-start gap-2 text-xs text-muted">
            <IconBase name="grip" :size="14" class-name="mt-0.5 shrink-0" />
            <span>{{ t('builder.dragHint') }}</span>
          </p>

          <div class="mt-3">
            <div v-if="questions.length === 0" class="surface-card rounded-2xl border">
              <EmptyState
                icon="clipboard-list"
                :title="t('builder.emptyTitle')"
                :description="t('builder.emptyDesc')"
              >
                <template #action>
                  <button
                    type="button"
                    class="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white"
                    @click="adding = true"
                  >
                    <IconBase name="plus" :size="16" />
                    {{ t('builder.addQuestion') }}
                  </button>
                </template>
              </EmptyState>
            </div>
            <QuestionList
              v-else
              :questions="questions"
              :selected-id="selectedId"
              :conditional="conditional"
              @select="(qid: string) => (selectedId = qid)"
              @move="onMove"
              @remove="onRemoveQuestion"
              @duplicate="onDuplicateQuestion"
            />
          </div>
        </div>

        <div class="min-w-0 xl:col-span-7">
          <div v-if="selected" class="grid gap-6 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <div class="surface-card min-w-0 rounded-2xl border p-5 md:p-6">
              <h2 class="mb-5 text-base font-semibold text-heading">{{ t('builder.editorTitle') }}</h2>
              <QuestionEditor
                :question="selected"
                @change="(patch) => store.updateQuestion(survey!.id, selected!.id, patch)"
                @remove="onRemoveQuestion(selected.id)"
              />
            </div>

            <div class="min-w-0">
              <div class="surface-card min-w-0 rounded-2xl border p-5 md:p-6">
                <div class="mb-5 flex items-center justify-between gap-3">
                  <h2 class="text-base font-semibold text-heading">{{ t('builder.previewTitle') }}</h2>
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-[11px] font-medium text-success-700 dark:bg-success-500/15 dark:text-success-500"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-success-500" />
                    {{ t('builder.previewLive') }}
                  </span>
                </div>

                <div class="mb-6">
                  <ProgressBar
                    :current="selectedIndex + 1"
                    :total="questions.length"
                    :percent="Math.round((selectedIndex / Math.max(1, questions.length)) * 100)"
                    :color="survey.color"
                  />
                </div>

                <QuestionRenderer
                  :question="selected"
                  :value="previewValue"
                  :color="survey.color"
                  @change="(v) => (previewValue = v)"
                />

                <p class="mt-6 border-t border-themed pt-4 text-xs text-muted">{{ t('builder.previewHint') }}</p>
              </div>
            </div>
          </div>
          <div v-else class="surface-card rounded-2xl border">
            <EmptyState icon="edit" :title="t('builder.selectTitle')" :description="t('builder.selectDesc')" />
          </div>
        </div>
      </div>

      <!-- Lógica -->
      <div v-else-if="tab === 1">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="max-w-2xl">
            <h2 class="text-base font-semibold text-heading">{{ t('logic.title') }}</h2>
            <p class="mt-1 text-sm text-muted">{{ t('logic.subtitle') }}</p>
          </div>
          <button
            type="button"
            :disabled="questions.length < 2"
            class="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
            @click="store.addRule(survey.id)"
          >
            <IconBase name="plus" :size="16" />
            {{ t('logic.addRule') }}
          </button>
        </div>

        <div class="mt-5 grid gap-3 sm:grid-cols-3">
          <div
            v-for="action in (['pular-para', 'mostrar', 'esconder'] as const)"
            :key="action"
            class="rounded-xl border border-dashed border-themed p-4"
          >
            <p class="text-sm font-medium text-heading">{{ t(`logic.actions.${action}`) }}</p>
            <p class="mt-1 text-xs text-muted">{{ t(`logic.actionHints.${action}`) }}</p>
          </div>
        </div>

        <div v-if="survey.logic.length === 0" class="surface-card mt-6 rounded-2xl border">
          <EmptyState icon="git-branch" :title="t('logic.emptyTitle')" :description="t('logic.emptyDesc')" />
        </div>
        <ul v-else class="mt-6 flex flex-col gap-3">
          <LogicRuleRow
            v-for="rule in survey.logic"
            :key="rule.id"
            :rule="rule"
            :questions="questions"
            @change="(patch) => store.updateRule(survey!.id, rule.id, patch)"
            @remove="onRemoveRule(rule.id)"
          />
        </ul>
      </div>

      <!-- Aparência -->
      <div v-else-if="tab === 2" class="grid gap-6 lg:grid-cols-3">
        <div class="surface-card min-w-0 rounded-2xl border p-5 md:p-6 lg:col-span-2">
          <h2 class="text-base font-semibold text-heading">{{ t('appearance.title') }}</h2>
          <p class="mt-1 text-sm text-muted">{{ t('appearance.subtitle') }}</p>

          <div class="mt-6 flex flex-col gap-5">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-heading" for="s-title">
                {{ t('appearance.formTitle') }}
              </label>
              <input
                id="s-title"
                :value="survey.title"
                class="focus-ring w-full rounded-lg border border-themed bg-transparent px-3.5 py-2.5 text-sm text-body"
                @input="store.updateSurvey(survey!.id, { title: ($event.target as HTMLInputElement).value })"
              />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-heading" for="s-desc">
                {{ t('appearance.description') }}
              </label>
              <textarea
                id="s-desc"
                :rows="3"
                :value="survey.description"
                class="focus-ring w-full resize-y rounded-lg border border-themed bg-transparent px-3.5 py-2.5 text-sm text-body"
                @input="store.updateSurvey(survey!.id, { description: ($event.target as HTMLTextAreaElement).value })"
              />
            </div>

            <div>
              <p class="mb-2 block text-sm font-medium text-heading">{{ t('appearance.color') }}</p>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  v-for="color in COLORS"
                  :key="color"
                  type="button"
                  :aria-label="color"
                  :class="`h-9 w-9 rounded-full border-2 transition ${
                    survey.color === color ? 'border-heading scale-110' : 'border-transparent'
                  }`"
                  :style="{ backgroundColor: color }"
                  @click="store.updateSurvey(survey!.id, { color })"
                />
                <input
                  type="color"
                  :value="survey.color"
                  :aria-label="t('appearance.customColor')"
                  class="h-9 w-12"
                  @input="store.updateSurvey(survey!.id, { color: ($event.target as HTMLInputElement).value })"
                />
              </div>
            </div>

            <div>
              <p class="mb-2 block text-sm font-medium text-heading">{{ t('appearance.cover') }}</p>
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <button
                  v-for="seed in COVERS"
                  :key="seed"
                  type="button"
                  :class="`relative overflow-hidden rounded-xl border-2 transition ${
                    survey.coverSeed === seed ? 'border-brand-500' : 'border-transparent hover:border-brand-200'
                  }`"
                  @click="store.updateSurvey(survey!.id, { coverSeed: seed })"
                >
                  <img :src="svImage(seed, 320, 160)" alt="" loading="lazy" class="h-20 w-full object-cover" />
                  <span
                    v-if="survey.coverSeed === seed"
                    class="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white"
                  >
                    <IconBase name="check" :size="13" :stroke-width="3" />
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-heading" for="s-thanks">
                {{ t('appearance.thankYou') }}
              </label>
              <textarea
                id="s-thanks"
                :rows="3"
                :value="survey.thankYou"
                class="focus-ring w-full resize-y rounded-lg border border-themed bg-transparent px-3.5 py-2.5 text-sm text-body"
                @input="store.updateSurvey(survey!.id, { thankYou: ($event.target as HTMLTextAreaElement).value })"
              />
              <p class="mt-1.5 text-xs text-muted">{{ t('appearance.thankYouHint') }}</p>
            </div>
          </div>
        </div>

        <div class="surface-card min-w-0 rounded-2xl border p-5 md:p-6">
          <h2 class="text-base font-semibold text-heading">{{ t('appearance.previewTitle') }}</h2>
          <div class="mt-4 overflow-hidden rounded-2xl border border-themed">
            <img :src="svImage(survey.coverSeed, 640, 280)" alt="" class="h-28 w-full object-cover" />
            <div class="p-4">
              <p class="text-sm font-semibold break-words text-heading">{{ survey.title }}</p>
              <p class="mt-1 line-clamp-3 text-xs text-muted">{{ survey.description }}</p>
              <span
                class="mt-4 flex h-10 items-center justify-center rounded-lg text-xs font-medium text-white"
                :style="{ backgroundColor: survey.color }"
              >
                {{ t('fill.start') }}
              </span>
            </div>
          </div>
          <p class="mt-4 text-xs text-muted">{{ t('appearance.previewHint') }}</p>
        </div>
      </div>

      <!-- Compartilhar -->
      <ShareBox v-else :survey="survey" />
    </Tabs>
  </template>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/app/PageHeader.vue'
import IconBase from '@/components/ui/IconBase.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Tabs from '@/components/ui/Tabs.vue'
import SurveyStatus from '@/components/sv/SurveyStatus.vue'
import QuestionList from '@/components/sv/QuestionList.vue'
import QuestionEditor from '@/components/sv/QuestionEditor.vue'
import LogicRuleRow from '@/components/sv/LogicRuleRow.vue'
import QuestionRenderer from '@/components/sv/QuestionRenderer.vue'
import ProgressBar from '@/components/sv/ProgressBar.vue'
import ShareBox from '@/components/sv/ShareBox.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useSurveyStore } from '@/stores/survey'
import { useUiStore } from '@/stores/ui'
import { conditionalIds, ordered } from '@/data/query'
import { svImage } from '@/data/mock'
import { QUESTION_COLOR, QUESTION_ICON, QUESTION_TYPES } from '@/lib/questionTypes'
import type { AnswerValue, QuestionType } from '@/data/types'

const COLORS = ['#465fff', '#12b76a', '#f79009', '#f04438', '#0ba5ec', '#7592ff', '#2a31d8', '#039855']
const COVERS = ['atendimento', 'mercado', 'evento', 'time', 'conceito', 'workshop']

const { t } = useI18n()
const route = useRoute()

const store = useSurveyStore()
const ui = useUiStore()

const survey = computed(() => store.surveys.find((s) => s.id === Number(route.params.id)))
usePageTitle(() => survey.value?.title ?? t('builder.title'))

const tab = ref(0)
const selectedId = ref<string | null>(null)
const adding = ref(false)
const previewValue = ref<AnswerValue | undefined>(undefined)

const questions = computed(() => (survey.value ? ordered(survey.value.questions) : []))
const selected = computed(() => questions.value.find((q) => q.id === selectedId.value) ?? null)
const selectedIndex = computed(() => questions.value.findIndex((q) => q.id === selectedId.value))
const conditional = computed(() => (survey.value ? conditionalIds(survey.value.logic) : new Set<string>()))

const crumbs = computed(() => [
  { label: t('appNav.forms'), href: '/app/formularios', icon: 'clipboard-list' },
  { label: survey.value?.title ?? '' },
])

const tabItems = computed(() => [
  { label: t('builder.tabs.questions'), icon: 'list' },
  { label: t('builder.tabs.logic'), icon: 'git-branch' },
  { label: t('builder.tabs.appearance'), icon: 'palette' },
  { label: t('builder.tabs.share'), icon: 'share' },
])

watch(
  [() => survey.value?.id, () => questions.value.length],
  () => {
    if (!survey.value) return
    if (!selectedId.value || !survey.value.questions.some((q) => q.id === selectedId.value)) {
      selectedId.value = questions.value[0]?.id ?? null
    }
  },
  { immediate: true }
)

watch(selectedId, () => {
  previewValue.value = undefined
})

function addOfType(type: QuestionType) {
  if (!survey.value) return
  const created = store.addQuestion(survey.value.id, type)
  adding.value = false
  if (created) {
    selectedId.value = created.id
    ui.notifySuccess(t('builder.questionAdded'))
  }
}

function onMove(from: number, to: number) {
  if (!survey.value) return
  store.moveQuestion(survey.value.id, from, to)
}

function onRemoveQuestion(qid: string) {
  if (!survey.value) return
  store.removeQuestion(survey.value.id, qid)
  ui.notifySuccess(t('builder.questionRemoved'))
}

function onDuplicateQuestion(qid: string) {
  if (!survey.value) return
  store.duplicateQuestion(survey.value.id, qid)
  ui.notifySuccess(t('builder.questionDuplicated'))
}

function onRemoveRule(ruleId: string) {
  if (!survey.value) return
  store.removeRule(survey.value.id, ruleId)
  ui.notifySuccess(t('logic.ruleRemoved'))
}

function onPublish() {
  if (!survey.value) return
  store.publishSurvey(survey.value.id)
  ui.notifySuccess(t('forms.published'))
}

function onClose() {
  if (!survey.value) return
  store.closeSurvey(survey.value.id)
  ui.notifySuccess(t('forms.closed'))
}
</script>
