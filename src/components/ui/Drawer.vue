<template>
  <Teleport to="body">
    <div :class="`fixed inset-0 z-[70] ${open ? '' : 'pointer-events-none'}`" :aria-hidden="!open">
      <div
        :class="`absolute inset-0 bg-gray-900/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`"
        @click="emit('close')"
      />
      <aside
        :class="`surface-card absolute right-0 top-0 flex h-full w-full ${width} flex-col border-l shadow-theme-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`"
        role="dialog"
        :aria-label="title"
      >
        <div class="flex items-start justify-between border-b border-themed px-5 py-4">
          <div>
            <h2 v-if="title" class="text-lg font-semibold text-heading">{{ title }}</h2>
            <p v-if="subtitle" class="mt-0.5 text-xs text-muted">{{ subtitle }}</p>
          </div>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:text-heading"
            aria-label="Fechar"
            @click="emit('close')"
          >
            <IconBase name="x" :size="20" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-5 py-4"><slot /></div>
        <div v-if="$slots.footer" class="border-t border-themed px-5 py-4"><slot name="footer" /></div>
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import IconBase from './IconBase.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    subtitle?: string
    width?: string
  }>(),
  { width: 'max-w-md' }
)

const emit = defineEmits<{ close: [] }>()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) document.addEventListener('keydown', onKey)
    else document.removeEventListener('keydown', onKey)
  }
)

onUnmounted(() => document.removeEventListener('keydown', onKey))
</script>
