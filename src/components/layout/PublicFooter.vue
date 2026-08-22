<template>
  <footer class="surface-card border-t border-themed">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="flex flex-col items-start justify-between gap-8 lg:flex-row">
        <div class="max-w-sm">
          <RouterLink to="/" class="flex items-center gap-2.5">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
              <IconBase name="clipboard-list" :size="18" />
            </span>
            <span class="text-lg font-bold text-heading">{{ t('brand') }}</span>
          </RouterLink>
          <p class="mt-4 text-sm text-muted">{{ t('landing.footer.tagline') }}</p>
        </div>
        <div class="flex min-w-0 flex-wrap gap-x-10 gap-y-2 text-sm">
          <RouterLink to="/" class="text-muted transition hover:text-brand-600">{{ t('nav.home') }}</RouterLink>
          <RouterLink to="/modelos" class="text-muted transition hover:text-brand-600">
            {{ t('nav.templates') }}
          </RouterLink>
          <RouterLink
            v-for="survey in published"
            :key="survey.id"
            :to="`/f/${survey.slug}`"
            class="max-w-[16rem] truncate text-muted transition hover:text-brand-600"
          >
            {{ survey.title }}
          </RouterLink>
          <RouterLink to="/contato" class="text-muted transition hover:text-brand-600">
            {{ t('nav.contact') }}
          </RouterLink>
        </div>
      </div>
      <div class="mt-10 flex flex-col items-center justify-between gap-4 border-t border-themed pt-6 sm:flex-row">
        <p class="text-xs text-muted">© {{ year }} {{ t('brand') }}. {{ t('landing.footer.rights') }}</p>
        <div class="flex items-center gap-3">
          <a
            v-for="icon in SOCIAL"
            :key="icon"
            href="#"
            :aria-label="icon"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-themed text-muted transition hover:text-brand-500"
          >
            <IconBase :name="icon" :size="16" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import IconBase from '@/components/ui/IconBase.vue'
import { useSurveyStore } from '@/stores/survey'

const SOCIAL = ['github', 'slack', 'globe']

const { t } = useI18n()
const store = useSurveyStore()
const year = new Date().getFullYear()

const published = computed(() => store.surveys.filter((s) => s.status === 'publicado').slice(0, 3))
</script>
