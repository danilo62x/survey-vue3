<template>
  <article
    class="surface-card flex flex-col overflow-hidden rounded-2xl border shadow-theme-sm transition hover:shadow-theme-md"
  >
    <div v-if="showCover" class="relative h-28 overflow-hidden">
      <img :src="svImage(template.slug, 640, 280)" alt="" loading="lazy" class="h-full w-full object-cover" />
      <span
        class="absolute bottom-3 left-4 flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-theme-md"
        :style="{ backgroundColor: template.color }"
      >
        <IconBase :name="template.icon" :size="20" />
      </span>
    </div>

    <div class="flex min-w-0 flex-1 flex-col p-5">
      <div class="flex min-w-0 items-start gap-3">
        <span
          v-if="!showCover"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          :style="{ backgroundColor: template.color }"
        >
          <IconBase :name="template.icon" :size="20" />
        </span>
        <div class="min-w-0">
          <h3 class="text-base font-semibold break-words text-heading">{{ template.name }}</h3>
          <p class="mt-1 text-sm text-muted">{{ template.objective }}</p>
        </div>
      </div>

      <ul class="mt-4 flex flex-1 flex-col gap-1.5">
        <li v-for="question in preview" :key="question.id" class="flex min-w-0 items-center gap-2 text-xs text-muted">
          <IconBase :name="QUESTION_ICON[question.type]" :size="13" class-name="shrink-0" />
          <span class="min-w-0 truncate">{{ question.title }}</span>
        </li>
        <li v-if="template.questions.length > preview.length" class="text-xs text-muted">
          {{ t('templates.more', { count: template.questions.length - preview.length }, template.questions.length - preview.length) }}
        </li>
      </ul>

      <div class="mt-5 flex items-center justify-between gap-3">
        <span class="text-xs text-muted">
          {{ t('templates.questionCount', { count: template.questions.length }, template.questions.length) }}
        </span>
        <button
          type="button"
          class="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 text-xs font-medium text-white transition hover:bg-brand-600"
          @click="emit('action')"
        >
          <IconBase name="plus" :size="14" />
          {{ actionLabel }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TemplateModel } from '@/data/types'
import { svImage } from '@/data/mock'
import IconBase from '@/components/ui/IconBase.vue'
import { QUESTION_ICON } from '@/lib/questionTypes'

const props = withDefaults(
  defineProps<{
    template: TemplateModel
    /** Ação principal — "Usar este modelo" na área logada, "Ver perguntas" no site. */
    actionLabel: string
    showCover?: boolean
  }>(),
  { showCover: true }
)

const emit = defineEmits<{ action: [] }>()

const { t } = useI18n()

const preview = computed(() => props.template.questions.slice(0, 4))
</script>
