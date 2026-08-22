<template>
  <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <div v-if="crumbs && crumbs.length > 0" class="mb-2">
        <Breadcrumb :items="crumbs" />
      </div>
      <h1 class="text-2xl font-bold text-heading">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-sm text-muted">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.action" class="shrink-0"><slot name="action" /></div>
  </div>
</template>

<script setup lang="ts">
import Breadcrumb, { type Crumb } from '@/components/ui/Breadcrumb.vue'

defineProps<{
  title: string
  subtitle?: string
  crumbs?: Crumb[]
}>()
</script>
