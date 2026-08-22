import { watchEffect, onUnmounted, type Ref } from 'vue'

const BASE = 'Sondagem — Pesquisas & Formulários'

/** Sets the document title to "<title> · <base>" while the component is mounted. */
export function usePageTitle(title?: Ref<string> | (() => string) | string) {
  const resolve = () =>
    typeof title === 'function' ? title() : typeof title === 'string' ? title : title?.value ?? ''
  watchEffect(() => {
    const t = resolve()
    document.title = t ? `${t} · ${BASE}` : BASE
  })
  onUnmounted(() => {
    document.title = BASE
  })
}
