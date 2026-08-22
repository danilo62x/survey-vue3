import { useUiStore } from '@/stores/ui'

/** Applies the persisted dark-mode preference to <html> on app start. */
export function useTheme() {
  const ui = useUiStore()
  function init() {
    ui.applyTheme()
  }
  return { init }
}
