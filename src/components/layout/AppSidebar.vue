<template>
  <aside
    :style="{ width: widthStyle }"
    :class="`surface-sidebar fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden border-r px-4 transition-[transform,width] duration-300 lg:static lg:translate-x-0 ${
      ui.sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'
    }`"
  >
    <div :class="`flex items-center pt-7 pb-6 ${ui.sidebarCollapsed ? 'justify-center' : 'justify-between'}`">
      <RouterLink to="/app" class="flex min-w-0 items-center gap-2.5">
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white shadow-theme-sm"
        >
          <IconBase name="clipboard-list" :size="18" />
        </span>
        <span v-if="!ui.sidebarCollapsed" data-brand-text class="truncate text-lg font-semibold">
          {{ t('brand') }}
        </span>
      </RouterLink>
      <button
        v-if="!ui.sidebarCollapsed"
        type="button"
        class="is-sidebar-inactive hidden h-8 w-8 items-center justify-center rounded-lg border border-themed lg:flex"
        :title="t('appNav.collapse')"
        @click="ui.toggleSidebar()"
      >
        <IconBase name="chevron-right" :size="14" class-name="rotate-180" />
      </button>
    </div>

    <div class="no-scrollbar flex flex-col gap-5 overflow-y-auto pb-4">
      <nav v-for="section in SECTIONS" :key="section.titleKey">
        <h3 v-if="!ui.sidebarCollapsed" class="mb-2 px-2 text-[11px] font-semibold tracking-wider uppercase">
          {{ t(section.titleKey) }}
        </h3>
        <ul class="flex flex-col gap-1">
          <li v-for="item in section.items" :key="item.to">
            <RouterLink
              :to="item.to"
              :class="navLinkClass(isActive(item))"
              :title="ui.sidebarCollapsed ? t(item.labelKey) : undefined"
              @click="ui.toggleSidebarMobile(false)"
            >
              <IconBase :name="item.icon" :size="20" />
              <span v-if="!ui.sidebarCollapsed" class="min-w-0 flex-1 truncate">{{ t(item.labelKey) }}</span>
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>

    <div class="mt-auto space-y-3 border-t border-themed py-4">
      <div v-if="!ui.sidebarCollapsed" class="rounded-xl bg-brand-50 p-4 dark:bg-brand-500/10">
        <p class="text-xs font-medium text-muted">{{ t('appNav.weekTitle') }}</p>
        <p class="mt-0.5 text-sm font-semibold text-heading">{{ t('appNav.weekDesc', { count: week }, week) }}</p>
        <RouterLink
          to="/app/formularios"
          class="mt-3 flex h-9 w-full items-center justify-center rounded-lg bg-brand-500 text-xs font-medium text-white transition hover:bg-brand-600"
        >
          {{ t('appNav.openForms') }}
        </RouterLink>
      </div>
      <button
        type="button"
        :class="navLinkClass(false)"
        :title="ui.sidebarCollapsed ? t('appNav.logout') : undefined"
        @click="handleLogout"
      >
        <IconBase name="logout" :size="20" />
        <span v-if="!ui.sidebarCollapsed">{{ t('appNav.logout') }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useSurveyStore } from '@/stores/survey'
import IconBase from '@/components/ui/IconBase.vue'

interface NavItem {
  to: string
  labelKey: string
  icon: string
  end?: boolean
}

const SECTIONS: { titleKey: string; items: NavItem[] }[] = [
  {
    titleKey: 'appNav.researchSection',
    items: [
      { to: '/app', labelKey: 'appNav.dashboard', icon: 'dashboard', end: true },
      { to: '/app/formularios', labelKey: 'appNav.forms', icon: 'clipboard-list' },
      { to: '/app/modelos', labelKey: 'appNav.templates', icon: 'layers' },
    ],
  },
  {
    titleKey: 'appNav.audienceSection',
    items: [{ to: '/app/contatos', labelKey: 'appNav.contacts', icon: 'users' }],
  },
  {
    titleKey: 'appNav.settingsSection',
    items: [{ to: '/app/configuracoes', labelKey: 'appNav.settings', icon: 'settings' }],
  },
]

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const ui = useUiStore()
const auth = useAuthStore()
const store = useSurveyStore()

const week = computed(() => {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return store.responses.filter((r) => new Date(r.at) >= weekAgo).length
})
const widthStyle = computed(() => (ui.sidebarCollapsed ? '90px' : '280px'))

function isActive(item: NavItem) {
  return item.end ? route.path === item.to : route.path.startsWith(item.to)
}

function navLinkClass(active: boolean) {
  return `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    ui.sidebarCollapsed ? 'justify-center' : ''
  } ${active ? 'is-sidebar-active' : 'is-sidebar-inactive'}`
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>
