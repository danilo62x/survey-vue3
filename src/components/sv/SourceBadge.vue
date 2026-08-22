<template>
  <Badge color="gray" :icon="SOURCE_ICON[source]">{{ t(`sources.${source}`) }}</Badge>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Badge from '@/components/ui/Badge.vue'
import type { ResponseSource } from '@/data/types'

defineProps<{ source: ResponseSource }>()

const { t } = useI18n()

const SOURCE_ICON: Record<ResponseSource, string> = {
  link: 'link',
  email: 'mail',
  qr: 'qr',
  incorporado: 'code',
}
</script>
