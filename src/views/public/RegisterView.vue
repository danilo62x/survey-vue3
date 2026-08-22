<template>
  <AuthShell :title="t('auth.registerTitle')" :subtitle="t('auth.registerSubtitle')">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="mb-2 block text-sm font-medium text-heading">{{ t('auth.name') }}</label>
        <input v-model="name" required :class="input" />
      </div>
      <div>
        <label class="mb-2 block text-sm font-medium text-heading">{{ t('auth.organization') }}</label>
        <input v-model="org" :class="input" />
      </div>
      <div>
        <label class="mb-2 block text-sm font-medium text-heading">{{ t('auth.email') }}</label>
        <input v-model="email" required type="email" :class="input" />
      </div>
      <div>
        <label class="mb-2 block text-sm font-medium text-heading">{{ t('auth.password') }}</label>
        <input v-model="password" required type="password" placeholder="••••••••" :class="input" />
      </div>
      <label class="flex items-center gap-2 text-sm text-body">
        <input v-model="accepted" type="checkbox" required class="h-4 w-4 rounded border-themed accent-brand-500" />
        {{ t('auth.terms') }}
      </label>
      <button
        type="submit"
        :disabled="loading"
        class="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        <template v-else>
          <IconBase name="check" :size="18" />
          {{ t('auth.registerCta') }}
        </template>
      </button>
    </form>

    <template #footer>
      {{ t('auth.hasAccount') }}
      <RouterLink to="/login" class="font-medium text-brand-500 hover:text-brand-600">
        {{ t('auth.loginLink') }}
      </RouterLink>
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePageTitle } from '@/composables/usePageTitle'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import IconBase from '@/components/ui/IconBase.vue'
import AuthShell from '@/components/layout/AuthShell.vue'

const { t } = useI18n()
usePageTitle(() => t('auth.registerTitle'))

const name = ref('')
const org = ref('')
const email = ref('')
const password = ref('')
const accepted = ref(false)
const loading = ref(false)

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

const input =
  'focus-ring h-11 w-full rounded-lg border border-themed bg-gray-50 px-3 text-sm text-body outline-none focus:border-brand-300 dark:bg-gray-900'

async function handleSubmit() {
  loading.value = true
  const ok = await auth.register(name.value, email.value, password.value)
  loading.value = false
  if (ok) {
    ui.notifySuccess(t('auth.registerSuccess'))
    router.push('/app')
  }
}
</script>
