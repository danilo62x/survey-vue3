<template>
  <!-- Painel lateral que edita a pergunta selecionada no construtor. -->
  <div class="flex flex-col gap-5">
    <div>
      <label :class="label" for="q-type">{{ t('builder.fields.type') }}</label>
      <div class="relative">
        <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">
          <IconBase :name="QUESTION_ICON[question.type]" :size="16" />
        </span>
        <select
          id="q-type"
          :value="question.type"
          :class="`${control} pl-9`"
          @change="changeType(($event.target as HTMLSelectElement).value as QuestionType)"
        >
          <option v-for="type in QUESTION_TYPES" :key="type" :value="type">{{ t(`questionTypes.${type}`) }}</option>
        </select>
      </div>
    </div>

    <div>
      <label :class="label" for="q-title">{{ t('builder.fields.title') }}</label>
      <textarea
        id="q-title"
        :rows="2"
        :value="question.title"
        :placeholder="t('builder.fields.titlePlaceholder')"
        :class="`${control} resize-y`"
        @input="emit('change', { title: ($event.target as HTMLTextAreaElement).value })"
      />
    </div>

    <div>
      <label :class="label" for="q-help">{{ t('builder.fields.help') }}</label>
      <input
        id="q-help"
        :value="question.help"
        :placeholder="t('builder.fields.helpPlaceholder')"
        :class="control"
        @input="emit('change', { help: ($event.target as HTMLInputElement).value })"
      />
    </div>

    <div class="flex items-center justify-between rounded-xl border border-themed px-4 py-3">
      <div class="min-w-0 pr-3">
        <p class="text-sm font-medium text-heading">{{ t('builder.fields.required') }}</p>
        <p class="text-xs text-muted">{{ t('builder.fields.requiredHint') }}</p>
      </div>
      <SwitchToggle
        :model-value="question.required"
        @update:model-value="(v: boolean) => emit('change', { required: v })"
      />
    </div>

    <div v-if="hasChoices(question.type)">
      <p :class="label">{{ t('builder.fields.options') }}</p>
      <ul class="flex flex-col gap-2">
        <li v-for="choice in question.choices" :key="choice.id" class="flex items-center gap-2">
          <input
            :value="choice.label"
            :class="control"
            @input="setChoice(choice.id, ($event.target as HTMLInputElement).value)"
          />
          <button
            type="button"
            :disabled="question.choices.length <= 1"
            :aria-label="t('common.remove')"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-themed text-muted transition hover:text-error-500 disabled:opacity-40"
            @click="removeChoice(choice.id)"
          >
            <IconBase name="trash" :size="15" />
          </button>
        </li>
      </ul>
      <button
        type="button"
        class="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400"
        @click="addChoice"
      >
        <IconBase name="plus" :size="15" />
        {{ t('builder.addOption') }}
      </button>
    </div>

    <div v-if="hasRange(question.type)" class="grid grid-cols-2 gap-3">
      <div>
        <label :class="label" for="q-min">{{ t('builder.fields.min') }}</label>
        <input
          id="q-min"
          type="number"
          :value="question.min ?? ''"
          :class="control"
          @input="setBound('min', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div>
        <label :class="label" for="q-max">{{ t('builder.fields.max') }}</label>
        <input
          id="q-max"
          type="number"
          :value="question.max ?? ''"
          :class="control"
          @input="setBound('max', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <template v-if="isMatrix(question.type)">
      <div v-for="key in (['rows', 'columns'] as const)" :key="key">
        <p :class="label">{{ t(key === 'rows' ? 'builder.fields.rows' : 'builder.fields.columns') }}</p>
        <ul class="flex flex-col gap-2">
          <li v-for="(item, index) in question[key]" :key="`${key}-${index}`" class="flex items-center gap-2">
            <input
              :value="item"
              :class="control"
              @input="setListItem(key, index, ($event.target as HTMLInputElement).value)"
            />
            <button
              type="button"
              :disabled="question[key].length <= 1"
              :aria-label="t('common.remove')"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-themed text-muted transition hover:text-error-500 disabled:opacity-40"
              @click="removeListItem(key, index)"
            >
              <IconBase name="trash" :size="15" />
            </button>
          </li>
        </ul>
        <button
          type="button"
          class="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400"
          @click="addListItem(key)"
        >
          <IconBase name="plus" :size="15" />
          {{ t(key === 'rows' ? 'builder.addRow' : 'builder.addColumn') }}
        </button>
      </div>
    </template>

    <button
      type="button"
      class="inline-flex items-center justify-center gap-2 rounded-lg border border-error-200 px-4 py-2.5 text-sm font-medium text-error-600 transition hover:bg-error-50 dark:border-error-500/30 dark:hover:bg-error-500/10"
      @click="emit('remove')"
    >
      <IconBase name="trash" :size="16" />
      {{ t('builder.removeQuestion') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Choice, Question, QuestionType } from '@/data/types'
import IconBase from '@/components/ui/IconBase.vue'
import SwitchToggle from '@/components/ui/SwitchToggle.vue'
import { QUESTION_ICON, QUESTION_TYPES, hasChoices, hasRange, isMatrix } from '@/lib/questionTypes'

const props = defineProps<{ question: Question }>()

const emit = defineEmits<{
  change: [patch: Partial<Question>]
  remove: []
}>()

const { t } = useI18n()

const label = 'mb-1.5 block text-sm font-medium text-heading'
const control =
  'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2.5 text-sm text-body placeholder:text-muted'

const setChoice = (id: string, value: string) =>
  emit('change', { choices: props.question.choices.map((c) => (c.id === id ? { ...c, label: value } : c)) })

function addChoice() {
  const next: Choice = {
    id: `${props.question.id}-o${props.question.choices.length + 1}-${Math.random().toString(36).slice(2, 5)}`,
    label: t('builder.newOption', { index: props.question.choices.length + 1 }),
  }
  emit('change', { choices: [...props.question.choices, next] })
}

const removeChoice = (id: string) =>
  emit('change', { choices: props.question.choices.filter((c) => c.id !== id) })

const setBound = (key: 'min' | 'max', value: string) =>
  emit('change', { [key]: value === '' ? null : Number(value) } as Partial<Question>)

const setListItem = (key: 'rows' | 'columns', index: number, value: string) =>
  emit('change', {
    [key]: props.question[key].map((item, i) => (i === index ? value : item)),
  } as Partial<Question>)

const addListItem = (key: 'rows' | 'columns') =>
  emit('change', {
    [key]: [...props.question[key], t(key === 'rows' ? 'builder.newRow' : 'builder.newColumn')],
  } as Partial<Question>)

const removeListItem = (key: 'rows' | 'columns', index: number) =>
  emit('change', { [key]: props.question[key].filter((_, i) => i !== index) } as Partial<Question>)

function changeType(type: QuestionType) {
  const patch: Partial<Question> = { type }
  if (hasChoices(type) && props.question.choices.length === 0) {
    patch.choices = [1, 2, 3].map((n) => ({
      id: `${props.question.id}-o${n}`,
      label: t('builder.newOption', { index: n }),
    }))
  }
  if (type === 'escala' && props.question.min === null) {
    patch.min = 1
    patch.max = 5
  }
  if (type === 'numero' && props.question.min === null) {
    patch.min = 0
    patch.max = 100
  }
  if (isMatrix(type) && props.question.rows.length === 0) {
    patch.rows = [t('builder.newRow')]
    patch.columns = [t('builder.newColumn')]
  }
  emit('change', patch)
}
</script>
