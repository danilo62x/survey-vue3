<template>
  <div>
    <div class="mb-2 flex items-center justify-between text-xs text-muted">
      <span>{{ t('fill.step', { current, total }) }}</span>
      <span>{{ percent }}%</span>
    </div>
    <div
      class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
      role="progressbar"
      :aria-valuenow="percent"
      :aria-valuemin="0"
      :aria-valuemax="100"
    >
      <div
        class="h-full rounded-full transition-[width] duration-300"
        :style="{ width: `${Math.max(4, percent)}%`, backgroundColor: color }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

withDefaults(
  defineProps<{
    current: number
    total: number
    percent: number
    color?: string
  }>(),
  { color: '#465fff' }
)

const { t } = useI18n()
</script>
