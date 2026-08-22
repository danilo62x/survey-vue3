<template>
  <Badge color="brand" :icon="QUESTION_ICON[type]">{{ t(`questionTypes.${type}`) }}</Badge>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Badge from '@/components/ui/Badge.vue'
import type { QuestionType } from '@/data/types'
import { QUESTION_ICON } from '@/lib/questionTypes'

defineProps<{ type: QuestionType }>()

const { t } = useI18n()
</script>
