import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';

const defaultCategories = [
  { name: 'Основные молитвы', tags: ['основные'] },
  { name: 'Марианские молитвы', tags: ['марианские'] }
];

const systemFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";

export const useSettingsStore = defineStore('settings', () => {
  const theme = useTheme();
  const { locale } = useI18n();

  // --- Состояния (Refs) ---
  const currentTheme = ref(localStorage.getItem('theme') || 'light');
  const keepScreenOn = ref(JSON.parse(localStorage.getItem('keepScreenOn') || 'false'));
  const fontFamily = ref(localStorage.getItem('fontFamily') || systemFont);
  const fontSizeMultiplier = ref(parseFloat(localStorage.getItem('fontSizeMultiplier')) || 1.0);
  const viewMode = ref(localStorage.getItem('viewMode') || 'compact');
  const currentLanguage = ref(localStorage.getItem('language') || 'ru');
  const pinnedIds = ref(JSON.parse(localStorage.getItem('pinnedIds') || '[]'));
  const menuCategories = ref(JSON.parse(localStorage.getItem('menuCategories') || JSON.stringify(defaultCategories)));
  const showHiddenItems = ref(JSON.parse(localStorage.getItem('showHiddenItems') || 'false'));

  // --- Слежение за изменениями и сохранение в localStorage (Watchers) ---
  // ✅ ИСПРАВЛЕНО: Предупреждение Vuetify. Теперь используется актуальный метод.
  watch(currentTheme, (v) => { theme.global.name.value = v; localStorage.setItem('theme', v); }, { immediate: true });
  watch(fontFamily, (v) => { document.documentElement.style.setProperty('--app-font-family', v); localStorage.setItem('fontFamily', v); }, { immediate: true });
  watch(fontSizeMultiplier, (v) => localStorage.setItem('fontSizeMultiplier', v));
  watch(keepScreenOn, (v) => localStorage.setItem('keepScreenOn', v));
  watch(viewMode, (v) => localStorage.setItem('viewMode', v));
  watch(currentLanguage, (v) => { locale.value = v; localStorage.setItem('language', v); }, { immediate: true });
  watch(pinnedIds, (v) => localStorage.setItem('pinnedIds', JSON.stringify(v)), { deep: true });
  watch(menuCategories, (v) => localStorage.setItem('menuCategories', JSON.stringify(v)), { deep: true });
  watch(showHiddenItems, (v) => localStorage.setItem('showHiddenItems', v));

  // --- Функции для изменения состояний (Actions) ---
  function toggleTheme() { currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'; }
  function setFontFamily(font) { fontFamily.value = font; }
  function increaseFontSize() { if (fontSizeMultiplier.value < 1.5) fontSizeMultiplier.value = parseFloat((fontSizeMultiplier.value + 0.1).toFixed(2)); }
  function decreaseFontSize() { if (fontSizeMultiplier.value > 0.8) fontSizeMultiplier.value = parseFloat((fontSizeMultiplier.value - 0.1).toFixed(2)); }
  function toggleViewMode() { viewMode.value = viewMode.value === 'card' ? 'compact' : 'card'; }
  function setLanguage(lang) { currentLanguage.value = lang; }
  
  // ✅ --- ИСПРАВЛЕНО: Возвращаем удаленные функции для закрепления ---
  function isPinned(noteId) { return pinnedIds.value.includes(noteId); }
  function togglePin(noteId) {
    const index = pinnedIds.value.indexOf(noteId);
    if (index > -1) pinnedIds.value.splice(index, 1);
    else pinnedIds.value.unshift(noteId);
  }

  function addCategory(cat) { if (cat && cat.name && cat.tags?.length > 0) menuCategories.value.push(cat); }
  function removeCategory(index) { menuCategories.value.splice(index, 1); }
  function toggleShowHiddenItems() { showHiddenItems.value = !showHiddenItems.value; }

  // Управление WakeLock API
  let wakeLock = null;
  const setKeepScreenOn = async (value) => {
    keepScreenOn.value = value;
    if (value && 'wakeLock' in navigator) {
      try { wakeLock = await navigator.wakeLock.request('screen'); } catch (err) { console.error(`${err.name}, ${err.message}`); }
    } else {
      if (wakeLock !== null) wakeLock.release().then(() => { wakeLock = null; });
    }
  };
  watch(keepScreenOn, setKeepScreenOn, { immediate: true });

  return {
    currentTheme, toggleTheme,
    keepScreenOn, setKeepScreenOn,
    fontFamily, setFontFamily, systemFont,
    fontSizeMultiplier, increaseFontSize, decreaseFontSize,
    currentLanguage, setLanguage,
    viewMode, toggleViewMode,
    pinnedIds, isPinned, togglePin, // ✅ Экспортируем isPinned
    menuCategories, addCategory, removeCategory,
    showHiddenItems, toggleShowHiddenItems
  };
});