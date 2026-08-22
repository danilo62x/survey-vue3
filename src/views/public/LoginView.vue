<template>
  <AuthShell :title="t('auth.loginTitle')" :subtitle="t('auth.loginSubtitle')">
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div>
        <label class="mb-2 block text-sm font-medium text-heading" for="email">{{ t('auth.email') }}</label>
        <div class="relative">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconBase name="mail" :size="18" />
          </span>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="pesquisa@sondagem.com"
            class="focus-ring h-11 w-full rounded-lg border border-themed bg-gray-50 pl-10 pr-3 text-sm text-body outline-none focus:border-brand-300 dark:bg-gray-900"
          />
        </div>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-heading" for="password">{{ t('auth.password') }}</label>
        <div class="relative">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconBase name="lock" :size="18" />
          </span>
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="••••••••"
            class="focus-ring h-11 w-full rounded-lg border border-themed bg-gray-50 pl-10 pr-10 text-sm text-body outline-none focus:border-brand-300 dark:bg-gray-900"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            @click="showPassword = !showPassword"
          >
            <IconBase :name="showPassword ? 'eye-off' : 'eye'" :size="18" />
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between text-sm">
        <label class="flex items-center gap-2 text-body">
          <input v-model="remember" type="checkbox" class="h-4 w-4 rounded border-themed accent-brand-500" />
          {{ t('auth.remember') }}
        </label>
        <span class="font-medium text-brand-500">{{ t('auth.forgot') }}</span>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="focus-ring flex h-11 w-full items-center justify-center rounded-lg bg-brand-500 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span v-if="loading" class="flex items-center gap-2">
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {{ t('auth.loggingIn') }}
        </span>
        <template v-else>{{ t('auth.loginCta') }}</template>
      </button>

      <p
        v-if="error"
        class="rounded-lg bg-error-50 px-4 py-2 text-center text-sm text-error-600 dark:bg-error-500/15 dark:text-error-500"
      >
        {{ error }}
      </p>
    </form>

    <div
      class="mt-6 rounded-lg border border-dashed border-themed bg-gray-50/60 p-3 text-xs text-muted dark:bg-gray-900/40"
    >
      <p class="font-medium text-body">{{ t('auth.demoTitle') }}</p>
      <p>{{ DEMO_CREDENTIALS.email }} / {{ DEMO_CREDENTIALS.password }}</p>
      <p class="mt-0.5">{{ t('auth.demoHint') }}</p>
    </div>

    <template #footer>
      {{ t('auth.noAccount') }}
      <RouterLink to="/registro" class="font-medium text-brand-500 hover:text-brand-600">
        {{ t('auth.registerCta') }}
      </RouterLink>
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useAuthStore, DEMO_CREDENTIALS } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import IconBase from '@/components/ui/IconBase.vue'
import AuthShell from '@/components/layout/AuthShell.vue'

const { t } = useI18n()
usePageTitle(() => t('auth.loginTitle'))

const email = ref(DEMO_CREDENTIALS.email)
const password = ref(DEMO_CREDENTIALS.password)
const showPassword = ref(false)
const remember = ref(true)
const loading = ref(false)
const error = ref('')

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()
const route = useRoute()

async function handleSubmit() {
  error.value = ''
  loading.value = true
  const ok = await auth.login(email.value, password.value)
  loading.value = false
  if (!ok) {
    error.value = t('auth.loginError')
    return
  }
  ui.notifySuccess(t('auth.loginSuccess'))
  router.push((route.query.redirect as string) || '/app')
}
</script>
