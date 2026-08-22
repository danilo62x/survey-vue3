<template>
  <label v-if="as === 'checkbox'" class="flex cursor-pointer items-center gap-2 text-sm text-body">
    <input
      :id="id"
      v-model="checkedValue"
      type="checkbox"
      v-bind="$attrs"
      class="h-4 w-4 rounded border-themed accent-brand-500"
    />
    {{ label }}
  </label>

  <div v-else class="space-y-1.5">
    <label v-if="label" :for="id" class="block text-sm font-medium text-heading">{{ label }}</label>

    <select v-if="as === 'select'" :id="id" v-model="value" v-bind="$attrs" :class="controlClass">
      <slot />
    </select>

    <textarea v-else-if="as === 'textarea'" :id="id" v-model="value" v-bind="$attrs" :class="controlClass" />

    <input v-else :id="id" v-model="value" :type="type" v-bind="$attrs" :class="controlClass" />

    <p v-if="errorMessage" class="text-xs text-error-500">{{ errorMessage }}</p>
    <p v-else-if="hint" class="text-xs text-muted">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useField } from 'vee-validate'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    name: string
    label?: string
    hint?: string
    as?: 'input' | 'select' | 'textarea' | 'checkbox'
    type?: string
  }>(),
  {
    as: 'input',
    type: 'text',
  }
)

const { value, errorMessage } = useField<any>(() => props.name)

// dedicated boolean binding for checkbox usage
const checkedValue = computed<boolean>({
  get: () => Boolean(value.value),
  set: (v) => {
    value.value = v
  },
})

const id = computed(() => `f-${props.name}`)

const baseControl =
  'focus-ring w-full rounded-lg border bg-transparent px-3.5 py-2.5 text-sm text-body placeholder:text-muted disabled:opacity-50'

const controlClass = computed(() => `${baseControl} ${errorMessage.value ? 'border-error-500' : 'border-themed'}`)
</script>
