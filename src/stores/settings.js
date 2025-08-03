import { defineStore } from 'pinia';
import { ref, watch, watchEffect } from 'vue';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';

export const useSettingsStore = defineStore('settings', () => {
  // --- ТЕМА (без изменений) ---
  const theme = useTheme();
  const currentTheme = ref(localStorage.getItem('theme') || 'light');
  theme.global.name.value = currentTheme.value;
  watch(currentTheme, (newTheme) => {
    theme.global.name.value = newTheme;
    localStorage.setItem('theme', newTheme);
  });
  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
  }

  // --- РАЗМЕР ШРИФТА (без изменений) ---
  const fontSizeMultiplier = ref(parseFloat(localStorage.getItem('fontSizeMultiplier')) || 1.0);
  watch(fontSizeMultiplier, (newMultiplier) => {
    localStorage.setItem('fontSizeMultiplier', newMultiplier);
  });
  watchEffect(() => {
    document.documentElement.style.setProperty('--font-size-multiplier', fontSizeMultiplier.value);
  });
  function increaseFontSize() {
    if (fontSizeMultiplier.value < 1.5) {
      fontSizeMultiplier.value = Math.round((fontSizeMultiplier.value + 0.1) * 10) / 10;
    }
  }
  function decreaseFontSize() {
    if (fontSizeMultiplier.value > 0.8) {
      fontSizeMultiplier.value = Math.round((fontSizeMultiplier.value - 0.1) * 10) / 10;
    }
  }

  // --- ЯЗЫК (без изменений) ---
  const { locale } = useI18n();
  const currentLanguage = ref(localStorage.getItem('language') || 'ru');
  locale.value = currentLanguage.value;
  watch(currentLanguage, (newLang) => {
    locale.value = newLang;
    localStorage.setItem('language', newLang);
  });
  function setLanguage(lang) {
    currentLanguage.value = lang;
  }

  // --- РЕЖИМ ОТОБРАЖЕНИЯ (без изменений) ---
  const viewMode = ref(localStorage.getItem('viewMode') || 'card');
  watch(viewMode, (newMode) => {
    localStorage.setItem('viewMode', newMode);
  });
  function toggleViewMode() {
    viewMode.value = viewMode.value === 'card' ? 'compact' : 'card';
  }
  
  // ✅ --- НОВЫЙ БЛОК: УПРАВЛЕНИЕ ЗАКРЕПЛЕННЫМИ ЗАМЕТКАМИ --- ✅
  // 1. Загружаем массив ID из localStorage или создаем пустой
  const pinnedIds = ref(JSON.parse(localStorage.getItem('pinnedIds') || '[]'));

  // 2. Сохраняем изменения обратно в localStorage
  watch(pinnedIds, (newIds) => {
    localStorage.setItem('pinnedIds', JSON.stringify(newIds));
  }, { deep: true });

  // 3. Функция для проверки, закреплена ли заметка
  function isPinned(noteId) {
    return pinnedIds.value.includes(noteId);
  }
  
  // 4. Функция для переключения статуса закрепления
  function togglePin(noteId) {
    if (isPinned(noteId)) {
      // Если уже закреплена - открепляем (удаляем ID из массива)
      pinnedIds.value = pinnedIds.value.filter(id => id !== noteId);
    } else {
      // Если не закреплена - закрепляем (добавляем ID в начало массива)
      pinnedIds.value.unshift(noteId);
    }
  }

  return {
    currentTheme,
    toggleTheme,
    fontSizeMultiplier,
    increaseFontSize,
    decreaseFontSize,
    currentLanguage,
    setLanguage,
    viewMode,
    toggleViewMode,
    // Экспортируем новые функции и переменные
    pinnedIds,
    isPinned,
    togglePin,
  };
});