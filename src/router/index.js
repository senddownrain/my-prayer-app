import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
  { path: '/settings', name: 'Settings', component: () => import('@/components/SettingsView.vue') },
  { path: '/edit/:id', name: 'ItemEdit', component: () => import('@/components/ItemForm.vue'), props: true, meta: { requiresAuth: true } },
  { path: '/add', name: 'ItemAdd', component: () => import('@/components/ItemForm.vue'), meta: { requiresAuth: true } },
  { path: '/admin', name: 'Admin', component: () => import('@/components/AdminView.vue'), meta: { requiresAuth: true } },
  { path: '/about', name: 'About', component: () => import('@/components/AboutView.vue') },
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
  // Начинаем группу логов для этого конкретного перехода
  console.group(`[ROUTER GUARD] ${new Date().toLocaleTimeString()}`);
  console.log(`Attempting to navigate TO: '${to.path}' FROM: '${from.path}'`);

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  console.log(`Does '${to.path}' require authentication? ->`, requiresAuth);

  console.log('Awaiting Firebase auth state...');
  const currentUser = await getCurrentUser();
  const userIsLoggedIn = !!currentUser;
  
  console.log(`Firebase state received. User is logged in? ->`, userIsLoggedIn, currentUser ? `(UID: ${currentUser.uid})` : '(No user)');

  if (requiresAuth && !userIsLoggedIn) {
    console.warn(`GUARD DECISION: Blocked. Redirecting to '/login'.`);
    console.groupEnd(); // Закрываем группу логов
    next({ name: 'Login' });
  } else {
    console.log(`GUARD DECISION: Allowed. Proceeding to '${to.path}'.`);
    console.groupEnd(); // Закрываем группу логов
    next();
  }
});

export default router;