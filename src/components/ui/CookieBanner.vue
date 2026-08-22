<template>
  <div v-if="ui.showCookieBanner" class="fixed inset-x-0 bottom-0 z-[60] p-4">
    <div class="surface-card mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border p-5 shadow-theme-xl sm:flex-row sm:items-center">
      <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15">
        <IconBase name="cookie" :size="22" />
      </span>
      <div class="flex-1">
        <p class="text-sm font-semibold text-heading">{{ t('cookie.title') }}</p>
        <p class="mt-0.5 text-xs text-muted">
          {{ t('cookie.desc') }}
          <a href="#" class="font-medium text-brand-500 hover:text-brand-600">{{ t('cookie.policy') }}</a>
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <button
          type="button"
          class="focus-ring rounded-lg border border-themed px-4 py-2 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
          @click="ui.declineCookies()"
        >
          {{ t('cookie.decline') }}
        </button>
        <button
          type="button"
          class="focus-ring rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          @click="ui.acceptCookies()"
        >
          {{ t('cookie.accept') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/ui'
import IconBase from './IconBase.vue'

const { t } = useI18n()
const ui = useUiStore()

onMounted(() => {
  if (!ui.cookiesAccepted) {
    setTimeout(() => ui.openCookieBanner(), 800)
  }
})
</script>
