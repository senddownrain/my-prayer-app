import { ref } from 'vue';

// Глобальные реактивные переменные
const appBar = ref({
  title: 'Мои Молитвы',
  showBackButton: false,
  isSearchVisible: false, // Показывать ли иконку поиска
  actions: []
});

const isDrawerOpen = ref(false);
const isSearchActive = ref(false); // Активен ли режим поиска (поле ввода на весь appbar)

export function useAppBar() {
  const setAppBar = (config) => {
    appBar.value.title = config.title || 'Мои Молитвы';
    appBar.value.showBackButton = config.showBackButton || false;
    appBar.value.isSearchVisible = config.isSearchVisible || false;
    appBar.value.actions = config.actions || [];
  };

  const resetAppBar = () => {
    // Сброс к состоянию по умолчанию для главного экрана
    setAppBar({
      title: 'Мои Молитвы',
      isSearchVisible: true,
      actions: []
    });
  };

  return { 
    appBar, 
    isDrawerOpen, 
    isSearchActive, 
    setAppBar, 
    resetAppBar 
  };
}