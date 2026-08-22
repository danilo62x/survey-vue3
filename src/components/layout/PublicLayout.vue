<template>
  <div class="flex min-h-screen flex-col overflow-x-hidden" :style="{ backgroundColor: 'var(--tx-body-bg)' }">
    <PublicNavbar />
    <main class="flex-1">
      <RouterView />
    </main>
    <PublicFooter />
    <ToastStack />
    <CookieBanner />
  </div>
</template>

<script setup lang="ts">
import PublicNavbar from './PublicNavbar.vue'
import PublicFooter from './PublicFooter.vue'
import ToastStack from '@/components/ui/ToastStack.vue'
import CookieBanner from '@/components/ui/CookieBanner.vue'
</script>
