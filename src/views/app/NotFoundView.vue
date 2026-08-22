<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center px-4 text-center"
    :style="{ backgroundColor: 'var(--tx-body-bg)' }"
  >
    <span
      class="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-500 dark:bg-brand-500/15"
    >
      <IconBase name="clipboard-list" :size="40" />
    </span>
    <p class="mt-8 text-title-lg font-bold text-heading">404</p>
    <h1 class="mt-2 text-xl font-semibold text-heading">{{ t('notFound.title') }}</h1>
    <p class="mt-2 max-w-md text-sm text-muted">{{ t('notFound.desc') }}</p>
    <RouterLink
      :to="isAuth ? '/app' : '/'"
      class="mt-8 flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-6 text-sm font-medium text-white transition hover:bg-brand-600"
    >
      <IconBase name="arrow-right" :size="16" />
      {{ isAuth ? t('notFound.back') : t('notFound.home') }}
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useAuthStore } from '@/stores/auth'
import IconBase from '@/components/ui/IconBase.vue'

const { t } = useI18n()
usePageTitle('404')

const auth = useAuthStore()
const isAuth = computed(() => auth.user !== null)
</script>
