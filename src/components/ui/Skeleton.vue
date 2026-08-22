<template>
  <div :class="`${base} ${shape} ${hasDims ? '' : defaults} ${className}`" :style="style" />
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'line' | 'circle' | 'rect'
    width?: string | number
    height?: string | number
    className?: string
  }>(),
  { variant: 'line', className: '' }
)

const base = 'animate-pulse bg-gray-200 dark:bg-gray-700'

const shape = computed(() =>
  props.variant === 'circle' ? 'rounded-full' : props.variant === 'rect' ? 'rounded-xl' : 'rounded-md'
)

const defaults = computed(() =>
  props.variant === 'circle' ? 'h-10 w-10' : props.variant === 'rect' ? 'h-24 w-full' : 'h-3.5 w-full'
)

const hasDims = computed(() => props.width != null || props.height != null)

const style = computed<CSSProperties>(() => {
  const s: CSSProperties = {}
  if (props.width != null) s.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  if (props.height != null) s.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  return s
})
</script>
