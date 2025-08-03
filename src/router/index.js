
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'ItemsList',
    component: () => import('@/components/ItemsList.vue'),
  },
  {
    path: '/item/:id',
    name: 'ItemView',
    component: () => import('@/components/ItemView.vue'),
    props: true,
  },
 // --- ИЗМЕНЕНИЕ: Маршрут для РЕДАКТИРОВАНИЯ теперь ведет на ItemForm.vue ---
  {
    path: '/edit/:id',
    name: 'ItemEdit',
    component: () => import('@/components/ItemForm.vue'), // <-- Указываем новый компонент
    props: true,
  },
  // --- ДОБАВЛЕНИЕ: Новый маршрут для СОЗДАНИЯ заметки ---
  {
    path: '/add',
    name: 'ItemAdd',
    component: () => import('@/components/ItemForm.vue'), // <-- Указываем тот же самый компонент
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/components/SettingsView.vue')
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

