<template>
  <div class="inline-flex items-center rounded-lg border border-themed">
    <button
      type="button"
      :disabled="value <= min"
      aria-label="-"
      :class="`${dim} flex items-center justify-center text-muted transition hover:text-heading disabled:opacity-40`"
      @click="emit('change', Math.max(min, value - 1))"
    >
      <IconBase name="minus" :size="16" />
    </button>
    <span :class="`min-w-8 text-center text-sm font-medium text-heading ${size === 'sm' ? '' : 'min-w-10'}`">
      {{ value }}
    </span>
    <button
      type="button"
      :disabled="value >= max"
      aria-label="+"
      :class="`${dim} flex items-center justify-center text-muted transition hover:text-heading disabled:opacity-40`"
      @click="emit('change', Math.min(max, value + 1))"
    >
      <IconBase name="plus" :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconBase from './IconBase.vue'

const props = withDefaults(
  defineProps<{
    value: number
    min?: number
    max?: number
    size?: 'sm' | 'md'
  }>(),
  { min: 1, max: 99, size: 'md' }
)

const emit = defineEmits<{ change: [val: number] }>()

const dim = computed(() => (props.size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'))
</script>
