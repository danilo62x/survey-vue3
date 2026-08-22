import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: number
  name: string
  email: string
  role: string
  organization?: string
}

/** Conta sugerida na tela de login. Qualquer e-mail/senha entra. */
export const DEMO_CREDENTIALS = { email: 'pesquisa@sondagem.com', password: 'demo123' }

export const useAuthStore = defineStore(
  'sv-auth',
  () => {
    const user = ref<User | null>(null)

    const isAuthenticated = computed(() => user.value !== null)

    // Autenticação fictícia: qualquer e-mail/senha não vazios entram.
    async function login(email: string, password: string): Promise<boolean> {
      await new Promise((r) => setTimeout(r, 500))
      if (!email || !password) return false
      const isDemo = email === DEMO_CREDENTIALS.email
      const raw = email.split('@')[0].replace(/[._-]/g, ' ') || 'Pesquisa'
      const name = isDemo ? 'Helena Prado' : raw.charAt(0).toUpperCase() + raw.slice(1)
      user.value = {
        id: 1,
        name,
        email,
        role: 'Coordenadora de pesquisa',
        organization: 'Sondagem',
      }
      return true
    }

    async function register(name: string, email: string, password: string): Promise<boolean> {
      await new Promise((r) => setTimeout(r, 500))
      if (!name || !email || !password) return false
      user.value = { id: 1, name, email, role: 'Analista de pesquisa', organization: '' }
      return true
    }

    function logout() {
      user.value = null
    }

    function updateProfile(patch: Partial<User>) {
      if (!user.value) return
      user.value = { ...user.value, ...patch }
    }

    return { user, isAuthenticated, login, register, logout, updateProfile }
  },
  {
    persist: { key: 'sv-auth', pick: ['user'] },
  }
)
