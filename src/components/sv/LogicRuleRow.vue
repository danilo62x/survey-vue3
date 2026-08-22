<template>
  <!-- Uma regra: "se a resposta de X for Y, então ação sobre Z". -->
  <li class="surface-card rounded-xl border p-4">
    <div class="grid gap-3 lg:grid-cols-12">
      <div class="lg:col-span-4">
        <label class="mb-1 block text-xs font-medium text-muted">{{ t('logic.ifAnswer') }}</label>
        <select
          :value="rule.questionId"
          :class="control"
          @change="emit('change', { questionId: ($event.target as HTMLSelectElement).value, value: '' })"
        >
          <option v-for="(q, i) in questions" :key="q.id" :value="q.id">
            {{ i + 1 }}. {{ q.title || t('builder.untitledQuestion') }}
          </option>
        </select>
      </div>

      <div class="lg:col-span-2">
        <label class="mb-1 block text-xs font-medium text-muted">{{ t('logic.operator') }}</label>
        <select
          :value="rule.operator"
          :class="control"
          @change="emit('change', { operator: ($event.target as HTMLSelectElement).value as LogicOperator })"
        >
          <option v-for="op in OPERATORS" :key="op" :value="op">{{ t(`logic.operators.${op}`) }}</option>
        </select>
      </div>

      <div class="lg:col-span-2">
        <label class="mb-1 block text-xs font-medium text-muted">{{ t('logic.value') }}</label>
        <select
          v-if="source && source.choices.length > 0 && (rule.operator === 'igual' || rule.operator === 'diferente')"
          :value="rule.value"
          :class="control"
          @change="emit('change', { value: ($event.target as HTMLSelectElement).value })"
        >
          <option value="">{{ t('logic.choose') }}</option>
          <option v-for="c in source.choices" :key="c.id" :value="c.label">{{ c.label }}</option>
        </select>
        <input
          v-else
          :type="numeric ? 'number' : 'text'"
          :value="rule.value"
          :placeholder="t('logic.valuePlaceholder')"
          :class="control"
          @input="emit('change', { value: ($event.target as HTMLInputElement).value })"
        />
      </div>

      <div class="lg:col-span-2">
        <label class="mb-1 block text-xs font-medium text-muted">{{ t('logic.action') }}</label>
        <select
          :value="rule.action"
          :class="control"
          @change="emit('change', { action: ($event.target as HTMLSelectElement).value as LogicAction })"
        >
          <option v-for="action in ACTIONS" :key="action" :value="action">
            {{ t(`logic.actions.${action}`) }}
          </option>
        </select>
      </div>

      <div class="flex items-end gap-2 lg:col-span-2">
        <div class="min-w-0 flex-1">
          <label class="mb-1 block text-xs font-medium text-muted">{{ t('logic.target') }}</label>
          <select
            :value="rule.targetId"
            :class="control"
            @change="emit('change', { targetId: ($event.target as HTMLSelectElement).value })"
          >
            <option v-for="(q, i) in questions" :key="q.id" :value="q.id">
              {{ i + 1 }}. {{ q.title || t('builder.untitledQuestion') }}
            </option>
          </select>
        </div>
        <button
          type="button"
          :aria-label="t('logic.removeRule')"
          :title="t('logic.removeRule')"
          class="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-themed text-muted transition hover:text-error-500"
          @click="emit('remove')"
        >
          <IconBase name="trash" :size="15" />
        </button>
      </div>
    </div>

    <p class="mt-3 flex items-start gap-2 text-xs text-muted">
      <IconBase name="git-branch" :size="14" class-name="mt-0.5 shrink-0" />
      <span class="min-w-0">
        {{
          t('logic.sentence', {
            question: source?.title || t('builder.untitledQuestion'),
            operator: t(`logic.operators.${rule.operator}`).toLowerCase(),
            value: rule.value || '—',
            action: t(`logic.actions.${rule.action}`).toLowerCase(),
            target: questions.find((q) => q.id === rule.targetId)?.title || t('builder.untitledQuestion'),
          })
        }}
      </span>
    </p>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { LogicAction, LogicOperator, LogicRule, Question } from '@/data/types'
import IconBase from '@/components/ui/IconBase.vue'

const props = defineProps<{
  rule: LogicRule
  questions: Question[]
}>()

const emit = defineEmits<{
  change: [patch: Partial<LogicRule>]
  remove: []
}>()

const { t } = useI18n()

const OPERATORS: LogicOperator[] = ['igual', 'diferente', 'maior', 'menor', 'contem']
const ACTIONS: LogicAction[] = ['pular-para', 'mostrar', 'esconder']

const control = 'focus-ring w-full rounded-lg border border-themed bg-transparent px-3 py-2 text-sm text-body'

const source = computed(() => props.questions.find((q) => q.id === props.rule.questionId))
const numeric = computed(() =>
  source.value ? ['escala', 'nps', 'numero'].includes(source.value.type) : false
)
</script>
