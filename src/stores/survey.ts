import { defineStore } from 'pinia'
import { ref } from 'vue'
import { CONTACTS, RESPONSES, SURVEYS, TEMPLATES, blankQuestion } from '@/data/mock'
import { ordered, slugify } from '@/data/query'
import type {
  Answer,
  Contact,
  LogicRule,
  Question,
  QuestionType,
  Response,
  ResponseSource,
  Survey,
  TemplateModel,
} from '@/data/types'

const nextId = (rows: { id: number }[]) => (rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1)

const uid = (prefix: string) => `${prefix}${Math.random().toString(36).slice(2, 8)}`

/** Reescreve os ids das perguntas/opções ao copiar um formulário ou modelo. */
function cloneQuestions(questions: Question[], logic: LogicRule[]) {
  const idMap = new Map<string, string>()
  const cloned = ordered(questions).map((q, index) => {
    const id = uid('q')
    idMap.set(q.id, id)
    return {
      ...q,
      id,
      order: index,
      choices: q.choices.map((c, i) => ({ id: `${id}-o${i + 1}`, label: c.label })),
      rows: [...q.rows],
      columns: [...q.columns],
    }
  })
  const rules = logic
    .filter((r) => idMap.has(r.questionId) && idMap.has(r.targetId))
    .map((r) => ({
      ...r,
      id: uid('r'),
      questionId: idMap.get(r.questionId)!,
      targetId: idMap.get(r.targetId)!,
    }))
  return { questions: cloned, logic: rules }
}

function uniqueSlug(surveys: Survey[], base: string): string {
  let slug = base || 'formulario'
  let n = 2
  while (surveys.some((s) => s.slug === slug)) slug = `${base}-${n++}`
  return slug
}

export interface NewResponseInput {
  surveyId: number
  answers: Answer[]
  durationSec: number
  completed: boolean
  source: ResponseSource
}

const seedSurveys = (): Survey[] =>
  SURVEYS.map((s) => ({
    ...s,
    questions: s.questions.map((q) => ({ ...q, choices: q.choices.map((c) => ({ ...c })) })),
    logic: s.logic.map((r) => ({ ...r })),
  }))
const seedResponses = (): Response[] =>
  RESPONSES.map((r) => ({ ...r, answers: r.answers.map((a) => ({ ...a })) }))
const seedContacts = (): Contact[] => CONTACTS.map((c) => ({ ...c, tags: [...c.tags] }))
const seedTemplates = (): TemplateModel[] => TEMPLATES.map((t) => ({ ...t }))

