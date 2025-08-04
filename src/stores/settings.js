import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';

// ✅ Значения по умолчанию для категорий
const defaultCategories = [
  { name: 'Основные молитвы', tag: 'основные' },
  { name: 'Марийные молитвы', tag: 'мария' }
];

export const useSettingsStore = defineStore('settings', () => {
  const theme = useTheme();
  const { locale } = useI18n();

  // ... (вся логика для темы, размера шрифта, языка, вида списка, закрепленных заметок остается без изменений) ...
  const currentTheme = ref(localStorage.getItem('theme') || 'light');
  theme.global.name.value = currentTheme.value;
  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
    theme.global.name.value = currentTheme.value;
    localStorage.setItem('theme', currentTheme.value);
  }
  const fontSizeMultiplier = ref(parseFloat(localStorage.getItem('fontSizeMultiplier')) || 1.0);
  watch(fontSizeMultiplier, (newMultiplier) => { document.documentElement.style.setProperty('--font-size-multiplier', newMultiplier); }, { immediate: true });
  function increaseFontSize() { if (fontSizeMultiplier.value < 1.5) fontSizeMultiplier.value += 0.1; }
  function decreaseFontSize() { if (fontSizeMultiplier.value > 0.8) fontSizeMultiplier.value -= 0.1; }
  const currentLanguage = ref(localStorage.getItem('language') || 'ru');
  locale.value = currentLanguage.value;
  function setLanguage(lang) { locale.value = lang; localStorage.setItem('language', lang); }
  const viewMode = ref(localStorage.getItem('viewMode') || 'card');
  function toggleViewMode() { viewMode.value = viewMode.value === 'card' ? 'compact' : 'card'; }
  const pinnedIds = ref(JSON.parse(localStorage.getItem('pinnedIds') || '[]'));
  watch(pinnedIds, (newIds) => { localStorage.setItem('pinnedIds', JSON.stringify(newIds)); }, { deep: true });
  function isPinned(noteId) { return pinnedIds.value.includes(noteId); }
  function togglePin(noteId) { /* ... */ }
  

  // ✅ --- НОВЫЙ БЛОК: УПРАВЛЕНИЕ КАТЕГОРИЯМИ МЕНЮ --- ✅
  const menuCategories = ref(
    JSON.parse(localStorage.getItem('menuCategories') || JSON.stringify(defaultCategories))
  );

  // Сохраняем любые изменения категорий в localStorage
  watch(menuCategories, (newCategories) => {
    localStorage.setItem('menuCategories', JSON.stringify(newCategories));
  }, { deep: true });

  function addCategory(category) {
    if (category && category.name && category.tag) {
      menuCategories.value.push(category);
    }
  }

  function removeCategory(index) {
    menuCategories.value.splice(index, 1);
  }

  return {
    currentTheme, toggleTheme,
    fontSizeMultiplier, increaseFontSize, decreaseFontSize,
    currentLanguage, setLanguage,
    viewMode, toggleViewMode,
    pinnedIds, isPinned, togglePin,
    // ✅ Экспортируем все для категорий
    menuCategories, addCategory, removeCategory
  };
});