<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm"
      @click="onBackdrop"
    >
      <div :class="`surface-card relative w-full overflow-hidden rounded-2xl border shadow-theme-xl ${SIZE_MAP[size]}`">
        <header v-if="title || subtitle || closable" class="flex items-center justify-between border-b border-themed px-5 py-4">
          <div>
            <h3 v-if="title" class="text-base font-semibold text-heading">{{ title }}</h3>
            <p v-if="subtitle" class="mt-0.5 text-xs text-muted">{{ subtitle }}</p>
          </div>
          <button
            v-if="closable"
            type="button"
            aria-label="Fechar"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            @click="emit('close')"
          >
            <IconBase name="x" :size="20" />
          </button>
        </header>
        <div class="px-5 py-5"><slot /></div>
        <footer v-if="$slots.footer" class="flex items-center justify-end gap-2 border-t border-themed px-5 py-3">
          <slot name="footer" :close="() => emit('close')" />
        </footer>
      </div>
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
    size?: 'sm' | 'md' | 'lg' | 'xl'
    closable?: boolean
  }>(),
  { size: 'md', closable: true }
)

const emit = defineEmits<{ close: [] }>()

const SIZE_MAP = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' } as const

function onBackdrop(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', onKey)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }
)

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKey)
})
</script>
