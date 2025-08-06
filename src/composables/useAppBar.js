import { ref } from 'vue';

// Глобальные реактивные переменные
const showBackButton = ref(false);
const isDrawerOpen = ref(false);
const isSearchActive = ref(false);
const isFilterSheetOpen = ref(false);

export function useAppBar() {
  // Эта функция будет просто переключать видимость кнопки "Назад"
  const setBackButtonVisibility = (visible) => {
    showBackButton.value = visible;
  };

  return { 
    showBackButton,
    setBackButtonVisibility,
    isDrawerOpen, 
    isSearchActive, 
    isFilterSheetOpen
  };
}