export const useSurveyStore = defineStore(
  'sv-data',
  () => {
    const surveys = ref<Survey[]>(seedSurveys())
    const responses = ref<Response[]>(seedResponses())
    const contacts = ref<Contact[]>(seedContacts())
    const templates = ref<TemplateModel[]>(seedTemplates())

    // ---- Formulários -------------------------------------------------
    function addSurvey(title: string, description = ''): Survey {
      const now = new Date().toISOString()
      const survey: Survey = {
        id: nextId(surveys.value),
        slug: uniqueSlug(surveys.value, slugify(title)),
        title,
        description,
        status: 'rascunho',
        coverSeed: slugify(title) || 'novo',
        color: '#465fff',
        questions: [blankQuestion('texto-curto', uid('q'), 0)],
        logic: [],
        thankYou: 'Obrigado por responder!',
        createdAt: now,
        publishedAt: '',
        closesAt: null,
        views: 0,
      }
      surveys.value = [...surveys.value, survey]
      return survey
    }

    function createFromTemplate(templateId: number, title?: string): Survey | undefined {
      const template = templates.value.find((t) => t.id === templateId)
      if (!template) return undefined
      const now = new Date().toISOString()
      const name = title?.trim() || template.name
      const { questions, logic } = cloneQuestions(template.questions, [])
      const survey: Survey = {
        id: nextId(surveys.value),
        slug: uniqueSlug(surveys.value, slugify(name)),
        title: name,
        description: template.objective,
        status: 'rascunho',
        coverSeed: template.slug,
        color: template.color,
        questions,
        logic,
        thankYou: 'Obrigado por responder!',
        createdAt: now,
        publishedAt: '',
        closesAt: null,
        views: 0,
      }
      surveys.value = [...surveys.value, survey]
      return survey
    }

    function updateSurvey(id: number, patch: Partial<Survey>) {
      surveys.value = surveys.value.map((s) => (s.id === id ? { ...s, ...patch } : s))
    }

    function removeSurvey(id: number) {
      surveys.value = surveys.value.filter((s) => s.id !== id)
      responses.value = responses.value.filter((r) => r.surveyId !== id)
    }

    function duplicateSurvey(id: number): Survey | undefined {
      const source = surveys.value.find((s) => s.id === id)
      if (!source) return undefined
      const { questions, logic } = cloneQuestions(source.questions, source.logic)
      const copy: Survey = {
        ...source,
        id: nextId(surveys.value),
        slug: uniqueSlug(surveys.value, `${source.slug}-copia`),
        title: `${source.title} (cópia)`,
        status: 'rascunho',
        questions,
        logic,
        createdAt: new Date().toISOString(),
        publishedAt: '',
        closesAt: null,
        views: 0,
      }
      surveys.value = [...surveys.value, copy]
      return copy
    }

    function publishSurvey(id: number) {
      surveys.value = surveys.value.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'publicado' as const,
              publishedAt: s.publishedAt || new Date().toISOString(),
              closesAt: null,
            }
          : s
      )
    }

    function closeSurvey(id: number) {
      surveys.value = surveys.value.map((s) =>
        s.id === id ? { ...s, status: 'encerrado' as const, closesAt: new Date().toISOString() } : s
      )
    }

    function reopenSurvey(id: number) {
      surveys.value = surveys.value.map((s) =>
        s.id === id ? { ...s, status: 'publicado' as const, closesAt: null } : s
      )
    }

    function registerView(id: number) {
      surveys.value = surveys.value.map((s) => (s.id === id ? { ...s, views: s.views + 1 } : s))
    }

    // ---- Perguntas ---------------------------------------------------
    function addQuestion(surveyId: number, type: QuestionType): Question | undefined {
      const survey = surveys.value.find((s) => s.id === surveyId)
      if (!survey) return undefined
      const question = blankQuestion(type, uid('q'), survey.questions.length)
      surveys.value = surveys.value.map((s) =>
        s.id === surveyId ? { ...s, questions: [...s.questions, question] } : s
      )
      return question
    }

    function updateQuestion(surveyId: number, questionId: string, patch: Partial<Question>) {
      surveys.value = surveys.value.map((s) =>
        s.id === surveyId
          ? { ...s, questions: s.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q)) }
          : s
      )
    }

    function removeQuestion(surveyId: number, questionId: string) {
      surveys.value = surveys.value.map((s) => {
        if (s.id !== surveyId) return s
        const questions = ordered(s.questions)
          .filter((q) => q.id !== questionId)
          .map((q, i) => ({ ...q, order: i }))
        return {
          ...s,
          questions,
          // Regras que citam a pergunta removida deixam de existir.
          logic: s.logic.filter((r) => r.questionId !== questionId && r.targetId !== questionId),
        }
      })
    }

    function moveQuestion(surveyId: number, from: number, to: number) {
      surveys.value = surveys.value.map((s) => {
        if (s.id !== surveyId) return s
        const list = ordered(s.questions)
        if (from < 0 || from >= list.length) return s
        const target = Math.max(0, Math.min(to, list.length - 1))
        const [moved] = list.splice(from, 1)
        list.splice(target, 0, moved)
        return { ...s, questions: list.map((q, i) => ({ ...q, order: i })) }
      })
    }

    function duplicateQuestion(surveyId: number, questionId: string) {
      surveys.value = surveys.value.map((s) => {
        if (s.id !== surveyId) return s
        const list = ordered(s.questions)
        const index = list.findIndex((q) => q.id === questionId)
        if (index === -1) return s
        const id = uid('q')
        const copy: Question = {
          ...list[index],
          id,
          title: `${list[index].title} (cópia)`,
          choices: list[index].choices.map((c, i) => ({ id: `${id}-o${i + 1}`, label: c.label })),
          rows: [...list[index].rows],
          columns: [...list[index].columns],
        }
        list.splice(index + 1, 0, copy)
        return { ...s, questions: list.map((q, i) => ({ ...q, order: i })) }
      })
    }

    // ---- Lógica ------------------------------------------------------
    function addRule(surveyId: number) {
      const survey = surveys.value.find((s) => s.id === surveyId)
      if (!survey || survey.questions.length < 2) return
      const list = ordered(survey.questions)
      const rule: LogicRule = {
        id: uid('r'),
        questionId: list[0].id,
        operator: 'igual',
        value: list[0].choices[0]?.label ?? '',
        action: 'pular-para',
        targetId: list[list.length - 1].id,
      }
      surveys.value = surveys.value.map((s) => (s.id === surveyId ? { ...s, logic: [...s.logic, rule] } : s))
    }

    function updateRule(surveyId: number, ruleId: string, patch: Partial<LogicRule>) {
      surveys.value = surveys.value.map((s) =>
        s.id === surveyId ? { ...s, logic: s.logic.map((r) => (r.id === ruleId ? { ...r, ...patch } : r)) } : s
      )
    }

    function removeRule(surveyId: number, ruleId: string) {
      surveys.value = surveys.value.map((s) =>
        s.id === surveyId ? { ...s, logic: s.logic.filter((r) => r.id !== ruleId) } : s
      )
    }

    // ---- Respostas e contatos ---------------------------------------
    function registerResponse(input: NewResponseInput): Response {
      const survey = surveys.value.find((s) => s.id === input.surveyId)
      const now = new Date().toISOString()

      // Se a pessoa deixou um e-mail, ela vira (ou reencontra) um contato.
      let list = contacts.value
      let contactId: number | null = null
      const emailQuestion = survey?.questions.find((q) => q.type === 'email')
      const emailAnswer = emailQuestion
        ? input.answers.find((a) => a.questionId === emailQuestion.id)
        : undefined
      const email = typeof emailAnswer?.value === 'string' ? emailAnswer.value.trim().toLowerCase() : ''

      if (email) {
        const found = list.find((c) => c.email.toLowerCase() === email)
        if (found) {
          contactId = found.id
          list = list.map((c) =>
            c.id === found.id ? { ...c, responseCount: c.responseCount + 1, lastAt: now } : c
          )
        } else {
          const created: Contact = {
            id: nextId(list),
            name: email.split('@')[0].replace(/[._-]/g, ' '),
            email,
            avatar: '',
            tags: ['novo'],
            responseCount: 1,
            lastAt: now,
          }
          contactId = created.id
          list = [...list, created]
        }
      }

      const response: Response = {
        id: nextId(responses.value),
        surveyId: input.surveyId,
        at: now,
        durationSec: input.durationSec,
        completed: input.completed,
        source: input.source,
        contactId,
        answers: input.answers.map((a) => ({ ...a })),
      }

      responses.value = [...responses.value, response]
      contacts.value = list
      return response
    }

    function removeResponse(id: number) {
      responses.value = responses.value.filter((r) => r.id !== id)
    }

    function updateContact(id: number, patch: Partial<Contact>) {
      contacts.value = contacts.value.map((c) => (c.id === id ? { ...c, ...patch } : c))
    }

    function removeContact(id: number) {
      contacts.value = contacts.value.filter((c) => c.id !== id)
      responses.value = responses.value.map((r) => (r.contactId === id ? { ...r, contactId: null } : r))
    }

    function reset() {
      surveys.value = seedSurveys()
      responses.value = seedResponses()
      contacts.value = seedContacts()
      templates.value = seedTemplates()
    }

    return {
      surveys,
      responses,
      contacts,
      templates,
      addSurvey,
      createFromTemplate,
      updateSurvey,
      removeSurvey,
      duplicateSurvey,
      publishSurvey,
      closeSurvey,
      reopenSurvey,
      registerView,
      addQuestion,
      updateQuestion,
      removeQuestion,
      moveQuestion,
      duplicateQuestion,
      addRule,
      updateRule,
      removeRule,
      registerResponse,
      removeResponse,
      updateContact,
      removeContact,
      reset,
    }
  },
  {
    persist: {
      key: 'sv-data',
      pick: ['surveys', 'responses', 'contacts', 'templates'],
    },
  }
)
