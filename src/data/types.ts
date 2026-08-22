// ===== Sondagem — Pesquisas & Formulários — domínio =====

/** Os dez tipos de pergunta que o construtor sabe montar e o público responder. */
export type QuestionType =
  | 'texto-curto'
  | 'texto-longo'
  | 'escolha-unica'
  | 'multipla-escolha'
  | 'escala'
  | 'nps'
  | 'data'
  | 'email'
  | 'numero'
  | 'matriz'

export type FormStatus = 'rascunho' | 'publicado' | 'encerrado'

export type ResponseSource = 'link' | 'email' | 'qr' | 'incorporado'

export interface Choice {
  id: string
  label: string
}

export interface Question {
  id: string
  type: QuestionType
  title: string
  /** Texto de apoio mostrado abaixo do enunciado. */
  help: string
  required: boolean
  /** Opções de 'escolha-unica' e 'multipla-escolha'. */
  choices: Choice[]
  /** Limites de 'escala' e 'numero'; null quando o tipo não usa. */
  min: number | null
  max: number | null
  /** Só para 'matriz'. */
  rows: string[]
  columns: string[]
  order: number
}

export type LogicOperator = 'igual' | 'diferente' | 'maior' | 'menor' | 'contem'
export type LogicAction = 'pular-para' | 'mostrar' | 'esconder'

export interface LogicRule {
  id: string
  /** Pergunta observada. */
  questionId: string
  operator: LogicOperator
  value: string
  action: LogicAction
  /** Pergunta afetada pela ação. */
  targetId: string
}

export interface Survey {
  id: number
  slug: string
  title: string
  description: string
  status: FormStatus
  /** Semente da capa (helper de imagem por seed). */
  coverSeed: string
  /** Cor de destaque em hexadecimal. */
  color: string
  questions: Question[]
  logic: LogicRule[]
  thankYou: string
  createdAt: string
  publishedAt: string
  closesAt: string | null
  views: number
}

/** Valor da resposta conforme o tipo: texto, lista, número ou linha→coluna. */
export type AnswerValue = string | string[] | number | Record<string, string>

export interface Answer {
  questionId: string
  value: AnswerValue
}

export interface Response {
  id: number
  surveyId: number
  at: string
  durationSec: number
  completed: boolean
  source: ResponseSource
  contactId: number | null
  answers: Answer[]
}

export interface Contact {
  id: number
  name: string
  email: string
  avatar: string
  tags: string[]
  responseCount: number
  lastAt: string
}

export interface TemplateModel {
  id: number
  slug: string
  name: string
  objective: string
  /** Nome de um ícone do IconBase. */
  icon: string
  color: string
  questions: Question[]
}

// ---- Derivados usados nas telas ----------------------------------------

/** Uma fatia da agregação de uma pergunta de escolha/escala/matriz. */
export interface Slice {
  label: string
  value: number
  /** Percentual sobre o total de respondentes da pergunta. */
  percent: number
}

export interface NpsBreakdown {
  promoters: number
  passives: number
  detractors: number
  total: number
  /** %promotores − %detratores, arredondado. */
  score: number
  average: number
}

export interface ScaleSummary {
  average: number
  min: number
  max: number
  distribution: Slice[]
  total: number
}

export interface TermCount {
  term: string
  count: number
}

export interface MatrixCell {
  row: string
  column: string
  count: number
  percent: number
}

export interface MatrixSummary {
  rows: string[]
  columns: string[]
  cells: MatrixCell[]
  max: number
  total: number
}

export type QuestionSummaryKind = 'escolha' | 'multipla' | 'escala' | 'nps' | 'texto' | 'matriz' | 'data' | 'numero'

/** Resumo pronto para desenhar o gráfico certo de cada pergunta. */
export interface QuestionSummary {
  question: Question
  kind: QuestionSummaryKind
  /** Quantas respostas trouxeram valor para esta pergunta. */
  answered: number
  /** Quantas pularam (alcançáveis, mas sem valor). */
  skipped: number
  slices: Slice[]
  nps: NpsBreakdown | null
  scale: ScaleSummary | null
  terms: TermCount[]
  matrix: MatrixSummary | null
  /** Exemplos de texto livre / datas, para as perguntas sem gráfico próprio. */
  samples: string[]
}

export interface SeriesPoint {
  label: string
  value: number
}

/** Linha da tabela de formulários com os números já calculados. */
export interface SurveyStats {
  survey: Survey
  responses: number
  completed: number
  completionRate: number
  averageSeconds: number
  nps: number | null
  lastAt: string | null
}
