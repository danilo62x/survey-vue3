<template>
  <Drawer
    :open="open"
    :title="t('results.responseTitle', { id: response?.id ?? 0 })"
    :subtitle="response ? formatDateTime(response.at, locale) : undefined"
    width="max-w-xl"
    @close="emit('close')"
  >
    <!-- Resposta completa, pergunta a pergunta, com o que foi pulado marcado. -->
    <div v-if="response && survey" class="flex flex-col gap-5">
      <div class="flex flex-wrap items-center gap-2">
        <SourceBadge :source="response.source" />
        <Badge :color="response.completed ? 'success' : 'warning'" dot>
          {{ t(response.completed ? 'results.completed' : 'results.partial') }}
        </Badge>
        <Badge color="gray" icon="clock">{{ formatSeconds(response.durationSec) }}</Badge>
      </div>

      <div v-if="contact" class="flex items-center gap-3 rounded-xl border border-themed p-3">
        <Avatar :src="contact.avatar" :name="contact.name" size="sm" />
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-heading">{{ contact.name }}</p>
          <p class="truncate text-xs text-muted">{{ contact.email }}</p>
        </div>
      </div>

      <ol class="flex flex-col gap-4">
        <li
          v-for="(question, index) in ordered(survey.questions)"
          :key="question.id"
          class="min-w-0 border-b border-themed pb-4 last:border-0 last:pb-0"
        >
          <p class="text-xs text-muted">
            {{ t('results.questionNumber', { index: index + 1 }) }} · {{ t(`questionTypes.${question.type}`) }}
          </p>
          <p class="mt-0.5 text-sm font-medium break-words text-heading">{{ question.title }}</p>

          <template v-if="map[question.id] !== undefined">
            <ul v-if="isMatrixValue(question, map[question.id])" class="mt-2 flex flex-col gap-1">
              <li
                v-for="[row, column] in Object.entries(map[question.id] as Record<string, string>)"
                :key="row"
                class="flex flex-wrap items-center gap-2 text-sm"
              >
                <span class="text-muted">{{ row }}:</span>
                <span class="font-medium text-body">{{ column }}</span>
              </li>
            </ul>
            <p v-else class="mt-2 text-sm break-words text-body">{{ answerToText(map[question.id]) }}</p>
          </template>
          <p v-else class="mt-2 flex items-center gap-1.5 text-sm text-muted">
            <IconBase :name="isHidden(question.id) ? 'git-branch' : 'minus'" :size="14" />
            {{ t(isHidden(question.id) ? 'results.hiddenByLogic' : 'results.skipped') }}
          </p>
        </li>
      </ol>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AnswerValue, Contact, Question, Response, Survey } from '@/data/types'
import Drawer from '@/components/ui/Drawer.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Badge from '@/components/ui/Badge.vue'
import IconBase from '@/components/ui/IconBase.vue'
import {
  answerToText,
  answersToMap,
  contactById,
  formatSeconds,
  isHiddenQuestion,
  ordered,
} from '@/data/query'
import { formatDateTime } from '@/lib/format'
import SourceBadge from './SourceBadge.vue'

const props = defineProps<{
  open: boolean
  survey: Survey | undefined
  response: Response | null
  contacts: Contact[]
}>()

const emit = defineEmits<{ close: [] }>()

const { t, locale } = useI18n()

const contact = computed(() =>
  props.response ? contactById(props.contacts, props.response.contactId) : undefined
)
const map = computed(() => (props.response ? answersToMap(props.response.answers) : {}))

const isHidden = (questionId: string) =>
  props.survey ? isHiddenQuestion(props.survey, questionId, map.value) : false

const isMatrixValue = (question: Question, value: AnswerValue | undefined) =>
  question.type === 'matriz' && typeof value === 'object' && !Array.isArray(value)
</script>
