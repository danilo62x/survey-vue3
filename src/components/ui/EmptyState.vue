<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <span class="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/15">
      <IconBase :name="icon" :size="28" />
    </span>
    <h3 class="mt-5 text-lg font-semibold text-heading">{{ title }}</h3>
    <p v-if="description" class="mt-2 max-w-sm text-sm text-muted">{{ description }}</p>
    <div v-if="$slots.action" class="mt-6"><slot name="action" /></div>
  </div>
</template>

<script setup lang="ts">
import IconBase from './IconBase.vue'

withDefaults(
  defineProps<{
    icon?: string
    title: string
    description?: string
  }>(),
  { icon: 'package' }
)
</script>
