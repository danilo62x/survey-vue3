<template>
  <footer class="surface-header border-t px-4 py-4 md:px-6 2xl:px-10">
    <div class="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
      <p class="text-xs text-muted">© {{ year }} {{ t('brand') }}. {{ t('landing.footer.rights') }}</p>
      <div class="flex items-center gap-4 text-xs text-muted">
        <a href="#" class="hover:text-brand-500">{{ t('landing.footer.docs') }}</a>
        <a href="#" class="hover:text-brand-500">{{ t('landing.footer.help') }}</a>
        <a href="#" class="hover:text-brand-500">{{ t('landing.footer.privacy') }}</a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const year = new Date().getFullYear()
</script>
