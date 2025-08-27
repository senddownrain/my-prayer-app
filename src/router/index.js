import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '@/stores/auth';

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener();
        resolve(user);
      },
      reject
    );
  });
};

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/components/LoginView.vue') },
  { path: '/', name: 'ItemsList', component: () => import('@/components/ItemsList.vue') },
  { path: '/item/:id', name: 'ItemView', component: () => import('@/components/ItemView.vue'), props: true },
  { path: '/p/:id', name: 'PublicItemView', component: () => import('@/components/ItemView.vue'), props: true },
  { path: '/settings', name: 'Settings', component: () => import('@/components/SettingsView.vue') },
  { path: '/edit/:id', name: 'ItemEdit', component: () => import('@/components/ItemForm.vue'), props: true, meta: { requiresAuth: true } },
  { path: '/add', name: 'ItemAdd', component: () => import('@/components/ItemForm.vue'), meta: { requiresAuth: true } },
  { path: '/admin', name: 'Admin', component: () => import('@/components/AdminView.vue'), meta: { requiresAuth: true } },
  { path: '/about', name: 'About', component: () => import('@/components/AboutView.vue') },
    { path: '/rule', name: 'PrayerRule', component: () => import('@/components/PrayerRuleView.vue') },
     { path: '/mass', name: 'HolyMass', component: () => import('@/components/HolyMassView.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // ✅ ДОБАВЬТЕ ЭТОТ БЛОК
  scrollBehavior(to, from, savedPosition) {
    // Если есть сохраненная позиция (при навигации назад/вперед),
    // то возвращаемся к ней.
    if (savedPosition) {
      return savedPosition;
    }
    // В противном случае (при новой навигации) всегда
    // прокручиваем в начало страницы.
    else {
      return { top: 0, left: 0 };
    }
  },
});

// --- ✅ НАВИГАЦИОННЫЙ СТРАЖ С ПОДРОБНЫМ ЛОГИРОВАНИЕМ ---
router.beforeEach(async (to, from, next) => {

  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const userIsLoggedIn = !!authStore.user;
  if (requiresAuth && !userIsLoggedIn) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;