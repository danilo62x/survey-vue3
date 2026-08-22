<template>
  <!-- Lista arrastável de perguntas — com setas para quem não usa o mouse. -->
  <ul class="flex flex-col gap-2">
    <li
      v-for="(question, index) in questions"
      :key="question.id"
      draggable="true"
      :class="[
        'group flex items-center gap-2 rounded-xl border px-3 py-2.5 transition',
        question.id === selectedId ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-themed surface-card',
        overIndex === index && dragIndex !== null && dragIndex !== index ? 'ring-2 ring-brand-300' : '',
        dragIndex === index ? 'opacity-50' : '',
      ]"
      @dragstart="dragIndex = index"
      @dragend="reset"
      @dragover.prevent="overIndex = index"
      @drop.prevent="drop(index)"
    >
      <span class="cursor-grab text-gray-400 active:cursor-grabbing" :title="t('builder.dragHint')">
        <IconBase name="grip" :size="16" />
      </span>

      <button
        type="button"
        class="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        @click="emit('select', question.id)"
      >
        <span
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-muted dark:bg-gray-800"
        >
          <IconBase :name="QUESTION_ICON[question.type]" :size="14" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-medium text-heading">
            {{ index + 1 }}. {{ question.title || t('builder.untitledQuestion') }}
          </span>
          <span class="flex items-center gap-1.5 text-[11px] text-muted">
            {{ t(`questionTypes.${question.type}`) }}
            <span v-if="question.required" class="text-error-500">*</span>
            <span v-if="conditional.has(question.id)" class="inline-flex items-center gap-1 text-brand-500">
              <IconBase name="git-branch" :size="11" />
              {{ t('builder.conditional') }}
            </span>
          </span>
        </span>
      </button>

      <div
        class="flex shrink-0 items-center gap-0.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100"
      >
        <button
          type="button"
          :disabled="index === 0"
          :title="t('builder.moveUp')"
          :aria-label="t('builder.moveUp')"
          class="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:text-heading disabled:opacity-30"
          @click="emit('move', index, index - 1)"
        >
          <IconBase name="chevron-up" :size="14" />
        </button>
        <button
          type="button"
          :disabled="index === questions.length - 1"
          :title="t('builder.moveDown')"
          :aria-label="t('builder.moveDown')"
          class="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:text-heading disabled:opacity-30"
          @click="emit('move', index, index + 1)"
        >
          <IconBase name="chevron-down" :size="14" />
        </button>
        <button
          type="button"
          :title="t('builder.duplicateQuestion')"
          :aria-label="t('builder.duplicateQuestion')"
          class="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:text-heading"
          @click="emit('duplicate', question.id)"
        >
          <IconBase name="copy" :size="14" />
        </button>
        <button
          type="button"
          :title="t('builder.removeQuestion')"
          :aria-label="t('builder.removeQuestion')"
          class="flex h-7 w-7 items-center justify-center rounded-md text-muted transition hover:text-error-500"
          @click="emit('remove', question.id)"
        >
          <IconBase name="trash" :size="14" />
        </button>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Question } from '@/data/types'
import IconBase from '@/components/ui/IconBase.vue'
import { QUESTION_ICON } from '@/lib/questionTypes'

defineProps<{
  questions: Question[]
  selectedId: string | null
  conditional: Set<string>
}>()

const emit = defineEmits<{
  select: [id: string]
  move: [from: number, to: number]
  remove: [id: string]
  duplicate: [id: string]
}>()

const { t } = useI18n()

const dragIndex = ref<number | null>(null)
const overIndex = ref<number | null>(null)

function reset() {
  dragIndex.value = null
  overIndex.value = null
}

function drop(to: number) {
  if (dragIndex.value !== null && dragIndex.value !== to) emit('move', dragIndex.value, to)
  reset()
}
</script>
