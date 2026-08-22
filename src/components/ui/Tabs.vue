<template>
  <div>
    <div class="flex gap-1 overflow-x-auto border-b border-themed no-scrollbar" role="tablist">
      <button
        v-for="(t, i) in tabs"
        :key="t.label"
        type="button"
        role="tab"
        :aria-selected="modelValue === i"
        @click="$emit('update:modelValue', i)"
        :class="[
          '-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition',
          modelValue === i
            ? 'border-brand-500 text-brand-600 dark:text-brand-400'
            : 'border-transparent text-muted hover:border-gray-300 hover:text-body dark:hover:border-gray-700',
        ]"
      >
        <IconBase v-if="t.icon" :name="t.icon" :size="16" />
        {{ t.label }}
      </button>
    </div>
    <div class="pt-5 text-sm text-body" role="tabpanel">
      <slot :index="modelValue" />
    </div>
  </div>
</template>

<script setup lang="ts">
import IconBase from './IconBase.vue'

export interface TabItem {
  label: string
  icon?: string
}

defineProps<{
  tabs: TabItem[]
  modelValue: number
}>()
defineEmits<{ (e: 'update:modelValue', idx: number): void }>()
</script>
