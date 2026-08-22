<template>
  <div
    class="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4 py-10 dark:from-gray-900 dark:via-gray-dark dark:to-gray-900"
  >
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <div class="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-500/10" />
      <div class="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-warning-100/60 blur-3xl dark:bg-brand-700/10" />
    </div>

    <div class="w-full max-w-md">
      <div class="mb-6 flex flex-col items-center">
        <RouterLink
          to="/"
          class="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-theme-md"
        >
          <IconBase name="clipboard-list" :size="26" />
        </RouterLink>
        <h1 class="mt-5 text-center text-title-sm font-bold text-heading">{{ title }}</h1>
        <p class="mt-2 text-center text-sm text-muted">{{ subtitle }}</p>
      </div>

      <div class="surface-card rounded-2xl border p-6 shadow-theme-md md:p-8"><slot /></div>

      <p v-if="$slots.footer" class="mt-6 text-center text-sm text-muted"><slot name="footer" /></p>

      <p class="mt-6 text-center text-xs text-muted">
        <RouterLink to="/" class="hover:text-brand-500">← {{ t('brand') }}</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import IconBase from '@/components/ui/IconBase.vue'

defineProps<{
  title: string
  subtitle: string
}>()

const { t } = useI18n()
</script>
