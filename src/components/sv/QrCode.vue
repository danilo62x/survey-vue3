<template>
  <svg
    :viewBox="`0 0 ${MODULES} ${MODULES}`"
    :width="size"
    :height="size"
    role="img"
    :aria-label="value"
    class="rounded-xl bg-white p-2 shadow-theme-xs"
  >
    <rect v-for="cell in cells" :key="`${cell.x}-${cell.y}`" :x="cell.x" :y="cell.y" width="1" height="1" fill="#101828" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: string
    size?: number
  }>(),
  { size: 160 }
)

const MODULES = 25

function hash(str: string, salt: number): number {
  let h = salt >>> 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) >>> 0
  return h
}

function isFinder(x: number, y: number): boolean {
  const inBox = (bx: number, by: number) => x >= bx && x < bx + 7 && y >= by && y < by + 7
  return inBox(0, 0) || inBox(MODULES - 7, 0) || inBox(0, MODULES - 7)
}

function finderFilled(x: number, y: number): boolean {
  const local = (bx: number, by: number) => {
    const dx = x - bx
    const dy = y - by
    const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3))
    return ring !== 2
  }
  if (x < 7 && y < 7) return local(0, 0)
  if (x >= MODULES - 7 && y < 7) return local(MODULES - 7, 0)
  if (x < 7 && y >= MODULES - 7) return local(0, MODULES - 7)
  return false
}

/**
 * Marca visual de código para leitura, gerada a partir do endereço — sem
 * dependência externa. Serve de ilustração na aba Compartilhar.
 */
const cells = computed(() => {
  const out: { x: number; y: number }[] = []
  for (let y = 0; y < MODULES; y++) {
    for (let x = 0; x < MODULES; x++) {
      if (isFinder(x, y)) {
        if (finderFilled(x, y)) out.push({ x, y })
        continue
      }
      if (hash(props.value, x * 131 + y * 17) % 100 < 46) out.push({ x, y })
    }
  }
  return out
})
</script>
