<template>
  <nav aria-label="Breadcrumb">
    <ol class="flex flex-wrap items-center gap-1.5 text-sm">
      <li v-for="(item, i) in items" :key="item.label" class="flex items-center gap-1.5">
        <RouterLink
          v-if="item.href && i !== items.length - 1"
          :to="item.href"
          class="inline-flex items-center gap-1.5 text-muted transition hover:text-brand-600 dark:hover:text-brand-400"
        >
          <IconBase v-if="item.icon" :name="item.icon" :size="15" />
          {{ item.label }}
        </RouterLink>
        <span
          v-else
          :aria-current="i === items.length - 1 ? 'page' : undefined"
          :class="`inline-flex items-center gap-1.5 ${i === items.length - 1 ? 'font-medium text-heading' : 'text-muted'}`"
        >
          <IconBase v-if="item.icon" :name="item.icon" :size="15" />
          {{ item.label }}
        </span>
        <IconBase v-if="i !== items.length - 1" name="chevron-right" :size="14" class-name="text-gray-400" />
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import IconBase from './IconBase.vue'

export interface Crumb {
  label: string
  href?: string
  icon?: string
}

defineProps<{ items: Crumb[] }>()
</script>
