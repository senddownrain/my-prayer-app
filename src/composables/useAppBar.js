import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Глобальные переменные, хранящие текущее состояние App Bar
const appBar = ref({
  title: 'Мои Молитвы',
  showBackButton: false,
  actions: [],
  onTitleClick: () => {}, // Обработчик клика
  isTitleClickable: false, // Флаг кликабельности
});

// Состояние для UI элементов, управляемых из App Bar
const isSearchActive = ref(false);
const isFilterSheetOpen = ref(false);

export function useAppBar() {
  // Мы должны инициализировать роутер здесь, внутри функции, чтобы он был доступен
  const router = useRouter();

  const setAppBar = (config) => {
    appBar.value.title = config.title || 'Мои Молитвы';
    appBar.value.showBackButton = config.showBackButton || false;
    appBar.value.actions = config.actions || [];
    
    // Логика кликабельного заголовка
    if (config.showBackButton) {
      // На внутренних страницах клик по заголовку ведет на главную
      appBar.value.onTitleClick = () => router.push({ name: 'ItemsList' });
      appBar.value.isTitleClickable = true;
    } else {
      // На главной странице заголовок не кликабелен
      appBar.value.onTitleClick = () => {};
      appBar.value.isTitleClickable = false;
    }
  };

  const resetAppBar = () => {
    // Сбрасываем к состоянию по умолчанию
    setAppBar({ title: 'Мои Молитвы', showBackButton: false, actions: [] });
  };

  return { appBar, isSearchActive, isFilterSheetOpen, setAppBar, resetAppBar };
}