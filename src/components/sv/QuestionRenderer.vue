<template>
  <div class="min-w-0">
    <h2 class="text-lg font-semibold text-heading sm:text-xl">
      {{ question.title || t('builder.untitledQuestion') }}
      <span v-if="question.required" class="ml-1 text-error-500">*</span>
    </h2>
    <p v-if="question.help" class="mt-1.5 text-sm text-muted">{{ question.help }}</p>

    <div class="mt-5">
      <textarea
        v-if="question.type === 'texto-longo'"
        :rows="5"
        :disabled="preview"
        :value="typeof value === 'string' ? value : ''"
        :placeholder="t('fill.placeholders.longText')"
        :class="`${controlBase} ${borderClass} resize-y`"
        @input="emit('change', ($event.target as HTMLTextAreaElement).value)"
      />

      <input
        v-else-if="question.type === 'email'"
        type="email"
        inputmode="email"
        :disabled="preview"
        :value="typeof value === 'string' ? value : ''"
        placeholder="voce@empresa.com"
        :class="`${controlBase} ${borderClass}`"
        @input="emit('change', ($event.target as HTMLInputElement).value)"
      />

      <input
        v-else-if="question.type === 'numero'"
        type="number"
        inputmode="numeric"
        :disabled="preview"
        :min="question.min ?? undefined"
        :max="question.max ?? undefined"
        :value="value === undefined || value === null ? '' : String(value)"
        :placeholder="
          question.min !== null && question.max !== null
            ? t('fill.placeholders.numberRange', { min: question.min, max: question.max })
            : t('fill.placeholders.number')
        "
        :class="`${controlBase} ${borderClass}`"
        @input="onNumber(($event.target as HTMLInputElement).value)"
      />

      <input
        v-else-if="question.type === 'data'"
        type="date"
        :disabled="preview"
        :value="typeof value === 'string' ? value : ''"
        :class="`${controlBase} ${borderClass}`"
        @input="emit('change', ($event.target as HTMLInputElement).value)"
      />

      <div v-else-if="question.type === 'escolha-unica'" class="flex flex-col gap-2">
        <button
          v-for="choice in question.choices"
          :key="choice.id"
          type="button"
          :disabled="preview"
          :class="optionClass(value === choice.label)"
          @click="emit('change', choice.label)"
        >
          <span
            :class="`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
              value === choice.label ? 'border-brand-500' : 'border-gray-300 dark:border-gray-600'
            }`"
          >
            <span v-if="value === choice.label" class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: color }" />
          </span>
          <span class="min-w-0 flex-1 break-words">{{ choice.label }}</span>
        </button>
      </div>

      <div v-else-if="question.type === 'multipla-escolha'" class="flex flex-col gap-2">
        <button
          v-for="choice in question.choices"
          :key="choice.id"
          type="button"
          :disabled="preview"
          :class="optionClass(selectedList.includes(choice.label))"
          @click="toggleChoice(choice.label)"
        >
          <span
            :class="`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
              selectedList.includes(choice.label) ? 'border-brand-500' : 'border-gray-300 dark:border-gray-600'
            }`"
            :style="selectedList.includes(choice.label) ? { backgroundColor: color, borderColor: color } : undefined"
          >
            <IconBase
              v-if="selectedList.includes(choice.label)"
              name="check"
              :size="12"
              :stroke-width="3"
              class-name="text-white"
            />
          </span>
          <span class="min-w-0 flex-1 break-words">{{ choice.label }}</span>
        </button>
      </div>

      <div v-else-if="question.type === 'escala'">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="step in scaleSteps"
            :key="step"
            type="button"
            :disabled="preview"
            :class="`h-11 min-w-11 flex-1 rounded-xl border text-sm font-semibold transition sm:flex-none ${
              Number(value) === step ? 'text-white' : 'border-themed text-body hover:border-brand-300'
            }`"
            :style="Number(value) === step ? { backgroundColor: color, borderColor: color } : undefined"
            @click="emit('change', step)"
          >
            {{ step }}
          </button>
        </div>
        <div class="mt-2 flex justify-between text-xs text-muted">
          <span>{{ t('fill.scaleLow') }}</span>
          <span>{{ t('fill.scaleHigh') }}</span>
        </div>
      </div>

      <div v-else-if="question.type === 'nps'">
        <div class="grid grid-cols-6 gap-1.5 sm:grid-cols-11">
          <button
            v-for="step in npsSteps"
            :key="step"
            type="button"
            :disabled="preview"
            :class="`h-11 rounded-lg border text-sm font-semibold transition ${
              Number(value) === step ? 'text-white' : 'border-themed text-body hover:border-brand-300'
            }`"
            :style="Number(value) === step ? { backgroundColor: npsTone(step), borderColor: npsTone(step) } : undefined"
            @click="emit('change', step)"
          >
            {{ step }}
          </button>
        </div>
        <div class="mt-2 flex justify-between text-xs text-muted">
          <span>{{ t('fill.npsLow') }}</span>
          <span>{{ t('fill.npsHigh') }}</span>
        </div>
      </div>

      <div v-else-if="question.type === 'matriz'" class="-mx-1 overflow-x-auto px-1">
        <table class="w-full min-w-[32rem] border-collapse text-sm">
          <thead>
            <tr>
              <th class="w-1/3 px-2 pb-2 text-left text-xs font-medium text-muted" />
              <th
                v-for="column in question.columns"
                :key="column"
                class="px-2 pb-2 text-center text-xs font-medium text-muted"
              >
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in question.rows" :key="row" class="border-t border-themed">
              <th scope="row" class="py-3 pr-3 text-left text-sm font-medium text-body">{{ row }}</th>
              <td v-for="column in question.columns" :key="column" class="px-2 py-3 text-center">
                <button
                  type="button"
                  :disabled="preview"
                  :aria-label="`${row} — ${column}`"
                  :class="`mx-auto flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                    matrixValue[row] === column ? 'border-brand-500' : 'border-gray-300 dark:border-gray-600'
                  }`"
                  @click="emit('change', { ...matrixValue, [row]: column })"
                >
                  <span
                    v-if="matrixValue[row] === column"
                    class="h-3 w-3 rounded-full"
                    :style="{ backgroundColor: color }"
                  />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <input
        v-else
        type="text"
        :disabled="preview"
        :value="typeof value === 'string' ? value : ''"
        :placeholder="t('fill.placeholders.shortText')"
        :class="`${controlBase} ${borderClass}`"
        @input="emit('change', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <p v-if="error" class="mt-2 flex items-center gap-1.5 text-sm text-error-500">
      <IconBase name="alert-triangle" :size="14" />
      {{ t(error.key, error.params ?? {}) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AnswerValue, Question } from '@/data/types'
import type { FieldError } from '@/data/query'
import IconBase from '@/components/ui/IconBase.vue'

const props = withDefaults(
  defineProps<{
    question: Question
    value: AnswerValue | undefined
    error?: FieldError | null
    color?: string
    /** Modo prévia: os controles ficam visíveis, porém inertes. */
    preview?: boolean
  }>(),
  { error: null, color: '#465fff', preview: false }
)

const emit = defineEmits<{ change: [value: AnswerValue] }>()

const { t } = useI18n()

const controlBase =
  'focus-ring w-full rounded-xl border bg-transparent px-4 py-3 text-sm text-body placeholder:text-muted'

const borderClass = computed(() => (props.error ? 'border-error-500' : 'border-themed'))

const selectedList = computed(() => (Array.isArray(props.value) ? props.value : []))

const matrixValue = computed(
  () =>
    (props.value && typeof props.value === 'object' && !Array.isArray(props.value)
      ? props.value
      : {}) as Record<string, string>
)

const scaleSteps = computed(() => {
  const min = props.question.min ?? 1
  const max = props.question.max ?? 5
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
})

const npsSteps = Array.from({ length: 11 }, (_, i) => i)

const npsTone = (step: number) => (step <= 6 ? '#f04438' : step <= 8 ? '#f79009' : '#12b76a')

const optionClass = (active: boolean) =>
  `flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
    active
      ? 'border-brand-500 bg-brand-50 text-heading dark:bg-brand-500/15'
      : 'border-themed text-body hover:border-brand-300'
  } ${props.preview ? 'cursor-default' : 'cursor-pointer'}`

function onNumber(raw: string) {
  emit('change', raw === '' ? '' : Number(raw))
}

function toggleChoice(labelText: string) {
  const active = selectedList.value.includes(labelText)
  emit('change', active ? selectedList.value.filter((v) => v !== labelText) : [...selectedList.value, labelText])
}
</script>
