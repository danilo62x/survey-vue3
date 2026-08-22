<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    @click="!disabled && $emit('update:modelValue', !modelValue)"
    :class="[
      'relative inline-flex shrink-0 items-center rounded-full transition',
      sizeClass,
      modelValue ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700',
      disabled ? 'cursor-not-allowed opacity-50' : '',
    ]"
  >
    <span
      :class="[
        'inline-block transform rounded-full bg-white shadow-theme-xs transition',
        thumbSize,
        modelValue ? activeTranslate : 'translate-x-1',
      ]"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    size?: 'sm' | 'md'
    disabled?: boolean
  }>(),
  { size: 'md', disabled: false }
)
defineEmits<{ (e: 'update:modelValue', val: boolean): void }>()

const sizeClass = computed(() => (props.size === 'sm' ? 'h-5 w-9' : 'h-6 w-11'))
const thumbSize = computed(() => (props.size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'))
const activeTranslate = computed(() => (props.size === 'sm' ? 'translate-x-4' : 'translate-x-5'))
</script>
