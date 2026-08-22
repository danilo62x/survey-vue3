<template>
  <div class="surface-card rounded-2xl border p-5 shadow-theme-sm">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="truncate text-sm text-muted">{{ title }}</p>
        <p class="mt-2 text-title-sm font-bold text-heading">{{ value }}</p>
      </div>
      <span :class="`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${BG_MAP[accent]}`">
        <IconBase :name="icon" :size="20" :class-name="COLOR_MAP[accent]" />
      </span>
    </div>
    <p v-if="hint" class="mt-3 text-xs text-muted">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import IconBase from '@/components/ui/IconBase.vue'

type Accent = 'brand' | 'success' | 'warning' | 'error' | 'info'

withDefaults(
  defineProps<{
    title: string
    value: string | number
    icon: string
    accent?: Accent
    hint?: string
  }>(),
  { accent: 'brand' }
)

const BG_MAP: Record<Accent, string> = {
  brand: 'bg-brand-50 dark:bg-brand-500/15',
  success: 'bg-success-50 dark:bg-success-500/15',
  warning: 'bg-warning-50 dark:bg-warning-500/15',
  error: 'bg-error-50 dark:bg-error-500/15',
  info: 'bg-blue-light-50 dark:bg-blue-light-500/15',
}

const COLOR_MAP: Record<Accent, string> = {
  brand: 'text-brand-500',
  success: 'text-success-600',
  warning: 'text-warning-600',
  error: 'text-error-500',
  info: 'text-blue-light-500',
}
</script>
