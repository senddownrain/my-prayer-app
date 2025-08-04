import { ref } from 'vue';

const appBar = ref({
  title: 'Мои Молитвы',
  showBackButton: false,
  actions: [],
  isMenu: true // ✅ Флаг, показывать ли кнопку меню
});

const isDrawerOpen = ref(false); // ✅ Состояние для открытия/закрытия меню

export function useAppBar() {
  const setAppBar = (config) => {
    appBar.value.title = config.title || 'Мои Молитвы';
    appBar.value.showBackButton = config.showBackButton || false;
    appBar.value.actions = config.actions || [];
    // Если есть кнопка "назад", кнопка меню не нужна.
    appBar.value.isMenu = !config.showBackButton; 
  };
  
  const resetAppBar = () => { /* ... */ };

  return { appBar, isDrawerOpen, setAppBar, resetAppBar };
}