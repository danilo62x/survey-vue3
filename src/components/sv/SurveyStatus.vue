<template>
  <Badge :color="STATUS_COLOR[status]" dot>{{ t(`statuses.${status}`) }}</Badge>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Badge from '@/components/ui/Badge.vue'
import type { FormStatus } from '@/data/types'

defineProps<{ status: FormStatus }>()

const { t } = useI18n()

const STATUS_COLOR: Record<FormStatus, 'brand' | 'success' | 'warning' | 'gray'> = {
  rascunho: 'warning',
  publicado: 'success',
  encerrado: 'gray',
}
</script>
