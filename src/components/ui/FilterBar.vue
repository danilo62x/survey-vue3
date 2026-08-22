<template>
  <div class="surface-card mb-5 flex flex-col gap-3 rounded-xl border p-4 lg:flex-row lg:items-center">
    <div v-if="searchable" class="relative w-full lg:max-w-xs">
      <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
        <IconBase name="search" :size="16" />
      </span>
      <input
        :value="search"
        :placeholder="searchPlaceholder"
        class="focus-ring w-full rounded-lg border border-themed bg-transparent py-2 pr-3 pl-9 text-sm text-body"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <div v-if="$slots.default" class="flex flex-wrap items-center gap-3"><slot /></div>
    <div v-if="$slots.action" class="lg:ml-auto"><slot name="action" /></div>
  </div>
</template>

<script setup lang="ts">
import IconBase from './IconBase.vue'

withDefaults(
  defineProps<{
    search?: string
    searchPlaceholder?: string
    searchable?: boolean
  }>(),
  { search: '', searchable: true }
)

const emit = defineEmits<{ 'update:search': [value: string] }>()
</script>
