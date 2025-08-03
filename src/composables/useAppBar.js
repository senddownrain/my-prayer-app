import { ref } from 'vue';

// Глобальные переменные, хранящие текущее состояние App Bar
const title = ref('Мои заметки');
const showBackButton = ref(false);
const actions = ref([]); // Массив кнопок (иконок) действий

// Состояние для UI элементов, управляемых из App Bar
const isSearchActive = ref(false);
const isFilterSheetOpen = ref(false);

export function useAppBar() {

  // Функция, которую вызывают страницы, чтобы настроить App Bar под себя
  const setAppBar = (options) => {
    title.value = options.title || 'Мои заметки';
    showBackButton.value = options.showBackButton || false;
    actions.value = options.actions || [];
  };

  // Функция для сброса App Bar к состоянию по умолчанию (для главной страницы)
  // Вызывается, когда пользователь уходит со страницы просмотра или редактирования
  const resetAppBar = () => {
    title.value = 'Мои заметки';
    showBackButton.value = false;
    actions.value = [];
  };

  return {
    // Состояние App Bar
    title,
    showBackButton,
    actions,
    
    // Состояние связанных UI элементов
    isSearchActive,
    isFilterSheetOpen,

    // Функции для управления
    setAppBar,
    resetAppBar,
  };
}