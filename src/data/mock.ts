import type {
  Answer,
  AnswerValue,
  Choice,
  Contact,
  LogicRule,
  Question,
  QuestionType,
  Response,
  ResponseSource,
  Survey,
  TemplateModel,
} from './types'
import { firstQuestionIndex, isHiddenQuestion, nextQuestionIndex, ordered } from './query'

// =========================================================================
// Imagens — conjuntos Unsplash curados (IDs já verificados no monorepo)
// =========================================================================

const IMG: Record<string, string[]> = {
  work: [
    '1497366216548-37526070297c',
    '1497366811353-6870744d04b2',
    '1542744173-8e7e53415bb0',
    '1568992687947-868a62a9f521',
    '1521737711867-e3b97375f902',
    '1504384308090-c894fdcc538d',
    '1560264280-88b68371db39',
    '1486312338219-ce68d2c6f44d',
    '1521791136064-7986c2920216',
    '1560472354-b33ff0c44a43',
    '1516321318423-f06f85e504b3',
    '1600880292203-757bb62b4baf',
  ],
  people: [
    '1500648767791-00dcc994a43e',
    '1494790108377-be9c29b29330',
    '1507003211169-0a1dd7228f2d',
    '1438761681033-6461ffad8d80',
    '1633332755192-727a05c4013d',
    '1573496359142-b8d87734a5a2',
  ],
}

function imgHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function imgCategory(seed: string): string {
  const s = seed.toLowerCase()
  if (/author|avatar|member|people|person|profile|staff|team|user|contato/.test(s)) return 'people'
  return 'work'
}

