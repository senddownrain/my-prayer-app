import { defineStore } from 'pinia';
import { ref, watch, watchEffect } from 'vue';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';

export const useSettingsStore = defineStore('settings', () => {
  const theme = useTheme();
  const { locale } = useI18n();

  // --- ТЕМА (✅ ИСПРАВЛЕНО) ---
  const currentTheme = ref(localStorage.getItem('theme') || 'light');
  
  // Применяем тему при инициализации
  theme.global.name.value = currentTheme.value;

  // Функция для смены темы
  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
    // Используем новый, правильный метод для смены темы
    theme.global.name.value = currentTheme.value;
    localStorage.setItem('theme', currentTheme.value);
  }

  // --- РАЗМЕР ШРИФТА (без изменений) ---
  const fontSizeMultiplier = ref(parseFloat(localStorage.getItem('fontSizeMultiplier')) || 1.0);
  watch(fontSizeMultiplier, (newMultiplier) => {
    localStorage.setItem('fontSizeMultiplier', newMultiplier);
    document.documentElement.style.setProperty('--font-size-multiplier', newMultiplier);
  }, { immediate: true });

  function increaseFontSize() { if (fontSizeMultiplier.value < 1.5) fontSizeMultiplier.value = Math.round((fontSizeMultiplier.value + 0.1) * 10) / 10; }
  function decreaseFontSize() { if (fontSizeMultiplier.value > 0.8) fontSizeMultiplier.value = Math.round((fontSizeMultiplier.value - 0.1) * 10) / 10; }

  // --- ЯЗЫК (без изменений) ---
  const currentLanguage = ref(localStorage.getItem('language') || 'ru');
  locale.value = currentLanguage.value;
  function setLanguage(lang) {
    currentLanguage.value = lang;
    locale.value = lang;
    localStorage.setItem('language', lang);
  }

  // --- РЕЖИМ ОТОБРАЖЕНИЯ (без изменений) ---
  const viewMode = ref(localStorage.getItem('viewMode') || 'card');
  watch(viewMode, (newMode) => { localStorage.setItem('viewMode', newMode); });
  function toggleViewMode() { viewMode.value = viewMode.value === 'card' ? 'compact' : 'card'; }

  // --- ЗАКРЕПЛЕННЫЕ ЗАМЕТКИ (без изменений) ---
  const pinnedIds = ref(JSON.parse(localStorage.getItem('pinnedIds') || '[]'));
  watch(pinnedIds, (newIds) => { localStorage.setItem('pinnedIds', JSON.stringify(newIds)); }, { deep: true });
  function isPinned(noteId) { return pinnedIds.value.includes(noteId); }
  function togglePin(noteId) {
    const index = pinnedIds.value.indexOf(noteId);
    if (index > -1) {
      pinnedIds.value.splice(index, 1);
    } else {
      pinnedIds.value.unshift(noteId);
    }
  }

  return {
    currentTheme, toggleTheme,
    fontSizeMultiplier, increaseFontSize, decreaseFontSize,
    currentLanguage, setLanguage,
    viewMode, toggleViewMode,
    pinnedIds, isPinned, togglePin,
  };
});