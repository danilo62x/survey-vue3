<template>
  <span class="relative inline-flex shrink-0">
    <img
      v-if="src"
      :src="src"
      :alt="name ?? ''"
      class="rounded-full object-cover"
      :class="SIZE_MAP[size]"
    />
    <span
      v-else
      class="flex items-center justify-center rounded-full bg-brand-500 font-bold text-white"
      :class="SIZE_MAP[size]"
    >
      {{ initials(name) }}
    </span>
    <span
      v-if="status"
      class="absolute bottom-0 right-0 rounded-full border-2"
      :class="[STATUS_SIZE[size], STATUS_COLOR[status]]"
      :style="{ borderColor: 'var(--tx-card-bg)' }"
    />
  </span>
</template>

<script setup lang="ts">
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Status = 'online' | 'offline' | 'busy'

withDefaults(
  defineProps<{
    src?: string
    name?: string
    size?: AvatarSize
    status?: Status
  }>(),
  { size: 'md' }
)

const SIZE_MAP: Record<AvatarSize, string> = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-16 w-16 text-lg',
}

const STATUS_SIZE: Record<AvatarSize, string> = {
  xs: 'h-2 w-2',
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
  xl: 'h-4 w-4',
}

const STATUS_COLOR: Record<Status, string> = {
  online: 'bg-success-500',
  offline: 'bg-gray-400',
  busy: 'bg-error-500',
}

function initials(name?: string) {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}
</script>
