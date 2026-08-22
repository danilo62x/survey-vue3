<template>
  <article
    class="surface-card flex flex-col overflow-hidden rounded-2xl border shadow-theme-sm transition hover:shadow-theme-md"
  >
    <RouterLink :to="`/app/formularios/${stats.survey.id}`" class="relative block h-32 overflow-hidden">
      <img
        :src="svImage(stats.survey.coverSeed, 640, 320)"
        alt=""
        loading="lazy"
        class="h-full w-full object-cover transition duration-300 hover:scale-105"
      />
      <span class="absolute top-3 left-3">
        <SurveyStatus :status="stats.survey.status" />
      </span>
    </RouterLink>

    <div class="flex min-w-0 flex-1 flex-col p-5">
      <h3 class="text-base font-semibold break-words text-heading">{{ stats.survey.title }}</h3>
      <p class="mt-1.5 line-clamp-2 text-sm text-muted">{{ stats.survey.description }}</p>

      <dl class="mt-4 grid grid-cols-3 gap-2 text-center">
        <div class="min-w-0 rounded-lg bg-gray-50 px-2 py-2 dark:bg-gray-800/60">
          <dt class="truncate text-[11px] text-muted">{{ t('forms.responses') }}</dt>
          <dd class="text-sm font-semibold text-heading">{{ stats.responses }}</dd>
        </div>
        <div class="min-w-0 rounded-lg bg-gray-50 px-2 py-2 dark:bg-gray-800/60">
          <dt class="truncate text-[11px] text-muted">{{ t('forms.completion') }}</dt>
          <dd class="text-sm font-semibold text-heading">{{ Math.round(stats.completionRate * 100) }}%</dd>
        </div>
        <div class="min-w-0 rounded-lg bg-gray-50 px-2 py-2 dark:bg-gray-800/60">
          <dt class="truncate text-[11px] text-muted">{{ t('forms.nps') }}</dt>
          <dd class="text-sm font-semibold text-heading">{{ stats.nps === null ? '—' : stats.nps }}</dd>
        </div>
      </dl>

      <div class="mt-5 flex flex-wrap items-center gap-2">
        <RouterLink
          :to="`/app/formularios/${stats.survey.id}`"
          class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-themed px-3 text-xs font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <IconBase name="edit" :size="14" />
          {{ t('forms.edit') }}
        </RouterLink>
        <RouterLink
          :to="`/app/formularios/${stats.survey.id}/respostas`"
          class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-themed px-3 text-xs font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <IconBase name="chart" :size="14" />
          {{ t('forms.results') }}
        </RouterLink>
        <RouterLink
          v-if="stats.survey.status === 'publicado'"
          :to="`/f/${stats.survey.slug}`"
          class="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-brand-600 transition hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
        >
          <IconBase name="external-link" :size="14" />
          {{ t('forms.open') }}
        </RouterLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { SurveyStats } from '@/data/types'
import { svImage } from '@/data/mock'
import IconBase from '@/components/ui/IconBase.vue'
import SurveyStatus from './SurveyStatus.vue'

defineProps<{ stats: SurveyStats }>()

const { t } = useI18n()
</script>
