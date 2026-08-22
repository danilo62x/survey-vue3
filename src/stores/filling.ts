import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AnswerValue, Survey } from '@/data/types'
import {
  type AnswerMap,
  firstQuestionIndex,
  mapToAnswers,
  nextQuestionIndex,
  previousQuestionIndex,
  reachableQuestions,
  ordered,
} from '@/data/query'

export const useFillingStore = defineStore(
  'sv-filling',
  () => {
    /** Formulário que está sendo preenchido — troca de slug zera o rascunho. */
    const slug = ref<string | null>(null)
    /** Índice da pergunta atual dentro de `survey.questions` ordenado. */
    const index = ref(0)
    const answers = ref<AnswerMap>({})
    const startedAt = ref<string | null>(null)
    /** Marcado ao enviar; a tela de agradecimento lê daqui. */
    const submitted = ref(false)
    const submittedAnswers = ref<AnswerMap>({})

    function start(survey: Survey) {
      if (slug.value === survey.slug && !submitted.value) {
        // Retoma o rascunho persistido do mesmo formulário.
        if (startedAt.value === null) startedAt.value = new Date().toISOString()
        return
      }
      slug.value = survey.slug
      index.value = firstQuestionIndex(survey, {})
      answers.value = {}
      startedAt.value = new Date().toISOString()
      submitted.value = false
      submittedAnswers.value = {}
    }

    function setAnswer(questionId: string, value: AnswerValue) {
      answers.value = { ...answers.value, [questionId]: value }
    }

    function goNext(survey: Survey) {
      const next = nextQuestionIndex(survey, index.value, answers.value)
      index.value = Math.min(next, ordered(survey.questions).length)
    }

    function goBack(survey: Survey) {
      index.value = previousQuestionIndex(survey, index.value, answers.value)
    }

    function submit(survey: Survey) {
      const started = startedAt.value ? new Date(startedAt.value).getTime() : Date.now()
      const durationSec = Math.max(20, Math.round((Date.now() - started) / 1000))
      const result = mapToAnswers(answers.value)
      submitted.value = true
      submittedAnswers.value = { ...answers.value }
      index.value = ordered(survey.questions).length
      return { answers: result, durationSec }
    }

    function restart() {
      slug.value = null
      index.value = 0
      answers.value = {}
      startedAt.value = null
      submitted.value = false
      submittedAnswers.value = {}
    }

    function isLast(survey: Survey) {
      const next = nextQuestionIndex(survey, index.value, answers.value)
      return next >= ordered(survey.questions).length
    }

    /** Só as perguntas alcançáveis contam na barra de progresso. */
    function progress(survey: Survey) {
      const path = reachableQuestions(survey, answers.value)
      const qs = ordered(survey.questions)
      const currentId = qs[index.value]?.id
      const at = path.findIndex((q) => q.id === currentId)
      const total = Math.max(1, path.length)
      const current = at === -1 ? total : at + 1
      return { current, total, percent: Math.round(((current - 1) / total) * 100) }
    }

    return {
      slug,
      index,
      answers,
      startedAt,
      submitted,
      submittedAnswers,
      start,
      setAnswer,
      goNext,
      goBack,
      submit,
      restart,
      isLast,
      progress,
    }
  },
  {
    persist: {
      key: 'sv-filling',
      pick: ['slug', 'index', 'answers', 'startedAt', 'submitted', 'submittedAnswers'],
    },
  }
)
