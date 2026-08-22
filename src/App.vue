<template>
  <PublicLayout v-if="layout === 'public'" />
  <AppLayout v-else-if="layout === 'app'" />
  <template v-else>
    <RouterView />
    <ToastStack />
    <CookieBanner />
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import PublicLayout from '@/components/layout/PublicLayout.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import ToastStack from '@/components/ui/ToastStack.vue'
import CookieBanner from '@/components/ui/CookieBanner.vue'

const route = useRoute()
const { init } = useTheme()

const layout = computed(() => (route.meta.layout as string) ?? 'public')

onMounted(() => {
  init()
  document.title = 'Sondagem — Pesquisas & Formulários'
})
</script>