function unsplash(id: string, w: number, h: number): string {
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=70&auto=format`
}

/** URL determinística por seed — capas de formulário/modelo e avatares. */
export function svImage(seed: string, w = 960, h = 640): string {
  const ids = IMG[imgCategory(seed)]
  return unsplash(ids[imgHash('sv-' + seed) % ids.length], w, h)
}

const av = (seed: string) => unsplash(IMG.people[imgHash('sv-av-' + seed) % IMG.people.length], 120, 120)

// =========================================================================
// Datas e sorteio determinístico
// =========================================================================

function daysAgo(days: number, hour = 10): string {
  const d = new Date()
  d.setHours(hour, 0, 0, 0)
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function daysAhead(days: number, hour = 18): string {
  return daysAgo(-days, hour)
}

function dateOnly(days: number): string {
  return daysAgo(days).slice(0, 10)
}

/** PRNG determinístico — os dados de demonstração são sempre os mesmos. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = <T,>(list: T[], r: () => number): T => list[Math.floor(r() * list.length) % list.length]

/** Sorteio com pesos — mantém os gráficos com forma, não achatados. */
function weightedIndex(weights: number[], r: () => number): number {
  const total = weights.reduce((a, b) => a + b, 0)
  let n = r() * total
  for (let i = 0; i < weights.length; i++) {
    n -= weights[i]
    if (n <= 0) return i
  }
  return weights.length - 1
}

// =========================================================================
// Construtor de perguntas
// =========================================================================

interface QInit {
  id: string
  type: QuestionType
  title: string
  help?: string
  required?: boolean
  choices?: string[]
  min?: number
  max?: number
  rows?: string[]
  columns?: string[]
}

function mkChoices(questionId: string, labels: string[]): Choice[] {
  return labels.map((label, i) => ({ id: `${questionId}-o${i + 1}`, label }))
}

function buildQuestions(list: QInit[]): Question[] {
  return list.map((q, index) => ({
    id: q.id,
    type: q.type,
    title: q.title,
    help: q.help ?? '',
    required: q.required ?? false,
    choices: q.choices ? mkChoices(q.id, q.choices) : [],
    min: q.min ?? null,
    max: q.max ?? null,
    rows: q.rows ?? [],
    columns: q.columns ?? [],
    order: index,
  }))
}

/** Pergunta em branco usada pelo construtor ao adicionar um item novo. */
export function blankQuestion(type: QuestionType, id: string, order: number): Question {
  const base: Question = {
    id,
    type,
    title: '',
    help: '',
    required: false,
    choices: [],
    min: null,
    max: null,
    rows: [],
    columns: [],
    order,
  }
  if (type === 'escolha-unica' || type === 'multipla-escolha') {
    base.choices = mkChoices(id, ['Opção 1', 'Opção 2', 'Opção 3'])
  }
  if (type === 'escala') {
    base.min = 1
    base.max = 5
  }
  if (type === 'numero') {
    base.min = 0
    base.max = 100
  }
  if (type === 'matriz') {
    base.rows = ['Primeira linha', 'Segunda linha']
    base.columns = ['Discordo', 'Neutro', 'Concordo']
  }
  return base
}

// =========================================================================
// Formulários
// =========================================================================

const S1_QUESTIONS = buildQuestions([
  {
    id: 's1q1',
    type: 'nps',
    title: 'De 0 a 10, o quanto você recomendaria nosso atendimento a um colega?',
    help: '0 é "de jeito nenhum" e 10 é "com certeza".',
    required: true,
  },
  {
    id: 's1q2',
    type: 'escala',
    title: 'Como você avalia a rapidez da resposta?',
    help: '1 é muito lento, 5 é muito rápido.',
    required: true,
    min: 1,
    max: 5,
  },
  {
    id: 's1q3',
    type: 'escolha-unica',
    title: 'Por qual canal você falou com a gente?',
    required: true,
    choices: ['Chat no site', 'E-mail', 'Telefone', 'WhatsApp'],
  },
  {
    id: 's1q4',
    type: 'multipla-escolha',
    title: 'O que mais pesou na sua avaliação?',
    help: 'Pode marcar mais de uma.',
    choices: ['Rapidez', 'Clareza da resposta', 'Educação da equipe', 'Problema resolvido', 'Acompanhamento depois'],
  },
  {
    id: 's1q5',
    type: 'escolha-unica',
    title: 'Seu problema foi resolvido?',
    required: true,
    choices: ['Sim, na primeira conversa', 'Sim, depois de algumas trocas', 'Não foi resolvido'],
  },
  {
    id: 's1q6',
    type: 'texto-longo',
    title: 'O que poderíamos ter feito melhor?',
    help: 'Esta pergunta aparece só para quem não teve o problema resolvido.',
  },
  {
    id: 's1q7',
    type: 'matriz',
    title: 'Como você avalia cada ponto?',
    required: true,
    rows: ['Atendimento', 'Produto', 'Preço', 'Prazo de entrega'],
    columns: ['Ruim', 'Regular', 'Bom', 'Ótimo'],
  },
  {
    id: 's1q8',
    type: 'email',
    title: 'Quer retorno? Deixe o seu e-mail',
    help: 'Só usamos para responder este contato.',
  },
  {
    id: 's1q9',
    type: 'texto-curto',
    title: 'Resuma a sua experiência em uma frase',
  },
])

const S1_LOGIC: LogicRule[] = [
  { id: 's1r1', questionId: 's1q1', operator: 'maior', value: '8', action: 'pular-para', targetId: 's1q7' },
  { id: 's1r2', questionId: 's1q5', operator: 'igual', value: 'Não foi resolvido', action: 'mostrar', targetId: 's1q6' },
  { id: 's1r3', questionId: 's1q3', operator: 'igual', value: 'Telefone', action: 'esconder', targetId: 's1q8' },
]

const S2_QUESTIONS = buildQuestions([
  { id: 's2q1', type: 'numero', title: 'Qual é a sua idade?', required: true, min: 16, max: 90 },
  {
    id: 's2q2',
    type: 'escolha-unica',
    title: 'Com que frequência você compra pela internet?',
    required: true,
    choices: ['Toda semana', 'Algumas vezes por mês', 'Uma vez por mês', 'Raramente'],
  },
  {
    id: 's2q3',
    type: 'multipla-escolha',
    title: 'Quais categorias você comprou nos últimos seis meses?',
    help: 'Pode marcar quantas quiser.',
    choices: ['Eletrônicos', 'Moda', 'Casa e decoração', 'Alimentos', 'Livros', 'Beleza', 'Esportes'],
  },
  {
    id: 's2q4',
    type: 'escala',
    title: 'Qual a importância do frete grátis na sua decisão?',
    help: '1 é irrelevante, 10 é decisivo.',
    required: true,
    min: 1,
    max: 10,
  },
  { id: 's2q5', type: 'data', title: 'Quando foi a sua última compra online?' },
  {
    id: 's2q6',
    type: 'texto-curto',
    title: 'Em qual loja você comprou o último eletrônico?',
    help: 'Aparece só para quem marcou eletrônicos.',
  },
  {
    id: 's2q7',
    type: 'matriz',
    title: 'O quanto cada fator pesa na escolha da loja?',
    required: true,
    rows: ['Preço', 'Prazo de entrega', 'Atendimento', 'Variedade'],
    columns: ['Nada importante', 'Pouco importante', 'Importante', 'Decisivo'],
  },
  {
    id: 's2q8',
    type: 'texto-longo',
    title: 'O que faz você abandonar um carrinho?',
    required: true,
  },
  {
    id: 's2q9',
    type: 'nps',
    title: 'O quanto você recomendaria comprar online para quem nunca comprou?',
    required: true,
  },
])

const S2_LOGIC: LogicRule[] = [
  { id: 's2r1', questionId: 's2q2', operator: 'igual', value: 'Raramente', action: 'pular-para', targetId: 's2q8' },
  { id: 's2r2', questionId: 's2q3', operator: 'contem', value: 'Eletrônicos', action: 'mostrar', targetId: 's2q6' },
  { id: 's2r3', questionId: 's2q1', operator: 'menor', value: '18', action: 'esconder', targetId: 's2q5' },
]

const S3_QUESTIONS = buildQuestions([
  { id: 's3q1', type: 'texto-curto', title: 'Nome completo', required: true },
  {
    id: 's3q2',
    type: 'email',
    title: 'E-mail para receber o ingresso',
    help: 'Confira com calma: o ingresso vai só para este endereço.',
    required: true,
  },
  {
    id: 's3q3',
    type: 'escolha-unica',
    title: 'Como você pretende participar?',
    required: true,
    choices: ['Presencial em São Paulo', 'Online ao vivo', 'Só quero a gravação'],
  },
  {
    id: 's3q4',
    type: 'data',
    title: 'Em qual dia você chega?',
    help: 'Aparece só para quem escolheu participar presencialmente.',
    required: true,
  },
  {
    id: 's3q5',
    type: 'multipla-escolha',
    title: 'Quais oficinas te interessam?',
    choices: [
      'Descoberta de produto',
      'Pesquisa com usuários',
      'Métricas e experimentos',
      'Design de serviço',
      'Gestão de backlog',
    ],
  },
  { id: 's3q6', type: 'numero', title: 'Quantos acompanhantes?', min: 0, max: 4 },
  { id: 's3q7', type: 'texto-longo', title: 'Alguma restrição alimentar ou de acessibilidade?' },
  {
    id: 's3q8',
    type: 'escala',
    title: 'Qual a sua expectativa para o encontro?',
    required: true,
    min: 1,
    max: 5,
  },
  { id: 's3q9', type: 'texto-curto', title: 'Empresa onde você trabalha' },
])

const S3_LOGIC: LogicRule[] = [
  {
    id: 's3r1',
    questionId: 's3q3',
    operator: 'igual',
    value: 'Presencial em São Paulo',
    action: 'mostrar',
    targetId: 's3q4',
  },
  {
    id: 's3r2',
    questionId: 's3q3',
    operator: 'igual',
    value: 'Só quero a gravação',
    action: 'pular-para',
    targetId: 's3q8',
  },
  {
    id: 's3r3',
    questionId: 's3q3',
    operator: 'diferente',
    value: 'Presencial em São Paulo',
    action: 'esconder',
    targetId: 's3q6',
  },
]

const S4_QUESTIONS = buildQuestions([
  {
    id: 's4q1',
    type: 'escolha-unica',
    title: 'Em qual área você trabalha?',
    required: true,
    choices: ['Produto', 'Engenharia', 'Vendas', 'Suporte', 'Pessoas e Cultura', 'Financeiro'],
  },
  {
    id: 's4q2',
    type: 'nps',
    title: 'De 0 a 10, o quanto você recomendaria a empresa como lugar para trabalhar?',
    required: true,
  },
  {
    id: 's4q3',
    type: 'matriz',
    title: 'O quanto você concorda com cada frase?',
    required: true,
    rows: ['A carga de trabalho é justa', 'Tenho autonomia', 'Sou reconhecido', 'A liderança comunica bem', 'As ferramentas ajudam'],
    columns: ['Discordo', 'Neutro', 'Concordo', 'Concordo muito'],
  },
  {
    id: 's4q4',
    type: 'escala',
    title: 'Como você avalia o equilíbrio entre trabalho e vida pessoal?',
    required: true,
    min: 1,
    max: 5,
  },
  {
    id: 's4q5',
    type: 'multipla-escolha',
    title: 'O que mais ajudaria no seu dia a dia?',
    choices: [
      'Menos reuniões',
      'Metas mais claras',
      'Mais autonomia',
      'Plano de carreira',
      'Melhores ferramentas',
      'Horário flexível',
    ],
  },
  { id: 's4q6', type: 'texto-longo', title: 'O que a liderança deveria começar a fazer?' },
  {
    id: 's4q7',
    type: 'texto-longo',
    title: 'O que a liderança deveria parar de fazer?',
    help: 'Aparece para quem deu nota abaixo de 7.',
  },
  { id: 's4q8', type: 'numero', title: 'Há quantos meses você está no time?', required: true, min: 0, max: 96 },
  {
    id: 's4q9',
    type: 'escolha-unica',
    title: 'Você se vê aqui daqui a um ano?',
    required: true,
    choices: ['Com certeza', 'Provavelmente', 'Não sei', 'Provavelmente não'],
  },
])

const S4_LOGIC: LogicRule[] = [
  { id: 's4r1', questionId: 's4q2', operator: 'menor', value: '7', action: 'mostrar', targetId: 's4q7' },
  { id: 's4r2', questionId: 's4q8', operator: 'menor', value: '3', action: 'esconder', targetId: 's4q3' },
]

const S5_QUESTIONS = buildQuestions([
  {
    id: 's5q1',
    type: 'escolha-unica',
    title: 'Você já usou uma ferramenta de formulários paga?',
    required: true,
    choices: ['Sim, uso hoje', 'Já usei, não uso mais', 'Nunca usei'],
  },
  { id: 's5q2', type: 'texto-curto', title: 'Qual ferramenta?', help: 'Aparece para quem já usou alguma.' },
  {
    id: 's5q3',
    type: 'escala',
    title: 'O quanto a proposta acima resolve o seu problema?',
    required: true,
    min: 1,
    max: 7,
  },
  {
    id: 's5q4',
    type: 'numero',
    title: 'Quanto você pagaria por mês, em reais?',
    help: 'Um número inteiro, sem centavos.',
    min: 0,
    max: 500,
  },
  {
    id: 's5q5',
    type: 'multipla-escolha',
    title: 'Quais recursos você usaria de verdade?',
    choices: [
      'Lógica condicional',
      'Relatórios automáticos',
      'Integração com planilha',
      'Marca própria',
      'Assinatura eletrônica',
      'Pagamento dentro do formulário',
    ],
  },
  { id: 's5q6', type: 'nps', title: 'O quanto você recomendaria essa ideia a um colega?', required: true },
  { id: 's5q7', type: 'texto-longo', title: 'O que falta nessa proposta?' },
  { id: 's5q8', type: 'data', title: 'A partir de quando isso seria útil para você?' },
  { id: 's5q9', type: 'email', title: 'Quer participar do teste fechado? Deixe o seu e-mail' },
])

const S5_LOGIC: LogicRule[] = [
  { id: 's5r1', questionId: 's5q1', operator: 'diferente', value: 'Nunca usei', action: 'mostrar', targetId: 's5q2' },
  { id: 's5r2', questionId: 's5q3', operator: 'menor', value: '4', action: 'pular-para', targetId: 's5q7' },
]

const S6_QUESTIONS = buildQuestions([
  { id: 's6q1', type: 'escala', title: 'Como você avalia o workshop no geral?', required: true, min: 1, max: 5 },
  {
    id: 's6q2',
    type: 'escolha-unica',
    title: 'O conteúdo atendeu à sua expectativa?',
    required: true,
    choices: ['Superou', 'Atendeu', 'Ficou abaixo'],
  },
  {
    id: 's6q3',
    type: 'multipla-escolha',
    title: 'Quais partes foram mais úteis?',
    choices: ['Abertura', 'Estudo de caso', 'Prática guiada', 'Perguntas e respostas', 'Material de apoio'],
  },
  {
    id: 's6q4',
    type: 'matriz',
    title: 'Dê uma nota para cada aspecto',
    required: true,
    rows: ['Conteúdo', 'Facilitação', 'Ritmo', 'Material'],
    columns: ['Fraco', 'Regular', 'Bom', 'Excelente'],
  },
  { id: 's6q5', type: 'texto-longo', title: 'O que faltou no workshop?', help: 'Aparece para quem achou abaixo do esperado.' },
  { id: 's6q6', type: 'nps', title: 'O quanto você recomendaria este workshop?', required: true },
  { id: 's6q7', type: 'texto-curto', title: 'Um tema que você gostaria na próxima edição' },
  { id: 's6q8', type: 'email', title: 'E-mail para receber o certificado', required: true },
  { id: 's6q9', type: 'data', title: 'Em qual turma você participou?' },
])

const S6_LOGIC: LogicRule[] = [
  { id: 's6r1', questionId: 's6q2', operator: 'igual', value: 'Ficou abaixo', action: 'mostrar', targetId: 's6q5' },
  { id: 's6r2', questionId: 's6q1', operator: 'maior', value: '4', action: 'pular-para', targetId: 's6q6' },
]

export const SURVEYS: Survey[] = [
  {
    id: 1,
    slug: 'satisfacao-atendimento',
    title: 'Satisfação com o atendimento',
    description:
      'Enviada logo depois de cada conversa com o suporte. Mede a nota de recomendação, a rapidez e o que mais pesou na experiência.',
    status: 'publicado',
    coverSeed: 'atendimento',
    color: '#465fff',
    questions: S1_QUESTIONS,
    logic: S1_LOGIC,
    thankYou: 'Obrigado! A sua resposta vai direto para quem atendeu você.',
    createdAt: daysAgo(120),
    publishedAt: daysAgo(96),
    closesAt: null,
    views: 1284,
  },
  {
    id: 2,
    slug: 'habitos-compra-online',
    title: 'Hábitos de compra online 2026',
    description:
      'Pesquisa de mercado com o público geral: frequência de compra, categorias, peso do frete e o que trava a finalização.',
    status: 'publicado',
    coverSeed: 'mercado',
    color: '#12b76a',
    questions: S2_QUESTIONS,
    logic: S2_LOGIC,
    thankYou: 'Resposta registrada. O relatório consolidado sai no fim do trimestre.',
    createdAt: daysAgo(80),
    publishedAt: daysAgo(72),
    closesAt: daysAhead(30),
    views: 2130,
  },
  {
    id: 3,
    slug: 'encontro-produto-2026',
    title: 'Inscrição no Encontro de Produto 2026',
    description:
      'Formulário de inscrição com trilha presencial ou online, escolha de oficinas e dados para emitir o ingresso.',
    status: 'publicado',
    coverSeed: 'evento',
    color: '#f79009',
    questions: S3_QUESTIONS,
    logic: S3_LOGIC,
    thankYou: 'Inscrição confirmada! O ingresso chega por e-mail em até 24 horas.',
    createdAt: daysAgo(48),
    publishedAt: daysAgo(40),
    closesAt: daysAhead(12),
    views: 906,
  },
  {
    id: 4,
    slug: 'clima-interno-2026',
    title: 'Clima interno — 2º semestre',
    description:
      'Pesquisa anônima com o time: eNPS, equilíbrio entre trabalho e vida pessoal e o que a liderança deveria mudar.',
    status: 'publicado',
    coverSeed: 'time',
    color: '#0ba5ec',
    questions: S4_QUESTIONS,
    logic: S4_LOGIC,
    thankYou: 'Obrigado pela franqueza. As respostas são lidas sem identificação.',
    createdAt: daysAgo(30),
    publishedAt: daysAgo(21),
    closesAt: daysAhead(6),
    views: 214,
  },
  {
    id: 5,
    slug: 'conceito-assinatura-pro',
    title: 'Teste de conceito: assinatura Pro',
    description:
      'Rascunho em construção. Valida disposição a pagar e quais recursos justificam a assinatura antes de a gente escrever uma linha de código.',
    status: 'rascunho',
    coverSeed: 'conceito',
    color: '#7592ff',
    questions: S5_QUESTIONS,
    logic: S5_LOGIC,
    thankYou: 'Obrigado! Se você deixou o e-mail, entramos em contato antes do teste fechado.',
    createdAt: daysAgo(9),
    publishedAt: '',
    closesAt: null,
    views: 0,
  },
  {
    id: 6,
    slug: 'workshop-onboarding',
    title: 'Avaliação do Workshop de Onboarding',
    description:
      'Formulário encerrado da última turma. Serve de referência para comparar as notas da próxima edição.',
    status: 'encerrado',
    coverSeed: 'workshop',
    color: '#f04438',
    questions: S6_QUESTIONS,
    logic: S6_LOGIC,
    thankYou: 'Avaliação recebida. O certificado chega por e-mail em até três dias úteis.',
    createdAt: daysAgo(140),
    publishedAt: daysAgo(132),
    closesAt: daysAgo(28),
    views: 318,
  },
]

// =========================================================================
// Contatos
// =========================================================================

const CONTACT_SEED: { name: string; email: string; tags: string[] }[] = [
  { name: 'Helena Prado', email: 'helena.prado@nortelab.com.br', tags: ['cliente', 'promotor'] },
  { name: 'Rafael Nunes', email: 'rafael.nunes@vialumen.com', tags: ['cliente'] },
  { name: 'Marina Alves', email: 'marina.alves@estudiocinza.com.br', tags: ['cliente', 'detrator'] },
  { name: 'Caio Ferraz', email: 'caio.ferraz@pontocerto.com.br', tags: ['prospecto'] },
  { name: 'Júlia Sampaio', email: 'julia.sampaio@casaverde.com.br', tags: ['cliente', 'promotor'] },
  { name: 'Bruno Tavares', email: 'bruno.tavares@meridianoapp.com', tags: ['evento'] },
  { name: 'Larissa Coelho', email: 'larissa.coelho@fluxopago.com.br', tags: ['cliente'] },
  { name: 'Diego Moraes', email: 'diego.moraes@alcanceweb.com.br', tags: ['prospecto', 'evento'] },
  { name: 'Patrícia Lemos', email: 'patricia.lemos@bemviverclinica.com', tags: ['cliente'] },
  { name: 'Thiago Barreto', email: 'thiago.barreto@rotasul.com.br', tags: ['cliente', 'promotor'] },
  { name: 'Camila Duarte', email: 'camila.duarte@officinadigital.com', tags: ['evento'] },
  { name: 'Vinícius Rocha', email: 'vinicius.rocha@vetorcinco.com.br', tags: ['prospecto'] },
  { name: 'Aline Figueiredo', email: 'aline.figueiredo@lumeeditora.com.br', tags: ['cliente'] },
  { name: 'Gustavo Pinheiro', email: 'gustavo.pinheiro@trilhaverde.com', tags: ['cliente', 'detrator'] },
  { name: 'Renata Salles', email: 'renata.salles@auroralabs.com.br', tags: ['evento', 'promotor'] },
  { name: 'Eduardo Campos', email: 'eduardo.campos@praticofood.com.br', tags: ['cliente'] },
  { name: 'Beatriz Andrade', email: 'beatriz.andrade@nuvemclara.com', tags: ['prospecto'] },
  { name: 'Felipe Aragão', email: 'felipe.aragao@sextaseis.com.br', tags: ['cliente'] },
  { name: 'Tatiane Ribeiro', email: 'tatiane.ribeiro@pontualcob.com.br', tags: ['cliente', 'promotor'] },
  { name: 'Otávio Mendes', email: 'otavio.mendes@circuitolab.com.br', tags: ['evento'] },
]

export const CONTACTS: Contact[] = CONTACT_SEED.map((c, i) => ({
  id: i + 1,
  name: c.name,
  email: c.email,
  avatar: av(c.name),
  tags: c.tags,
  responseCount: 0,
  lastAt: '',
}))

// =========================================================================
// Textos livres por pergunta — alimentam a nuvem de termos frequentes
// =========================================================================

const TEXT_POOLS: Record<string, string[]> = {
  s1q6: [
    'A resposta demorou dois dias e ninguém avisou que estava em análise.',
    'Precisei repetir o problema para três pessoas diferentes.',
    'O atendente foi educado, mas não tinha acesso ao meu pedido.',
    'Faltou um retorno depois que o chamado foi fechado.',
    'A solução proposta não resolveu e o chamado foi fechado assim mesmo.',
    'Queria um canal por telefone para problema urgente.',
    'O prazo prometido não foi cumprido e ninguém avisou.',
    'Faltou clareza sobre o que eu precisava enviar.',
  ],
  s1q9: [
    'Atendimento rápido e resolveu de primeira.',
    'Boa vontade, mas demorou.',
    'Resolveram o problema com clareza.',
    'Atendimento educado e eficiente.',
    'Demorou, mas resolveu.',
    'Precisei insistir bastante.',
    'Excelente, sem enrolação.',
    'Faltou acompanhamento depois.',
  ],
  s2q6: [
    'Loja Ponto Certo',
    'Magazine Aurora',
    'TecnoSul',
    'Casa e Cia',
    'Mercado Meridiano',
    'Vitrine Digital',
    'Eletro Vetor',
  ],
  s2q8: [
    'Frete caro demais na hora de fechar o pedido.',
    'Prazo de entrega muito longo para o meu endereço.',
    'O site pediu cadastro completo antes de mostrar o valor do frete.',
    'Cupom não funcionou e desisti da compra.',
    'Faltou opção de pagamento em pix.',
    'A página travou no pagamento e perdi o carrinho.',
    'O valor final ficou bem acima do anunciado.',
    'Não achei a política de troca antes de finalizar.',
    'Frete grátis só a partir de um valor alto demais.',
  ],
  s3q1: [
    'Ana Clara Bonfim',
    'Marcos Vinícius Teles',
    'Priscila Antunes',
    'Rodrigo Barbosa',
    'Letícia Maranhão',
    'Fernando Quintela',
    'Sabrina Peixoto',
    'Henrique Vasques',
  ],
  s3q7: [
    'Sou vegetariano, sem restrição de acessibilidade.',
    'Preciso de acesso para cadeira de rodas nas salas.',
    'Intolerância a lactose.',
    'Sem restrição alimentar.',
    'Alergia a frutos do mar.',
    'Preciso de legenda nas gravações.',
    'Prefiro opção sem glúten no almoço.',
  ],
  s3q9: [
    'Nortelab',
    'Via Lumen',
    'Estúdio Cinza',
    'Ponto Certo',
    'Casa Verde',
    'Meridiano',
    'Fluxo Pago',
    'Alcance Web',
  ],
  s4q6: [
    'Compartilhar as metas do trimestre antes de cobrar resultado.',
    'Dar retorno individual com mais frequência.',
    'Explicar as decisões de prioridade para o time todo.',
    'Reconhecer publicamente quem entrega bem.',
    'Definir um plano de carreira claro.',
    'Conversar com o time antes de mudar a prioridade.',
  ],
  s4q7: [
    'Marcar reunião de alinhamento em cima da hora.',
    'Mudar a prioridade no meio da semana.',
    'Cobrar prazo sem discutir o escopo.',
    'Aprovar projeto sem time disponível.',
    'Deixar decisão importante só no chat.',
    'Convocar reunião longa sem pauta.',
  ],
  s5q2: ['Typeform', 'Google Forms', 'SurveyMonkey', 'Jotform', 'Formulário próprio'],
  s5q7: [
    'Falta integração com a planilha que o time já usa.',
    'Precisa de relatório por período comparando meses.',
    'Sem marca própria não dá para mandar para cliente.',
    'Falta pagamento dentro do formulário.',
  ],
  s6q5: [
    'Faltou mais tempo na prática guiada.',
    'O estudo de caso ficou distante da nossa realidade.',
    'Material de apoio chegou depois da aula.',
    'Faltou um roteiro para levar de volta para o time.',
  ],
  s6q7: [
    'Pesquisa com usuários na prática',
    'Métricas de produto',
    'Facilitação de workshops',
    'Escrita para produto',
    'Discovery contínuo',
    'Priorização de backlog',
  ],
}

const GENERIC_TEXT = [
  'Resposta registrada durante a demonstração.',
  'Nada a acrescentar por enquanto.',
  'Está bom do jeito que está.',
]

const EMAIL_DOMAINS = ['nortelab.com.br', 'vialumen.com', 'meridianoapp.com', 'casaverde.com.br', 'alcanceweb.com.br']
const FIRST_NAMES = ['ana', 'bruno', 'carla', 'diego', 'elisa', 'felipe', 'gabriela', 'henrique', 'isabel', 'joao']
const LAST_NAMES = ['souza', 'lima', 'castro', 'monteiro', 'freitas', 'braga', 'pires', 'rocha']

// =========================================================================
// Geração das respostas
// =========================================================================

/** Pesos deterministas por pergunta — cada gráfico ganha uma forma própria. */
function choiceWeights(question: Question, size: number): number[] {
  const base = imgHash(question.id)
  return Array.from({ length: size }, (_, i) => {
    const rotated = (i + (base % size)) % size
    return 10 + ((base >> (rotated % 8)) % 7) * 4 + (size - rotated) * 3
  })
}

function answerFor(question: Question, r: () => number): AnswerValue | null {
  if (!question.required && r() < 0.14) return null

  switch (question.type) {
    case 'nps': {
      const weights = [1, 1, 1, 2, 2, 4, 6, 10, 14, 18, 16]
      return weightedIndex(weights, r)
    }
    case 'escala': {
      const min = question.min ?? 1
      const max = question.max ?? 5
      const size = max - min + 1
      const weights = Array.from({ length: size }, (_, i) => 2 + i * i * 0.9)
      return min + weightedIndex(weights, r)
    }
    case 'numero': {
      const min = question.min ?? 0
      const max = question.max ?? 100
      const span = max - min
      // Distribuição concentrada no meio da faixa.
      const v = min + Math.round(((r() + r() + r()) / 3) * span)
      return Math.max(min, Math.min(max, v))
    }
    case 'escolha-unica': {
      if (question.choices.length === 0) return null
      const weights = choiceWeights(question, question.choices.length)
      return question.choices[weightedIndex(weights, r)].label
    }
    case 'multipla-escolha': {
      if (question.choices.length === 0) return null
      const weights = choiceWeights(question, question.choices.length)
      const wanted = 1 + Math.floor(r() * Math.min(3, question.choices.length))
      const chosen = new Set<string>()
      let guard = 0
      while (chosen.size < wanted && guard++ < 20) {
        chosen.add(question.choices[weightedIndex(weights, r)].label)
      }
      return [...chosen]
    }
    case 'matriz': {
      const out: Record<string, string> = {}
      for (const row of question.rows) {
        const weights = question.columns.map((_, i) => 2 + i * i * 1.2)
        out[row] = question.columns[weightedIndex(weights, r)]
      }
      return out
    }
    case 'data':
      return dateOnly(Math.floor(r() * 120) - 20)
    case 'email': {
      const name = `${pick(FIRST_NAMES, r)}.${pick(LAST_NAMES, r)}`
      return `${name}@${pick(EMAIL_DOMAINS, r)}`
    }
    default: {
      const pool = TEXT_POOLS[question.id] ?? GENERIC_TEXT
      return pick(pool, r)
    }
  }
}

function generateAnswers(survey: Survey, r: () => number, complete: boolean): Answer[] {
  const qs = ordered(survey.questions)
  const map: Record<string, AnswerValue> = {}
  const answers: Answer[] = []

  // Abandono: quem não completa para em algum ponto do caminho.
  const stopAfter = complete ? qs.length : 1 + Math.floor(r() * Math.max(1, qs.length - 3))

  let index = firstQuestionIndex(survey, map)
  let seen = 0
  let guard = 0
  while (index < qs.length && guard++ < 60) {
    const question = qs[index]
    if (!isHiddenQuestion(survey, question.id, map)) {
      const value = answerFor(question, r)
      if (value !== null) {
        map[question.id] = value
        answers.push({ questionId: question.id, value })
      }
      seen++
      if (seen >= stopAfter) break
    }
    index = nextQuestionIndex(survey, index, map)
  }

  return answers
}

const SOURCES: ResponseSource[] = ['link', 'email', 'qr', 'incorporado']

interface ResponsePlan {
  surveyId: number
  count: number
  /** Janela de datas, em dias atrás. */
  from: number
  to: number
  completedRate: number
}

const PLANS: ResponsePlan[] = [
  { surveyId: 1, count: 38, from: 92, to: 0, completedRate: 0.87 },
  { surveyId: 2, count: 32, from: 70, to: 0, completedRate: 0.79 },
  { surveyId: 3, count: 24, from: 38, to: 0, completedRate: 0.92 },
  { surveyId: 4, count: 18, from: 20, to: 1, completedRate: 0.83 },
  { surveyId: 6, count: 14, from: 118, to: 30, completedRate: 0.93 },
]

function buildResponses(): Response[] {
  const r = mulberry32(20260821)
  const out: Response[] = []
  let id = 1

  for (const plan of PLANS) {
    const survey = SURVEYS.find((s) => s.id === plan.surveyId)!
    for (let i = 0; i < plan.count; i++) {
      const complete = r() < plan.completedRate
      const answers = generateAnswers(survey, r, complete)
      // Datas mais densas nos dias recentes.
      const bias = Math.pow(r(), 1.7)
      const day = Math.round(plan.to + bias * (plan.from - plan.to))
      const source = SOURCES[weightedIndex([48, 26, 14, 12], r)]
      const withContact = source === 'email' || r() < 0.45
      const contactId = withContact ? 1 + Math.floor(r() * CONTACTS.length) : null

      const d = new Date()
      d.setDate(d.getDate() - day)
      d.setHours(8 + Math.floor(r() * 12), Math.floor(r() * 60), Math.floor(r() * 60), 0)

      out.push({
        id: id++,
        surveyId: survey.id,
        at: d.toISOString(),
        durationSec: 45 + Math.round(answers.length * (14 + r() * 46)) + Math.round(r() * 90),
        completed: complete,
        source,
        contactId,
        answers,
      })
    }
  }

  return out.sort((a, b) => a.at.localeCompare(b.at)).map((row, i) => ({ ...row, id: i + 1 }))
}

export const RESPONSES: Response[] = buildResponses()

// Contadores dos contatos derivam das respostas geradas.
for (const contact of CONTACTS) {
  const rows = RESPONSES.filter((r) => r.contactId === contact.id)
  contact.responseCount = rows.length
  contact.lastAt = rows.length ? rows[rows.length - 1].at : daysAgo(60 + (contact.id % 30))
}

// =========================================================================
// Modelos prontos
// =========================================================================

export const TEMPLATES: TemplateModel[] = [
  {
    id: 1,
    slug: 'nps-relacional',
    name: 'NPS relacional',
    objective: 'Medir a lealdade da base com uma pergunta de nota e um porquê aberto.',
    icon: 'activity',
    color: '#465fff',
    questions: buildQuestions([
      { id: 'm1q1', type: 'nps', title: 'De 0 a 10, o quanto você recomendaria a nossa empresa?', required: true },
      { id: 'm1q2', type: 'texto-longo', title: 'Qual o principal motivo da sua nota?', required: true },
      {
        id: 'm1q3',
        type: 'escolha-unica',
        title: 'Há quanto tempo você é cliente?',
        choices: ['Menos de 3 meses', 'De 3 a 12 meses', 'De 1 a 3 anos', 'Mais de 3 anos'],
      },
      {
        id: 'm1q4',
        type: 'multipla-escolha',
        title: 'O que faria você aumentar a nota?',
        choices: ['Preço', 'Suporte', 'Prazo', 'Recursos do produto', 'Facilidade de uso'],
      },
      { id: 'm1q5', type: 'email', title: 'Podemos responder por e-mail?' },
    ]),
  },
  {
    id: 2,
    slug: 'satisfacao-pos-atendimento',
    name: 'Satisfação pós-atendimento',
    objective: 'Fechar cada chamado com nota, motivo e um espaço para o desabafo.',
    icon: 'message-circle',
    color: '#12b76a',
    questions: buildQuestions([
      { id: 'm2q1', type: 'escala', title: 'Como você avalia o atendimento?', required: true, min: 1, max: 5 },
      {
        id: 'm2q2',
        type: 'escolha-unica',
        title: 'Seu problema foi resolvido?',
        required: true,
        choices: ['Sim, na primeira conversa', 'Sim, depois de algumas trocas', 'Não foi resolvido'],
      },
      {
        id: 'm2q3',
        type: 'escolha-unica',
        title: 'Por qual canal você falou com a gente?',
        choices: ['Chat no site', 'E-mail', 'Telefone', 'WhatsApp'],
      },
      { id: 'm2q4', type: 'texto-longo', title: 'O que poderíamos ter feito melhor?' },
      { id: 'm2q5', type: 'nps', title: 'O quanto você recomendaria nosso suporte?', required: true },
      { id: 'm2q6', type: 'email', title: 'Deixe o seu e-mail para retorno' },
    ]),
  },
  {
    id: 3,
    slug: 'inscricao-evento',
    name: 'Inscrição em evento',
    objective: 'Coletar dados do participante, trilha escolhida e restrições em uma tela por vez.',
    icon: 'calendar',
    color: '#f79009',
    questions: buildQuestions([
      { id: 'm3q1', type: 'texto-curto', title: 'Nome completo', required: true },
      { id: 'm3q2', type: 'email', title: 'E-mail para o ingresso', required: true },
      {
        id: 'm3q3',
        type: 'escolha-unica',
        title: 'Como você pretende participar?',
        required: true,
        choices: ['Presencial', 'Online ao vivo', 'Só quero a gravação'],
      },
      { id: 'm3q4', type: 'data', title: 'Em qual dia você chega?' },
      {
        id: 'm3q5',
        type: 'multipla-escolha',
        title: 'Quais oficinas te interessam?',
        choices: ['Descoberta', 'Pesquisa', 'Métricas', 'Design de serviço'],
      },
      { id: 'm3q6', type: 'numero', title: 'Quantos acompanhantes?', min: 0, max: 4 },
      { id: 'm3q7', type: 'texto-longo', title: 'Restrição alimentar ou de acessibilidade' },
    ]),
  },
  {
    id: 4,
    slug: 'pesquisa-de-mercado',
    name: 'Pesquisa de mercado',
    objective: 'Entender perfil, hábito de consumo e disposição a pagar antes de lançar.',
    icon: 'chart',
    color: '#0ba5ec',
    questions: buildQuestions([
      { id: 'm4q1', type: 'numero', title: 'Qual é a sua idade?', required: true, min: 16, max: 90 },
      {
        id: 'm4q2',
        type: 'escolha-unica',
        title: 'Com que frequência você compra nesta categoria?',
        required: true,
        choices: ['Toda semana', 'Algumas vezes por mês', 'Uma vez por mês', 'Raramente'],
      },
      {
        id: 'm4q3',
        type: 'multipla-escolha',
        title: 'Quais marcas você considera hoje?',
        choices: ['Marca A', 'Marca B', 'Marca C', 'Outra', 'Nenhuma'],
      },
      { id: 'm4q4', type: 'numero', title: 'Quanto você pagaria por mês, em reais?', min: 0, max: 500 },
      {
        id: 'm4q5',
        type: 'matriz',
        title: 'O quanto cada fator pesa na sua escolha?',
        rows: ['Preço', 'Qualidade', 'Marca', 'Prazo'],
        columns: ['Nada importante', 'Pouco importante', 'Importante', 'Decisivo'],
      },
      { id: 'm4q6', type: 'texto-longo', title: 'O que falta no que existe hoje no mercado?' },
      { id: 'm4q7', type: 'nps', title: 'O quanto você recomendaria a categoria a um amigo?' },
    ]),
  },
  {
    id: 5,
    slug: 'feedback-interno',
    name: 'Feedback interno',
    objective: 'Ouvir o time com anonimato: eNPS, concordância por tema e dois campos abertos.',
    icon: 'users',
    color: '#7592ff',
    questions: buildQuestions([
      {
        id: 'm5q1',
        type: 'escolha-unica',
        title: 'Em qual área você trabalha?',
        required: true,
        choices: ['Produto', 'Engenharia', 'Vendas', 'Suporte', 'Administrativo'],
      },
      { id: 'm5q2', type: 'nps', title: 'O quanto você recomendaria a empresa como lugar para trabalhar?', required: true },
      {
        id: 'm5q3',
        type: 'matriz',
        title: 'O quanto você concorda com cada frase?',
        rows: ['Tenho autonomia', 'Sou reconhecido', 'A comunicação é clara'],
        columns: ['Discordo', 'Neutro', 'Concordo', 'Concordo muito'],
      },
      { id: 'm5q4', type: 'escala', title: 'Como está o seu equilíbrio entre trabalho e vida pessoal?', min: 1, max: 5 },
      { id: 'm5q5', type: 'texto-longo', title: 'O que a liderança deveria começar a fazer?' },
      { id: 'm5q6', type: 'texto-longo', title: 'O que a liderança deveria parar de fazer?' },
    ]),
  },
]

// =========================================================================
// Depoimentos e planos da página inicial
// =========================================================================

export interface Testimonial {
  id: number
  name: string
  role: string
  avatar: string
  quoteKey: string
}

export const TESTIMONIALS: Testimonial[] = [
  { id: 1, name: 'Helena Prado', role: 'Pesquisa e Insights', avatar: av('helena'), quoteKey: 'one' },
  { id: 2, name: 'Rafael Nunes', role: 'Coordenação de Suporte', avatar: av('rafael'), quoteKey: 'two' },
  { id: 3, name: 'Marina Alves', role: 'Produto', avatar: av('marina'), quoteKey: 'three' },
]

export interface Plan {
  id: string
  priceMonthly: number
  featured: boolean
  featureKeys: string[]
}

export const PLANS_LIST: Plan[] = [
  { id: 'gratuito', priceMonthly: 0, featured: false, featureKeys: ['a', 'b', 'c'] },
  { id: 'profissional', priceMonthly: 79, featured: true, featureKeys: ['a', 'b', 'c', 'd'] },
  { id: 'empresa', priceMonthly: 249, featured: false, featureKeys: ['a', 'b', 'c', 'd'] },
]
