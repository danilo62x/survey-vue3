<template>
  <div class="flex h-screen overflow-hidden" :style="{ backgroundColor: 'var(--tx-body-bg)' }">
    <AppSidebar />

    <div
      v-if="ui.sidebarMobileOpen"
      class="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      @click="ui.toggleSidebarMobile(false)"
    />

    <div class="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
      <AppHeader />
      <main class="flex-1">
        <div class="mx-auto w-full max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          <RouterView />
        </div>
      </main>
      <AppFooter />
    </div>

    <ToastStack />
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import ToastStack from '@/components/ui/ToastStack.vue'

const ui = useUiStore()
</script>
