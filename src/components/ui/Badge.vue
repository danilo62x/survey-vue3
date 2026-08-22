<template>
  <span :class="`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles}`">
    <span v-if="dot" :class="`h-1.5 w-1.5 rounded-full ${variant === 'solid' ? 'bg-white' : DOT[color]}`" />
    <IconBase v-if="icon" :name="icon" :size="12" :stroke-width="2.2" />
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconBase from './IconBase.vue'

type Color = 'brand' | 'success' | 'warning' | 'error' | 'gray'
type Variant = 'soft' | 'solid'

const props = withDefaults(
  defineProps<{
    color?: Color
    variant?: Variant
    icon?: string
    dot?: boolean
  }>(),
  { color: 'brand', variant: 'soft', dot: false }
)

const SOFT: Record<Color, string> = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
  success: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500',
  error: 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

const SOLID: Record<Color, string> = {
  brand: 'bg-brand-500 text-white',
  success: 'bg-success-500 text-white',
  warning: 'bg-warning-500 text-white',
  error: 'bg-error-500 text-white',
  gray: 'bg-gray-500 text-white',
}

const DOT: Record<Color, string> = {
  brand: 'bg-brand-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  gray: 'bg-gray-400',
}

const styles = computed(() => (props.variant === 'solid' ? SOLID[props.color] : SOFT[props.color]))
</script>
