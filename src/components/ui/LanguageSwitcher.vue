<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-full border border-themed text-base hover:bg-gray-50 dark:hover:bg-gray-800"
      aria-label="Language"
      :title="current.label"
      @click="open = !open"
    >
      <span aria-hidden>{{ current.flag }}</span>
    </button>
    <div v-if="open" class="surface-card absolute right-0 mt-3 w-44 rounded-xl border py-1 shadow-theme-lg">
      <button
        v-for="lang in LANGUAGES"
        :key="lang.code"
        type="button"
        :class="`flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${
          lang.code === current.code ? 'font-medium text-brand-600' : 'text-body'
        }`"
        @click="select(lang.code)"
      >
        <span aria-hidden>{{ lang.flag }}</span>
        {{ lang.label }}
        <IconBase v-if="lang.code === current.code" name="check" :size="14" class-name="ml-auto" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { LANGUAGES, setLanguage, type LanguageCode } from '@/i18n'
import IconBase from './IconBase.vue'

const { locale } = useI18n()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

const current = computed(() => LANGUAGES.find((l) => l.code === locale.value) ?? LANGUAGES[0])

function select(code: LanguageCode) {
  setLanguage(code)
  open.value = false
}

function onClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onClick))
onUnmounted(() => document.removeEventListener('click', onClick))
</script>
