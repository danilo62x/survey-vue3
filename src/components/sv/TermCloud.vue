<template>
  <p v-if="terms.length === 0 && samples.length === 0" class="text-sm text-muted">{{ t('results.noAnswers') }}</p>

  <div v-else>
    <template v-if="terms.length > 0">
      <p class="text-xs font-medium tracking-wide text-muted uppercase">{{ t('results.topTerms') }}</p>
      <div class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="term in terms"
          :key="term.term"
          class="inline-flex items-center gap-1.5 rounded-full border border-themed px-3 py-1"
          :style="{
            fontSize: `${12 + Math.round((term.count / max) * 5)}px`,
            backgroundColor: `rgba(70, 95, 255, ${0.06 + (term.count / max) * 0.16})`,
          }"
        >
          <span class="text-body">{{ term.term }}</span>
          <span class="text-xs tabular-nums text-muted">{{ term.count }}</span>
        </span>
      </div>
    </template>

    <template v-if="samples.length > 0">
      <p class="mt-6 text-xs font-medium tracking-wide text-muted uppercase">{{ t('results.samples') }}</p>
      <ul class="mt-3 flex flex-col gap-2">
        <li
          v-for="(sample, i) in samples"
          :key="`${sample}-${i}`"
          class="rounded-xl border border-themed px-4 py-3 text-sm break-words text-body"
        >
          “{{ sample }}”
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TermCount } from '@/data/types'

const props = defineProps<{
  terms: TermCount[]
  samples: string[]
}>()

const { t } = useI18n()

const max = computed(() => Math.max(...props.terms.map((term) => term.count), 1))
</script>
