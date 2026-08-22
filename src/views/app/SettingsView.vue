<template>
  <PageHeader :title="t('settings.title')" :subtitle="t('settings.subtitle')" />

  <Tabs v-model="tab" :tabs="tabItems">
    <!-- Perfil -->
    <div v-if="tab === 0" class="surface-card max-w-2xl rounded-2xl border p-5 md:p-6">
      <h2 class="text-base font-semibold text-heading">{{ t('settings.profile.title') }}</h2>
      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label :class="label" for="p-name">{{ t('settings.profile.name') }}</label>
          <input id="p-name" v-model="name" :class="control" />
        </div>
        <div>
          <label :class="label" for="p-email">{{ t('settings.profile.email') }}</label>
          <input id="p-email" v-model="email" type="email" :class="control" />
        </div>
        <div class="sm:col-span-2">
          <label :class="label" for="p-role">{{ t('settings.profile.role') }}</label>
          <input id="p-role" v-model="role" :class="control" />
        </div>
      </div>
      <button
        type="button"
        class="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"
        @click="saveProfile"
      >
        <IconBase name="check" :size="16" />
        {{ t('common.save') }}
      </button>
    </div>

    <!-- Organização -->
    <div v-else-if="tab === 1" class="surface-card max-w-2xl rounded-2xl border p-5 md:p-6">
      <h2 class="text-base font-semibold text-heading">{{ t('settings.org.title') }}</h2>
      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label :class="label" for="o-name">{{ t('settings.org.name') }}</label>
          <input id="o-name" v-model="org" :class="control" />
        </div>
        <div>
          <label :class="label" for="o-domain">{{ t('settings.org.domain') }}</label>
          <input id="o-domain" v-model="domain" :class="control" />
        </div>
      </div>
      <p class="mt-3 text-xs text-muted">{{ t('settings.org.domainHint') }}</p>
      <button
        type="button"
        class="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"
        @click="saveOrg"
      >
        <IconBase name="check" :size="16" />
        {{ t('common.save') }}
      </button>
    </div>

    <!-- Notificações -->
    <div v-else-if="tab === 2" class="surface-card max-w-2xl rounded-2xl border p-5 md:p-6">
      <h2 class="text-base font-semibold text-heading">{{ t('settings.notifications.title') }}</h2>
      <ul class="mt-5 flex flex-col gap-3">
        <li
          v-for="item in notificationItems"
          :key="item.key"
          class="flex items-center justify-between gap-4 rounded-xl border border-themed px-4 py-3"
        >
          <div class="min-w-0">
            <p class="text-sm font-medium text-heading">{{ t(`settings.notifications.${item.key}`) }}</p>
            <p class="text-xs text-muted">{{ t(`settings.notifications.${item.key}Desc`) }}</p>
          </div>
          <SwitchToggle :model-value="item.value" @update:model-value="item.set" />
        </li>
      </ul>
    </div>

    <!-- Aparência -->
    <div v-else class="flex max-w-2xl flex-col gap-6">
      <div class="surface-card rounded-2xl border p-5 md:p-6">
        <h2 class="text-base font-semibold text-heading">{{ t('settings.tabs.appearance') }}</h2>
        <div class="mt-5 flex items-center justify-between gap-4 rounded-xl border border-themed px-4 py-3">
          <div class="min-w-0">
            <p class="text-sm font-medium text-heading">{{ t('settings.appearance.dark') }}</p>
            <p class="text-xs text-muted">{{ t('settings.appearance.darkDesc') }}</p>
          </div>
          <SwitchToggle :model-value="ui.darkMode" @update:model-value="(v: boolean) => ui.setDarkMode(v)" />
        </div>

        <div class="mt-5">
          <label :class="label" for="lang">{{ t('settings.appearance.language') }}</label>
          <select
            id="lang"
            :value="locale"
            :class="control"
            @change="setLanguage(($event.target as HTMLSelectElement).value as LanguageCode)"
          >
            <option v-for="lang in LANGUAGES" :key="lang.code" :value="lang.code">
              {{ lang.flag }} {{ lang.label }}
            </option>
          </select>
          <p class="mt-1.5 text-xs text-muted">{{ t('settings.appearance.languageHint') }}</p>
        </div>
      </div>

      <div class="rounded-2xl border border-dashed border-themed p-5 md:p-6">
        <h2 class="text-base font-semibold text-heading">{{ t('settings.reset.title') }}</h2>
        <p class="mt-1 text-sm text-muted">{{ t('settings.reset.desc') }}</p>
        <button
          type="button"
          class="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-themed px-4 text-sm font-medium text-body transition hover:bg-gray-50 dark:hover:bg-gray-800"
          @click="onReset"
        >
          <IconBase name="refresh-cw" :size="16" />
          {{ t('settings.reset.action') }}
        </button>
      </div>
    </div>
  </Tabs>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/app/PageHeader.vue'
import Tabs from '@/components/ui/Tabs.vue'
import SwitchToggle from '@/components/ui/SwitchToggle.vue'
import IconBase from '@/components/ui/IconBase.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useSurveyStore } from '@/stores/survey'
import { LANGUAGES, setLanguage, type LanguageCode } from '@/i18n'

const label = 'mb-1.5 block text-sm font-medium text-heading'
const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3.5 py-2.5 text-sm text-body'

const { t, locale } = useI18n()
usePageTitle(() => t('settings.title'))

const auth = useAuthStore()
const ui = useUiStore()
const store = useSurveyStore()

const tab = ref(0)
const name = ref(auth.user?.name ?? '')
const email = ref(auth.user?.email ?? '')
const role = ref(auth.user?.role ?? '')
const org = ref(auth.user?.organization ?? 'Sondagem')
const domain = ref('sondagem.com')
const weekly = ref(true)
const closing = ref(true)

const tabItems = computed(() => [
  { label: t('settings.tabs.profile'), icon: 'user' },
  { label: t('settings.tabs.org'), icon: 'briefcase' },
  { label: t('settings.tabs.notifications'), icon: 'bell' },
  { label: t('settings.tabs.appearance'), icon: 'palette' },
])

const notificationItems = computed(() => [
  {
    key: 'response',
    value: ui.notifyOnResponse,
    set: (v: boolean) => {
      ui.setNotifyOnResponse(v)
      ui.notifySuccess(t('settings.saved'))
    },
  },
  { key: 'weekly', value: weekly.value, set: (v: boolean) => (weekly.value = v) },
  { key: 'closing', value: closing.value, set: (v: boolean) => (closing.value = v) },
])

function saveProfile() {
  auth.updateProfile({ name: name.value, email: email.value, role: role.value })
  ui.notifySuccess(t('settings.profile.saved'))
}

function saveOrg() {
  auth.updateProfile({ organization: org.value })
  ui.notifySuccess(t('settings.org.saved'))
}

function onReset() {
  store.reset()
  ui.notifySuccess(t('settings.reset.done'))
}
</script>
