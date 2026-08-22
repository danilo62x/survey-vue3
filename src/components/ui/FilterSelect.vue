<template>
  <label class="flex items-center gap-2 text-sm text-muted">
    <span v-if="label" class="whitespace-nowrap">{{ label }}</span>
    <select
      :value="value"
      class="focus-ring rounded-lg border border-themed bg-transparent px-3 py-2 text-sm text-body"
      @change="emit('update:value', ($event.target as HTMLSelectElement).value)"
    >
      <slot />
    </select>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  value: string
  label?: string
}>()

const emit = defineEmits<{ 'update:value': [value: string] }>()
</script>
