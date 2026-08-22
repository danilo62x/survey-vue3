import type { QuestionType } from '@/data/types'

/** Ordem em que os tipos aparecem no construtor e na página inicial. */
export const QUESTION_TYPES: QuestionType[] = [
  'texto-curto',
  'texto-longo',
  'escolha-unica',
  'multipla-escolha',
  'escala',
  'nps',
  'data',
  'email',
  'numero',
  'matriz',
]

export const QUESTION_ICON: Record<QuestionType, string> = {
  'texto-curto': 'type',
  'texto-longo': 'align-left',
  'escolha-unica': 'circle-dot',
  'multipla-escolha': 'check-square',
  escala: 'sliders',
  nps: 'gauge',
  data: 'calendar',
  email: 'mail',
  numero: 'hash',
  matriz: 'table',
}

/** Cor de destaque de cada tipo — usada nos cartões da home e do construtor. */
export const QUESTION_COLOR: Record<QuestionType, string> = {
  'texto-curto': '#465fff',
  'texto-longo': '#7592ff',
  'escolha-unica': '#12b76a',
  'multipla-escolha': '#039855',
  escala: '#f79009',
  nps: '#f04438',
  data: '#0ba5ec',
  email: '#026aa2',
  numero: '#dc6803',
  matriz: '#2a31d8',
}

export const hasChoices = (type: QuestionType): boolean =>
  type === 'escolha-unica' || type === 'multipla-escolha'

export const hasRange = (type: QuestionType): boolean => type === 'escala' || type === 'numero'

export const isMatrix = (type: QuestionType): boolean => type === 'matriz'
