import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', name: 'ItemsList', component: () => import('@/components/ItemsList.vue') },
  { path: '/item/:id', name: 'ItemView', component: () => import('@/components/ItemView.vue'), props: true },
  { path: '/edit/:id', name: 'ItemEdit', component: () => import('@/components/ItemForm.vue'), props: true },
  { path: '/add', name: 'ItemAdd', component: () => import('@/components/ItemForm.vue') },
  { path: '/settings', name: 'Settings', component: () => import('@/components/SettingsView.vue') },
  // ✅ --- НОВЫЕ МАРШРУТЫ --- ✅
  { path: '/about', name: 'About', component: () => import('@/components/AboutView.vue') },
  { path: '/admin', name: 'Admin', component: () => import('@/components/AdminView.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;