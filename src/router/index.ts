import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Site público
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/public/HomeView.vue'),
      meta: { layout: 'public' },
    },
    {
      path: '/modelos',
      name: 'templates',
      component: () => import('@/views/public/TemplatesView.vue'),
      meta: { layout: 'public' },
    },
    {
      path: '/f/:slug',
      name: 'fill',
      component: () => import('@/views/public/FillView.vue'),
      meta: { layout: 'public' },
    },
    {
      path: '/f/:slug/obrigado',
      name: 'thank-you',
      component: () => import('@/views/public/ThankYouView.vue'),
      meta: { layout: 'public' },
    },
    {
      path: '/contato',
      name: 'contact',
      component: () => import('@/views/public/ContactView.vue'),
      meta: { layout: 'public' },
    },

    // Autenticação (layout em branco)
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/public/LoginView.vue'),
      meta: { layout: 'blank' },
    },
    {
      path: '/registro',
      name: 'register',
      component: () => import('@/views/public/RegisterView.vue'),
      meta: { layout: 'blank' },
    },

    // Área logada (guardada, layout com sidebar)
    {
      path: '/app',
      name: 'dashboard',
      component: () => import('@/views/app/DashboardView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/formularios',
      name: 'forms',
      component: () => import('@/views/app/FormsView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/formularios/:id',
      name: 'builder',
      component: () => import('@/views/app/BuilderView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/formularios/:id/respostas',
      name: 'results',
      component: () => import('@/views/app/ResultsView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/modelos',
      name: 'templates-library',
      component: () => import('@/views/app/TemplatesLibraryView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/contatos',
      name: 'contacts',
      component: () => import('@/views/app/ContactsView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },
    {
      path: '/app/configuracoes',
      name: 'settings',
      component: () => import('@/views/app/SettingsView.vue'),
      meta: { layout: 'app', requiresAuth: true },
    },

    // 404 (layout em branco)
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/app/NotFoundView.vue'),
      meta: { layout: 'blank' },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

// Equivalente ao RequireAuth do React: manda para /login?redirect=…
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.path } })
  } else {
    next()
  }
})

export default router
