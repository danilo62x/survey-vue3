<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-2" aria-label="Pagination">
    <button
      type="button"
      @click="$emit('change', page - 1)"
      :disabled="page <= 1"
      :class="`${btn} text-muted hover:text-heading`"
      aria-label="Previous"
    >
      <IconBase name="chevron-left" :size="16" />
    </button>
    <template v-for="(p, i) in pages" :key="typeof p === 'number' ? p : `gap-${i}`">
      <span v-if="p === '...'" class="px-1 text-muted">…</span>
      <button
        v-else
        type="button"
        @click="$emit('change', p)"
        :class="`${btn} ${p === page ? 'border-brand-500 bg-brand-500 text-white' : 'text-body hover:text-heading'}`"
      >
        {{ p }}
      </button>
    </template>
    <button
      type="button"
      @click="$emit('change', page + 1)"
      :disabled="page >= totalPages"
      :class="`${btn} text-muted hover:text-heading`"
      aria-label="Next"
    >
      <IconBase name="chevron-right" :size="16" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconBase from './IconBase.vue'

const props = defineProps<{
  page: number
  totalPages: number
}>()
defineEmits<{ (e: 'change', page: number): void }>()

const btn =
  'flex h-10 min-w-10 items-center justify-center rounded-lg border border-themed px-3 text-sm font-medium transition disabled:opacity-40'

const pages = computed(() => {
  const out: (number | '...')[] = []
  for (let i = 1; i <= props.totalPages; i++) {
    if (i === 1 || i === props.totalPages || (i >= props.page - 1 && i <= props.page + 1)) {
      out.push(i)
    } else if (out[out.length - 1] !== '...') {
      out.push('...')
    }
  }
  return out
})
</script>
